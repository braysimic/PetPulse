const express = require("express");
const router = express.Router();

const Reminder = require("../models/Reminder");
const Pet = require("../models/Pet");


// ================= GET ALL REMINDERS =================
router.get("/", async (req, res) => {

  try {

    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const reminders = await Reminder.find({
      owner: req.session.userId
    })
    .populate("pet", "name")
    .sort({ date: 1 });

    res.send(reminders);

  } catch (err) {

    res.status(500).send({ error: err.message });

  }

});


// ================= CREATE REMINDER =================
router.post("/", async (req, res) => {

  try {

    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const { petId, task, date, repeat } = req.body;

    if (!petId || !task || !date) {
      return res.status(400).send({ error: "All fields required" });
    }

    const pet = await Pet.findOne({
      _id: petId,
      owner: req.session.userId
    });

    if (!pet) {
      return res.status(404).send({ error: "Pet not found" });
    }

    const reminder = new Reminder({
      owner: req.session.userId,
      pet: petId,
      task,
      date,
      repeat: repeat || "none"
    });

    await reminder.save();

    res.send({ message: "Reminder created successfully" });

  } catch (err) {

    res.status(500).send({ error: err.message });

  }

});


// ================= UPDATE REMINDER =================
router.put("/:id", async (req, res) => {

  try {

    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const { task, date, completed } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      owner: req.session.userId
    });

    if (!reminder) {
      return res.status(404).send({ error: "Reminder not found" });
    }

    if (task !== undefined) reminder.task = task;
    if (date !== undefined) reminder.date = date;

    if (completed !== undefined) {

      reminder.completed = completed;

      // ===== RECURRING REMINDER LOGIC =====
      if (completed === true && reminder.repeat !== "none") {

        let nextDate = new Date(reminder.date);

        if (reminder.repeat === "daily") {
          nextDate.setDate(nextDate.getDate() + 1);
        }

        if (reminder.repeat === "weekly") {
          nextDate.setDate(nextDate.getDate() + 7);
        }

        if (reminder.repeat === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }

        await Reminder.create({
          owner: reminder.owner,
          pet: reminder.pet,
          task: reminder.task,
          date: nextDate,
          repeat: reminder.repeat
        });

      }

    }

    await reminder.save();

    res.send({ message: "Reminder updated" });

  } catch (err) {

    res.status(500).send({ error: err.message });

  }

});


// ================= DELETE REMINDER =================
router.delete("/:id", async (req, res) => {

  try {

    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const deleted = await Reminder.findOneAndDelete({
      _id: req.params.id,
      owner: req.session.userId
    });

    if (!deleted) {
      return res.status(404).send({ error: "Reminder not found" });
    }

    res.send({ message: "Reminder deleted" });

  } catch (err) {

    res.status(500).send({ error: err.message });

  }

});

module.exports = router;