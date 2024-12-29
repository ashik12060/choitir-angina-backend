// const Attendance = require('../models/attendanceModel');

// // Handle Check-In
// exports.checkIn = async (req, res) => {
//   const { employeeId } = req.body;
//   const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

//   try {
//     // Check if an attendance record already exists for today
//     let attendance = await Attendance.findOne({ employeeId, date: currentDate });

//     if (attendance) {
//       return res.status(400).json({ message: 'You have already checked in for today.' });
//     }

//     // Create a new attendance record with check-in time
//     const checkInTime = new Date().toLocaleTimeString(); // e.g., "09:30 AM"
//     attendance = new Attendance({ employeeId, date: currentDate, checkIn: checkInTime });
//     await attendance.save();

//     res.status(201).json({ message: `Checked in successfully at ${checkInTime}`, attendance });
//   } catch (error) {
//     console.error('Check-in error:', error);
//     res.status(500).json({ message: 'Error during check-in' });
//   }
// };

// // Handle Check-Out
// exports.checkOut = async (req, res) => {
//   const { employeeId } = req.body;
//   const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

//   try {
//     // Find the attendance record for today
//     const attendance = await Attendance.findOne({ employeeId, date: currentDate });

//     if (!attendance) {
//       return res.status(400).json({ message: 'You have not checked in today.' });
//     }

//     if (attendance.checkOut) {
//       return res.status(400).json({ message: 'You have already checked out for today.' });
//     }

//     // Update the attendance record with check-out time
//     const checkOutTime = new Date().toLocaleTimeString(); // e.g., "06:30 PM"
//     attendance.checkOut = checkOutTime;
//     await attendance.save();

//     res.status(200).json({ message: `Checked out successfully at ${checkOutTime}`, attendance });
//   } catch (error) {
//     console.error('Check-out error:', error);
//     res.status(500).json({ message: 'Error during check-out' });
//   }
// };

// // Get Attendance Report
// exports.getAttendanceReport = async (req, res) => {
//   const { employeeId } = req.query; // Optional query to filter by employee
//   const { startDate, endDate } = req.query; // Optional date range

//   try {
//     // Build query filters
//     const filters = {};
//     if (employeeId) filters.employeeId = employeeId;
//     if (startDate && endDate) {
//       filters.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     const attendanceRecords = await Attendance.find(filters).populate('employeeId', 'name'); // Fetch employee name
//     res.status(200).json(attendanceRecords);
//   } catch (error) {
//     console.error('Error fetching attendance report:', error);
//     res.status(500).json({ message: 'Error fetching attendance report' });
//   }
// };
