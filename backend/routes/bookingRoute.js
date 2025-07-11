const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Route to create a new booking
router.post('/bookings/create', bookingController.createBooking);

// Route to get all bookings
router.get('/bookings', bookingController.getAllBookings);

// Route to get a specific booking by ID
router.get('/bookings/:id', bookingController.getBookingById);

// Route to update a booking by ID
router.put('/bookings/:id', bookingController.updateBooking);

// Route to delete a booking by ID
router.delete('/bookings/:id', bookingController.deleteBooking);

module.exports = router;
