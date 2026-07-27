// src/utils/midtransStatus.js
// Maps a Midtrans Core API transaction response to our internal
// Payments.Status / Bookings.Status values.
//
// Reference (Midtrans transaction_status for bank_transfer/echannel payments):
// - capture        -> not used by bank_transfer/echannel, kept for completeness
// - settlement      -> the VA/bill was paid and funds settled
// - pending         -> VA/bill generated, waiting for the customer to pay
// - deny            -> payment denied (fraud rule)
// - cancel          -> transaction canceled (e.g. admin cancel while pending)
// - expire          -> the VA/bill expired before payment was made
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
