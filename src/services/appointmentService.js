const Appointment = require("../models/appointment");
const ServiceBooked = require("../models/service-booked");

class AppointmentService {
  constructor() {}

  createAppointment = async (
    dateCreated,
    clientName,
    clientContact,
    startTime,
    endTimeExpected,
    priceExpected,
    clientId,
    employeeId
  ) => {
    const createdAppointment = await Appointment.create(
      {
        date_created: dateCreated,
        client_name: clientName,
        client_contact: clientContact,
        start_time: startTime,
        end_time_expected: endTimeExpected,
        price_expected: priceExpected,
        clientId: null,
        employeeId: null,
        ServiceBooked: [
          {
            price: priceExpected,
          },
        ],
      },
      {
        include: [ServiceBooked],
      }
    )
      .then((result) => result)
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return createdAppointment;
  };
}

module.exports = {
  AppointmentService: AppointmentService,
};
