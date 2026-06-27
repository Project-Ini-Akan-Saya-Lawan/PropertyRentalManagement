// src/controllers/auth.controller.js
const pool = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// LOGIKA SIGNUP
const signup = async (req, res) => {
    const { username, email, phone_number, password, role_id } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, dan password wajib diisi.' });
    }

    try {
        const userExists = await pool.query(
            'SELECT * FROM Users WHERE email = $1 OR phone_number = $2',
            [email, phone_number]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email atau nomor telepon sudah terdaftar.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO Users (username, email, phone_number, hashed_password, role_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, email, phone_number`,
            [username, email, phone_number, hashedPassword, role_id || null]
        );

        res.status(201).json({
            message: 'Registrasi berhasil!',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// LOGIKA LOGIN
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    try {
        const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, role_id: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login berhasil!',
            token: token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                phone_number: user.phone_number
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = {
    signup,
    login
};