// src/routes/floorpacks.routes.js
const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/authenticatejwt");
const floorPacksController = require("../controllers/floorpacks.controller");

router.get("/", floorPacksController.getFloorPacks);
router.get("/:id", floorPacksController.getFloorPackById);
router.post("/", authenticateJWT, floorPacksController.createFloorPack);
router.put("/:id", authenticateJWT, floorPacksController.updateFloorPack);
router.delete("/:id", authenticateJWT, floorPacksController.deleteFloorPack);

module.exports = router;
