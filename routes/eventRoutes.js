const express = require("express");
const router = express.Router();
const {
  addEvent,
  getAllEvents,
  getAllMyEvents,
  joinEvent,
  exitEvent,
  addEventMessage,
  getAllEventMessages,
} = require("../controllers/eventController.js");

router.get("/", getAllEvents);
router.post("/add", addEvent);
router.post("/join", joinEvent);
router.post("/exit", exitEvent);
router.post("/add-message", addEventMessage);
router.post("/get-messages", getAllEventMessages);
//Log in user
router.post("/my-events", getAllMyEvents);

module.exports = router;
