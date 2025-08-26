const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Get all employees
router.get('/employees', employeeController.getEmployees);

// Add a new employee
router.post('/create/employee', employeeController.createEmployee);

// Update an existing employee
router.put('/:id', employeeController.updateEmployee);

// Delete an employee
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
