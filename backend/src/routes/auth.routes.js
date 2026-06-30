// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const passport = require('../middlewares/passport');
const authenticateJWT = require('../middlewares/authenticatejwt');
const authController = require('../controllers/auth.controller');

// Auth lokal (email + password)
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Auth via Google OAuth
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
    authController.googleCallback
);

router.get('/google/failure', (req, res) => {
    res.status(401).json({ message: 'Login Google gagal.' });
});

// Contoh route yang butuh token JWT (signup/login lokal maupun Google)
router.get('/me', authenticateJWT, (req, res) => {
    res.status(200).json({
        message: 'Data user dari token JWT',
        user: req.user
    });
});

module.exports = router;
