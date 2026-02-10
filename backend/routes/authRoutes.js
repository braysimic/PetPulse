const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).send({ error: "Email and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).send({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).send({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash
    });

    res.send({ message: "Account created!", userId: newUser._id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Login
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

    // For now, just return success (later you can do sessions/JWT)
    res.send({ message: "Login successful!", userId: user._id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
