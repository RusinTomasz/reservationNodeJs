const express = require("express");
const { body } = require("express-validator");

const isNotVerified = require("../middleware/is-not-verified");
const User = require("../models/user");
const authController = require("../controllers/auth");
const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({
          where: {
            email: value,
          },
        }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exist");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 1 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", isNotVerified, authController.login);

router.get("/verify-email", authController.verifyEmail);

router.put("/forgot-password", authController.forgotPassword);
router.put("/reset-password", authController.resetPassword);

module.exports = router;
