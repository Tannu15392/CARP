const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const { protect } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// GET /api/items - get all items (with filters)
router.get("/", async (req, res) => {
  const { type, category, status, search } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { desc: { $regex: search, $options: "i" } },
    { location: { $regex: search, $options: "i" } },
  ];
  const items = await Item.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(items);
});

// POST /api/items/ai-chat - Gemini AI (must be before /:id)
router.post("/ai-chat", async (req, res) => {
  const { messages } = req.body;

  const filtered = messages.map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content
  }));

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      messages: [
        { role: "system", content: "You are FindIt AI, a helpful assistant for a college campus lost and found platform. Help students find lost items, describe items better, and give recovery tips. Be concise and friendly." },
        ...filtered
      ]
    })
  });

  const data = await r.json();
  console.log("Groq response:", JSON.stringify(data));

  if (data.error) {
    return res.json({ reply: "AI is temporarily unavailable. Please try again later." });
  }

  const reply = data.choices?.[0]?.message?.content || "Sorry, try again.";
  res.json({ reply });
});
// GET /api/items/:id - get single item
router.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id).populate("user", "name email");
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});

// POST /api/items - create item with photos
router.post("/", protect, upload.array("photos", 4), async (req, res) => {
  const { type, title, category, location, desc, contact, reward } = req.body;
  if (!type || !title || !desc || !contact)
    return res.status(400).json({ message: "Fill all required fields" });

  const photos = req.files ? req.files.map((f) => f.path) : [];
  const item = await Item.create({
    user: req.user._id,
    type, title, category, location, desc, contact, reward, photos,
  });

  // Fire-and-forget: ask the Python image-service for a CLIP embedding of
  // the first photo, so this item can be compared against opposite-type
  // items later. Never blocks the response to the user, and failures here
  // (e.g. service asleep on free tier) just mean no AI matches for this item.
  if (photos.length > 0 && process.env.IMAGE_SERVICE_URL) {
    fetch(`${process.env.IMAGE_SERVICE_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: photos[0] }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.embedding) {
          return Item.findByIdAndUpdate(item._id, { embedding: data.embedding });
        }
      })
      .catch((err) => console.log("Image embedding failed:", err.message));
  }

  res.status(201).json(item);
});

// PUT /api/items/:id - update item
router.put("/:id", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (item.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not authorized" });

  Object.assign(item, req.body);
  await item.save();
  res.json(item);
});

// PATCH /api/items/:id/claim - mark as claimed
router.patch("/:id/claim", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  item.status = "claimed";
  await item.save();

  // Reward the original reporter with trust-score points for a successful
  // resolution. Keeps a lightweight anti-fraud/reputation signal.
  const User = require("../models/User");
  await User.findByIdAndUpdate(item.user, { $inc: { trustScore: 5 } });

  res.json({ message: "Marked as claimed", item });
});

// DELETE /api/items/:id
router.delete("/:id", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (item.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not authorized" });
  await item.deleteOne();
  res.json({ message: "Item deleted" });
});

module.exports = router;