const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("reservation", "root", "", {
  host: "localhost",
  dialect: "mariadb",
});

module.exports = sequelize;
