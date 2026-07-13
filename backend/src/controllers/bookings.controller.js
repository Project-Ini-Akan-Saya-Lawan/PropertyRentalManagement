// src/controllers/bookings.controller.js
const pool = require('../../db');

// GET semua booking milik user yang sedang login
const getMyBookings = async (req, res) => {
    const userId = req.user.user_id;
    try {
        const result = await pool.query(
            'SELECT * FROM Bookings WHERE user_id = $1 ORDER BY booking_date DESC',
            [userId]
        );
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// GET detail booking (harus milik user yang login), termasuk data pembayaran
const getBookingById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;
    try {
        const booking = await pool.query(
            'SELECT * FROM Bookings WHERE booking_id = $1 AND user_id = $2',
            [id, userId]
        );
        if (booking.rows.length === 0) {
            return res.status(404).json({ message: 'Booking tidak ditemukan.' });
        }

        const payments = await pool.query('SELECT * FROM Payments WHERE booking_id = $1', [id]);

        res.status(200).json({
            data: {
                ...booking.rows[0],
                payments: payments.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// POST buat booking baru
const createBooking = async (req, res) => {
    const userId = req.user.user_id;
    const { pack_id, floor_booked, start_date, months } = req.body;

    if (!pack_id || !floor_booked || !start_date || !months) {
        return res.status(400).json({
            message: "pack_id, floor_booked, start_date, dan months wajib diisi."
        });
    }

    if (!Number.isInteger(Number(months)) || Number(months) <= 0) {
        return res.status(400).json({
            message: "months harus berupa bilangan bulat lebih dari 0."
        });
    }

    try {
        // Ambil data paket
        const packResult = await pool.query(
            `SELECT Price, Floor_range
             FROM Floor_Packs
             WHERE Pack_id = $1`,
            [pack_id]
        );

        if (packResult.rows.length === 0) {
            return res.status(404).json({
                message: "Paket tidak ditemukan."
            });
        }

        const { price, floor_range } = packResult.rows[0];

        // Validasi floor terhadap floor_range
        const [minFloor, maxFloor] = floor_range
            .split("-")
            .map(Number);

        if (
            isNaN(minFloor) ||
            isNaN(maxFloor) ||
            floor_booked < minFloor ||
            floor_booked > maxFloor
        ) {
            return res.status(400).json({
                message: `Paket ini hanya berlaku untuk lantai ${minFloor}-${maxFloor}.`
            });
        }

        // Hitung end_date
        const endDate = new Date(start_date);
        endDate.setMonth(endDate.getMonth() + Number(months));

        // Hitung total harga
        const total_price = Number(price) * Number(months);

        // Cek booking yang bentrok
        const existingBooking = await pool.query(
            `SELECT booking_id
             FROM Bookings
             WHERE floor_booked = $1
               AND status IN ('pending', 'confirmed')
               AND start_date < $3
               AND end_date > $2`,
            [
                floor_booked,
                start_date,
                endDate
            ]
        );

        if (existingBooking.rows.length > 0) {
            return res.status(409).json({
                message: "Lantai tersebut sudah dibooking pada periode yang dipilih."
            });
        }

        // Simpan booking
        const result = await pool.query(
            `INSERT INTO Bookings
            (
                user_id,
                pack_id,
                floor_booked,
                start_date,
                end_date,
                total_price,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING *`,
            [
                userId,
                pack_id,
                floor_booked,
                start_date,
                endDate,
                total_price
            ]
        );

        return res.status(201).json({
            message: "Booking berhasil dibuat.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server."
        });
    }
};

// PUT update status booking (mis. confirmed, cancelled, completed)
const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { status } = req.body;

    const allowedStatus = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!status || !allowedStatus.includes(status)) {
        return res.status(400).json({ message: `status wajib salah satu dari: ${allowedStatus.join(', ')}` });
    }

    try {
        const result = await pool.query(
            'UPDATE Bookings SET status = $1 WHERE booking_id = $2 AND user_id = $3 RETURNING *',
            [status, id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Status booking berhasil diperbarui.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE (batalkan) booking milik sendiri
const deleteBooking = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;
    try {
        const result = await pool.query(
            'DELETE FROM Bookings WHERE booking_id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Booking berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { getMyBookings, getBookingById, createBooking, updateBookingStatus, deleteBooking };
