const createError = require("http-errors");

function authRole(role) {
  return async (req, res, next) => {
    try {
      const isAuth = role.includes(req.user.role);

      if (!isAuth) {
        throw createError(401, "Not authenticated your role is not enough.");
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
