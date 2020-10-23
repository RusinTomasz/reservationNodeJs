const Schedule = require("../models/schedule");

class ScheduleService {
  constructor() {}

  createSchedule = async (from, to, employeeId) => {
    let schedule;
    schedule = new Schedule({
      from: from,
      to: to,
      employeeId: employeeId,
    });

    const createdSchedule = schedule
      .save()
      .then((result) => result)
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return createdSchedule;
  };
}

module.exports = {
  ScheduleService: ScheduleService,
};
