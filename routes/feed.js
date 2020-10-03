const express = require("express");
const { authRole } = require("../middleware/role-auth.js");

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/posts", isAuth, authRole("admin"), feedController.getPosts);

module.exports = router;
