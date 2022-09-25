const mongoose = require("mongoose");
const Hangout = require("../models/hangoutModel");
const moment = require("moment");

// @desc    Add new hangout
// @route   POST /api/hangouts/add
// @access  Public
const addHangout = (req, res) => {
  Hangout.create(
    {
      createdBy: mongoose.Types.ObjectId(req.body.createdBy),
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      members: [req.body.createdBy],
    },
    (err, hangout) => {
      if (hangout) {
        res.status(200).json(hangout);
      } else {
        res.status(404).send(err);
      }
    }
  );
};

// @desc    Get all hangouts (only login user hangouts)
// @route   POST /api/hangouts/
// @access  Public
const getAllHangouts = (req, res) => {
  Hangout.find({})
    .populate("createdBy")
    .populate("messages.sender")
    .populate("members")
    .exec((err, hangouts) => {
      if (hangouts) {
        res.status(200).json(hangouts);
      } else {
        res.status(404).send(err);
      }
    });
};
// @desc    Get my entered hangouts
// @route   POST /api/hangouts/my-hangouts/
// @access  login user
const getAllMyHangouts = (req, res) => {
  const { id, date } = req.body;
  const endDate = moment(date).add(1, "days").format("YYYY-MM-DD");

  Hangout.find({
    $or: [{ members: { $elemMatch: { $eq: id } } }, { createdBy: id }],
    $expr: {
      $and: [
        { $gte: ["$date", moment(date).toDate()] },
        { $lt: ["$date", moment(endDate).toDate()] },
      ],
    },
  })
    .populate("members")
    .exec((err, hangouts) => {
      if (err) res.status(404).send(err);
      else
        res.status(200).json({
          total: hangouts.length,
          hangouts,
        });
    });
};
// @desc    User joins a hangout
// @route   POST /api/hangouts/join
// @access  Public
const joinHangout = (req, res) => {
  Hangout.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.hangout_id),
    },
    {
      $push: { members: mongoose.Types.ObjectId(req.body.user_id) },
    },
    { new: true },
    (err, updatedHangout) => {
      if (updatedHangout) res.status(200).json(updatedHangout);
      else res.status(404).send(err);
    }
  );
};

// @desc    User exits a hangout
// @route   POST /api/hangouts/exit
// @access  Public
const exitHangout = (req, res) => {
  Hangout.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.hangout_id),
    },
    {
      $pull: { members: mongoose.Types.ObjectId(req.body.user_id) },
    },
    { new: true },
    (err, updatedHangout) => {
      if (updatedHangout) res.status(200).json(updatedHangout);
      else res.status(404).send(err);
    }
  );
};
// @desc    User Edit hangout
// @route   delete /api/hangouts/edit/:id
// @access  login user
const editHangout = (req, res) => {
  const { id } = req.params;
  Hangout.findByIdAndUpdate(
    mongoose.Types.ObjectId(id),
    req.body,
    { new: true },
    (err, updatedHangout) => {
      if (err) return res.status(404).send(err);
      res.status(200).json(updatedHangout);
    }
  );
};
// @desc    User delete hangout
// @route   delete /api/hangouts/delete/:id
// @access  login user
const deleteHangout = (req, res) => {
  const { id } = req.params;
  Hangout.findByIdAndDelete(mongoose.Types.ObjectId(id), (err) => {
    if (err) return res.status(404).send(err);
    res
      .status(204)
      .json({ success: true, message: "Hangout deleted successfully" });
  });
};

// @desc    Add message to message thread
// @route   POST /api/hangouts/add-message
// @access  Public
const addHangoutMessage = (req, res) => {
  const message = {
    sender: mongoose.Types.ObjectId(req.body.user_id),
    content: req.body.message,
  };
  Hangout.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.hangout_id),
    },
    {
      $push: { messages: message },
    },
    { new: true },
    (err, updatedThread) => {
      if (updatedThread) res.status(200).json(updatedThread);
      else res.status(404).send(err);
    }
  );
};

// @desc    Get all messages from message thread
// @route   POST /api/hangouts/get-messages
// @access  Public
const getAllHangoutMessages = (req, res) => {
  Hangout.find({ _id: mongoose.Types.ObjectId(req.body.hangout_id) })
    .populate("messages.sender")
    .exec((err, hangoutMessages) => {
      if (err) res.status(404).send(err);
      else res.status(200).json(hangoutMessages[0].messages);
    });
};

module.exports = {
  addHangout,
  getAllHangouts,
  getAllMyHangouts,
  joinHangout,
  exitHangout,
  editHangout,
  deleteHangout,
  addHangoutMessage,
  getAllHangoutMessages,
};
