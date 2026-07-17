ALTER TABLE Bookings
ADD COLUMN Deleted_at TIMESTAMP NULL;

-- opsional tapi disarankan, biar query yang exclude soft-deleted row cepat
CREATE INDEX idx_bookings_deleted_at ON Bookings (Deleted_at);