// src/routes/notifications.routes.js
const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticatejwt');
const notificationsController = require('../controllers/notifications.controller');

router.get('/', authenticateJWT, notificationsController.getMyNotifications);
// router.post('/', authenticateJWT, notificationsController.createNotification);
// router.put('/:id/read', authenticateJWT, notificationsController.markNotificationRead);
// router.delete('/:id', authenticateJWT, notificationsController.deleteNotification);

module.exports = router;
