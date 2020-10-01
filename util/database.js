const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("reservation", "root", "", {
  host: "localhost",
  dialect: "mariadb",
  dialectOptions: {
    timezone: "Etc/GMT+2",
  },
});

module.exports = sequelize;
