const Appoitment = require("../models/appointment");

class ClientService {
  constructor() {}

  fetchClientAppoitments = async (clientId) => {
    const appoitments = await Appoitment.findAll({
      attributes: [
        "id",
        ["start_time", "startTime"],
        ["end_time_expected", "endTimeExpected"],
      ],
      where: {
        clientId: clientId,
      },
      order: [["start_time", "ASC"]],
    })
      .then((appoitments) => appoitments)
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return appoitments;
  };
}

module.exports = {
  ClientService: ClientService,
};
