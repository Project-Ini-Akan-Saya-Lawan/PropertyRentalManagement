// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes'); // Import rute auth

const app = express();

// Konfigurasi CORS (Next.js aman)
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Menggunakan rute auth dengan prefix /api/auth
app.use('/api/auth', authRoutes);

// Menjalankan server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});