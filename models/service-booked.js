const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const ServiceBooked = sequelize.define("services_booked", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

module.exports = ServiceBooked;
