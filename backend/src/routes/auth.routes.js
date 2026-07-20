// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const passport = require("../middlewares/passport");
const authenticateJWT = require("../middlewares/authenticatejwt");
const authController = require("../controllers/auth.controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/change-password", authenticateJWT, authController.changePassword);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/failure",
  }),
  authController.googleCallback,
);

router.get("/google/failure", (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  res.redirect(`${clientUrl}/login?error=google_failed`);
});

router.get("/me", authenticateJWT, (req, res) => {
  res.status(200).json({ message: "User data from JWT token", user: req.user });
});

module.exports = router;