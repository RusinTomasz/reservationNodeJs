const express = require("express");
const { authRole } = require("../middleware/role-auth.js");
const { createServiceValidator } = require("../helpers/validators");
const servicesController = require("../controllers/services");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get(
  "/services",
  isAuth,
  authRole(process.env.ADMINPERMISSIONS),
  servicesController.fetchServices
);

router.post(
  "/services/create",
  isAuth,
  authRole(process.env.EMPLOYEEPERMISSIONS),
  createServiceValidator,
  servicesController.createService
);

module.exports = router;
