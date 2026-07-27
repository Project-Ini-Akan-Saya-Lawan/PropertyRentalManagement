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