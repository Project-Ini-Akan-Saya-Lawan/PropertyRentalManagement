// src/controllers/payments.controller.js
const pool = require("../../db");
const { coreApi } = require("../config/midtrans");
const { mapMidtransStatus } = require("../utils/midtransStatus");

const PAYABLE_BOOKING_STATUSES = ["pending"];

// Banks supported through Midtrans Core API's `bank_transfer` payment type
// (each produces a Virtual Account number the customer transfers to).
const VA_BANKS = ["bca", "bni", "bri", "permata"];
// Mandiri Bill Payment uses a separate Core API payment type (`echannel`)
// and returns a biller_code/bill_key pair instead of a va_number.
const ECHANNEL_BANKS = ["mandiri"];
const SUPPORTED_BANKS = [...VA_BANKS, ...ECHANNEL_BANKS];

/**
 * POST /api/payments/bank-transfer/charge
 * Body: { booking_id, bank }
 *
 * `bank` must be one of SUPPORTED_BANKS. No sensitive payment instrument data
 * is ever collected from the client - Midtrans generates a Virtual Account
 * (or, for Mandiri, a biller_code/bill_key pair) that the customer pays into
 * from their own banking app; we just relay the booking amount.
 */
const chargeBankTransferPayment = async (req, res) => {
  const userId = req.user.user_id;
  const { booking_id, bank } = req.body;

  if (!booking_id || !bank) {
    return res
      .status(400)
      .json({ message: "booking_id and bank are required." });
  }

  const normalizedBank = String(bank).toLowerCase();
  if (!SUPPORTED_BANKS.includes(normalizedBank)) {
    return res.status(400).json({
      message: `Unsupported bank '${bank}'. Supported banks: ${SUPPORTED_BANKS.join(", ")}.`,
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the booking row to avoid double-charging on concurrent requests.
    const bookingResult = await client.query(
      `SELECT b.booking_id, b.user_id, b.total_price, b.status
       FROM Bookings b
       WHERE b.booking_id = $1 AND b.user_id = $2 AND b.deleted_at IS NULL
       FOR UPDATE`,
      [booking_id, userId],
    );

    if (bookingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = bookingResult.rows[0];

    if (!PAYABLE_BOOKING_STATUSES.includes(booking.status)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Booking with status '${booking.status}' cannot be paid.`,
      });
    }

    // Prevent double charging: if there's already a paid/pending-challenge payment, block.
    const existingPayment = await client.query(
      `SELECT payment_id, status FROM Payments
       WHERE booking_id = $1 AND status IN ('paid', 'challenge')
       ORDER BY created_at DESC LIMIT 1`,
      [booking_id],
    );
    if (existingPayment.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "This booking already has a paid or pending payment.",
      });
    }

    const userResult = await client.query(
      `SELECT username, email, phone_number FROM Users WHERE user_id = $1`,
      [userId],
    );
    const user = userResult.rows[0];

    const grossAmount = Math.round(Number(booking.total_price));
    const orderId = `BOOKING-${booking_id}-${Date.now()}`;
    const [firstName, ...rest] = (user.username || "Customer").split(" ");

    const customerDetails = {
      first_name: firstName,
      last_name: rest.join(" ") || undefined,
      email: user.email,
      phone: user.phone_number || undefined,
    };
    const itemDetails = [
      {
        id: `PACK-${booking_id}`,
        price: grossAmount,
        quantity: 1,
        name: `Booking #${booking_id} payment`,
      },
    ];

    const isEchannel = ECHANNEL_BANKS.includes(normalizedBank);

    const chargeParams = isEchannel
      ? {
          // Mandiri Bill Payment - customer pays via the biller_code/bill_key
          // shown to them, from any Mandiri channel (ATM, internet/mobile banking).
          payment_type: "echannel",
          transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount,
          },
          echannel: {
            bill_info1: "Payment for:",
            bill_info2: `Booking #${booking_id}`,
          },
          customer_details: customerDetails,
          item_details: itemDetails,
        }
      : {
          // Standard Virtual Account bank transfer (BCA/BNI/BRI/Permata).
          payment_type: "bank_transfer",
          transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount,
          },
          bank_transfer: {
            bank: normalizedBank,
          },
          customer_details: customerDetails,
          item_details: itemDetails,
        };

    let midtransResponse;
    try {
      midtransResponse = await coreApi.charge(chargeParams);
    } catch (midtransError) {
      await client.query("ROLLBACK");
      console.error("Midtrans charge error:", midtransError?.ApiResponse || midtransError);
      const validationMessages = midtransError?.ApiResponse?.validation_messages;
      const apiMessage =
        (Array.isArray(validationMessages) && validationMessages.length > 0
          ? validationMessages.join("; ")
          : null) ||
        midtransError?.ApiResponse?.status_message ||
        midtransError.message ||
        "Payment gateway error.";
      return res.status(502).json({ message: apiMessage });
    }

    const {
      transaction_status,
      fraud_status,
      transaction_id,
      va_numbers, // present for bank_transfer (VA) payments
      permata_va_number, // Permata returns the VA number in its own field
      biller_code, // present for echannel (Mandiri) payments
      bill_key,
      expiry_time,
    } = midtransResponse;

    const vaNumber =
      (Array.isArray(va_numbers) && va_numbers.length > 0
        ? va_numbers[0].va_number
        : null) ||
      permata_va_number ||
      null;

    const { paymentStatus, bookingStatus } = mapMidtransStatus(
      transaction_status,
      fraud_status,
    );

    const paymentInsert = await client.query(
      `INSERT INTO Payments
        (booking_id, amount, payment_method, status, transaction_reference,
         order_id, midtrans_transaction_id, fraud_status, bank, va_number,
         biller_code, bill_key, expiry_time, raw_response, paid_at)
       VALUES ($1, $2, 'bank_transfer', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        booking_id,
        grossAmount,
        paymentStatus,
        transaction_id,
        orderId,
        transaction_id,
        fraud_status || null,
        normalizedBank,
        vaNumber,
        biller_code || null,
        bill_key || null,
        expiry_time || null,
        JSON.stringify(midtransResponse),
        paymentStatus === "paid" ? new Date() : null,
      ],
    );

    if (bookingStatus !== booking.status) {
      await client.query(
        `UPDATE Bookings SET status = $1 WHERE booking_id = $2`,
        [bookingStatus, booking_id],
      );
    }

    if (paymentStatus === "paid") {
      await client.query(
        `INSERT INTO Notifications (user_id, title, message)
         VALUES ($1, $2, $3)`,
        [
          userId,
          "Payment Successful",
          `Your payment for Booking #${booking_id} has been received. Your booking is now confirmed.`,
        ],
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Bank transfer created.",
      data: {
        payment: paymentInsert.rows[0],
        transaction_status,
        // Everything the frontend needs to render payment instructions:
        bank: normalizedBank,
        va_number: vaNumber,
        biller_code: biller_code || null,
        bill_key: bill_key || null,
        expiry_time: expiry_time || null,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    client.release();
  }
};

/**
 * GET /api/payments/status/:order_id
 * Re-checks the transaction status directly with Midtrans (source of truth)
 * and syncs it into our database. Used by the frontend to poll while the
 * customer completes their bank transfer, before the async webhook
 * notification arrives.
 */
const getPaymentStatus = async (req, res) => {
  const { order_id } = req.params;
  const userId = req.user.user_id;

  try {
    const paymentResult = await pool.query(
      `SELECT p.*, b.user_id
       FROM Payments p
       JOIN Bookings b ON b.booking_id = p.booking_id
       WHERE p.order_id = $1`,
      [order_id],
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found." });
    }

    const payment = paymentResult.rows[0];
    if (payment.user_id !== userId && req.user.role_id !== 1) {
      return res.status(403).json({ message: "Access denied." });
    }

    const statusResponse = await coreApi.transaction.status(order_id);
    const { transaction_status, fraud_status } = statusResponse;
    const { paymentStatus, bookingStatus } = mapMidtransStatus(
      transaction_status,
      fraud_status,
    );

    const updated = await pool.query(
      `UPDATE Payments
       SET status = $1::varchar, fraud_status = $2, raw_response = $3,
           paid_at = CASE WHEN $1::varchar = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END
       WHERE order_id = $4
       RETURNING *`,
      [paymentStatus, fraud_status || null, JSON.stringify(statusResponse), order_id],
    );

    await pool.query(`UPDATE Bookings SET status = $1 WHERE booking_id = $2`, [
      bookingStatus,
      payment.booking_id,
    ]);

    return res.status(200).json({ data: updated.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * POST /api/payments/notification
 * Public webhook Midtrans calls asynchronously. No JWT here - instead we
 * re-fetch the transaction status from Midtrans using the order_id from the
 * notification body, which is the officially recommended way to trust a
 * notification (rather than trusting the POST body's fields directly).
 */
const handleMidtransNotification = async (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id;

    if (!orderId) {
      return res.status(400).json({ message: "order_id missing." });
    }

    // Re-verify with Midtrans directly (also validates the signature key internally).
    const statusResponse = await coreApi.transaction.notification(notification);
    const { transaction_status, fraud_status, order_id } = statusResponse;

    const paymentResult = await pool.query(
      `SELECT * FROM Payments WHERE order_id = $1`,
      [order_id],
    );
    if (paymentResult.rows.length === 0) {
      // Acknowledge with 200 so Midtrans doesn't keep retrying for an unknown order.
      return res.status(200).json({ message: "Order not found, ignored." });
    }

    const payment = paymentResult.rows[0];
    const { paymentStatus, bookingStatus } = mapMidtransStatus(
      transaction_status,
      fraud_status,
    );

    await pool.query(
      `UPDATE Payments
       SET status = $1::varchar, fraud_status = $2, raw_response = $3,
           paid_at = CASE WHEN $1::varchar = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END
       WHERE order_id = $4`,
      [paymentStatus, fraud_status || null, JSON.stringify(statusResponse), order_id],
    );

    await pool.query(`UPDATE Bookings SET status = $1 WHERE booking_id = $2`, [
      bookingStatus,
      payment.booking_id,
    ]);

    if (paymentStatus === "paid") {
      const bookingUser = await pool.query(
        `SELECT user_id FROM Bookings WHERE booking_id = $1`,
        [payment.booking_id],
      );
      if (bookingUser.rows.length > 0) {
        await pool.query(
          `INSERT INTO Notifications (user_id, title, message) VALUES ($1, $2, $3)`,
          [
            bookingUser.rows[0].user_id,
            "Payment Successful",
            `Your payment for Booking #${payment.booking_id} has been received. Your booking is now confirmed.`,
          ],
        );
      }
    }

    return res.status(200).json({ message: "Notification processed." });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    // Still respond 200 to avoid endless retries once we've logged the issue,
    // unless it's a payload we couldn't parse at all.
    return res.status(200).json({ message: "Notification received." });
  }
};

/**
 * POST /api/payments/:order_id/cancel
 * Admin-only: cancel a still-pending/authorized transaction on Midtrans's side.
 */
const cancelPayment = async (req, res) => {
  const { order_id } = req.params;
  try {
    const paymentResult = await pool.query(
      `SELECT * FROM Payments WHERE order_id = $1`,
      [order_id],
    );
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found." });
    }

    const cancelResponse = await coreApi.transaction.cancel(order_id);
    const { transaction_status } = cancelResponse;
    const { paymentStatus, bookingStatus } = mapMidtransStatus(
      transaction_status,
      null,
    );

    const updated = await pool.query(
      `UPDATE Payments SET status = $1, raw_response = $2 WHERE order_id = $3 RETURNING *`,
      [paymentStatus, JSON.stringify(cancelResponse), order_id],
    );

    await pool.query(`UPDATE Bookings SET status = $1 WHERE booking_id = $2`, [
      bookingStatus,
      paymentResult.rows[0].booking_id,
    ]);

    return res.status(200).json({
      message: "Payment cancelled.",
      data: updated.rows[0],
    });
  } catch (error) {
    console.error(error);
    const apiMessage =
      error?.ApiResponse?.status_message || "Failed to cancel payment.";
    return res.status(502).json({ message: apiMessage });
  }
};

module.exports = {
  chargeBankTransferPayment,
  getPaymentStatus,
  handleMidtransNotification,
  cancelPayment,
};