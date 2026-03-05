const express = require("express");
const router = express.Router();
const Pet = require("../models/Pet");


// ================= GET ALL PETS =================
router.get("/", async (req, res) => {
  try {

    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const pets = await Pet.find({
      owner: req.session.userId
    });

    res.send(pets);

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
      owner: req.session.userId
    });

    if (!pet) {
      return res.status(404).send({ error: "Pet not found" });
    }

    res.send(pet);

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
      owner: req.session.userId
    });

    res.send({ message: "Pet created", pet });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }

});


// ================= UPDATE PET =================
router.put("/:id", async (req, res) => {

  try {

    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const { name, species, breed } = req.body;

    const pet = await Pet.findOne({
      _id: req.params.id,
      owner: req.session.userId
    });

    if (!pet) {
      return res.status(404).send({ error: "Pet not found" });
    }

    pet.name = name;
    pet.species = species;
    pet.breed = breed;

    await pet.save();

    res.send({ message: "Pet updated successfully" });

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

    const deleted = await Pet.findOneAndDelete({
      _id: req.params.id,
      owner: req.session.userId
    });

    if (!deleted) {
      return res.status(404).send({ error: "Pet not found" });
    }

    res.send({ message: "Pet deleted" });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }

});


module.exports = router;