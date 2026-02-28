const express = require("express");
const Pet = require("../models/Pet");

const router = express.Router();


// ================= GET ALL PETS =================
router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const pets = await Pet.find({
      owner: req.session.userId,
    }).sort({ createdAt: -1 });

    res.send(pets);

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// ================= CREATE PET =================
router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const { name, species, breed } = req.body;

    if (!name || !species || !breed) {
      return res.status(400).send({ error: "All fields required" });
    }

    const pet = await Pet.create({
      name,
      species,
      breed,
      owner: req.session.userId, // 🔥 VERY IMPORTANT
    });

    res.send({ message: "Pet created", pet });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// ================= GET SINGLE PET =================
router.get("/:id", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const pet = await Pet.findOne({
      _id: req.params.id,
      owner: req.session.userId, // security check
    });

    if (!pet) {
      return res.status(404).send({ error: "Pet not found" });
    }

    res.send(pet);

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// ================= DELETE PET =================
router.delete("/:id", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    await Pet.findOneAndDelete({
      _id: req.params.id,
      owner: req.session.userId,
    });

    res.send({ message: "Pet deleted" });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;