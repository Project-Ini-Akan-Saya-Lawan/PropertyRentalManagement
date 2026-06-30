// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./src/middlewares/passport'); // registrasi strategy Google
const authRoutes = require('./src/routes/auth.routes'); // Import rute auth

const app = express();

// Konfigurasi CORS (Next.js aman)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// session: false dipakai di semua passport.authenticate, tapi initialize tetap wajib
app.use(passport.initialize());

// Menggunakan rute auth dengan prefix /api/auth
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('<a href="/api/auth/google">Login dengan Google</a>');
});

// Menjalankan server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
