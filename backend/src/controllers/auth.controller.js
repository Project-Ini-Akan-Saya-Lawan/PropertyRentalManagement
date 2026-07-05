// src/controllers/auth.controller.js
const pool = require('../../db');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

// LOGIKA SIGNUP
const signup = async (req, res) => {
    const { username, email, phone_number, password } = req.body;
    const role_id = 1; 

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, dan password wajib diisi.' });
    }

    try {
        const userExists = await pool.query(
            'SELECT * FROM Users WHERE email = $1 OR phone_number = $2',
            [email, phone_number || null]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email atau nomor telepon sudah terdaftar.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO Users (username, email, phone_number, hashed_password, auth_provider, role_id)
             VALUES ($1, $2, $3, $4, 'local', $5) RETURNING user_id, username, email, phone_number, auth_provider`,
            [username, email, phone_number || null, hashedPassword, role_id || null]
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

        // User yang daftar via Google tidak punya hashed_password
        if (!user.hashed_password) {
            return res.status(401).json({
                message: 'Akun ini terdaftar via Google. Silakan login menggunakan Google.'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: 'Login berhasil!',
            token: token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// LOGIKA CALLBACK GOOGLE OAUTH
// req.user di sini sudah berisi row dari tabel Users (lihat src/middlewares/passport.js)
const googleCallback = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Login Google gagal.' });
    }

    const token = generateToken(req.user);

    res.status(200).json({
        message: 'Login Google berhasil!',
        token: token,
        user: {
            user_id: req.user.user_id,
            username: req.user.username,
            email: req.user.email,
            auth_provider: req.user.auth_provider
        }
    });
};

module.exports = {
    signup,
    login,
    googleCallback
};
