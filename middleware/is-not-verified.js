const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({
      where: {
        email: email,
      },
    }).then((user) => {
      if (!user) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        throw error;
      }
      if (!user.isVerified) {
        const error = new Error("Account has not been verified");
        error.statusCode = 401;
        throw error;
      }
      return next();
    });
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};