const express = require('express');
const router = express.Router();
const productController = require('../controllers/sellerProductController');

router.post('/seller-pro', productController.createSellerProduct);
router.get('/seller-products', productController.getAllSellerProducts); 
router.get('/seller-products/:id', productController.getSellerProductById);

module.exports = router;
