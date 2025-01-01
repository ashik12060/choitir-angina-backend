// controllers/attendanceController.js
const Attendance = require('../models/attendanceModel');
const Employee = require('../models/employeeModel');

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employees.' });
  }
};

// Check-in an employee
exports.checkIn = async (req, res) => {
  const { employeeId, name } = req.body;

  if (!employeeId || !name) {
    return res.status(400).json({ message: 'Employee ID and name are required.' });
  }

  try {
    // Check if the employee has already checked in but not checked out
    const existingAttendance = await Attendance.findOne({ employeeId, checkOutTime: null });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Employee has already checked in.' });
    }

    const attendance = new Attendance({
      employeeId,
      name,
      checkInTime: new Date(),
    });

    await attendance.save();
    res.json({ message: 'Check-in successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check in.' });
  }
};

// Check-out an employee
exports.checkOut = async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: 'Employee ID is required.' });
  }

  try {
    // Find the latest check-in record for the employee without a check-out time
    const attendance = await Attendance.findOne({ employeeId, checkOutTime: null });

    if (!attendance) {
      return res.status(400).json({ message: 'No active check-in found for this employee.' });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();
    res.json({ message: 'Check-out successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check out.' });
  }
};




// Get attendance report for all employees
exports.getAllAttendanceReport = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate('employeeId', 'name') // Populate the employee name
      .sort({ checkInTime: -1 }); // Sort by check-in time

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found.' });
    }

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({ message: 'Failed to fetch attendance report.' });
  }
};
