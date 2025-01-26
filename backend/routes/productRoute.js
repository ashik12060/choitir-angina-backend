const express = require('express');
const router = express.Router();

const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { createPostProduct, showProduct, showSingleProduct, deleteProduct, updateProduct, addComment, addLike, removeLike, showPaginatedProducts, getProductsByCategory, updateProductQuantity, getProductsByShop, assignProductToShop } = require('../controllers/productController');

//product routes
router.post('/product/create', isAuthenticated, isAdmin, createPostProduct);

// get products by shop


router.post('/product/assign-to-shop', assignProductToShop);
router.get('/products/shop/:shopId', getProductsByShop);



router.get('/products/show', showProduct);
router.get('/products/paginated', showPaginatedProducts); // <-- Pagination route

router.get('/product/:id', showSingleProduct);
router.get('/category/:category', getProductsByCategory);

router.delete('/delete/product/:id', isAuthenticated, isAdmin, deleteProduct);

router.put('/update/product/:id', isAuthenticated, isAdmin, updateProduct);

router.put('/comment/product/:id', isAuthenticated, addComment);

router.put('/addlike/product/:id', isAuthenticated, addLike);

router.put('/removelike/product/:id', isAuthenticated, removeLike);




module.exports = router;