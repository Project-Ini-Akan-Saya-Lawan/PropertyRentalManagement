// src/controllers/notifications.controller.js
const pool = require('../../db');

// GET semua notifikasi milik user yang login
const getMyNotifications = async (req, res) => {
    const userId = req.user.user_id;
    try {
        const result = await pool.query(
            'SELECT * FROM Notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// POST buat notifikasi baru untuk seorang user
const createNotification = async (req, res) => {
    const { user_id, title, message } = req.body;
    if (!user_id || !title || !message) {
        return res.status(400).json({ message: 'user_id, title, dan message wajib diisi.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO Notifications (user_id, title, message) VALUES ($1, $2, $3) RETURNING *`,
            [user_id, title, message]
        );
        res.status(201).json({ message: 'Notifikasi berhasil dibuat.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// PUT tandai notifikasi sebagai sudah dibaca (harus milik user yang login)
const markNotificationRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;
    try {
        const result = await pool.query(
            'UPDATE Notifications SET is_read = TRUE WHERE notifications_id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Notifikasi tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Notifikasi ditandai sudah dibaca.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE notifikasi milik sendiri
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;
    try {
        const result = await pool.query(
            'DELETE FROM Notifications WHERE notifications_id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Notifikasi tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Notifikasi berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { getMyNotifications, createNotification, markNotificationRead, deleteNotification };
