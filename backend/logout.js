const express = require('express');
const pool = require('./dbpg');   // <-- Use PostgreSQL
const moment = require('moment-timezone');

const router = express.Router();

router.post('/logout', async (req, res) => {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
        return res.status(400).json({ message: 'No session found' });
    }

    const currentTime = moment()
        .tz('Asia/Kolkata')
        .format('YYYY-MM-DD HH:mm:ss');

    try {
        // Update logout_time for this session
        const result = await pool.query(
            `UPDATE user_sessions 
             SET logout_time = $1 
             WHERE session_id = $2`,
            [currentTime, sessionId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Session not found in database' });
        }

        // Clear cookies
        res.clearCookie('sessionId', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            domain: '.elementsenergies.com',
            path: '/',
        });

        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            domain: '.elementsenergies.com',
            path: '/',
        });

        return res.status(200).json({ message: 'Logged out successfully' });

    } catch (err) {
        console.error('Error logging out:', err.message);
        return res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
