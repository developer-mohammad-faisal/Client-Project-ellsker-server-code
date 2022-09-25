const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  FBauth,
  getAllUsers,
  blockUser,
  unblockUser,
  getUser,
  addUserImage,
  updateUserName,
  updateUserDOB,
  updateUserLocation,
  updateUserDescription,
  deleteUserImage,
  getAllEventHangout,
} = require("../controllers/userController.js");

router.get("/", getAllUsers);
router.post("/get-user", getUser);
router.post("/add-image", addUserImage);
router.post("/delete-image", deleteUserImage);
router.post("/update-name", updateUserName);
router.post("/update-dob", updateUserDOB);
router.post("/update-location", updateUserLocation);
router.post("/update-description", updateUserDescription);
router.post("/block", blockUser);
router.post("/unblock", unblockUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/fb-auth", FBauth);

//Login user
// Get all the events and hangout that user have this month
router.post("/event-hangout/month", getAllEventHangout);

module.exports = router;
