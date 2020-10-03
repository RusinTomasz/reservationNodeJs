const createError = require("http-errors");

function authRole(role) {
  return async (req, res, next) => {
    console.log(req.user);
    try {
      if (req.user.role !== role) {
        throw createError(401, "Not authenticated.");
      }
    } catch (error) {
      next(error);
    }
    next();
  };
}

module.exports = {
  authRole,
};
