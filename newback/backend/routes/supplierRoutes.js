const express = require('express');
const { createSupplier, getSuppliers } = require('../controllers/SupplierController');
const router = express.Router();


// Route to create a new supplier
router.post('/suppliers/create', createSupplier);

// Route to get all suppliers
router.get('/suppliers', getSuppliers);

module.exports = router;
