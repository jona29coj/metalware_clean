const express = require('express');
const router = express.Router();
const pool = require('./dbpg'); 

// ------------------ Fetch Hourly Consumption ------------------
async function fetchHourlyConsumption(startDateTime, endDateTime) {
  const query = `
    SELECT
      TO_CHAR(timestamp, 'YYYY-MM-DD HH24:00:00') AS hour,
      energy_meter_id,
      ROUND((MAX(kvah) - MIN(kvah))::numeric, 1) AS kvah_difference
    FROM modbus_data
    WHERE timestamp BETWEEN $1 AND $2
      AND energy_meter_id BETWEEN 1 AND 11
      AND kvah > 0
    GROUP BY energy_meter_id, hour
    ORDER BY hour ASC;
  `;

  try {
    const result = await pool.query(query, [startDateTime, endDateTime]);

    // sum per hour across meters
    const hourlyConsumption = result.rows.reduce((acc, { hour, kvah_difference }) => {
      acc[hour] = (acc[hour] || 0) + (parseFloat(kvah_difference) || 0);
      return acc;
    }, {});

    // Round only final result per hour
    const roundedResult = Object.entries(hourlyConsumption).reduce((acc, [hour, value]) => {
      acc[hour] = parseFloat(value.toFixed(1));
      return acc;
    }, {});

    return roundedResult;
  } catch (error) {
    throw error;
  }
}

// ------------------ Route ------------------
router.get('/hkVAhconsumptiontest', async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  if (!startDateTime || !endDateTime) {
    console.warn('⚠️ Missing required query parameters:', { startDateTime, endDateTime });
    return res.status(400).json({ error: 'startDateTime and endDateTime are required' });
  }

  try {
    const consumptionData = await fetchHourlyConsumption(startDateTime, endDateTime);

    // Final formatting for API response
    const roundedConsumptionData = Object.entries(consumptionData).reduce((acc, [hour, value]) => {
      acc[hour] = value.toFixed(1);
      return acc;
    }, {});

    res.status(200).json({ consumptionData: roundedConsumptionData });
  } catch (error) {
    console.error('❌ Error in /hkVAhconsumption route:', error.message);
    res.status(500).json({ error: 'Database query failed', details: error.message });
  }
});

module.exports = router;
