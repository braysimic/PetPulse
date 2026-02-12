const express = require("express");
const User = require("../models/User");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

/**
 * GET /api/admin/users
 * Admin can view all users
 */
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Admin can view one user
 */
router.get("/users/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    res.send(user);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Admin can delete a user
 */
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Optional: prevent admin from deleting themselves
    if (req.session.userId === userId) {
      return res.status(400).send({ error: "You cannot delete your own account." });
    }

    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return res.status(404).send({ error: "User not found." });
    }

    // Later: delete pets, reminders, medical records, etc.

    res.send({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
