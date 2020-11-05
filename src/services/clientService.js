const Appoitment = require("../models/appointment");
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const Employee = require("../models/employee");
class ClientService {
  constructor() {}

  fetchClientAppoitments = async (clientId, archives) => {
    const sequelizeOperator = archives ? Op.lt : Op.gte;
    const order = archives ? "DESC" : "ASC";
    const appoitments = await Appoitment.findAll({
      attributes: [
        "id",
        ["start_time", "startTime"],
        ["end_time_expected", "endTimeExpected"],
        ["price_expected", "priceExpected"],
      ],
      include: [
        {
          model: Employee,
          attributes: [
            ["first_name", "firstName"],
            ["last_name", "lastName"],
          ],
        },
      ],
      where: {
        clientId: clientId,
        start_time: {
          [sequelizeOperator]: sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      order: [["start_time", order]],
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
