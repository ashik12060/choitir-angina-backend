// routes/salesRoutes.js
const express = require('express');
const { createWarehouseSale, getAllWarehouseSales, getWarehouseSaleById, updateWarehouseSale, deleteWarehouseSale } = require('../controllers/salesWarehouseController');
const router = express.Router();
// const salesController = require('../controllers/salesWarehouseController');

// Route to create a new sale
router.post('/warehouse-sales/create', createWarehouseSale);


// Route to get all sales
router.get('/warehouse-sales', getAllWarehouseSales);

// Route to get a specific sale by ID
router.get('/warehouse-sales/:id', getWarehouseSaleById);

// Route to update a sale by ID
router.put('/warehouse-sales/:id', updateWarehouseSale);

// Route to delete a sale by ID
router.delete('/warehouse-sales/:id', deleteWarehouseSale);

module.exports = router;
