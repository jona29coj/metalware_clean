const express = require('express');
const router = express.Router();
const pool = require('./dbpg.js'); // <-- Postgres pool

async function fetchHourlyConsumption(startDateTime, endDateTime) {
  const query = `
    SELECT
      TO_CHAR(timestamp, 'YYYY-MM-DD HH24:00:00') AS hour,
      energy_meter_id,
      ROUND((MAX(kwh) - MIN(kwh))::numeric, 1) AS kWh_difference
    FROM modbus_data
    WHERE timestamp BETWEEN $1 AND $2
      AND energy_meter_id BETWEEN 1 AND 11
      AND kvah > 0
    GROUP BY energy_meter_id, hour
    ORDER BY hour ASC;
  `;

  try {
    const { rows } = await pool.query(query, [startDateTime, endDateTime]);
    console.log(rows);

    const hourlyConsumption = rows.reduce((acc, { hour, kwh_difference }) => {
      const diff = parseFloat(kwh_difference || 0);
      acc[hour] = (acc[hour] || 0) + diff;
      return acc;
    }, {});

    Object.keys(hourlyConsumption).forEach(hour => {
      hourlyConsumption[hour] = parseFloat(hourlyConsumption[hour].toFixed(1));
    });

    console.log(hourlyConsumption);
    return hourlyConsumption;
  } catch (error) {
    throw error;
  }
}

router.get('/hconsumptiontest', async (req, res) => {
  const { startDateTime, endDateTime } = req.query;
  try {
    const consumptionData = await fetchHourlyConsumption(startDateTime, endDateTime);
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
