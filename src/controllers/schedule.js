const { validationResult } = require("express-validator");
const { ScheduleService } = require("../services/scheduleService");
const createError = require("http-errors");

exports.createSchedule = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw createError(422, errors.errors[0].msg);
    }
    const { from, to, employeeId } = req.body;
    const scheduleServiceInstance = new ScheduleService();

    const createdSchedule = await scheduleServiceInstance.createSchedule(
      from,
      to,
      employeeId
    );
    if (createdSchedule instanceof Error) {
      throw createError(createdSchedule.statusCode, createdSchedule);
    } else {
      res.status(200).json({
        createdSchedule,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
