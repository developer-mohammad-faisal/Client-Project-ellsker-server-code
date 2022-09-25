const express = require("express");
const router = express.Router();
const {
  addAdmin,
  adminLogin,
  getAllResources,
  getAllEvents,
  getAllInvites,
  getAllUsers,
  createEvent,
  updateEvent,
  deleteEvent,
  updateMe,
  updatePassword,
} = require("../controllers/adminController");
const { blockUser, unblockUser } = require("../controllers/userController");
const { deleteHangout } = require("../controllers/hangoutController");
const { restrictTo } = require("../middlewares/auth");

router.post("/login", adminLogin);
router.use(restrictTo("admin"));
router.post("/add", addAdmin);
router.patch("/update-me", updateMe);
router.patch("/update-password", updatePassword);
router.post("/event", createEvent);
router.route("/event/:id").patch(updateEvent).delete(deleteEvent);
router.delete("/invite/:id", deleteHangout);
router.get("/total-resources", getAllResources);
router.get("/events", getAllEvents);
router.get("/invites", getAllInvites);
router.get("/users", getAllUsers);
router.post("/block-user", blockUser);
router.post("/unblock-user", unblockUser);

module.exports = router;
