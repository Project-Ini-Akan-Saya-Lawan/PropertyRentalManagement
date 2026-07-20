// src/routes/users.routes.js
const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticatejwt');
const adminAuth = require('../middlewares/adminAuth');
const usersController = require('../controllers/users.controller');

router.get('/', authenticateJWT, adminAuth, usersController.getUsers);
router.get('/me', authenticateJWT, usersController.getMyProfile);
router.put('/me', authenticateJWT, usersController.updateMyProfile);
router.delete('/me', authenticateJWT, usersController.deleteMyAccount);

module.exports = router;
