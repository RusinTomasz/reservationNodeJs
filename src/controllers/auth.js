require("dotenv").config();

const { validationResult } = require("express-validator");
const { UserService } = require("../services/userService");
const createError = require("http-errors");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw createError(422, errors.errors[0].msg);
    }

    const { email, firstName, lastName, password, phoneNumber } = req.body;
    const authServiceInstance = new UserService();
    const createdUserName = await authServiceInstance.signUp(
      email,
      firstName,
      lastName,
      password,
      phoneNumber
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

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const authServiceInstance = new UserService();
    const user = await authServiceInstance.login(email, password);
    if (user instanceof Error) {
      throw createError(401, user);
    } else {
      res.status(200).json({
        token: user.token,
        userId: user.userId,
        role: user.role,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;
    const authServiceInstance = new UserService();
    const verifiedUser = await authServiceInstance.verifyEmail(token);
    if (verifiedUser instanceof Error) {
      throw createError(401, verifiedUser);
    } else {
      res.status(200).json(`User with Id ${verifiedUser} was verified`);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const authServiceInstance = new UserService();
    const userWithForgottenPass = await authServiceInstance.forgotPassword(
      email
    );
    if (userWithForgottenPass instanceof Error) {
      throw createError(401, userWithForgottenPass);
    } else {
      res
        .status(200)
        .json(
          `Email with resset password link was sent to user with Id ${userWithForgottenPass}`
        );
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { resetPassToken } = req.query;
  const { newPass } = req.body;
  if (resetPassToken) {
    try {
      const authServiceInstance = new UserService();
      const userWhosePassIsToBeReset = await authServiceInstance.resetPassword(
        resetPassToken,
        newPass
      );
      if (userWhosePassIsToBeReset instanceof Error) {
        throw createError(401, userWhosePassIsToBeReset);
      } else {
        res
          .status(200)
          .json(
            `Password for user Id ${userWhosePassIsToBeReset} has been change`
          );
      }
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
