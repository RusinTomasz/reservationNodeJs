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

router.put(
  "/appointment/close/:appointmentId",
  isAuth,
  // authRole("admin"),
  appointmentController.closeAppointment
);

module.exports = router;
