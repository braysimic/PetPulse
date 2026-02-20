const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },

    // Profile fields
    name: { type: String, default: "", maxlength: 50 },
    bio: { type: String, default: "", maxlength: 300 },
    profilePicture: { type: String, default: "" },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

