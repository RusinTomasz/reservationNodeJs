const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Appointment = sequelize.define("Appointment", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  date_created: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  employee_created: {
    type: DataTypes.INTEGER,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  client_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client_contact: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time_expected: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  price_expected: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  price_full: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  price_final: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  canceled: {
    type: DataTypes.BOOLEAN,
    defaultValue: 0,
  },
  cancellation_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Appointment;
