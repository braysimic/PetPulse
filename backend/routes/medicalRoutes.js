const express = require("express");
const router = express.Router();
const multer = require("multer");

const MedicalRecord = require("../models/MedicalRecord");
const Pet = require("../models/Pet");

// STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


// GET
router.get("/:petId", async (req, res) => {

  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in" });
  }

  const records = await MedicalRecord.find({
    owner: req.session.userId,
    pet: req.params.petId
  }).sort({ date: -1 });

  res.send(records);
});


// CREATE
router.post("/", upload.single("file"), async (req, res) => {

  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in" });
  }

  const { petId, type, description, date } = req.body;

  const fileUrl = req.file
    ? `/uploads/${req.file.filename}`
    : "";

  const record = new MedicalRecord({
    owner: req.session.userId,
    pet: petId,
    type,
    description,
    date,
    fileUrl
  });

  await record.save();

  res.send({ message: "Record created" });
});


// DELETE
router.delete("/:id", async (req, res) => {

  await MedicalRecord.findOneAndDelete({
    _id: req.params.id,
    owner: req.session.userId
  });

  res.send({ message: "Deleted" });
});

module.exports = router;