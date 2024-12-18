const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    address: {
      type: String,
      required: [true, 'address is required'],
    },
    // Add any other fields you want for the supplier
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
