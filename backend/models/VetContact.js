const mongoose = require("mongoose");

const vetContactSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  primary: {
    clinicName: String,
    vetName: String,
    phone: String
  },

  emergency: {
    clinicName: String,
    phone: String,
    address: String
  }

}, { timestamps: true });

module.exports = mongoose.model("VetContact", vetContactSchema);