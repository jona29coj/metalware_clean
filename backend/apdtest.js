const express = require('express');
const moment = require('moment');
const router = express.Router();
const pool = require('./dbpg'); // your pg pool (from pg.Pool)

// ------------------ Peak Demand Above Threshold ------------------
async function getPeakDemandAboveThreshold(startDateTime, endDateTime) {
  const query = `
    SELECT
      TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:00') AS minute,
      SUM(total_kva) AS total_kva
    FROM modbus_data
    WHERE energy_meter_id BETWEEN 1 AND 11
      AND timestamp BETWEEN $1 AND $2
    GROUP BY minute
    HAVING SUM(total_kva) > 596
    ORDER BY minute DESC
  `;

  const result = await pool.query(query, [startDateTime, endDateTime]);

  return result.rows.map((entry, index) => ({
    id: index + 1,
    minute: entry.minute,
    total_kVA: parseFloat(entry.total_kva).toFixed(1)
  }));
}

// ------------------ DG Activate and Deactivate ------------------
async function getDGActivateandDeactivate(startDateTime, endDateTime) {
  const query = `
    SELECT 
      energy_meter_id,
      timestamp,
      kwh
    FROM modbus_data
    WHERE energy_meter_id IN (13, 14)
      AND timestamp BETWEEN $1 AND $2
    ORDER BY energy_meter_id, timestamp
  `;

  const result = await pool.query(query, [startDateTime, endDateTime]);
  const rows = result.rows;

  const events = [];
  const state = {};

  for (const row of rows) {
    const id = row.energy_meter_id;
    const ts = moment(row.timestamp);
    let kWh = parseFloat(row.kwh);

    if (!state[id]) {
      state[id] = { on: false, prev: kWh, startKWh: null, startTime: null };
      continue;
    }

    const meter = state[id];


    // DG START LOGIC
    if (!meter.on && kWh > meter.prev) {
      meter.on = true;
      meter.startKWh = kWh;
      meter.startTime = ts.clone();

      events.push({
        meter: parseInt(id, 10),
        timestamp: ts.format('YYYY-MM-DD HH:mm:ss'),
        status: "DG started",
        kWh: kWh
      });
    }

    // DG STOP LOGIC
    else if (meter.on && kWh === meter.prev) {
      meter.on = false;

      events.push({
        meter: parseInt(id, 10),
        timestamp: ts.format('YYYY-MM-DD HH:mm:ss'),
        status: "DG stopped",
        kWh: kWh,
        startKWh: meter.startKWh,
        startTime: meter.startTime.format('YYYY-MM-DD HH:mm:ss')
      });
    }

    // Update previous value after applying the new logic
    meter.prev = kWh;
  }

  return events;
}

// ------------------ API Route ------------------
router.get('/apdtest', async (req, res) => { 
  const { startDateTime, endDateTime } = req.query;
  console.log("📥 Received /apd request:", startDateTime, endDateTime);

  try {
    const peakDemandAboveThresholdData = await getPeakDemandAboveThreshold(startDateTime, endDateTime);
    const dgActivations = await getDGActivateandDeactivate(startDateTime, endDateTime);

    res.status(200).json({
      peakDemandAboveThreshold: peakDemandAboveThresholdData,
      dgActivations: dgActivations
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Database query failed', details: error.message });
  }
});

module.exports = router;
