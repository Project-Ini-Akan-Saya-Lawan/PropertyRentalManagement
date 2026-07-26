// src/utils/midtransStatus.js
// Maps a Midtrans Core API transaction response to our internal
// Payments.Status / Bookings.Status values.
//
// Reference (Midtrans transaction_status for card payments):
// - capture        -> only for credit_card; check fraud_status too
// - settlement      -> payment settled
// - pending         -> waiting for payment / 3DS challenge in progress
// - deny            -> payment denied (bank/fraud rule)
// - cancel          -> transaction canceled
// - expire          -> payment expired
// - refund / partial_refund -> refunded

function mapMidtransStatus(transaction_status, fraud_status) {
  switch (transaction_status) {
    case "capture":
      if (fraud_status === "accept") return { paymentStatus: "paid", bookingStatus: "confirmed" };
      if (fraud_status === "challenge") return { paymentStatus: "challenge", bookingStatus: "pending" };
      return { paymentStatus: "failed", bookingStatus: "pending" };
    case "settlement":
      return { paymentStatus: "paid", bookingStatus: "confirmed" };
    case "pending":
      return { paymentStatus: "pending", bookingStatus: "pending" };
    case "deny":
      return { paymentStatus: "failed", bookingStatus: "pending" };
    case "cancel":
      return { paymentStatus: "cancelled", bookingStatus: "pending" };
    case "expire":
      return { paymentStatus: "expired", bookingStatus: "pending" };
    case "refund":
    case "partial_refund":
      return { paymentStatus: "refunded", bookingStatus: "cancelled" };
    default:
      return { paymentStatus: transaction_status || "unknown", bookingStatus: "pending" };
  }
}

module.exports = { mapMidtransStatus };
