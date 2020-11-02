const Employee = require("../models/employee");
const Appoitment = require("../models/appointment");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const sequelize = require("sequelize");
class EmployeeService {
  constructor() {}
  createEmployee = async (email, firstName, lastName, password) => {
    let employee;
    const createdUserName = await bcrypt
      .hash(password, 12)
      .then(async (hashedPw) => {
        employee = await User.create(
          {
            email: email,
            emailToken: null,
            isVerified: 1,
            password: hashedPw,
            first_name: firstName,
            last_name: lastName,
            role: "employee",
            employee: {
              first_name: firstName,
              last_name: lastName,
            },
          },
          {
            include: [Employee],
          }
        );
        return employee;
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return createdUserName;
  };

  fetchEmployees = async () => {
    const employees = await Employee.findAll({
      attributes: [
        "id",
        ["first_name", "firstName"],
        ["last_name", "lastName"],
      ],
      include: [
        {
          model: User,
          attributes: ["email"],
        },
      ],
    })
      .then((employees) => employees)
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return employees;
  };

  fetchEmployeeAppoitments = async (employeeId, reqDayOfAppoitments) => {
    const appoitments = await Appoitment.findAll({
      attributes: [
        "id",
        ["start_time", "startTime"],
        ["end_time_expected", "endTimeExpected"],
      ],
      where: {
        employeeId: employeeId,
        date: sequelize.where(
          sequelize.fn("date", sequelize.col("start_time")),
          "=",
          reqDayOfAppoitments
        ),
      },
    })
      .then((appoitments) => appoitments)
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return appoitments;
  };
}

module.exports = {
  EmployeeService: EmployeeService,
};
