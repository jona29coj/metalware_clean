const express = require('express');
const router = express.Router();
const pool = require('./dbpg.js');

async function getTotalConsumptionForAllZones(startDateTime, endDateTime) {  
    const query = `
      SELECT
        TO_CHAR(timestamp, 'YYYY-MM-DD HH24:00:00') AS hour,
        energy_meter_id,
        ROUND(
          (MAX(CASE WHEN kvah > 0 THEN kvah ELSE NULL END) -
           MIN(CASE WHEN kvah > 0 THEN kvah ELSE NULL END))::numeric,
          1
        ) AS kvah_difference
      FROM modbus_data
      WHERE timestamp BETWEEN $1 AND $2
        AND energy_meter_id BETWEEN 1 AND 11
      GROUP BY energy_meter_id, hour
      ORDER BY energy_meter_id, hour;
    `;
  
    const { rows } = await pool.query(query, [startDateTime, endDateTime]);
    return rows;
  }
  

router.get('/zkVAhAZconsumptiontest', async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  if (!startDateTime || !endDateTime) {
    return res.status(400).json({ error: 'startDateTime and endDateTime are required' });
  }

  try {
    const consumptionData = await getTotalConsumptionForAllZones(startDateTime, endDateTime);
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
