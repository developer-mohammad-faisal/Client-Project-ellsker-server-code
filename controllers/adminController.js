const path = require("path");
const fs = require("fs");
const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const Event = require("../models/eventModel");
const Invite = require("../models/hangoutModel");
const User = require("../models/userModel");
const buildPath = require("../utils/buildPath");

// @desc    Add a new admin
// @route   POST /api/admins/add
// @access  Public
const addAdmin = (req, res) => {
  const { name, username, password } = req.body;
  Admin.findOne({ username }).then((userExists) => {
    if (userExists) {
      //user already exists with this username
      res.status(404).json({
        existingUser: true,
      });
    } else {
      if (!name || !username || !password) {
        return res.status(400).json({
          message: "Invalid input",
        });
      }
      bcrypt.hash(password, 6).then((hashedPassword) => {
        Admin.create({
          name: name,
          username: username,
          password: hashedPassword,
        }).then((admin) => {
          res.status(201).json({
            _id: admin._id,
            name: admin.name,
            username: admin.username,
          });
        });
      });
    }
  });
};

// @desc    Login admin
// @route   POST /api/admins/login
// @access  Public
const adminLogin = (req, res) => {
  const { username, password } = req.body;
  Admin.findOne({ username }).then((admin) => {
    if (admin) {
      bcrypt.compare(password, admin.password).then((isMatch) => {
        if (isMatch) {
          res.status(200).json({
            _id: admin._id,
            name: admin.name,
            username: admin.username,
          });
        } else {
          res.status(400).json({
            //username found, but incorrect password
            isUsernameMatch: true,
            isPasswordMatch: false,
          });
        }
      });
    } else {
      //username not found
      res.status(400).json({
        isUsernameMatch: false,
      });
    }
  });
};
// @desc    Update login admin himself
// @route   PATCH /api/admins/update-me
// @access  Private(only admin)

const updateMe = async (req, res, next) => {
  const { name, email } = req.body;

  try {
    const admin = await Admin.findOneAndUpdate(
      { email },
      {
        name,
        email,
      },
      { new: true }
    );
    res.status(200).json({ status: "Success", admin });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      error: error.messag,
    });
  }
};

// @desc    Update password
// @route   PATCH /api/admins/update-password
// @access  Private(only admin)

const updatePassword = async (req, res, next) => {
  try {
    const { currPassword, newPassword } = req.body;
    const { userid: id } = req.headers;
    const admin = await Admin.findById(id);
    if (!admin)
      return res
        .status(400)
        .json({ status: "fail", message: "Password mismatch!" });
    if (!(currPassword && (await bcrypt.compare(currPassword, admin.password))))
      return res
        .status(400)
        .json({ status: "fail", message: "Password mismatch!" });
    const newHashPassword = await bcrypt.hash(newPassword, 6);
    admin.password = newHashPassword;
    await admin.save();
    res.status(200).json({ status: "success", admin });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/admins/event
// @access  Private(only admin)

const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);

    const file = req.files.file;
    const filePath = buildPath("events", event._id.toString());

    file.mv(filePath);
    res.status(200).json({ status: "success", event });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// @desc    Update event
// @route   PATCH /api/admins/event/:id
// @access  Private(only admin)
const updateEvent = async (req, res, next) => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (req?.files?.file) {
      // update the event image
      let filePath = buildPath("events", event._id.toString());
      fs.writeFileSync(filePath, req.files.file.data);
    }
    res.status(200).json({ status: "success", event });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "fail", message: error.message });
  }
};
// @desc    Delete event
// @route   Delete /api/admins/event/:id
// @access  Private(only admin)
const deleteEvent = async (req, res, next) => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndDelete(id);
    //delete the event image
    const filePath = buildPath("events", id);
    fs.unlinkSync(filePath);
    res.status(204).json({ status: "success", event });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// @desc    Get all Total resources
// @route   GET /api/admins/total-resources
// @access  Private(only admin)

const getAllResources = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalInvites = await Invite.countDocuments();
    const totalUsers = await User.countDocuments();
    res
      .status(200)
      .json({ status: "success", totalEvents, totalInvites, totalUsers });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// @desc    Get all Events
// @route   GET /api/admins/events
// @access  Private(only admin)

const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().select("title description date location");
    res.json({ status: "success", events });
  } catch (error) {
    res.status(404).json({ status: "success", message: error.message });
  }
};
// @desc    Get all Invites
// @route   GET /api/admins/invites
// @access  Private(only admin)

const getAllInvites = async (req, res, next) => {
  try {
    const invites = await Invite.find()
      .select("title description date location")
      .populate("createdBy", "name");
    res.json({ status: "success", invites });
  } catch (error) {
    res.status(404).json({ status: "success", message: error.message });
  }
};
// @desc    Get all Users
// @route   GET /api/admins/users
// @access  Private(only admin)

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select(
      "name email dob description location"
    );
    res.json({ status: "success", users });
  } catch (error) {
    res.status(404).json({ status: "success", message: error.message });
  }
};

module.exports = {
  addAdmin,
  adminLogin,
  getAllResources,
  getAllEvents,
  getAllInvites,
  getAllUsers,
  createEvent,
  deleteEvent,
  updateEvent,
  updateMe,
  updatePassword,
};
