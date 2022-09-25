const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  dob: {
    type: Date,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  images: [
    {
      type: String,
      required: false,
    },
  ],
  isBlocked: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
