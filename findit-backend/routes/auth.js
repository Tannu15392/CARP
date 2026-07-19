const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password, college, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Fill all required fields" });

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password, college, phone });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    college: user.college,
    role: user.role,
    token: generateToken(user._id),
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid email or password" });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    college: user.college,
    role: user.role,
    token: generateToken(user._id),
  });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");
  res.json(user);
});

module.exports = router;