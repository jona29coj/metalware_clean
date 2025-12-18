const express = require('express');
const moment = require('moment');
const router = express.Router();
const pool = require('./dbpg'); // <-- PostgreSQL pool

// --------- Fetch total kWh difference (energy produced) ---------
async function fetchDGD(startDateTime, endDateTime, DGNo) {
  const query = `
    SELECT MIN(kwh) AS min_kwh, MAX(kwh) AS max_kwh
    FROM modbus_data
    WHERE energy_meter_id = $1 AND kwh > 0 AND timestamp BETWEEN $2 AND $3;
  `;

  const { rows } = await pool.query(query, [DGNo, startDateTime, endDateTime]);
  const min = parseFloat(rows[0]?.min_kwh) || 0;
  const max = parseFloat(rows[0]?.max_kwh) || 0;
  const energyProduced = Math.round((max - min) * 10) / 10;

  return { energyProduced };
}

// --------- Fetch latest voltage & current ---------
async function fetchDGDCV(startDateTime, endDateTime, DGNo) {
  const query = `
    SELECT timestamp, avg_vln_value, avg_current_value
    FROM modbus_data
    WHERE energy_meter_id = $1 AND timestamp BETWEEN $2 AND $3
    ORDER BY timestamp DESC LIMIT 1;
  `;

  const { rows } = await pool.query(query, [DGNo, startDateTime, endDateTime]);
  const data = rows[0];
  if (!data) return null;

  return {
    avg_vln_value: data.avg_vln_value,
    avg_current_value: data.avg_current_value,
    timestamp: moment(data.timestamp).format('YYYY-MM-DD HH:mm:ss')
  };
}

// --------- Calculate DG Running Time ---------
async function fetchDGRunningTime(startDateTime, endDateTime, DGNo) {
  const query = `
    SELECT timestamp, kwh
    FROM modbus_data
    WHERE energy_meter_id = $1 AND timestamp BETWEEN $2 AND $3
    ORDER BY timestamp ASC;
  `;

  const { rows } = await pool.query(query, [DGNo, startDateTime, endDateTime]);

  if (!rows || rows.length < 2) return 0;

  let totalRunningSeconds = 0;
  let sessionStart = null;

  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const curr = rows[i];

    const prevKWh = parseFloat(prev.kwh);
    const currKWh = parseFloat(curr.kwh);
    const prevTime = moment(prev.timestamp);
    const currTime = moment(curr.timestamp);
    const diffSeconds = currTime.diff(prevTime, 'seconds');

    if (currKWh > prevKWh && diffSeconds <= 300) {
      if (!sessionStart) sessionStart = prevTime;
    } else {
      if (sessionStart) {
        const sessionEnd = prevTime;
        totalRunningSeconds += sessionEnd.diff(sessionStart, 'seconds');
        sessionStart = null;
      }
    }
  }

  if (sessionStart) {
    const sessionEnd = moment(rows[rows.length - 1].timestamp);
    totalRunningSeconds += sessionEnd.diff(sessionStart, 'seconds');
  }

  const totalMinutes = totalRunningSeconds / 60;
  return {
    runningTimeMinutes: Math.round(totalMinutes),
    runningTimeHours: +(totalMinutes / 60).toFixed(2)
  };
}

// --------- Hourly kWh difference ---------
async function fetchDGDkWhdiff(startDateTime, endDateTime, DGNo) {
  const query = `
    SELECT
      TO_CHAR(timestamp, 'YYYY-MM-DD HH24:00:00') AS hour,
      MAX(kwh) - MIN(kwh) AS kwh_difference
    FROM modbus_data
    WHERE timestamp BETWEEN $1 AND $2
      AND energy_meter_id = $3
      AND kwh > 0
    GROUP BY hour
    ORDER BY hour ASC;
  `;

  const { rows } = await pool.query(query, [startDateTime, endDateTime, DGNo]);

  const formatted = {};
  rows.forEach(({ hour, kwh_difference }) => {
    formatted[moment(hour).format('YYYY-MM-DD HH:mm:ss')] =
      Math.round(parseFloat(kwh_difference) * 10) / 10;
  });

  return formatted;
}

// --------- API Route ---------
router.get('/dgdtest', async (req, res) => {
  const { startDateTime, endDateTime, DGNo } = req.query;

  if (!startDateTime || !endDateTime || !DGNo) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    const [dgd, dgdcv, dgdrt, hrly_kwh_diff] = await Promise.all([
      fetchDGD(startDateTime, endDateTime, DGNo),
      fetchDGDCV(startDateTime, endDateTime, DGNo),
      fetchDGRunningTime(startDateTime, endDateTime, DGNo),
      fetchDGDkWhdiff(startDateTime, endDateTime, DGNo)
    ]);

    res.json({
      DGNo,
      dgd,
      dgdcv: { [DGNo]: dgdcv },
      dgdrt: { [DGNo]: dgdrt },
      hrly_kwh_diff: { [DGNo]: hrly_kwh_diff }
    });
  } catch (error) {
    console.error("Error in /dgd:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
