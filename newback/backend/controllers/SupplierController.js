const Supplier = require('../models/SupplierModel');
const ErrorResponse = require('../utils/errorResponse');  // Assuming you have an error handler

// Create a new supplier
exports.createSupplier = async (req, res, next) => {
  const { name, phone, email,address } = req.body;

  try {
    const supplier = new Supplier({
      name,
      phone,
      email,
      address,
    });

    await supplier.save();

    res.status(201).json({
      success: true,
      supplier,
    });
  } catch (error) {
    next(error);  // Pass error to error handling middleware
  }
};

// Get all suppliers
exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find();

    res.status(200).json({
      success: true,
      suppliers,
    });
  } catch (error) {
    next(error);
  }
};
