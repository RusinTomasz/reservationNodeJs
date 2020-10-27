const express = require("express");
const { authRole } = require("../middleware/role-auth.js");
// const { createServiceValidator } = require("../helpers/validators");
const scheduleController = require("../controllers/schedule");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/schedule/create",
  isAuth,
  authRole(process.env.ADMINPERMISSIONS),
  scheduleController.createSchedule
);

module.exports = router;
