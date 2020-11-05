const express = require("express");
const { authRole } = require("../middleware/role-auth.js");
const isAuth = require("../middleware/is-auth");
const clientController = require("../controllers/client");

const router = express.Router();

router.get(
  "/client/appoitments/:clientId",
  isAuth,
  authRole(process.env.CLIENTPERMISSIONS),
  clientController.fetchClientAppoitments
);

module.exports = router;
