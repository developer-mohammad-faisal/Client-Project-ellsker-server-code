const express = require("express");
const router = express.Router();
const {
  getAllHangouts,
  getAllMyHangouts,
  addHangout,
  joinHangout,
  exitHangout,
  addHangoutMessage,
  getAllHangoutMessages,
  editHangout,
  deleteHangout,
} = require("../controllers/hangoutController.js");

router.get("/", getAllHangouts);
router.post("/add", addHangout);
router.post("/join", joinHangout);
router.post("/exit", exitHangout);
router.post("/add-message", addHangoutMessage);
router.post("/get-messages", getAllHangoutMessages);
//Log in user
router.post("/my-hangouts", getAllMyHangouts);
router.patch("/edit/:id", editHangout);
router.delete("/delete/:id", deleteHangout);

module.exports = router;
