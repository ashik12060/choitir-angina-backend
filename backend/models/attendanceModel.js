const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true }, // Stores the attendance date
  checkIn: { type: String }, // Stores the check-in time
  checkOut: { type: String }, // Stores the check-out time
});

module.exports = mongoose.model('Attendance', attendanceSchema);
