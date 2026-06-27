-- 1. Membuat Database Baru (jika belum ada)
CREATE DATABASE booking_system_db;

-- 2. Otomatis berpindah/masuk ke database yang baru dibuat
\c booking_system_db

-- 3. Membuat Tabel User_Roles
CREATE TABLE User_Roles (
    Role_id SERIAL PRIMARY KEY,
    Role_name VARCHAR(50) NOT NULL
);

-- 4. Membuat Tabel Users (Sudah ditambahkan Phone_number)
CREATE TABLE Users (
    User_id SERIAL PRIMARY KEY,
    Username VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Phone_number VARCHAR(20) UNIQUE, -- Kolom baru untuk nomor telepon
    Hashed_password VARCHAR(255) NOT NULL,
    Role_id INT,
    FOREIGN KEY (Role_id) REFERENCES User_Roles(Role_id) ON DELETE SET NULL
);

-- 5. Membuat Tabel Notifications
CREATE TABLE Notifications (
    Notifications_id SERIAL PRIMARY KEY,
    User_id INT,
    Title VARCHAR(150) NOT NULL,
    Message TEXT NOT NULL,
    Is_read BOOLEAN DEFAULT FALSE,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_id) REFERENCES Users(User_id) ON DELETE CASCADE
);

-- 6. Membuat Tabel Properties_Towers
CREATE TABLE Properties_Towers (
    Property_id SERIAL PRIMARY KEY,
    Property_name VARCHAR(150) NOT NULL,
    Description TEXT,
    Total_floor INT NOT NULL
);

-- 7. Membuat Tabel Floor_Packs
CREATE TABLE Floor_Packs (
    Pack_id SERIAL PRIMARY KEY,
    Pack_name VARCHAR(150) NOT NULL,
    Property_id INT,
    Description TEXT,
    Floor_range VARCHAR(50),
    FOREIGN KEY (Property_id) REFERENCES Properties_Towers(Property_id) ON DELETE CASCADE
);

-- 8. Membuat Tabel Properties_Photo
CREATE TABLE Properties_Photo (
    Photo_id SERIAL PRIMARY KEY,
    Property_id INT,
    Photo_url VARCHAR(255) NOT NULL,
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Pack_id INT,
    FOREIGN KEY (Property_id) REFERENCES Properties_Towers(Property_id) ON DELETE CASCADE,
    FOREIGN KEY (Pack_id) REFERENCES Floor_Packs(Pack_id) ON DELETE SET NULL
);

-- 9. Membuat Tabel Amenities
CREATE TABLE Amenities (
    Amenities_id SERIAL PRIMARY KEY,
    Amenities_name VARCHAR(100) NOT NULL,
    Is_public BOOLEAN DEFAULT TRUE
);

-- 10. Membuat Tabel Pack_Amenities (Pivot/Junction Table)
CREATE TABLE Pack_Amenities (
    Amenities_id INT,
    Pack_id INT,
    PRIMARY KEY (Amenities_id, Pack_id),
    FOREIGN KEY (Amenities_id) REFERENCES Amenities(Amenities_id) ON DELETE CASCADE,
    FOREIGN KEY (Pack_id) REFERENCES Floor_Packs(Pack_id) ON DELETE CASCADE
);

-- 11. Membuat Tabel Bookings
CREATE TABLE Bookings (
    Booking_id SERIAL PRIMARY KEY,
    User_id INT,
    Pack_id INT,
    Floor_booked INT NOT NULL,
    Start_date DATE NOT NULL,
    End_date DATE NOT NULL,
    Total_price DECIMAL(12, 2) NOT NULL,
    Status VARCHAR(50) NOT NULL,
    Booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_id) REFERENCES Users(User_id) ON DELETE RESTRICT,
    FOREIGN KEY (Pack_id) REFERENCES Floor_Packs(Pack_id) ON DELETE RESTRICT
);

-- 12. Membuat Tabel Payments
CREATE TABLE Payments (
    Payment_id SERIAL PRIMARY KEY,
    Booking_id INT,
    Amount DECIMAL(12, 2) NOT NULL,
    Payment_method VARCHAR(50) NOT NULL,
    Status VARCHAR(50) NOT NULL,
    Transaction_reference VARCHAR(100),
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Due_date TIMESTAMP NULL,
    Paid_at TIMESTAMP NULL,
    FOREIGN KEY (Booking_id) REFERENCES Bookings(Booking_id) ON DELETE CASCADE
);