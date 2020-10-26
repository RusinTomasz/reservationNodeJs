const { validationResult } = require("express-validator");
const { AppointmentService } = require("../services/appointmentService");
const createError = require("http-errors");

exports.createAppointment = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw createError(422, errors.errors[0].msg);
    }
    const {
      dateCreated,
      clientName,
      clientContact,
      startTime,
      endTimeExpected,
      priceExpected,
      clientId,
      employeeId,
    } = req.body;
    const appointmentServiceInstance = new AppointmentService();

    const createdAppointment = await appointmentServiceInstance.createAppointment(
      dateCreated,
      clientName,
      clientContact,
      startTime,
      endTimeExpected,
      priceExpected,
      clientId,
      employeeId
    );
    if (createdAppointment instanceof Error) {
      throw createError(createdAppointment.statusCode, createdAppointment);
    } else {
      res.status(200).json({
        createdAppointment,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};