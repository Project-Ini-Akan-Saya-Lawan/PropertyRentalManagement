// src/routes/bookings.routes.js
const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticatejwt');
const bookingsController = require('../controllers/bookings.controller');

// Semua endpoint booking wajib login
router.get('/', authenticateJWT, bookingsController.getMyBookings);
router.get('/:id', authenticateJWT, bookingsController.getBookingById);
// router.post('/', authenticateJWT, bookingsController.createBooking);
// router.put('/:id/status', authenticateJWT, bookingsController.updateBookingStatus);
// router.delete('/:id', authenticateJWT, bookingsController.deleteBooking);

module.exports = router;
