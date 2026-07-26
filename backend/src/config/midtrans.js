// src/config/midtrans.js
const midtransClient = require("midtrans-client");

if (!process.env.MIDTRANS_SERVER_KEY) {
  console.warn(
    "[midtrans] MIDTRANS_SERVER_KEY is not set. Payment requests will fail.",
  );
}

// Core API client -> used for direct card charge (non-redirect Snap flow).
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = { coreApi };
