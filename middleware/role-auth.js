const createError = require("http-errors");

function authRole(role) {
  return async (req, res, next) => {
    try {
      if (req.user.role !== role) {
        throw createError(401, "Not authenticated.");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  authRole,
};
