const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// ===== Register =====
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: "Email and password are required." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .send({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).send({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role: "user",
    });

    res.send({ message: "Account created!", userId: newUser._id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ===== Login =====
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).send({ error: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).send({ error: "Account is disabled." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).send({ error: "Invalid email or password." });
    }

    // Create session
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    req.session.email = user.email;

    res.send({
      message: "Login successful!",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ===== Logout =====
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({ error: "Logout failed." });
    }

    res.clearCookie("connect.sid");
    res.send({ message: "Logged out successfully." });
  });
});

// ===== Check current session =====
router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in" });
  }

  res.send({
    userId: req.session.userId,
    role: req.session.role,
    email: req.session.email,
  });
});

module.exports = router;
