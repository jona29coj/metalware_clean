require('dotenv').config();

const express = require('express');
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const pool = require('./dbpg');   // <-- Switch to PostgreSQL pool

const router = express.Router();

router.get('/auth', async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.auth !== "true") {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    const { username, deviceName, ipAddress } = decoded;
    const currentTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    const setCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      domain: '.elementsenergies.com',
      path: '/'
    };

    // ---------------------------------------------
    // 1️⃣ CHECK FOR EXISTING ACTIVE SESSION
    // ---------------------------------------------
    const existing = await pool.query(
      `
      SELECT session_id 
      FROM user_sessions
      WHERE username = $1
        AND device_name = $2
        AND ip_address = $3
        AND logout_time IS NULL
      ORDER BY login_time DESC
      LIMIT 1
      `,
      [username, deviceName, ipAddress]
    );

    if (existing.rows.length > 0) {
      const sessionId = existing.rows[0].session_id;

      // Update last_active
      await pool.query(
        `UPDATE user_sessions SET last_active = $1 WHERE session_id = $2`,
        [currentTime, sessionId]
      );

      res.cookie("sessionId", sessionId, setCookieOptions);

      return res.status(200).json({
        message: "Session updated",
        authenticated: true,
        username,
        deviceName,
        ipAddress,
      });
    }

    // ---------------------------------------------
    // 2️⃣ NO ACTIVE SESSION → CREATE NEW ONE
    // ---------------------------------------------
    const insertResult = await pool.query(
      `
      INSERT INTO user_sessions (username, login_time, last_active, device_name, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING session_id
      `,
      [username, currentTime, currentTime, deviceName, ipAddress]
    );

    const newSessionId = insertResult.rows[0].session_id;

    res.cookie("sessionId", newSessionId, setCookieOptions);

    return res.status(200).json({
      message: "New session created",
      authenticated: true,
      username,
      deviceName,
      ipAddress,
    });

  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({
      message: "Invalid token or authentication failed.",
    });
  }
});

module.exports = router;
