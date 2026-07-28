BEGIN;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS company VARCHAR(255);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

UPDATE users
SET status = 'active'
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_deleted_at
ON bookings (deleted_at);

INSERT INTO user_roles (role_id, role_name)
VALUES
    (1, 'Admin'),
    (2, 'Tenant')
ON CONFLICT (role_id) DO NOTHING;

INSERT INTO properties_towers (
    property_id,
    property_name,
    description,
    total_floor
)
VALUES
    (1, 'Wowo Tower', 'Premium office tower A', 25),
    (2, 'Wowi Tower', 'Premium office tower B', 25)
ON CONFLICT (property_id) DO NOTHING;

INSERT INTO floor_packs (
    pack_id,
    pack_name,
    property_id,
    description,
    floor_range,
    price
)
VALUES
    (1, 'Wowo Starter Pack',   1, 'Coworking Desk - Wowo Tower',     '5-10', 500000000.00),
    (2, 'Wowo Business Pack',  1, 'Business Executive - Wowo Tower', '11-18', 700000000.00),
    (3, 'Wowo Executive Pack', 1, 'Executive Suite - Wowo Tower',    '19-25', 1000000000.00),
    (4, 'Wowi Starter Pack',   2, 'Coworking Desk - Wowi Tower',     '5-10', 500000000.00),
    (5, 'Wowi Business Pack',  2, 'Business Executive - Wowi Tower', '11-18', 700000000.00),
    (6, 'Wowi Executive Pack', 2, 'Executive Suite - Wowi Tower',    '19-25', 1000000000.00)
ON CONFLICT (pack_id) DO NOTHING;

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Order_id VARCHAR(100) UNIQUE;
-- Order_id = the order_id we send to Midtrans (unique per charge attempt).
-- Transaction_reference (already existed) is used to store Midtrans's transaction_id.

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Midtrans_transaction_id VARCHAR(100);

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Fraud_status VARCHAR(50);

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Card_type VARCHAR(50);

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Masked_card VARCHAR(30);

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Bank VARCHAR(50);

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Redirect_url TEXT;
-- Used for 3DS authentication redirect (card payments that require challenge).

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Raw_response JSONB;
-- Stores the full latest Midtrans response for auditing/debugging.

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON Payments (Order_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON Payments (Booking_id);

COMMIT;

-- Migration: switch payments from card charging to bank transfer (Midtrans
-- Core API `bank_transfer` / `echannel`). Card-only columns (Card_type,
-- Masked_card, Redirect_url) are dropped since no code writes to them
-- anymore - the codebase no longer accepts credit_card charges at all.
BEGIN;

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Va_number VARCHAR(50);
-- The Virtual Account number the customer transfers to (BCA/BNI/BRI/Permata).

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Biller_code VARCHAR(20);
-- Mandiri Bill Payment biller code (echannel payments only).

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Bill_key VARCHAR(30);
-- Mandiri Bill Payment bill key (echannel payments only).

ALTER TABLE Payments
ADD COLUMN IF NOT EXISTS Expiry_time TIMESTAMP;
-- When the VA / bill key expires and is no longer payable.

ALTER TABLE Payments
DROP COLUMN IF EXISTS Card_type;

ALTER TABLE Payments
DROP COLUMN IF EXISTS Masked_card;

ALTER TABLE Payments
DROP COLUMN IF EXISTS Redirect_url;

COMMIT;

-- Migration: booking expiry.
-- A 'pending' booking (created but never paid) currently blocks the floor
-- forever because createBooking() only excludes 'pending'/'confirmed' when
-- checking for conflicts. Expires_at gives every pending booking a deadline;
-- a background job flips it to 'expired' once the deadline passes, freeing
-- the floor for other tenants.
BEGIN;

ALTER TABLE Bookings
ADD COLUMN IF NOT EXISTS Expires_at TIMESTAMP;
-- Deadline for the booking to be paid while status = 'pending'.
-- Set at creation time (Booking_date + BOOKING_EXPIRY_HOURS). NULL for
-- bookings that are already confirmed/cancelled/completed.

CREATE INDEX IF NOT EXISTS idx_bookings_status_expires_at
ON Bookings (status, expires_at)
WHERE deleted_at IS NULL;
-- Speeds up the expiry job's scan for stale pending bookings.

COMMIT;

-- Demo/dummy data: populates Bookings + Payments with realistic data spread
-- across the last 6 months, so the admin panel's charts (Reports > Revenue
-- Trend / Occupancy / Bookings, the main Dashboard stats, and Payment
-- Management's table) have something real to render instead of an
-- empty/zero state. Safe to re-run - everything is scoped to dedicated
-- "demo.*" tenant accounts, and the block below clears out any bookings
-- from a previous run before re-inserting, so it never duplicates data or
-- touches real users.
--
-- To remove the demo data later:
--   DELETE FROM Bookings WHERE user_id IN (SELECT user_id FROM Users WHERE email LIKE 'demo.%@rupiah-building.com');
--   DELETE FROM Users WHERE email LIKE 'demo.%@rupiah-building.com';
BEGIN;

-- Three dedicated demo tenants to own the dummy bookings. Using more than
-- one keeps "Total Tenants" / "New This Month" on the Reports page from
-- looking like a single fake account, and spreads bookings out like a real
-- tenant base would.
INSERT INTO Users (username, email, phone_number, hashed_password, auth_provider, role_id, company, status)
VALUES
    ('Demo Tenant - Startup Co', 'demo.startup@rupiah-building.com', NULL, NULL, 'local', 2, 'Demo Startup Co', 'active'),
    ('Demo Tenant - Consulting Group', 'demo.consulting@rupiah-building.com', NULL, NULL, 'local', 2, 'Demo Consulting Group', 'active'),
    ('Demo Tenant - Studio Kreatif', 'demo.studio@rupiah-building.com', NULL, NULL, 'local', 2, 'Demo Studio Kreatif', 'active')
ON CONFLICT (email) DO NOTHING;

-- Clear out any demo bookings from a previous run first, so re-running this
-- file replaces the data instead of duplicating it (Payments rows are
-- removed automatically via their FK's ON DELETE CASCADE).
DELETE FROM Bookings
WHERE user_id IN (SELECT user_id FROM Users WHERE email LIKE 'demo.%@rupiah-building.com');

-- Dummy bookings across the last 6 months, mixing both towers (Wowo:
-- pack_id 1-3, Wowi: pack_id 4-6), a realistic status mix (mostly
-- confirmed/completed so revenue shows up, plus a few pending/cancelled so
-- the status breakdown chart isn't a single flat bar), and total_price
-- using the same "yearly + 10%" formula the booking controller itself uses
-- (Floor_Packs.Price * years * 1.1).
WITH demo_users AS (
  SELECT user_id, email FROM Users WHERE email IN (
    'demo.startup@rupiah-building.com',
    'demo.consulting@rupiah-building.com',
    'demo.studio@rupiah-building.com'
  )
),
booking_data (email, pack_id, floor_booked, months_ago, term_years, status) AS (
  VALUES
    -- 5 months ago
    ('demo.startup@rupiah-building.com',    1, 6,  5, 1, 'completed'),
    ('demo.consulting@rupiah-building.com', 5, 13, 5, 1, 'confirmed'),
    -- 4 months ago
    ('demo.studio@rupiah-building.com',     2, 12, 4, 1, 'confirmed'),
    ('demo.startup@rupiah-building.com',    4, 7,  4, 1, 'cancelled'),
    -- 3 months ago
    ('demo.consulting@rupiah-building.com', 3, 21, 3, 2, 'confirmed'),
    ('demo.studio@rupiah-building.com',     6, 22, 3, 1, 'completed'),
    -- 2 months ago
    ('demo.startup@rupiah-building.com',    2, 14, 2, 1, 'confirmed'),
    ('demo.consulting@rupiah-building.com', 4, 8,  2, 1, 'confirmed'),
    -- 1 month ago
    ('demo.studio@rupiah-building.com',     1, 9,  1, 1, 'confirmed'),
    ('demo.startup@rupiah-building.com',    5, 15, 1, 1, 'pending'),
    -- this month
    ('demo.consulting@rupiah-building.com', 6, 23, 0, 1, 'confirmed'),
    ('demo.studio@rupiah-building.com',     3, 20, 0, 1, 'confirmed')
),
priced AS (
  SELECT
    du.user_id,
    bd.pack_id,
    bd.floor_booked,
    bd.status,
    (CURRENT_DATE - make_interval(months => bd.months_ago))::date AS start_date,
    (CURRENT_DATE - make_interval(months => bd.months_ago) + make_interval(months => bd.term_years * 12))::date AS end_date,
    (CURRENT_TIMESTAMP - make_interval(months => bd.months_ago)) AS booking_date,
    ROUND(fp.price * bd.term_years * 1.1, 2) AS total_price
  FROM booking_data bd
  JOIN demo_users du ON du.email = bd.email
  JOIN Floor_Packs fp ON fp.pack_id = bd.pack_id
),
new_bookings AS (
  INSERT INTO Bookings (user_id, pack_id, floor_booked, start_date, end_date, total_price, status, booking_date)
  SELECT user_id, pack_id, floor_booked, start_date, end_date, total_price, status, booking_date
  FROM priced
  RETURNING booking_id, total_price, status, booking_date
)
-- A matching Payment row per booking, mapped to the same Status values the
-- real Midtrans webhook uses (see src/utils/midtransStatus.js): confirmed/
-- completed bookings were actually "paid"; a cancelled booking's payment
-- was "cancelled"; a pending booking's VA is still "pending". Bank is
-- rotated across bca/bri/mandiri so the payment-method breakdown isn't a
-- single flat bar either.
INSERT INTO Payments (booking_id, amount, payment_method, bank, status, order_id, transaction_reference, created_at, paid_at)
SELECT
  booking_id,
  total_price,
  'bank_transfer',
  (ARRAY['bca', 'bri', 'mandiri'])[(booking_id % 3) + 1],
  CASE
    WHEN status IN ('confirmed', 'completed') THEN 'paid'
    WHEN status = 'cancelled' THEN 'cancelled'
    ELSE 'pending'
  END,
  'DEMO-' || booking_id,
  'DEMO-' || booking_id,
  booking_date,
  CASE WHEN status IN ('confirmed', 'completed') THEN booking_date + INTERVAL '2 hours' ELSE NULL END
FROM new_bookings;

COMMIT;