const mongoose = require("mongoose");
const User = require("../models/userModel.js");
const Event = require("../models/eventModel");
const Hangout = require("../models/hangoutModel");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const verifier = require("email-verify");
const randomstring = require("randomstring");
const path = require("path");
const moment = require("moment");
const buildPath = require("../utils/buildPath");

// @desc    Get all events and hangout of given month
// @route   post  /api/users/event-hangout/month
// @access  login user
const getAllEventHangout = async (req, res) => {
  const { id, date } = req.body;
  const startDate = moment(date).startOf("month").format("YYYY-MM-DD");
  const endDate = moment(date).endOf("month").format("YYYY-MM-DD");
  // console.log(startDate, endDate);
  // console.log(date, endDate);
  try {
    let events = await Event.find({
      members: { $elemMatch: { $eq: id } },
      $expr: {
        $and: [
          { $gte: ["$date", new Date(startDate)] },
          { $lt: ["$date", new Date(endDate)] },
        ],
      },
    }).select("date");
    // console.log(events);
    events = events.map((e) => moment(e.date).format("MMMM D, YYYY"));

    let hangouts = await Hangout.find({
      $or: [{ members: { $elemMatch: { $eq: id } } }, { createdBy: id }],
      $expr: {
        $and: [
          { $gte: ["$date", new Date(startDate)] },
          { $lt: ["$date", new Date(endDate)] },
        ],
      },
    }).select("date");
    // console.log(hangouts);
    hangouts = hangouts.map((h) => moment(h.date).format("MMMM D, YYYY"));
    const allDates = [...new Set(hangouts.concat(events))];
    res.status(200).json({ results: allDates.length, allDates });
  } catch (error) {
    res.status(404).json({ success: false, msg: error.message });
  }
};
// @desc    Get all users
// @route   GET /api/users/
// @access  Public
const getAllUsers = (req, res) => {
  User.find({}).then((users) => {
    res.status(201).json({ users });
  });
};

// @desc    Get specific user
// @route   POST /api/users/get-user
// @access  Public
const getUser = (req, res) => {
  User.find({ _id: mongoose.Types.ObjectId(req.body.user_id) }).then((user) => {
    res.status(201).json(user);
  });
};

// @desc    Add a user image
// @route   POST /api/users/add-image
// @access  Public
const addUserImage = (req, res) => {
  const randomFileName = randomstring.generate(20);
  User.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.user_id),
    },
    {
      $push: { images: `./images/users/${randomFileName}.jpg` },
    },
    { new: true },
    (err, updatedUser) => {
      if (updatedUser) {
        const file = req.files.file;
        const filePath = buildPath("users", randomFileName);
        file.mv(filePath);
        res.status(200).json(updatedUser);
      } else res.status(404).send(err);
    }
  );
};

// @desc    Delete a user's image
// @route   POST /api/users/delete-image
// @access  Public
const deleteUserImage = (req, res) => {
  const fileName = req.body.image_path.split("/")[3];
  const filePath = buildPath("users", fileName);
  User.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.user_id),
    },
    {
      $pull: { images: `./images/users/${fileName}` },
    },
    { new: true },
    (err, updatedUser) => {
      if (updatedUser) {
        fs.unlink(filePath, (err) => {
          if (err) return console.log(err);
          else res.status(200).json(updatedUser);
        });
      } else res.status(404).send(err);
    }
  );
};

// @desc    Update a user's name
// @route   POST /api/users/update-name
// @access  Public
const updateUserName = (req, res) => {
  User.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.user_id),
    },
    {
      name: req.body.name,
    },
    { new: true },
    (err, updatedUser) => {
      if (updatedUser) res.status(200).json(updatedUser);
      else res.status(404).send(err);
    }
  );
};

// @desc    Update a user's date of birth
// @route   POST /api/users/update-dob
// @access  Public
const updateUserDOB = (req, res) => {
  User.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.user_id),
    },
    {
      dob: req.body.dob,
    },
    { new: true },
    (err, updatedUser) => {
      if (updatedUser) res.status(200).json(updatedUser);
      else res.status(404).send(err);
    }
  );
};

// @desc    Update a user's location
// @route   POST /api/users/update-location
// @access  Public
const updateUserLocation = (req, res) => {
  User.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.user_id),
    },
    {
      location: req.body.location,
    },
    { new: true },
    (err, updatedUser) => {
      if (updatedUser) res.status(200).json(updatedUser);
      else res.status(404).send(err);
    }
  );
};

// @desc    Update a user's description
// @route   POST /api/users/update-description
// @access  Public
const updateUserDescription = (req, res) => {
  User.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.user_id),
    },
    {
      description: req.body.description,
    },
    { new: true },
    (err, updatedUser) => {
      if (updatedUser) res.status(200).json(updatedUser);
      else res.status(404).send(err);
    }
  );
};

// @desc    Block a user
// @route   POST /api/users/block
// @access  Public
const blockUser = (req, res) => {
  User.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.user_id),
    },
    {
      isBlocked: true,
    },
    { new: true },
    (err, updatedUser) => {
      if (updatedUser) res.status(200).json(updatedUser);
      else res.status(404).send(err);
    }
  );
};

// @desc    Unblock a user
// @route   POST /api/users/unblock
// @access  Public
const unblockUser = (req, res) => {
  User.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.user_id),
    },
    {
      isBlocked: false,
    },
    { new: true },
    (err, updatedUser) => {
      if (updatedUser) res.status(200).json(updatedUser);
      else res.status(404).send(err);
    }
  );
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = (req, res) => {
  const { name, email, password, image } = req.body;
  verifier.verify(email, function (err, info) {
    if (err) {
      console.log(err);
      res.status(400).json({
        emailInvalid: true,
      });
    } else {
      if (info.success === false)
        res.status(400).json({
          emailInvalid: true,
        });
      else {
        User.findOne({ email }).then((userExists) => {
          if (userExists) {
            //user already exists in this email
            res.status(400).json({
              existingUser: true,
            });
          } else {
            bcrypt.hash(password, 6).then((hashedPassword) => {
              User.create({
                name: name,
                email: email,
                password: hashedPassword,
                $push: { images: image },
              }).then((user) => {
                res.status(201).json({
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  images: user.images,
                  isBlocked: user.isBlocked,
                });
              });
            });
          }
        });
      }
    }
  });
};

// @desc    Authenticate user and login
// @route   POST /api/users/login
// @access  Public
const loginUser = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            images: user.images,
            isBlocked: user.isBlocked,
          });
        } else {
          res.status(400).json({
            //email found, but incorrect password
            isEmailMatch: true,
            isPasswordMatch: false,
          });
        }
      });
    } else {
      //email not found
      res.status(400).json({
        isEmailMatch: false,
      });
    }
  });
};

// @desc    Login/signup via facebook
// @route   POST /api/users/fb-auth
// @access  Public
const FBauth = (req, res) => {
  const { name, email, image } = req.body;
  User.findOne({ email }).then((user) => {
    if (user) {
      //updating info because info from facebook is changed
      User.findOneAndUpdate(
        { email },
        { $set: { "images.0": image } },
        { new: true },
        (err, updatedUser) => {
          res.status(201).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            images: updatedUser.images,
            isBlocked: updatedUser.isBlocked,
          });
        }
      );
    } else {
      User.create({
        name: name,
        email: email,
        images: [image],
      }).then((user) => {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          images: user.images,
          isBlocked: user.isBlocked,
        });
      });
    }
  });
};

module.exports = {
  loginUser,
  registerUser,
  FBauth,
  getAllUsers,
  getUser,
  blockUser,
  unblockUser,
  addUserImage,
  updateUserName,
  updateUserDOB,
  updateUserLocation,
  updateUserDescription,
  deleteUserImage,
  getAllEventHangout,
};
