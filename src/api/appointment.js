const express = require("express");
const { authRole } = require("../middleware/role-auth.js");
const isAuth = require("../middleware/is-auth");
const appointmentController = require("../controllers/appointment");

const router = express.Router();

router.post(
  "/appointment/create",
  isAuth,
  authRole(process.env.CLIENTPERMISSIONS),
  appointmentController.createAppointment
);

router.put(
  "/appointment/close/:appointmentId",
  isAuth,
  authRole(process.env.EMPLOYEEPERMISSIONS),
  appointmentController.closeAppointment
);

module.exports = router;
