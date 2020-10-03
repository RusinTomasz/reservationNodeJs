const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
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
app.use(cors());
app.options("*", cors());

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

//404 handler and pass to error handler
app.use((req, res, next) => {
  next(createError(404, "Not found"));
});

//Error handler
app.use((error, req, res, next) => {
  console.log(error);
  res.status(error.status || 500);
  res.send({
    error: {
      status: error.status || 500,
      message: error.message,
    },
  });
});

app.listen(8080);
