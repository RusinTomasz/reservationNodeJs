const { body } = require("express-validator");
const User = require("../models/user");

exports.signUpValidator = [
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
  body("password").trim().isLength({ min: 6 }),
  body("name").trim().not().isEmpty(),
];
