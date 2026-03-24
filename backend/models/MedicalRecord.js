const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
    required: true
  },

  type: {
    type: String,
    required: true
  },

  description: String,

  date: {
    type: Date,
    required: true
  },

  fileUrl: String

}, { timestamps: true });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);