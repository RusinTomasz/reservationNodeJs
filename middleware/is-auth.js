const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    res.status(401).send({ message: error });
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "dbapasmwij");
  } catch (err) {
    err.statusCode = 500;
    res.status(500).send({ message: err });
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCOde = 401;
    res.status(401).send({ message: error });
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
