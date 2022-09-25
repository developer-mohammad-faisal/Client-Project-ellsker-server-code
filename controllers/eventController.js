const mongoose = require("mongoose");
const Event = require("../models/eventModel");
const path = require("path");
const moment = require("moment");

// @desc    Add new event
// @route   POST /api/events/add
// @access  Public
const addEvent = (req, res) => {
  Event.create(
    {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
    },
    (err, event) => {
      if (event) {
        const file = req.files.file;
        const filePath = path.join(
          __dirname,
          "..",
          "..",
          "client",
          "public",
          "images",
          "events",
          `${event._id.toString()}.jpg`
        );
        file.mv(filePath);
        res.status(200).json(event);
      } else {
        res.status(404).send(err);
      }
    }
  );
};

// @desc    Get all events
// @route   POST /api/events/
// @access  Public
const getAllEvents = (req, res) => {
  Event.find({})
    .populate("messages.sender")
    .populate("members")
    .exec((err, events) => {
      if (err) res.status(404).send(err);
      else res.status(200).json(events);
    });
};
// @desc    Get my entered events
// @route   POST /api/events/my-events/
// @access  login user
const getAllMyEvents = (req, res) => {
  const { id, date } = req.body;
  const endDate = moment(date).add(1, "days").format("YYYY-MM-DD");
  // console.log(date, endDate);
  Event.find({
    members: { $elemMatch: { $eq: id } },
    $expr: {
      $and: [
        { $gte: ["$date", moment(date).toDate()] },
        { $lt: ["$date", moment(endDate).toDate()] },
      ],
    },
  })
    .populate("members")
    .exec((err, events) => {
      if (err) res.status(404).send(err);
      else
        res.status(200).json({
          total: events.length,
          events,
        });
    });
};

// @desc    User joins an event
// @route   POST /api/events/join
// @access  Public
const joinEvent = (req, res) => {
  Event.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.event_id),
    },
    {
      $push: { members: mongoose.Types.ObjectId(req.body.user_id) },
    },
    { new: true },
    (err, updatedEvent) => {
      if (updatedEvent) res.status(200).json(updatedEvent);
      else res.status(404).send(err);
    }
  );
};

// @desc    User exits an event
// @route   POST /api/events/exit
// @access  Public
const exitEvent = (req, res) => {
  Event.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.event_id),
    },
    {
      $pull: { members: mongoose.Types.ObjectId(req.body.user_id) },
    },
    { new: true },
    (err, updatedEvent) => {
      if (updatedEvent) res.status(200).json(updatedEvent);
      else res.status(404).send(err);
    }
  );
};

// @desc    Add message to message thread
// @route   POST /api/events/add-message
// @access  Public
const addEventMessage = (req, res) => {
  const message = {
    sender: mongoose.Types.ObjectId(req.body.user_id),
    content: req.body.message,
  };
  Event.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.body.event_id),
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

// @desc    Add message to message thread
// @route   POST /api/events/get-messages
// @access  Public
const getAllEventMessages = (req, res) => {
  Event.find({ _id: mongoose.Types.ObjectId(req.body.event_id) })
    .populate("messages.sender")
    .exec((err, eventMessages) => {
      if (err) res.status(404).send(err);
      else res.status(200).json(eventMessages[0].messages);
    });
};

module.exports = {
  addEvent,
  getAllEvents,
  getAllMyEvents,
  joinEvent,
  exitEvent,
  addEventMessage,
  getAllEventMessages,
};
