const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Employee = sequelize.define("Employees", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Employee;
