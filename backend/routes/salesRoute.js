// routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Route to create a new sale
router.post('/sales/create', salesController.createSale);


// Route to get all sales
router.get('/sales', salesController.getAllSales);

// Route to get a specific sale by ID
router.get('/sales/:id', salesController.getSaleById);

// Route to update a sale by ID
router.put('/sales/:id', salesController.updateSale);

// Route to delete a sale by ID
router.delete('/sales/:id', salesController.deleteSale);

module.exports = router;
