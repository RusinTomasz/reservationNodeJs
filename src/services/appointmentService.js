const Appointment = require("../models/appointment");
const ServiceBooked = require("../models/service-booked");
const createError = require("http-errors");

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
        clientId: clientId,
        employeeId: employeeId,
        appoitmentStatusId: 1,
        servicesBooked: [
          {
            price: priceExpected,
            serviceId: 1,
          },
        ],
      },
      {
        include: [{ model: ServiceBooked, as: "servicesBooked" }],
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

  closeAppointment = async (appointmentId, end_time, price_full, discount) => {
    let priceFinal;
    const closedAppointment = await Appointment.findOne({
      where: { id: appointmentId },
    })
      .then(async (appointment) => {
        if (!appointment) {
          throw createError(
            401,
            "A appointment with this id could not be found."
          );
        }
        if (discount) {
          priceFinal = price_full - discount;
        } else {
          priceFinal = price_full;
        }
        const updatedAppointment = await appointment.update({
          end_time: end_time,
          price_full: price_full,
          discount: discount,
          price_final: priceFinal,
          appoitmentStatusId: 2,
        });
        return updatedAppointment;
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return closedAppointment;
  };
}

module.exports = {
  AppointmentService: AppointmentService,
};
