const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
{
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

  task: {
    type: String,
    required: true,
    trim: true
  },

  date: {
    type: Date,
    required: true
  },

  completed: {
    type: Boolean,
    default: false
  },

  repeat: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly"],
    default: "none"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);