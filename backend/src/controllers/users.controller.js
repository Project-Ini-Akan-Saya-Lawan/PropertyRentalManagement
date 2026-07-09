// src/controllers/users.controller.js
const pool = require('../../db');
const bcrypt = require('bcrypt');

// GET semua user (kolom sensitif seperti hashed_password disembunyikan)
const getUsers = async (req, res) => {
    // this for develop only. for future this need an admin auth to access

    // try {
    //     const result = await pool.query(
    //         `SELECT user_id, username, email, phone_number, auth_provider, role_id
    //          FROM Users ORDER BY user_id ASC`
    //     );
    //     res.status(200).json({ data: result.rows });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    // }
};

// GET profil user yang sedang login
const getMyProfile = async (req, res) => {
    const userId = req.user.user_id;
    try {
        const result = await pool.query(
            `SELECT user_id, username, email, phone_number, auth_provider, role_id
             FROM Users WHERE user_id = $1`,
            [userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// PUT update profil sendiri (username, phone_number, dan opsional password baru)
const updateMyProfile = async (req, res) => {
    const userId = req.user.user_id;
    const { username, phone_number, password } = req.body;

    try {
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const result = await pool.query(
            `UPDATE Users
             SET username = COALESCE($1, username),
                 phone_number = COALESCE($2, phone_number),
                 hashed_password = COALESCE($3, hashed_password)
             WHERE user_id = $4
             RETURNING user_id, username, email, phone_number, auth_provider, role_id`,
            [username, phone_number, hashedPassword, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Profil berhasil diperbarui.', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE hapus akun sendiri
const deleteMyAccount = async (req, res) => {
    const userId = req.user.user_id;
    try {
        const result = await pool.query('DELETE FROM Users WHERE user_id = $1 RETURNING user_id', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Akun berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { getUsers, getMyProfile, updateMyProfile, deleteMyAccount };
