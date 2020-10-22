const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Schedule = sequelize.define("schedules", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  from: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  to: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Schedule;
