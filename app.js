const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const bodyParser = require("body-parser");

const sequlize = require("./src/util/database");

/////////database tables
const Client = require("./src/models/client");
const Appointment = require("./src/models/appointment");
const ServiceBooked = require("./src/models/service-booked");
const ServiceProvided = require("./src/models/service-provided");
const Service = require("./src/models/service");
const Schedule = require("./src/models/schedule");
const Employee = require("./src/models/employee");

Client.hasMany(Appointment);
Appointment.belongsTo(Client);

Service.hasMany(ServiceBooked);
ServiceBooked.belongsTo(Service);
Service.hasMany(ServiceProvided);
ServiceProvided.belongsTo(Service);

Appointment.hasMany(ServiceProvided);
ServiceProvided.belongsTo(Appointment);
Appointment.hasMany(ServiceBooked);
ServiceBooked.belongsTo(Appointment);

Employee.hasMany(Schedule);
Schedule.belongsTo(Employee);

Employee.hasMany(Appointment);
Appointment.belongsTo(Employee);

//////////////////////////

const feedRoutes = require("./src/api/feed");
const authRoutes = require("./src/api/auth");

const app = express();

// app.use(bodyParser.urlencoded());

sequlize
  .sync()
  // .sync({ force: true })
  .then((results) => {
    // console.log(results);
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
