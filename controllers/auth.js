require("dotenv").config();

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const createError = require("http-errors");
const User = require("../models/user");
const Employee = require("../models/employee");
const nodemailer = require("nodemailer");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw createError(422, errors.errors[0].msg);
    } else {
      const email = req.body.email;
      const emailToken = crypto.randomBytes(64).toString("hex");
      const isVerified = false;
      const name = req.body.name;
      const password = req.body.password;
      let user;
      bcrypt
        .hash(password, 12)
        .then((hashedPw) => {
          user = new User({
            email: email,
            emailToken: emailToken,
            isVerified: isVerified,
            password: hashedPw,
            name: name,
          });
          return user.save();
        })
        .then(async (result) => {
          const isEmailSend = await sendVerificationEmail(
            emailToken,
            email,
            req.headers.host
          );
          return result;
        })
        .then((result) => {
          res.status(201).json({ message: "User created!", userId: result.id });
        })
        .catch((error) => {
          if (error.removeUser === true) {
            user.destroy();
            next(error);
          } else {
            next(error);
          }
        });
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
    const user = await User.findOne({ emailToken: req.query.token });
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

const sendVerificationEmail = async (emailToken, email, host) => {
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
    subject: "Verify your email",
    text: `
      Hello, thanks for registering on our site.
      Please copy and paste the addres below to verify yor account.
      http://${host}/auth/verify-email?token=${emailToken}
    `,
    html: `
      <h1>Hello,</h1>
      <p>thanks for registering on our site.</p>
      <p>Please click the link below to verify your account.</p>
      <a href="http://${host}/auth/verify-email?token=${emailToken}">Verify your account</a>
    `,
  };

  return new Promise(function (resolve, reject) {
    transporter.sendMail(msg, (err, info) => {
      if (err) {
        reject(createError(422, err, { removeUser: true }));
      } else {
        resolve(true);
      }
    });
  });
};
