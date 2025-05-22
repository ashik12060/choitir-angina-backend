const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { createGallery, showGallery, showSingleGallery, deleteGallery, updateGallery } = require('../controllers/galleryController');


//gallery routes
router.post('/gallery/create', isAuthenticated, isAdmin, createGallery);
router.get('/galleries/show', showGallery);
router.get('/gallery/:id', showSingleGallery);
router.delete('/delete/gallery/:id', isAuthenticated, isAdmin, deleteGallery);
router.put('/update/gallery/:id', isAuthenticated, isAdmin, updateGallery);


module.exports = router;