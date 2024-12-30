// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Route to get all employees
router.get('/employees', attendanceController.getEmployees);

// Route to check in an employee
router.post('/attendance/checkin', attendanceController.checkIn);

// Route to check out an employee
router.post('/attendance/checkout', attendanceController.checkOut);

module.exports = router;
