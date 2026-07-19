const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// All routes below require a logged-in admin
router.use(protect, adminOnly);

// GET /api/admin/stats - high level dashboard numbers
router.get("/stats", async (req, res) => {
  const [total, active, claimed, lost, found, userCount] = await Promise.all([
    Item.countDocuments(),
    Item.countDocuments({ status: "active" }),
    Item.countDocuments({ status: "claimed" }),
    Item.countDocuments({ type: "lost" }),
    Item.countDocuments({ type: "found" }),
    User.countDocuments(),
  ]);

  const recoveryRate = total > 0 ? Math.round((claimed / total) * 100) : 0;

  res.json({ total, active, claimed, lost, found, userCount, recoveryRate });
});

// GET /api/admin/by-category - counts grouped by category
router.get("/by-category", async (req, res) => {
  const rows = await Item.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json(rows.map((r) => ({ category: r._id || "Other", count: r.count })));
});

// GET /api/admin/by-location - counts grouped by location (hotspots)
router.get("/by-location", async (req, res) => {
  const rows = await Item.aggregate([
    { $group: { _id: "$location", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json(rows.map((r) => ({ location: r._id || "Other", count: r.count })));
});

// GET /api/admin/trend - items reported per day, last 30 days (for a line chart)
router.get("/trend", async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const rows = await Item.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        lost: { $sum: { $cond: [{ $eq: ["$type", "lost"] }, 1, 0] } },
        found: { $sum: { $cond: [{ $eq: ["$type", "found"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(rows.map((r) => ({ date: r._id, lost: r.lost, found: r.found })));
});

// GET /api/admin/recent - most recent items for the activity feed
router.get("/recent", async (req, res) => {
  const items = await Item.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(15);
  res.json(items);
});

// GET /api/admin/users - all users (for the admin to manage / promote)
router.get("/users", async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// PATCH /api/admin/users/:id/role - promote/demote a user
router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["student", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

module.exports = router;
