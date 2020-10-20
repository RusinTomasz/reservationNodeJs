const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Client = sequelize.define("clients", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  client_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact_mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contact_mail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Client;
