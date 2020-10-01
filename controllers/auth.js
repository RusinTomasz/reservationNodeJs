require("dotenv").config();

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");

const nodemailer = require("nodemailer");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    res.status(422).send({ message: error.data[0].msg });
    throw error;
  }
  const email = req.body.email;
  const emailToken = crypto.randomBytes(64).toString("hex");
  const isVerified = false;
  const name = req.body.name;
  const password = req.body.password;
  sendVerificationEmail(emailToken, email, req.headers.host, function (
    returnValue
  ) {
    if (returnValue !== true) {
      const error = new Error("Email cant be send due " + returnValue);
      error.statusCode = 503;
      res.status(503).send({ message: error });
      throw error;
    }
    bcrypt
      .hash(password, 12)
      .then((hashedPw) => {
        const user = new User({
          email: email,
          emailToken: emailToken,
          isVerified: isVerified,
          password: hashedPw,
          name: name,
        });
        return user.save();
      })
      .then((result) => {
        res.status(201).json({ message: "User created!", userId: result.id });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });
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
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        res.status(401).send({ message: error });
        throw error;
      }
      loadeduser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        res.status(401).send({ message: error });
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadeduser.email,
          userId: loadeduser.id.toString(),
        },
        "dbapasmwij",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadeduser.id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ emailToken: req.query.token });
    if (!user) {
      const error = new Error(
        "Token is invalid. Please contact us for assistance"
      );
      error.statusCode = 401;
      throw error;
    }
    user.emailToken = null;
    user.isVerified = true;
    await user.save().then((result) => {
      res.status(200).json(`User with Id ${result.id} was verified`);
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const sendVerificationEmail = async (emailToken, email, host, callback) => {
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

  transporter.sendMail(msg, function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(true);
    }
  });
};
