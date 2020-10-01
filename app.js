const express = require("express");
const bodyParser = require("body-parser");

const sequlize = require("./util/database");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

// app.use(bodyParser.urlencoded());

sequlize
  .sync()
  .then((results) => {
    console.log(results);
  })
  .catch((err) => console.log(err));

app.use(bodyParser.json()); // aplication/json

app.use((error, req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });

  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.listen(8080);
