const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

// Get all brands
router.get('/brands', brandController.getBrands);

// Add a new brand
router.post('/create/brand', brandController.createBrand);
router.post('/subcategories')

// Update an existing brand
router.put('/:id', brandController.updateBrand);

// Delete an brand
router.delete('/:id', brandController.deleteBrand);

module.exports = router;
