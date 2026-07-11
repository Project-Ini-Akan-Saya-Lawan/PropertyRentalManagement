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
    const { pack_id, floor_booked, start_date, end_date, total_price } = req.body;

    if (!pack_id || !floor_booked || !start_date || !end_date || !total_price) {
        return res.status(400).json({
            message: 'pack_id, floor_booked, start_date, end_date, dan total_price wajib diisi.'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO Bookings (user_id, pack_id, floor_booked, start_date, end_date, total_price, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
            [userId, pack_id, floor_booked, start_date, end_date, total_price]
        );
        res.status(201).json({ message: 'Booking berhasil dibuat.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
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
