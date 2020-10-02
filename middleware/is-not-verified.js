const User = require("../models/user");
const createError = require("http-errors");

module.exports = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({
      where: {
        email: email,
      },
    }).then((user) => {
      if (!user) {
        throw createError(401, "A user with this email could not be found.");
      }
      if (!user.isVerified) {
        throw createError(401, "Account has not been verified");
      }
      return next();
    });
  } catch (error) {
    next(error);
  }
};
