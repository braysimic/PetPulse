const express = require("express");
const router = express.Router();

const VetContact = require("../models/VetContact");


// ================= GET =================
router.get("/", async (req, res) => {

  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in" });
  }

  const contact = await VetContact.findOne({
    owner: req.session.userId
  });

  res.send(contact || {});
});


// ================= SAVE / UPDATE =================
router.post("/", async (req, res) => {

  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in" });
  }

  const { primary, emergency } = req.body;

  let contact = await VetContact.findOne({
    owner: req.session.userId
  });

  if (!contact) {
    contact = new VetContact({
      owner: req.session.userId,
      primary,
      emergency
    });
  } else {
    contact.primary = primary;
    contact.emergency = emergency;
  }

  await contact.save();

  res.send({ message: "Saved successfully" });
});

module.exports = router;