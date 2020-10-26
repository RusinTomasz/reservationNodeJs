const Employee = require("../models/employee");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

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
}

module.exports = {
  EmployeeService: EmployeeService,
};
