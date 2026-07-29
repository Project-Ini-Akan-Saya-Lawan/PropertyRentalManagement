// src/controllers/users.controller.js
const pool = require("../../db");

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, username, email, phone_number, company, status, auth_provider, role_id
       FROM Users ORDER BY user_id ASC`,
    );
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getMyProfile = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const result = await pool.query(
      `SELECT user_id, username, email, phone_number, company, status, auth_provider, role_id
       FROM Users WHERE user_id = $1`,
      [userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateMyProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { username, phone_number, company } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Users
       SET username     = COALESCE($1, username),
           phone_number = COALESCE($2, phone_number),
           company      = COALESCE($3, company)
       WHERE user_id = $4
       RETURNING user_id, username, email, phone_number, company, status, auth_provider, role_id`,
      [username, phone_number, company, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Admin update user status
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = ["active", "inactive", "suspended"];
  if (!status || !allowedStatus.includes(status.toLowerCase())) {
    return res
      .status(400)
      .json({ message: `Status must be one of: ${allowedStatus.join(", ")}` });
  }

  try {
    const result = await pool.query(
      `UPDATE Users SET status = $1 WHERE user_id = $2
       RETURNING user_id, username, email, status`,
      [status.toLowerCase(), id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res
      .status(200)
      .json({
        message: "User status updated successfully.",
        data: result.rows[0],
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteMyAccount = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const result = await pool.query(
      "DELETE FROM Users WHERE user_id = $1 RETURNING user_id",
      [userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getUsers,
  getMyProfile,
  updateMyProfile,
  updateUserStatus,
  deleteMyAccount,
};
