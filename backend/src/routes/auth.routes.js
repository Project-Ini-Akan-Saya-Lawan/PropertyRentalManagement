// src/routes/auth.routes.js
const   express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Mengarahkan ke controller masing-masing
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;