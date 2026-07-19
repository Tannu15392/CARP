/**
 * One-off helper: promote an existing user to admin.
 * Usage:  node scripts/makeAdmin.js someone@college.edu
 *
 * Run this once after that person has signed up normally through the app.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2];
if (!email) {
  console.log("Usage: node scripts/makeAdmin.js <email>");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    );
    if (!user) {
      console.log(`No user found with email ${email}. Sign up first, then re-run this.`);
    } else {
      console.log(`✅ ${user.name} (${user.email}) is now an admin.`);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("DB error:", err.message);
    process.exit(1);
  });
