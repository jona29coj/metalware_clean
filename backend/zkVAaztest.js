const express = require('express');
const router = express.Router();
const pool = require('./dbpg.js'); // PostgreSQL pool

// ---------------------- Function ----------------------
async function getTotalKVAForAllZonesPerMinute(startDateTime, endDateTime) {
  const query = `
    SELECT
      TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:00') AS minute,
      energy_meter_id AS zone_id,
      total_kva
    FROM modbus_data
    WHERE timestamp BETWEEN $1 AND $2
      AND energy_meter_id BETWEEN 1 AND 11
    ORDER BY timestamp ASC, energy_meter_id ASC;
  `;

  const { rows } = await pool.query(query, [startDateTime, endDateTime]);
  return rows;
}

// ---------------------- Route ----------------------
router.get('/zkVAaztest', async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  if (!startDateTime || !endDateTime) {
    return res.status(400).json({ error: 'startDateTime and endDateTime are required' });
  }

  try {
    const kvaAllZonesData = await getTotalKVAForAllZonesPerMinute(startDateTime, endDateTime);
    res.status(200).json({ kvaAllZonesData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
