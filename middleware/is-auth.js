const User = require("../models/user");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw createError(401, "Not authenticated.");
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "dbapasmwij");
    } catch (error) {
      next(createError(500, error));
    }
    if (!decodedToken) {
      throw createError(401, "Not authenticated.");
    }

    await User.findOne({
      where: {
        id: decodedToken.userId,
      },
    })
      .then((user) => {
        if (!user) {
          next(createError(401, "User not found"));
        }
        const { id, role, email } = user;
        req.user = { id, role, email };
      })
      .catch((error) => next(createError(401, error)));
    return next();
  } catch (error) {
    next(error);
  }
};
