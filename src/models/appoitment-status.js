const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const AppoitmentStatus = sequelize.define("appoitment_status", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = AppoitmentStatus;
