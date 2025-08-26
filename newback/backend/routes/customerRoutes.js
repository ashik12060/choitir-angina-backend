const express = require("express");
const { addCustomer, getCustomers } = require("../controllers/customerController");

const router = express.Router();

// Route to add a customer
router.post("/add-customer", addCustomer);

// Route to get all customers
router.get("/customers", getCustomers);

module.exports = router;
