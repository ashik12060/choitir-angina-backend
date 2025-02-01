const express = require('express');
const { createShop, getShops, assignProductToShop } = require('../controllers/shopController');
// const { createShop, getShops } = require');
const router = express.Router();

router.post('/shop/create', createShop);
router.get('/shops/show', getShops);
router.post("/shops/:shopId/assign-product", assignProductToShop);

module.exports = router;
