// src/utils/bookingExpiry.js
// Core logic for expiring stale, unpaid bookings.
//
// A booking is created with status 'pending' and an Expires_at deadline
// (see createBooking in bookings.controller.js). If the tenant never
// completes payment before that deadline, this module flips the booking
// to 'expired' so the floor becomes available again, expires any payment
// that's still sitting in 'pending', and notifies the tenant.

const pool = require("../../db");

// One-time diagnostic: prints exactly which Postgres instance/database this
// pool is talking to. If bookings "expire" in the logs but don't change
// when you query with psql, compare this against `\conninfo` in your psql
// session - a mismatch here means the backend and your psql client are
// pointed at two different databases.
console.log(
  `[booking-expiry] DB pool target -> host=${process.env.DB_HOST} port=${process.env.DB_PORT} database=${process.env.DB_NAME} user=${process.env.DB_USER}`,
);

// BOOKING_EXPIRY_MINUTES takes priority (fine-grained, good for testing e.g.
// "5"). Falls back to BOOKING_EXPIRY_HOURS for backward compatibility.
// Defaults to 24 hours if neither is set.
const BOOKING_EXPIRY_MS = process.env.BOOKING_EXPIRY_MINUTES
  ? Number(process.env.BOOKING_EXPIRY_MINUTES) * 60 * 1000
  : (Number(process.env.BOOKING_EXPIRY_HOURS) || 24) * 60 * 60 * 1000;

/**
 * Finds bookings that are still 'pending' and whose Expires_at has passed,
 * marks them (and any still-pending payment row) as expired, and inserts
 * a notification for the tenant. Runs as a single transaction per booking
 * so a failure on one booking doesn't roll back the others.
 *
 * @returns {Promise<Array>} the bookings that were expired in this run
 */
async function expireStaleBookings() {
  const staleResult = await pool.query(
    `SELECT booking_id, user_id
     FROM Bookings
     WHERE status = 'pending'
       AND deleted_at IS NULL
       AND expires_at IS NOT NULL
       AND expires_at < CURRENT_TIMESTAMP`,
  );

  const expired = [];

  for (const row of staleResult.rows) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Re-check status under lock in case a payment settled or an admin
      // updated it between the SELECT above and now.
      const bookingResult = await client.query(
        `SELECT booking_id, user_id, status
         FROM Bookings
         WHERE booking_id = $1
           AND status = 'pending'
           AND deleted_at IS NULL
           AND expires_at IS NOT NULL
           AND expires_at < CURRENT_TIMESTAMP
         FOR UPDATE`,
        [row.booking_id],
      );

      if (bookingResult.rows.length === 0) {
        await client.query("ROLLBACK");
        continue;
      }

      const booking = bookingResult.rows[0];

      const updateResult = await client.query(
        `UPDATE Bookings SET status = 'expired' WHERE booking_id = $1`,
        [booking.booking_id],
      );
      console.log(
        `[booking-expiry] UPDATE Bookings booking_id=${booking.booking_id} rowCount=${updateResult.rowCount}`,
      );

      // Any payment still waiting on the customer (VA generated but never
      // paid) is now moot - mark it expired too instead of leaving it
      // 'pending' forever.
      await client.query(
        `UPDATE Payments SET status = 'expired'
         WHERE booking_id = $1 AND status = 'pending'`,
        [booking.booking_id],
      );

      await client.query(
        `INSERT INTO Notifications (user_id, title, message)
         VALUES ($1, $2, $3)`,
        [
          booking.user_id,
          "Booking Expired",
          `Your booking #${booking.booking_id} has expired because payment was not completed in time. Please make a new booking if you're still interested.`,
        ],
      );

      await client.query("COMMIT");
      expired.push(booking);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(
        `Failed to expire booking #${row.booking_id}:`,
        error,
      );
    } finally {
      client.release();
    }
  }

  return expired;
}

module.exports = { expireStaleBookings, BOOKING_EXPIRY_MS };
