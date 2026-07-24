BEGIN;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS company VARCHAR(255);

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

COMMIT;