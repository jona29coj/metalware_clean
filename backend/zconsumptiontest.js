const express = require('express');
const router = express.Router();
const pool = require('./dbpg.js');

async function getTotalConsumptionForZone(startDateTime, endDateTime, zone) {  
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
      AND energy_meter_id = $3
    GROUP BY energy_meter_id, hour
    ORDER BY hour;
  `;

  const { rows } = await pool.query(query, [startDateTime, endDateTime, zone]);
  return rows;
}

router.get('/zconsumptiontest', async (req, res) => {
  const { startDateTime, endDateTime, zone } = req.query;

  if (!startDateTime || !endDateTime || !zone) {
    return res.status(400).json({ error: 'startDateTime, endDateTime, and zone are required' });
  }

  try {
    const consumptionData = await getTotalConsumptionForZone(startDateTime, endDateTime, zone);
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
