const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "m1105_reservatio",
  "m1105_reservatio",
  "0Cl5uF8bTXkKnn4SiTt4",
  {
    host: "localhost",
    dialect: "mariadb",
    dialectOptions: {
      timezone: "Etc/GMT+2",
    },
    define: {
      freezeTableName: true,
    },
  }
);

// const sequelize = new Sequelize("reservation", "root", "", {
//   host: "localhost",
//   dialect: "mariadb",
//   dialectOptions: {
//     timezone: "Etc/GMT+2",
//   },
//   define: {
//     freezeTableName: true,
//   },
// });

module.exports = sequelize;
