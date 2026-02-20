const express = require("express");
const Activity = require("../models/Activity");

const router = express.Router();

// ===== GET All Activities for Logged-In User =====
router.get("/", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in." });
  }

  const activities = await Activity.find({
    userId: req.session.userId,
  }).sort({ date: 1 });

  res.send(activities);
});

// ===== CREATE Activity =====
router.post("/", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in." });
  }

  const { title, date } = req.body;

  if (!title || !date) {
    return res.status(400).send({ error: "Title and date required." });
  }

  const newActivity = await Activity.create({
    userId: req.session.userId,
    title,
    date,
  });

  res.send(newActivity);
});

// ===== TOGGLE Complete =====
router.put("/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in." });
  }

  const activity = await Activity.findOne({
    _id: req.params.id,
    userId: req.session.userId,
  });

  if (!activity) {
    return res.status(404).send({ error: "Activity not found." });
  }

  activity.completed = !activity.completed;
  await activity.save();

  res.send(activity);
});

// ===== DELETE Activity =====
router.delete("/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in." });
  }

  await Activity.deleteOne({
    _id: req.params.id,
    userId: req.session.userId,
  });

  res.send({ message: "Activity deleted." });
});

module.exports = router;
