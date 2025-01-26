const express = require('express');
const { createShop, getShops } = require('../controllers/shopController');
// const { createShop, getShops } = require');
const router = express.Router();

router.post('/shop/create', createShop);
router.get('/shops/show', getShops);

module.exports = router;
