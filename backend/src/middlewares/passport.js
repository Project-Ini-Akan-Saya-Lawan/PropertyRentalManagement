// src/middlewares/passport.js
require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../../db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        if (!email) {
          return done(new Error("Akun Google tidak memiliki email publik."), null);
        }

        // 1. Cari user berdasarkan google_id
        let result = await pool.query(
          "SELECT * FROM Users WHERE google_id = $1",
          [googleId]
        );

        if (result.rows.length > 0) {
          return done(null, result.rows[0]);
        }

        // 2. Belum ada by google_id -> cek apakah email sudah dipakai akun lokal
        result = await pool.query(
          "SELECT * FROM Users WHERE email = $1",
          [email]
        );

        if (result.rows.length > 0) {
          // Email sudah terdaftar (mis. signup manual) -> tautkan akun Google ke user ini
          const linked = await pool.query(
            `UPDATE Users SET google_id = $1, auth_provider = 'google'
             WHERE email = $2 RETURNING *`,
            [googleId, email]
          );
          return done(null, linked.rows[0]);
        }

        // 3. User baru -> insert
        // role_id is set explicitly here (matches local signup in
        // auth.controller.js) because the Role_id column has no DB-level
        // DEFAULT - leaving it out of the INSERT silently produces NULL,
        // which then gets filtered out of the admin User Management page
        // (it only shows users with role_id === 2).
        const newUser = await pool.query(
          `INSERT INTO Users (username, email, hashed_password, auth_provider, google_id, role_id)
           VALUES ($1, $2, NULL, 'google', $3, 2)
           RETURNING *`,
          [name || email, email, googleId]
        );

        return done(null, newUser.rows[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;