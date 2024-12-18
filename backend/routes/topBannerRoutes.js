const express = require('express');
const router = express.Router();

const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { createTopBanner, showTopBanner, showSingleTopBanner, deleteTopBanner, updateTopBanner } = require('../controllers/TopBannerController');

//product routes
router.post('/topBanner/create', isAuthenticated, isAdmin, createTopBanner);

router.get('/topBanners/show', showTopBanner);

router.get('/product/:id', showSingleTopBanner);

router.delete('/delete/product/:id', isAuthenticated, isAdmin, deleteTopBanner)

router.put('/update/product/:id', isAuthenticated, isAdmin, updateTopBanner)








module.exports = router;