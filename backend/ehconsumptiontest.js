const express = require('express');
const router = express.Router();
const pool = require('./dbpg'); // your pg pool

// ------------------ Hourly Consumption ------------------
async function getHourlyConsumptionForRange(startDate, endDate) {
  try {
    const query = `
      SELECT
        TO_CHAR(timestamp, 'YYYY-MM-DD') AS day,
        EXTRACT(HOUR FROM timestamp) AS hour,
        energy_meter_id,
        MAX(kvah) - MIN(kvah) AS kvah_difference
      FROM modbus_data
      WHERE timestamp BETWEEN $1 AND $2
        AND energy_meter_id BETWEEN 1 AND 11
        AND kvah > 0
      GROUP BY day, hour, energy_meter_id
      HAVING MIN(kvah) > 0 AND MAX(kvah) > 0
      ORDER BY day, hour, energy_meter_id;
    `;

    const result = await pool.query(query, [startDate, endDate]);

    const hourlyConsumption = {};

    result.rows.forEach((entry) => {
      if (!hourlyConsumption[entry.day]) {
        hourlyConsumption[entry.day] = {};
      }
      if (!hourlyConsumption[entry.day][entry.hour]) {
        hourlyConsumption[entry.day][entry.hour] = 0;
      }
      hourlyConsumption[entry.day][entry.hour] += parseFloat(entry.kvah_difference);
    });

    const finalResult = [];
    for (const day in hourlyConsumption) {
      for (const hour in hourlyConsumption[day]) {
        finalResult.push({
          day,
          hour: parseInt(hour),
          total_consumption: hourlyConsumption[day][hour].toFixed(2)
        });
      }
    }

    console.log('Hourly consumption (Postgres):', finalResult);
    return finalResult;
  } catch (error) {
    console.error('❌ Database query failed (Postgres):', error);
    throw error;
  }
}

// ------------------ Route ------------------
router.get('/ehconsumptiontest', async (req, res) => {
  const { startDate, endDate } = req.query;
  console.log('📥 Incoming /ehconsumption request:', { startDate, endDate });

  try {
    const consumptionData = await getHourlyConsumptionForRange(startDate, endDate);
    return res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('❌ API error in /ehconsumption:', error);
    res.status(500).json({ error: 'Failed to fetch hourly consumption', details: error.message });
  }
});

module.exports = router;
