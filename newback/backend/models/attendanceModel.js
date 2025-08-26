// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  name: { type: String, required: true },
  checkInTime: { type: Date, required: true },
  checkOutTime: { type: Date },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
