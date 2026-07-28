// src/utils/formatExpiryTime.js
//
// Payments.expiry_time is a `TIMESTAMP` (no time zone) column holding the
// literal "yyyy-MM-dd HH:mm:ss" wall-clock string Midtrans gives us for WIB
// (GMT+7), with no offset attached - see the comment in
// payments.controller.js for why that matters.
//
// node-postgres parses `timestamp without time zone` columns into a JS
// Date by treating the stored digits as UTC (no conversion is applied).
// That means:
//   - `row.expiry_time` is a Date object, not the original string.
//   - JSON.stringify()/res.json() will therefore serialize it back out as
//     an ISO-8601 string with a trailing "Z", e.g.
//     "2026-07-29T10:00:00.000Z" instead of "2026-07-29 10:00:00".
//
// The frontend's countdown expects the original Midtrans format and
// appends "+07:00" itself to make the WIB offset explicit. Sending it the
// "...Z" ISO variant instead produces an invalid date string once "+07:00"
// is appended (e.g. "...000Z+07:00"), which parses to `Invalid Date` and
// renders as "NaN:NaN:NaN".
//
// Since node-pg's Date already carries the exact original digits (just
// relabeled as UTC), toISOString() recovers them losslessly - we only need
// to swap the "T" back to a space and drop the trailing "Z"/milliseconds.
function formatExpiryTimeForClient(expiryTime) {
  if (!expiryTime) return null;
  // Already a raw string (e.g. passed straight through from a fresh
  // Midtrans charge response rather than read back from the DB).
  if (typeof expiryTime === "string") return expiryTime;
  return expiryTime.toISOString().slice(0, 19).replace("T", " ");
}

module.exports = { formatExpiryTimeForClient };