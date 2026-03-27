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


// ================= GET =================
router.get("/:petId", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const records = await MedicalRecord.find({
      owner: req.session.userId,
      pet: req.params.petId
    }).sort({ date: -1 });

    res.send(records);

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// ================= CREATE =================
router.post("/", upload.single("file"), async (req, res) => {
  try {
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

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});


// ================= UPDATE (NEW) =================
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ error: "Not logged in" });
    }

    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      owner: req.session.userId
    });

    if (!record) {
      return res.status(404).send({ error: "Record not found" });
    }

    const { type, description, date } = req.body;

    if (type) record.type = type;
    if (description) record.description = description;
    if (date) record.date = date;

    if (req.file) {
      record.fileUrl = `/uploads/${req.file.filename}`;
    }

    await record.save();

    res.send({ message: "Record updated" });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});


// ================= DELETE =================
router.delete("/:id", async (req, res) => {
  try {
    await MedicalRecord.findOneAndDelete({
      _id: req.params.id,
      owner: req.session.userId
    });

    res.send({ message: "Deleted" });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;