const createError = require("http-errors");
const User = require("../models/user");

function test(value) {
  return async (req, res, next) => {
    try {
      if (value !== "go") {
        throw createError(500, "Cant go");
      }
      await User.findOne({
        where: {
          id: 1,
        },
      })
        .then((user) => {
          if (!user) {
            next(createError(401, "user not found"));
          }
        })
        .catch((error) => next(createError(401, error)));
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  test,
};
