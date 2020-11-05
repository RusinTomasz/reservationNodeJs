const { ClientService } = require("../services/clientService");
const createError = require("http-errors");

exports.fetchClientAppoitments = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    let { archives } = req.query;

    if (archives === "true") {
      archives = true;
    } else {
      archives = false;
    }

    const clientServiceInstance = new ClientService();
    const clientAppoitments = await clientServiceInstance.fetchClientAppoitments(
      clientId,
      archives
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
