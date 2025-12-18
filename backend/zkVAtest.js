const express = require('express');
const router = express.Router();
const pool = require('./dbpg.js'); // your PostgreSQL pool

// ---------------------- Function ----------------------
async function getTotalKVAForZonePerMinute(startDateTime, endDateTime, zone) {
  const query = `
    SELECT 
      TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:00') AS minute,
      energy_meter_id,
      total_kva
    FROM modbus_data
    WHERE timestamp BETWEEN $1 AND $2
      AND energy_meter_id = $3
    ORDER BY timestamp ASC;
  `;

  const { rows } = await pool.query(query, [startDateTime, endDateTime, zone]);
  return rows;
}

// ---------------------- Route ----------------------
router.get('/zkVAtest', async (req, res) => {
  const { startDateTime, endDateTime, zone } = req.query;

  if (!startDateTime || !endDateTime || !zone) {
    return res.status(400).json({ error: 'startDateTime, endDateTime, and zone are required' });
  }

  try {
    const kvaData = await getTotalKVAForZonePerMinute(startDateTime, endDateTime, zone);
    res.status(200).json({ kvaData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
