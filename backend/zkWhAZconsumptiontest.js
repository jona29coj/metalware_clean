const express = require('express');
const router = express.Router();
const pool = require('./dbpg.js');

// ---------------------- Function ----------------------
async function getTotalkWhConsumptionForAllZones(startDateTime, endDateTime) {
    const query = `
      SELECT
        TO_CHAR(timestamp, 'YYYY-MM-DD HH24:00:00') AS hour,
        energy_meter_id,
        ROUND(
          (MAX(CASE WHEN kwh > 0 THEN kwh ELSE NULL END) -
           MIN(CASE WHEN kwh > 0 THEN kwh ELSE NULL END))::numeric,
          1
        ) AS kwh_difference
      FROM modbus_data
      WHERE timestamp BETWEEN $1 AND $2
        AND energy_meter_id BETWEEN 1 AND 11
      GROUP BY energy_meter_id, hour
      ORDER BY hour, energy_meter_id;
    `;
  
    const { rows } = await pool.query(query, [startDateTime, endDateTime]);
    return rows;
  }
  
// ---------------------- Route ----------------------
router.get('/zkWhAZconsumptiontest', async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  try {
    const consumptionData = await getTotalkWhConsumptionForAllZones(startDateTime, endDateTime);
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
