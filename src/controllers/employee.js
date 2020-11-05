const { validationResult } = require("express-validator");
const { EmployeeService } = require("../services/employeeService");
const createError = require("http-errors");

exports.createEmployee = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      throw createError(422, errors.errors[0].msg);
    }
    const { email, firstName, lastName, password } = req.body;
    const employeeServiceInstance = new EmployeeService();

    const createdEmployee = await employeeServiceInstance.createEmployee(
      email,
      firstName,
      lastName,
      password
    );
    if (createdEmployee instanceof Error) {
      throw createError(createdEmployee.statusCode, createdEmployee);
    } else {
      res.status(200).json({
        createdEmployee,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.fetchEmployees = async (req, res, next) => {
  try {
    const employeeServiceInstance = new EmployeeService();
    const employees = await employeeServiceInstance.fetchEmployees();
    if (employees instanceof Error) {
      throw createError(employees.statusCode, employees);
    } else {
      res.status(200).json({
        employees,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.fetchEmployeeDailyAppoitments = async (req, res, next) => {
  try {
    const { reqDayOfAppoitments } = req.query;
    const { employeeId } = req.params;
    const employeeServiceInstance = new EmployeeService();
    const employeeAppoitments = await employeeServiceInstance.fetchEmployeeDailyAppoitments(
      employeeId,
      reqDayOfAppoitments
    );
    if (employeeAppoitments instanceof Error) {
      throw createError(employeeAppoitments.statusCode, employeeAppoitments);
    } else {
      res.status(200).json({
        employeeAppoitments,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// exports.fetchClientAppoitments = async (req, res, next) => {
//   try {
//     const { clientId } = req.params;
//     let { archives } = req.query;

//     if (archives === "true") {
//       archives = true;
//     } else {
//       archives = false;
//     }

//     const clientServiceInstance = new ClientService();
//     const clientAppoitments = await clientServiceInstance.fetchClientAppoitments(
//       clientId,
//       archives
//     );
//     if (clientAppoitments instanceof Error) {
//       throw createError(clientAppoitments.statusCode, clientAppoitments);
//     } else {
//       res.status(200).json({
//         clientAppoitments,
//       });
//     }
//   } catch (error) {
//     if (!error.statusCode) {
//       error.statusCode = 500;
//     }
//     next(error);
//   }
// };
