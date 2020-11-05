const { ClientService } = require("../services/clientService");
const createError = require("http-errors");

exports.fetchClientAppoitments = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const clientServiceInstance = new ClientService();
    const clientAppoitments = await clientServiceInstance.fetchClientAppoitments(
      clientId
    );
    if (clientAppoitments instanceof Error) {
      throw createError(clientAppoitments.statusCode, clientAppoitments);
    } else {
      res.status(200).json({
        clientAppoitments,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
