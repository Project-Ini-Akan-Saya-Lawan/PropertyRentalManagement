// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("./src/middlewares/passport");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/users.routes");
const propertyRoutes = require("./src/routes/properties.routes");
const floorPackRoutes = require("./src/routes/floorpacks.routes");
const amenityRoutes = require("./src/routes/amenities.routes");
const bookingRoutes = require("./src/routes/bookings.routes");
const paymentRoutes = require("./src/routes/payments.routes");
const notificationRoutes = require("./src/routes/notifications.routes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/floor-packs", floorPackRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send('<a href="/api/auth/google">Login dengan Google</a>');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
