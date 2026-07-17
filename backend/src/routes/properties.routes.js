// src/routes/properties.routes.js
const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticatejwt');
const propertiesController = require('../controllers/properties.controller');

router.get('/', propertiesController.getProperties);
router.get('/:id', propertiesController.getPropertyById);

// router.post('/', authenticateJWT, propertiesController.createProperty);
// router.put('/:id', authenticateJWT, propertiesController.updateProperty);
// router.delete('/:id', authenticateJWT, propertiesController.deleteProperty);
// this will develop soon with admin auth

module.exports = router;