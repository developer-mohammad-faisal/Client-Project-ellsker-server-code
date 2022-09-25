const Admin = require("../models/adminModel");

exports.restrictTo =
  (...roles) =>
  async (req, res, next) => {

    try {
      if (roles.includes("admin")) {
        const { userid } = req.headers;

        // find admin
        const admin = await Admin.findById(userid);
        if (!admin) {
          return res.status(400).json({
            message: "You are unauthorize to access this route",
            status: "fail",
          });
        }
      }
      next();
    } catch (error) {
      res.status(400).json({ message: error.message, status: "fail" });
    }
  };
