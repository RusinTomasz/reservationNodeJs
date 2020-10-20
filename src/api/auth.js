const express = require("express");
const { signUpValidator } = require("../helpers/validators");
const isNotVerified = require("../middleware/is-not-verified");
const authController = require("../controllers/auth");
const router = express.Router();

router.post("/signup", signUpValidator, authController.signup);

router.post("/login", isNotVerified, authController.login);

router.get("/verify-email", authController.verifyEmail);
//
router.put("/forgot-password", authController.forgotPassword);
router.put("/reset-password", authController.resetPassword);

module.exports = router;
