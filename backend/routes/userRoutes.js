const express = require("express");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// ===== Multer Storage Config =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Only JPG, PNG, or WEBP images allowed."));
    } else {
      cb(null, true);
    }
  },
});

// ===== GET current user profile =====
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in." });
    }

    const user = await User.findById(req.session.userId).select(
      "email name bio profilePicture role"
    );

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    res.send(user);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ===== UPDATE current user profile (WITH IMAGE UPLOAD) =====
router.put("/me", upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in." });
    }

    const { email, name, bio } = req.body;

    // ===== Validation =====
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).send({ error: "Invalid email format." });
    }

    if (name && name.length > 50) {
      return res.status(400).send({ error: "Name must be under 50 characters." });
    }

    if (bio && bio.length > 300) {
      return res.status(400).send({ error: "Bio must be under 300 characters." });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    // ===== Update Fields =====
    user.email = email.toLowerCase();
    user.name = name || "";
    user.bio = bio || "";

    // If new file uploaded
    if (req.file) {
      user.profilePicture = "/uploads/" + req.file.filename;
    }

    await user.save();

    res.send({ message: "Profile updated successfully." });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
