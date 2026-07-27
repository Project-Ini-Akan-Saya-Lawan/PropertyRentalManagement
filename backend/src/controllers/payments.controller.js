// src/controllers/payments.controller.js
const pool = require("../../db");
const { coreApi } = require("../config/midtrans");
const { mapMidtransStatus } = require("../utils/midtransStatus");

const PAYABLE_BOOKING_STATUSES = ["pending"];
const VA_BANKS = ["bca", "bni", "bri", "permata"];
const ECHANNEL_BANKS = ["mandiri"];
const SUPPORTED_BANKS = [...VA_BANKS, ...ECHANNEL_BANKS];

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
          payment_type: "echannel",
          transaction_details: { order_id: orderId, gross_amount: grossAmount },
          echannel: {
            bill_info1: "Payment for:",
            bill_info2: `Booking #${booking_id}`,
          },
          customer_details: customerDetails,
          item_details: itemDetails,
        }
      : {
          payment_type: "bank_transfer",
          transaction_details: { order_id: orderId, gross_amount: grossAmount },
          bank_transfer: { bank: normalizedBank },
          customer_details: customerDetails,
          item_details: itemDetails,
        };

    let midtransResponse;
    try {
      midtransResponse = await coreApi.charge(chargeParams);
    } catch (midtransError) {
      await client.query("ROLLBACK");
      console.error(
        "Midtrans charge error:",
        midtransError?.ApiResponse || midtransError,
      );
      const validationMessages =
        midtransError?.ApiResponse?.validation_messages;
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
      va_numbers,
      permata_va_number,
      biller_code,
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
        `INSERT INTO Notifications (user_id, title, message) VALUES ($1, $2, $3)`,
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

const getPaymentStatus = async (req, res) => {
  const { order_id } = req.params;
  const userId = req.user.user_id;

  try {
    const paymentResult = await pool.query(
      `SELECT p.*, b.user_id FROM Payments p
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
      [
        paymentStatus,
        fraud_status || null,
        JSON.stringify(statusResponse),
        order_id,
      ],
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

const handleMidtransNotification = async (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id;

    if (!orderId) {
      return res.status(400).json({ message: "order_id missing." });
    }

    const statusResponse = await coreApi.transaction.notification(notification);
    const { transaction_status, fraud_status, order_id } = statusResponse;

    const paymentResult = await pool.query(
      `SELECT * FROM Payments WHERE order_id = $1`,
      [order_id],
    );

    if (paymentResult.rows.length === 0) {
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
      [
        paymentStatus,
        fraud_status || null,
        JSON.stringify(statusResponse),
        order_id,
      ],
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
    return res.status(200).json({ message: "Notification received." });
  }
};

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

    return res
      .status(200)
      .json({ message: "Payment cancelled.", data: updated.rows[0] });
  } catch (error) {
    console.error(error);
    const apiMessage =
      error?.ApiResponse?.status_message || "Failed to cancel payment.";
    return res.status(502).json({ message: apiMessage });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.*,
        b.pack_id, b.floor_booked, b.start_date, b.end_date,
        u.username, u.email
       FROM Payments p
       JOIN Bookings b ON b.booking_id = p.booking_id
       JOIN Users u ON u.user_id = b.user_id
       ORDER BY p.created_at DESC`,
    );
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  chargeBankTransferPayment,
  getPaymentStatus,
  handleMidtransNotification,
  cancelPayment,
  getAllPayments,
};
