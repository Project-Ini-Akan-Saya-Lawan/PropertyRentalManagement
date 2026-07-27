// src/jobs/expireBookings.job.js
// Periodically checks for pending bookings past their Expires_at deadline
// and expires them. Uses a plain setInterval so no new dependency
// (e.g. node-cron) is needed - the check itself is cheap since it's
// filtered/indexed on (status, expires_at).

const { expireStaleBookings } = require("../utils/bookingExpiry");

const CHECK_INTERVAL_MS =
  (Number(process.env.BOOKING_EXPIRY_CHECK_MINUTES) || 5) * 60 * 1000;

let intervalHandle = null;

async function runOnce() {
  try {
    const expired = await expireStaleBookings();
    if (expired.length > 0) {
      console.log(
        `[booking-expiry] Expired ${expired.length} booking(s): ${expired
          .map((b) => `#${b.booking_id}`)
          .join(", ")}`,
      );
    }
  } catch (error) {
    console.error("[booking-expiry] Job run failed:", error);
  }
}

function startExpireBookingsJob() {
  if (intervalHandle) return intervalHandle;

  // Run once shortly after startup, then on a fixed interval.
  runOnce();
  intervalHandle = setInterval(runOnce, CHECK_INTERVAL_MS);

  console.log(
    `[booking-expiry] Job started, checking every ${CHECK_INTERVAL_MS / 60000} minute(s).`,
  );

  return intervalHandle;
}

function stopExpireBookingsJob() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

module.exports = { startExpireBookingsJob, stopExpireBookingsJob, runOnce };
