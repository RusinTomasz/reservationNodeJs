const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const bodyParser = require("body-parser");

const sequlize = require("./util/database");

/////////database tables
const Client = require("./models/client");
const Appointment = require("./models/appointment");
const ServiceBooked = require("./models/service-booked");
const ServiceProvided = require("./models/service-provided");
const Service = require("./models/service");
const Schedule = require("./models/schedule");
const Employee = require("./models/employee");

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

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

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
