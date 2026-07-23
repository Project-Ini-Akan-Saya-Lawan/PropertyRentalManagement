// src/controllers/auth.controller.js
const pool = require("../../db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const signup = async (req, res) => {
  const { username, email, phone_number, password, company } = req.body;
  const role_id = 2;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    return res.status(400).json({ message: "Invalid email format." });
  }
  const normalizedEmail = email.trim().toLowerCase();

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      `INSERT INTO Users (username, email, phone_number, hashed_password, auth_provider, role_id, company, status)
       VALUES ($1, $2, $3, $4, 'local', $5, $6, 'active')
       RETURNING user_id, username, email, phone_number, auth_provider`,
      [
        username,
        normalizedEmail,
        phone_number || null,
        hashedPassword,
        role_id,
        company || null,
      ],
    );

    // Send notification to admin
    const adminResult = await pool.query(
      "SELECT user_id FROM Users WHERE role_id = 1 LIMIT 1",
    );
    if (adminResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO Notifications (user_id, title, message) VALUES ($1, $2, $3)`,
        [
          adminResult.rows[0].user_id,
          "New User Registration",
          `${username} (${normalizedEmail}) has registered a new account.`,
        ],
      );
    }

    res
      .status(201)
      .json({ message: "Registration successful!", user: newUser.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ message: "Email or phone number already registered." });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    return res.status(400).json({ message: "Invalid email format." });
  }
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const result = await pool.query("SELECT * FROM Users WHERE email = $1", [
      normalizedEmail,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = result.rows[0];

    if (!user.hashed_password) {
      return res.status(401).json({
        message:
          "This account was registered via Google. Please login using Google.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashed_password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const googleCallback = (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

  if (!req.user) {
    return res.redirect(`${clientUrl}/login?error=google_failed`);
  }

  const token = generateToken(req.user);
  res.redirect(`${clientUrl}/auth/callback?token=${encodeURIComponent(token)}`);
};

const changePassword = async (req, res) => {
  const userId = req.user.user_id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old and new password are required." });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters." });
  }

  try {
    const result = await pool.query(
      "SELECT hashed_password FROM Users WHERE user_id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const isValid = await bcrypt.compare(
      oldPassword,
      result.rows[0].hashed_password,
    );
    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE Users SET hashed_password = $1 WHERE user_id = $2",
      [hashed, userId],
    );

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { signup, login, googleCallback, changePassword };
