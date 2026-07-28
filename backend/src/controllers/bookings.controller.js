// src/controllers/bookings.controller.js
const pool = require("../../db");
const {
  expireStaleBookings,
  BOOKING_EXPIRY_MS,
} = require("../utils/bookingExpiry");

const getMyBookings = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const result = await pool.query(
      "SELECT * FROM Bookings WHERE user_id = $1 AND deleted_at IS NULL ORDER BY booking_date DESC",
      [userId],
    );
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getBookingById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  try {
    const booking = await pool.query(
      "SELECT * FROM Bookings WHERE booking_id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId],
    );
    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }
    // expiry_time must come back as the same raw "yyyy-MM-dd HH:mm:ss" (WIB
    // wall-clock, no timezone suffix) string the frontend already expects -
    // see the comment in payments.controller.js's chargeBankTransferPayment.
    // Without the explicit to_char() cast here, node-postgres turns the
    // TIMESTAMP column into a JS Date and Express serializes it as a full
    // ISO string with a trailing "Z". The frontend's isPaymentStillValid()
    // then appends "+07:00" after that "Z", producing an Invalid Date -
    // which makes every existing payment look expired on reload, even
    // seconds after it was created.
    const payments = await pool.query(
      `SELECT *, to_char(expiry_time, 'YYYY-MM-DD HH24:MI:SS') AS expiry_time
       FROM Payments WHERE booking_id = $1`,
      [id],
    );
    res
      .status(200)
      .json({ data: { ...booking.rows[0], payments: payments.rows } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const createBooking = async (req, res) => {
  const userId = req.user.user_id;
  const { pack_id, floor_booked, start_date, months } = req.body;

  if (!pack_id || !floor_booked || !start_date || !months) {
    return res.status(400).json({
      message: "pack_id, floor_booked, start_date, and months are required.",
    });
  }

  if (!Number.isInteger(Number(months)) || Number(months) <= 0) {
    return res
      .status(400)
      .json({ message: "months must be a positive integer." });
  }

  try {
    const packResult = await pool.query(
      `SELECT Price, Floor_range FROM Floor_Packs WHERE Pack_id = $1`,
      [pack_id],
    );

    if (packResult.rows.length === 0) {
      return res.status(404).json({ message: "Pack not found." });
    }

    const { price, floor_range } = packResult.rows[0];
    const [minFloor, maxFloor] = floor_range.split("-").map(Number);

    if (
      isNaN(minFloor) ||
      isNaN(maxFloor) ||
      floor_booked < minFloor ||
      floor_booked > maxFloor
    ) {
      return res.status(400).json({
        message: `This pack is only valid for floors ${minFloor}-${maxFloor}.`,
      });
    }

    const endDate = new Date(start_date);
    endDate.setMonth(endDate.getMonth() + Number(months));

    const total_price =
      Number(price) * (Number(months) / 12) +
      (Number(price) * (Number(months) / 12)) / 10;

    const existingBooking = await pool.query(
      `SELECT booking_id FROM Bookings
             WHERE floor_booked = $1
               AND status IN ('pending', 'confirmed')
               AND deleted_at IS NULL
               AND start_date < $3
               AND end_date > $2`,
      [floor_booked, start_date, endDate],
    );

    if (existingBooking.rows.length > 0) {
      return res.status(409).json({
        message: "This floor is already booked for the selected period.",
      });
    }

    const expiresAt = new Date(Date.now() + BOOKING_EXPIRY_MS);

    const result = await pool.query(
      `INSERT INTO Bookings (user_id, pack_id, floor_booked, start_date, end_date, total_price, status, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7) RETURNING *`,
      [
        userId,
        pack_id,
        floor_booked,
        start_date,
        endDate,
        total_price,
        expiresAt,
      ],
    );

    // Send notification to admin
    const adminResult = await pool.query(
      "SELECT user_id FROM Users WHERE role_id = 1 LIMIT 1",
    );
    if (adminResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO Notifications (user_id, title, message)
                 VALUES ($1, $2, $3)`,
        [
          adminResult.rows[0].user_id,
          "New Booking Request",
          `${req.user.username} has submitted a new booking request for Pack ID ${pack_id}, Floor ${floor_booked}.`,
        ],
      );
    }

    return res
      .status(201)
      .json({ message: "Booking created successfully.", data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
    "expired",
  ];
  if (!status || !allowedStatus.includes(status)) {
    return res
      .status(400)
      .json({ message: `status must be one of: ${allowedStatus.join(", ")}` });
  }

  try {
    // expires_at only matters while a booking is 'pending'; clear it once
    // it moves to any other state so the expiry job stops considering it.
    //
    // $1 is cast explicitly here because it's used twice in this query: once
    // assigned straight to the Status column (inferred as varchar) and once
    // compared against a text literal in the CASE (inferred as text).
    // Postgres refuses to reconcile two different inferred types for the
    // same parameter and throws "inconsistent types deduced for parameter
    // $1" (42P08) on every single call - this was why every Approve/Pending/
    // Cancel action from the admin panel failed with a 500 error.
    const result = await pool.query(
      `UPDATE Bookings
       SET status = $1::varchar, expires_at = CASE WHEN $1::varchar = 'pending' THEN expires_at ELSE NULL END
       WHERE booking_id = $2 AND deleted_at IS NULL RETURNING *`,
      [status, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }
    res.status(200).json({
      message: "Booking status updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  const nonDeletableStatus = ["completed"];

  try {
    const existing = await pool.query(
      "SELECT status FROM Bookings WHERE booking_id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const currentStatus = existing.rows[0].status;
    if (nonDeletableStatus.includes(currentStatus)) {
      return res.status(400).json({
        message: `Booking with status '${currentStatus}' cannot be deleted.`,
      });
    }

    const result = await pool.query(
      `UPDATE Bookings SET deleted_at = CURRENT_TIMESTAMP
             WHERE booking_id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING *`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }
    res.status(200).json({ message: "Booking deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.username, u.email 
             FROM Bookings b
             JOIN Users u ON b.user_id = u.user_id
             WHERE b.deleted_at IS NULL
             ORDER BY b.booking_date DESC`,
    );
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const runBookingExpiryCheck = async (req, res) => {
  try {
    const expired = await expireStaleBookings();
    res.status(200).json({
      message: `Expiry check complete. ${expired.length} booking(s) expired.`,
      data: expired,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getMyBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getAllBookings,
  runBookingExpiryCheck,
};