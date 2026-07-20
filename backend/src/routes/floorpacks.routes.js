// src/routes/floorpacks.routes.js
const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/authenticatejwt");
const adminAuth = require("../middlewares/adminAuth");
const floorPacksController = require("../controllers/floorpacks.controller");

router.get("/", floorPacksController.getFloorPacks);
router.get("/:id", floorPacksController.getFloorPackById);
router.post("/", authenticateJWT, adminAuth, floorPacksController.createFloorPack);
router.put("/:id", authenticateJWT, adminAuth, floorPacksController.updateFloorPack);
router.delete("/:id", authenticateJWT, adminAuth, floorPacksController.deleteFloorPack);

module.exports = router;
