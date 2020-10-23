const Service = require("../models/service");

class ServicesService {
  constructor() {}

  fetchServices = async () => {
    const services = await Service.findAll({
      attributes: ["id", ["service_name", "serviceName"], "duration", "price"],
    })
      .then((services) => services)
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return services;
  };

  createService = async (serviceName, duration, price) => {
    let service;
    service = new Service({
      service_name: serviceName,
      duration: duration,
      price: price,
    });

    const createdService = service
      .save()
      .then((result) => result)
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return createdService;
  };
}

module.exports = {
  ServicesService: ServicesService,
};
