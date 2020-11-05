const express = require("express");
const { authRole } = require("../middleware/role-auth.js");
const isAuth = require("../middleware/is-auth");
const employeeController = require("../controllers/employee");
const { createEmployeeValidator } = require("../helpers/validators");

const router = express.Router();

router.get(
  "/employees",
  isAuth,
  authRole(process.env.CLIENTPERMISSIONS),
  employeeController.fetchEmployees
);

router.post(
  "/employee/create",
  isAuth,
  authRole(process.env.ADMINPERMISSIONS),
  createEmployeeValidator,
  employeeController.createEmployee
);

router.get(
  "/employee/appoitments/:employeeId",
  isAuth,
  authRole(process.env.CLIENTPERMISSIONS),
  employeeController.fetchEmployeeAppoitments
);

module.exports = router;
