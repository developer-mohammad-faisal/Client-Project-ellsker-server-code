const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  content: {
    type: String,
    required: true,
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
});

const hangoutSchema = mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  ],
  messages: [messageSchema],
});

const Hangout = mongoose.model("Hangout", hangoutSchema);
module.exports = Hangout;
