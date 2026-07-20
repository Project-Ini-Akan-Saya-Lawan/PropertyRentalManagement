ALTER TABLE Bookings
ADD COLUMN Deleted_at TIMESTAMP NULL;

-- opsional tapi disarankan, biar query yang exclude soft-deleted row cepat
CREATE INDEX idx_bookings_deleted_at ON Bookings (Deleted_at);

INSERT INTO User_Roles (Role_id, Role_name) VALUES
(1, 'Admin'),
(2, 'Tenant')
ON CONFLICT (Role_id) DO NOTHING;