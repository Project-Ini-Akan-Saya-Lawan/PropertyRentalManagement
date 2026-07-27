// src/controllers/notifications.controller.js
const pool = require("../../db");

const getMyNotifications = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const result = await pool.query(
      "SELECT * FROM Notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const createNotification = async (req, res) => {
  const { user_id, title, message } = req.body;
  if (!user_id || !title || !message) {
    return res
      .status(400)
      .json({ message: "user_id, title, and message are required." });
  }
  try {
    const result = await pool.query(
      `INSERT INTO Notifications (user_id, title, message) VALUES ($1, $2, $3) RETURNING *`,
      [user_id, title, message],
    );
    res
      .status(201)
      .json({
        message: "Notification created successfully.",
        data: result.rows[0],
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  try {
    const result = await pool.query(
      "UPDATE Notifications SET is_read = TRUE WHERE notifications_id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res
      .status(200)
      .json({ message: "Notification marked as read.", data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const markAllRead = async (req, res) => {
  const userId = req.user.user_id;
  try {
    await pool.query(
      "UPDATE Notifications SET is_read = TRUE WHERE user_id = $1",
      [userId],
    );
    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  try {
    const result = await pool.query(
      "DELETE FROM Notifications WHERE notifications_id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getMyNotifications,
  createNotification,
  markNotificationRead,
  markAllRead,
  deleteNotification,
};
