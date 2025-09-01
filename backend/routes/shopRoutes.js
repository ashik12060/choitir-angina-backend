const express = require('express');
const { createShop, getShops, assignProductToShop, getShopProducts, getShopById } = require('../controllers/shopController');
// const { createShop, getShops } = require');
const router = express.Router();

router.post('/shop/create', createShop);
router.get('/shops/show', getShops);
router.post("/shops/:shopId/assign-product", assignProductToShop);
router.get("/shops/:shopId/products", getShopProducts); 
router.get("/shops/:id", getShopById);
module.exports = router;
