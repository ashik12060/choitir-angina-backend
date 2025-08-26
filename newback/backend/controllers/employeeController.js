const Employee = require('../models/employeeModel');

// Get all employees
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
    const { name, phoneNumber } = req.body;
    try {
        const newEmployee = new Employee({ name, phoneNumber });
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { name, phoneNumber } = req.body;
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { name, phoneNumber },
            { new: true }
        );
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        await Employee.findByIdAndDelete(id);
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
