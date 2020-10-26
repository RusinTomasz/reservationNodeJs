const express = require("express");
const { authRole } = require("../middleware/role-auth.js");
const appointmentController = require("../controllers/appointment");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/appointment/create",
  isAuth,
  // authRole("admin"),
  appointmentController.createAppointment
);

module.exports = router;
