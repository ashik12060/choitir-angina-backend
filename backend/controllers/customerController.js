const Customer = require("../models/customerModel");

// Create a new customer
const addCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, profession } = req.body;
    
    const newCustomer = new Customer({
      name,
      phone,
      email,
      address,
      profession,
    });

    await newCustomer.save();
    res.status(201).json({ message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export the controller functions
module.exports = { addCustomer, getCustomers };
