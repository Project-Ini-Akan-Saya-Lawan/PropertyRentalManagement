// src/routes/amenities.routes.js
const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticatejwt');
const adminAuth = require('../middlewares/adminAuth');
const amenitiesController = require('../controllers/amenities.controller');

router.get('/', amenitiesController.getAmenities);
router.post('/', authenticateJWT, adminAuth, amenitiesController.createAmenity);
router.put('/:id', authenticateJWT, adminAuth, amenitiesController.updateAmenity);
router.delete('/:id', authenticateJWT, adminAuth, amenitiesController.deleteAmenity);

// Relasi amenity <-> floor pack
router.post('/assign', authenticateJWT, adminAuth, amenitiesController.assignAmenityToPack);
router.delete('/:amenitiesId/pack/:packId', authenticateJWT, adminAuth, amenitiesController.removeAmenityFromPack);

module.exports = router;
