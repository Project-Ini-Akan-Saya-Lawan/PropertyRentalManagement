// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("./src/middlewares/passport"); // registrasi strategy Google

const authRoutes = require("./src/routes/auth.routes"); // Import rute auth
const userRoutes = require("./src/routes/users.routes");

// this is just future reference

const propertyRoutes = require("./src/routes/properties.routes");
const floorPackRoutes = require("./src/routes/floorpacks.routes");
// const photoRoutes = require('./src/routes/photos.routes');
const amenityRoutes = require("./src/routes/amenities.routes");
const bookingRoutes = require("./src/routes/bookings.routes");
// const paymentRoutes = require('./src/routes/payments.routes');
const notificationRoutes = require("./src/routes/notifications.routes");

const app = express();

// Konfigurasi CORS (Next.js aman)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// session: false dipakai di semua passport.authenticate, tapi initialize tetap wajib
app.use(passport.initialize());

// Menggunakan rute auth dengan prefix /api/auth
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

//more of this will add soon

app.use("/api/properties", propertyRoutes);
app.use("/api/floor-packs", floorPackRoutes);
// app.use("/api/photos", photoRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/bookings", bookingRoutes);
// app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send('<a href="/api/auth/google">Login dengan Google</a>');
});

// Menjalankan server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
