// src/routes/properties.routes.js
const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticatejwt');
const adminAuth = require('../middlewares/adminAuth');
const propertiesController = require('../controllers/properties.controller');

router.get('/', propertiesController.getProperties);
router.get('/:id', propertiesController.getPropertyById);

router.post('/', authenticateJWT, adminAuth, propertiesController.createProperty);
router.put('/:id', authenticateJWT, adminAuth, propertiesController.updateProperty);
router.delete('/:id', authenticateJWT, adminAuth, propertiesController.deleteProperty);

module.exports = router;