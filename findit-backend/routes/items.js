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

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { desc: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const items = await Item.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(items);
});

// POST /api/items/ai-chat - Groq AI
router.post("/ai-chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        reply: "Please provide a valid conversation.",
      });
    }

    const filtered = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    }));

    const r = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 500,
          temperature: 0.6,
          messages: [
            {
              role: "system",
              content: `
You are FindIt AI, the conversational assistant for a college campus Lost & Found platform.

Your job is to help students report, describe, search for, and recover lost or found items.

IMPORTANT RESPONSE RULES:
- Be natural, conversational, concise, and helpful.
- Usually respond in 1-4 short sentences.
- Do NOT give long numbered lists unless the user explicitly asks for detailed instructions.
- Do NOT sound like a generic FAQ or customer-support bot.
- Ask a follow-up question when important information is missing.
- Use information the user has already provided.
- Do not ask for information that the user has already given.
- Never invent details about an item.
- Do not repeat the same information unnecessarily.
- Keep the tone friendly and practical.

WHEN HELPING DESCRIBE AN ITEM:
Ask only for useful missing details such as:
- Item type
- Brand/model
- Color
- Size
- Distinctive features
- Location
- Approximate date/time

Help the user turn their natural description into a clear lost/found report.

EXAMPLES:

User: "How do I describe my item?"

Assistant:
"Tell me what the item is, its color or brand, any distinctive features, and where and when you lost or found it. If you have a photo, you can upload it too."

User: "I lost my wallet."

Assistant:
"Got it. Do you remember its color, brand, or where you last saw it?"

User: "Black leather wallet near the library."

Assistant:
"Got it. Do you remember roughly when you lost it or any distinctive mark on the wallet?"

User: "I found a blue water bottle near the canteen."

Assistant:
"Nice. If you remember the brand, size, or any sticker or design on it, add that to the report so the owner can identify it more easily."

User: "I lost a black HP laptop near the library yesterday."

Assistant:
"Got it. A black HP laptop was lost near the library yesterday. Do you remember roughly what time you last had it or any distinctive feature on the laptop?"

RECOVERY QUESTIONS:
If the user asks what they should do after losing something:
- Give practical campus lost-and-found advice.
- Suggest checking the location where it was last seen.
- Suggest reporting the item on FindIt.
- Keep the response concise.

SEARCH HELP:
If the user wants to find a lost item:
- Help them identify useful search terms.
- Use details such as item type, brand, color, location, and time.
- Do not claim that you searched the database unless the application actually provides that capability.

UNRELATED QUESTIONS:
If the user asks something unrelated to lost and found:
- Briefly explain that you are FindIt AI and are mainly designed to help with lost and found items.

IMPORTANT:
- Never claim that you searched the FindIt database unless the application actually performs a search.
- Never claim that you contacted another user.
- Never claim that an item has been found unless the application provides that information.
- Never fabricate matches or recovery results.
`,
            },
            ...filtered,
          ],
        }),
      }
    );

    const data = await r.json();

    console.log("Groq response:", JSON.stringify(data));

    if (!r.ok || data.error) {
      console.error("Groq API error:", data.error || r.statusText);

      return res.json({
        reply: "AI is temporarily unavailable. Please try again later.",
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);

    res.status(500).json({
      reply: "Something went wrong while connecting to the AI.",
    });
  }
});

// GET /api/items/:id - get single item
router.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!item) {
    return res.status(404).json({
      message: "Item not found",
    });
  }

  res.json(item);
});

// POST /api/items - create item with photos
router.post("/", protect, upload.array("photos", 4), async (req, res) => {
  const {
    type,
    title,
    category,
    location,
    desc,
    contact,
    reward,
  } = req.body;

  if (!type || !title || !desc || !contact) {
    return res.status(400).json({
      message: "Fill all required fields",
    });
  }

  const photos = req.files ? req.files.map((f) => f.path) : [];

  const item = await Item.create({
    user: req.user._id,
    type,
    title,
    category,
    location,
    desc,
    contact,
    reward,
    photos,
  });

  // Generate CLIP embedding for the first image
  // so the item can later be compared with opposite-type items.
  if (photos.length > 0 && process.env.IMAGE_SERVICE_URL) {
    fetch(`${process.env.IMAGE_SERVICE_URL}/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: photos[0],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.embedding) {
          return Item.findByIdAndUpdate(item._id, {
            embedding: data.embedding,
          });
        }
      })
      .catch((err) =>
        console.log("Image embedding failed:", err.message)
      );
  }

  res.status(201).json(item);
});

// PUT /api/items/:id - update item
router.put("/:id", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found",
    });
  }

  if (item.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  Object.assign(item, req.body);

  await item.save();

  res.json(item);
});

// PATCH /api/items/:id/claim - mark as claimed
router.patch("/:id/claim", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found",
    });
  }

  item.status = "claimed";

  await item.save();

  // Reward original reporter with trust-score points.
  const User = require("../models/User");

  await User.findByIdAndUpdate(item.user, {
    $inc: { trustScore: 5 },
  });

  res.json({
    message: "Marked as claimed",
    item,
  });
});

// DELETE /api/items/:id
router.delete("/:id", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found",
    });
  }

  if (item.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  await item.deleteOne();

  res.json({
    message: "Item deleted",
  });
});

module.exports = router;