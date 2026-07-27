// src/controllers/payments.controller.js
const pool = require("../../db");
const { coreApi } = require("../config/midtrans");
const { mapMidtransStatus } = require("../utils/midtransStatus");

const PAYABLE_BOOKING_STATUSES = ["pending"];

/**
 * POST /api/payments/card/charge
 * Body: { booking_id, token_id, save_card? }
 *
 * `token_id` MUST be produced client-side (Midtrans.js / Snap.js `card_token` API)
 * using the MIDTRANS_CLIENT_KEY. Raw card numbers/CVV must never be sent to this
 * backend directly - that would be out of PCI-DSS scope and Midtrans's Core API
 * rejects raw card data from the server side anyway.
 */
const chargeCardPayment = async (req, res) => {
  const userId = req.user.user_id;
  const { booking_id, token_id, save_card } = req.body;

  if (!booking_id || !token_id) {
    return res
      .status(400)
      .json({ message: "booking_id and token_id are required." });
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

    const chargeParams = {
      payment_type: "credit_card",
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      credit_card: {
        token_id,
        authentication: true, // force 3DS when supported by the card/bank
        save_card: Boolean(save_card),
      },
      customer_details: {
        first_name: firstName,
        last_name: rest.join(" ") || undefined,
        email: user.email,
        phone: user.phone_number || undefined,
      },
      item_details: [
        {
          id: `PACK-${booking_id}`,
          price: grossAmount,
          quantity: 1,
          name: `Booking #${booking_id} payment`,
        },
      ],
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
      redirect_url, // present when 3DS authentication is required
      card_type,
      masked_card,
      bank,
    } = midtransResponse;

    const { paymentStatus, bookingStatus } = mapMidtransStatus(
      transaction_status,
      fraud_status,
    );

    const paymentInsert = await client.query(
      `INSERT INTO Payments
        (booking_id, amount, payment_method, status, transaction_reference,
         order_id, midtrans_transaction_id, fraud_status, card_type, masked_card,
         bank, redirect_url, raw_response, paid_at)
       VALUES ($1, $2, 'credit_card', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        booking_id,
        grossAmount,
        paymentStatus,
        transaction_id,
        orderId,
        transaction_id,
        fraud_status || null,
        card_type || null,
        masked_card || null,
        bank || null,
        redirect_url || null,
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
      message: "Card charge processed.",
      data: {
        payment: paymentInsert.rows[0],
        transaction_status,
        fraud_status,
        redirect_url: redirect_url || null, // frontend must open this URL (e.g. in an iframe) to finish 3DS
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
 * and syncs it into our database. Useful right after the 3DS redirect returns
 * to the frontend, before the async webhook notification arrives.
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
       SET status = $1, fraud_status = $2, raw_response = $3,
           paid_at = CASE WHEN $1 = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END
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
       SET status = $1, fraud_status = $2, raw_response = $3,
           paid_at = CASE WHEN $1 = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END
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
  chargeCardPayment,
  getPaymentStatus,
  handleMidtransNotification,
  cancelPayment,
};