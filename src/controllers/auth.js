require("dotenv").config();

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const createError = require("http-errors");
const User = require("../models/user");
const nodemailer = require("nodemailer");

const { UserService } = require("../services/userService");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw createError(422, errors.errors[0].msg);
    }
    const { email, name, password } = req.body;
    const authServiceInstance = new UserService();
    const createdUserName = await authServiceInstance.signUp(
      email,
      name,
      password
    );
    if (createdUserName instanceof Error) {
      throw createError(422, createdUserName);
    } else {
      res
        .status(201)
        .json({ message: "User created!", createdUserName: createdUserName });
    }
  } catch (error) {
    next(error);
  }
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadeduser;
  User.findOne({
    where: {
      email: email,
    },
  })
    .then((user) => {
      if (!user) {
        throw createError(401, "A user with this email could not be found.");
      }
      loadeduser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        throw createError(401, "Wrong password!");
      }
      const token = jwt.sign(
        {
          email: loadeduser.email,
          userId: loadeduser.id.toString(),
          role: loadeduser.role,
        },
        "dbapasmwij",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        userId: loadeduser.id.toString(),
        role: loadeduser.role,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { emailToken: req.query.token } });
    if (!user) {
      throw createError(
        401,
        "Token is invalid. Please contact us for assistance"
      );
    }
    user.emailToken = null;
    user.isVerified = true;
    await user.save().then((result) => {
      res.status(200).json(`User with Id ${result.id} was verified`);
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.forgotPassword = (req, res, next) => {
  const email = req.body.email;
  const resetPasswordToken = crypto.randomBytes(64).toString("hex");

  User.findOne({
    where: {
      email: email,
    },
  })
    .then((user) => {
      if (!user) {
        throw createError(401, "A user with this email could not be found.");
      }
      user.resetPasswordToken = resetPasswordToken;
      user.save();
      return user;
    })
    .then(async (user) => {
      const isEmailSend = await sendResetPasswordEmail(
        resetPasswordToken,
        email,
        req.headers.host
      );
      res
        .status(200)
        .json(
          `Email with resset password link was sent to user with Id ${user.id}`
        );
    })
    .catch((error) => {
      if (error.removeUserPasswordToken === true) {
        user.resetPasswordToken = null;
        user.save();
        next(error);
      } else {
        next(error);
      }
    });
};

exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = req.query.resetPassToken;
  const newPass = req.body.newPass;
  if (resetPasswordToken) {
    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: resetPasswordToken,
        },
      })
        .then((user) => {
          if (!user) {
            throw createError(
              401,
              "Reset token is invalid. Please contact us for assistance"
            );
          }
          return user;
        })
        .then((user) => {
          bcrypt
            .hash(newPass, 12)
            .then(async (hashedNewPass) => {
              user.password = hashedNewPass;
              user.resetPasswordToken = null;
              await user
                .save()
                .then((result) => {
                  res
                    .status(200)
                    .json(`Password for user Id ${result.id} has been change`);
                })
                .catch((error) => next(error));
            })
            .catch((error) => {
              if (!error.statusCode) {
                error.statusCode = 500;
              }
              next(error);
            });
        })
        .catch((error) => {
          if (!error.statusCode) {
            error.statusCode = 500;
          }
          next(error);
        });
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  } else {
    next(
      createError(
        401,
        "Authentication error. No reset password token available"
      )
    );
  }
};

const sendResetPasswordEmail = async (resetPasswordToken, email, host) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const msg = {
    from: process.env.EMAIL,
    to: email,
    subject: "Resset your password",
    text: `
      Hello,
      Please copy and paste the addres below to reset your password.
      http://${host}/auth/reset-password?token=${resetPasswordToken}
    `,
    html: `
      <h1>Hello,</h1>
      <p>thanks for registering on our site.</p>
      <p>Please click the link below to reset your password.</p>
      <a href="http://${host}/auth/reset-password?token=${resetPasswordToken}">Reset your password</a>
    `,
  };

  return new Promise(function (resolve, reject) {
    transporter.sendMail(msg, (err, info) => {
      if (err) {
        reject(createError(422, err, { removeUserPasswordToken: true }));
      } else {
        resolve(true);
      }
    });
  });
};
