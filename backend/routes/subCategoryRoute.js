const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subCategoryController');

// Create a subcategory
router.post('/subcategories', subcategoryController.createSubcategory);
router.get('/subcategories', subcategoryController.getAllSubcategories);

// Get subcategories for a specific brand
router.get('/subcategories/:brandId', subcategoryController.getSubcategoriesByBrand);

module.exports = router;
