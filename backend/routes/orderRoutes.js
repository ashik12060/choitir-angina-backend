const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../middleware/auth');
const { createOrder, getOrderById, getAllOrders, getOrdersByUserId } = require('../controllers/orderController');

// Order routes
router.post('/order/place', isAuthenticated, createOrder);
router.get('/order/:userId', isAuthenticated, getOrderById);
router.get('/orders', isAuthenticated, getAllOrders);
router.get('/orders/user/:userId', isAuthenticated, getOrdersByUserId); // New route to get orders by user ID

// router.put('/order/update/:id', isAuthenticated, updateOrderStatus);

module.exports = router;
