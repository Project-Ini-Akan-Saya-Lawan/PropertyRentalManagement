// src/routes/payments.routes.js
const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/authenticatejwt");
const adminAuth = require("../middlewares/adminAuth");
const paymentsController = require("../controllers/payments.controller");

// Midtrans calls this asynchronously - must stay public (no JWT), Midtrans
// authenticates itself via server-key-based signature, verified server-side
// through coreApi.transaction.notification().
router.post("/notification", paymentsController.handleMidtransNotification);

router.post("/card/charge", authenticateJWT, paymentsController.chargeCardPayment);
router.get("/status/:order_id", authenticateJWT, paymentsController.getPaymentStatus);
router.post(
  "/:order_id/cancel",
  authenticateJWT,
  adminAuth,
  paymentsController.cancelPayment,
);

module.exports = router;
