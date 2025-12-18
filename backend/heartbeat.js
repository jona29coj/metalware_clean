const express = require('express');
const moment = require('moment-timezone');
const pool = require('./dbpg');   // <-- Use PostgreSQL pool

const router = express.Router();

router.post('/heartbeat', async (req, res) => {
  const sessionId = req.cookies?.sessionId;

  if (!sessionId) {
    return res.status(401).json({ message: 'Session ID not found in cookies.' });
  }

  const last_active = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

  try {
    const result = await pool.query(
      `UPDATE user_sessions 
       SET last_active = $1 
       WHERE session_id = $2`,
      [last_active, sessionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    return res.status(200).json({ message: 'Heartbeat received. Session updated.' });

  } catch (err) {
    console.error('Error updating last_active:', err.message);
    return res.status(500).json({ message: 'Database error.' });
  }
});

module.exports = router;
