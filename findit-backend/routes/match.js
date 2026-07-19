const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// Cosine similarity between two equal-length vectors, returns 0..1
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// GET /api/match/:itemId - top visual matches from the opposite list
// (a "lost" item is matched against "found" items, and vice versa)
router.get("/:itemId", async (req, res) => {
  const source = await Item.findById(req.params.itemId).select("+embedding");
  if (!source) return res.status(404).json({ message: "Item not found" });

  if (!source.embedding || source.embedding.length === 0) {
    return res.json({ matches: [], note: "No AI embedding yet for this item (photo may still be processing)." });
  }

  const oppositeType = source.type === "lost" ? "found" : "lost";
  const candidates = await Item.find({
    type: oppositeType,
    status: "active",
    embedding: { $exists: true, $ne: [] },
  }).select("+embedding");

  const scored = candidates
    .map((c) => ({
      item: c,
      score: cosineSimilarity(source.embedding, c.embedding),
    }))
    .filter((m) => m.score > 0.55) // only surface reasonably confident matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((m) => ({
      _id: m.item._id,
      title: m.item.title,
      category: m.item.category,
      location: m.item.location,
      photos: m.item.photos,
      createdAt: m.item.createdAt,
      similarity: Math.round(m.score * 100),
    }));

  res.json({ matches: scored });
});

module.exports = router;
