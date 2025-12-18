const express = require('express');
const router = express.Router();
const pool = require('./dbpg.js');
const moment = require('moment-timezone');

router.get('/meterreadingtest', async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.query;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ error: 'startDateTime and endDateTime are required' });
    }

    const query = `
    SELECT 
      d.energy_meter_id,
      d.min_kvah,
      d.min_kvah_timestamp AS starttimestamp,
      d.max_kvah,
      d.max_kvah_timestamp AS endtimestamp,
      agg.min_kwh,
      agg.max_kwh
    FROM (
      SELECT 
        energy_meter_id,
        MIN(kvah) AS min_kvah,
        MAX(kvah) AS max_kvah,
        TO_CHAR((ARRAY_AGG(timestamp ORDER BY kvah ASC))[1], 'YYYY-MM-DD HH24:MI:SS') AS min_kvah_timestamp,
        TO_CHAR((ARRAY_AGG(timestamp ORDER BY kvah DESC))[1], 'YYYY-MM-DD HH24:MI:SS') AS max_kvah_timestamp
      FROM modbus_data
      WHERE timestamp BETWEEN $1 AND $2
        AND energy_meter_id BETWEEN 1 AND 14
      GROUP BY energy_meter_id
    ) AS d
    JOIN (
      SELECT 
        energy_meter_id,
        MIN(kwh) AS min_kwh,
        MAX(kwh) AS max_kwh
      FROM modbus_data
      WHERE timestamp BETWEEN $1 AND $2
        AND energy_meter_id BETWEEN 1 AND 14
      GROUP BY energy_meter_id
    ) AS agg
    ON d.energy_meter_id = agg.energy_meter_id
    ORDER BY d.energy_meter_id;
    `;
        
    const { rows } = await pool.query(query, [startDateTime, endDateTime]);

    const data = rows.map(row => ({
        zone: row.energy_meter_id,
        min: {
          kVAh: row.min_kvah,
          kWh: row.min_kwh,
          timestamp: moment(row.starttimestamp)
                      .format('YYYY-MM-DD HH:mm:ss'),
        },
        max: {
          kVAh: row.max_kvah,
          kWh: row.max_kwh,
          timestamp: moment(row.endtimestamp)
                      .format('YYYY-MM-DD HH:mm:ss'),
        },
      }));

    res.json({ data });
  } catch (err) {
    console.error('Error fetching meter readings:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;