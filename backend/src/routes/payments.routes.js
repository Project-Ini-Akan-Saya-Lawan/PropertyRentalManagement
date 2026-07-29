// src/routes/payments.routes.js
const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/authenticatejwt");
const adminAuth = require("../middlewares/adminAuth");
const paymentsController = require("../controllers/payments.controller");

router.get("/", authenticateJWT, adminAuth, paymentsController.getAllPayments);
router.post("/notification", paymentsController.handleMidtransNotification);
router.post(
  "/bank-transfer/charge",
  authenticateJWT,
  paymentsController.chargeBankTransferPayment,
);
router.get(
  "/status/:order_id",
  authenticateJWT,
  paymentsController.getPaymentStatus,
);
router.post(
  "/:order_id/cancel",
  authenticateJWT,
  adminAuth,
  paymentsController.cancelPayment,
);

module.exports = router;
