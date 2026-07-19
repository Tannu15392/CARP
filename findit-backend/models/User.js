const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, default: "" },
  phone: { type: String, default: "" },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  // Simple trust score: goes up when a user's reported item is successfully
  // resolved/claimed, helps surface reliable reporters and discourage fraud.
  trustScore: { type: Number, default: 0 },
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);