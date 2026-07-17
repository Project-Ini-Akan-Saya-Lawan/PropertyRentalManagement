// src/routes/amenities.routes.js
const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticatejwt');
const amenitiesController = require('../controllers/amenities.controller');

router.get('/', amenitiesController.getAmenities);
// router.post('/', authenticateJWT, amenitiesController.createAmenity);
// router.put('/:id', authenticateJWT, amenitiesController.updateAmenity);
// router.delete('/:id', authenticateJWT, amenitiesController.deleteAmenity);

// Relasi amenity <-> floor pack
// router.post('/assign', authenticateJWT, amenitiesController.assignAmenityToPack);
// router.delete('/:amenitiesId/pack/:packId', authenticateJWT, amenitiesController.removeAmenityFromPack);

module.exports = router;
