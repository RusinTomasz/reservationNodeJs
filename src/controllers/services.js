const { ServicesService } = require("../services/servicesService");
const { validationResult } = require("express-validator");
const createError = require("http-errors");

exports.fetchServices = async (req, res, next) => {
  try {
    const servicesServiceInstance = new ServicesService();
    const services = await servicesServiceInstance.fetchServices();
    if (services instanceof Error) {
      throw createError(services.statusCode, services);
    } else {
      res.status(200).json({
        services,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createService = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw createError(422, errors.errors[0].msg);
    }
    const { serviceName, duration, price } = req.body;
    const servicesServiceInstance = new ServicesService();
    const createdService = await servicesServiceInstance.createService(
      serviceName,
      duration,
      price
    );
    if (createdService instanceof Error) {
      throw createError(createdService.statusCode, createdService);
    } else {
      res.status(200).json({
        createdService,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
