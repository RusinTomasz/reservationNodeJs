const express = require("express");
const { authRole } = require("../middleware/role-auth.js");
const employeeController = require("../controllers/employee");
const isAuth = require("../middleware/is-auth");
const { createEmployeeValidator } = require("../helpers/validators");

const router = express.Router();

router.get(
  "/employees",
  isAuth,
  authRole(process.env.ADMINPERMISSIONS),
  employeeController.fetchEmployees
);

router.post(
  "/employee/create",
  isAuth,
  authRole(process.env.ADMINPERMISSIONS),
  createEmployeeValidator,
  employeeController.createEmployee
);

module.exports = router;
