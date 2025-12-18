const express = require('express');
const router = express.Router();
const pool = require('./dbpg.js'); 

async function getPeakDemandForDate(startDateTime, endDateTime) {

  const cutoff = new Date('2025-05-15 00:00:00');
  const start = new Date(startDateTime);

  let query = '';
  let params = [startDateTime, endDateTime];

  if (start > cutoff) {
    query = `
      SELECT energy_meter_id, timestamp, total_kva
      FROM modbus_data
      WHERE energy_meter_id = 12
        AND timestamp BETWEEN $1 AND $2
      ORDER BY timestamp
    `;
  } else {
    query = `
      SELECT energy_meter_id, timestamp, total_kva
      FROM modbus_data
      WHERE energy_meter_id BETWEEN 1 AND 11
        AND timestamp BETWEEN $1 AND $2
      ORDER BY timestamp
    `;
  }

  const result = await pool.query(query, params);

  function formatLocalMinute(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${mins}:00`;
  }

  const minuteMeterMap = new Map();

  for (const entry of result.rows) {
    const meter = entry.energy_meter_id;
    const ts = new Date(entry.timestamp);
    const minuteKey = formatLocalMinute(ts);
    const val = parseFloat(entry.total_kva);

    if (!minuteMeterMap.has(minuteKey)) {
      minuteMeterMap.set(minuteKey, new Map());
    }

    const meterMap = minuteMeterMap.get(minuteKey);

    if (meterMap.has(meter)) {
      meterMap.set(meter, Math.max(meterMap.get(meter), val));
    } else {
      meterMap.set(meter, val);
    }
  }

  // -----------------------------------------------------
  // ONLY return minutes that exist in DB (no zero-fill)
  // -----------------------------------------------------
  const output = [];

  const sortedMinutes = [...minuteMeterMap.keys()].sort();

  for (const minuteStr of sortedMinutes) {
    const meterMap = minuteMeterMap.get(minuteStr);

    let total = 0.0;
    for (const val of meterMap.values()) {
      total += val;
    }

    output.push({
      minute: minuteStr,
      total_kVA: total.toFixed(1)
    });
  }

  return output;
}


// ------------------ DGDC ------------------
async function fetchDGDC(startDateTime, endDateTime) {
    console.log('📊 fetchDGDC called with:', { startDateTime, endDateTime });
  
    const query = `
      SELECT
        TO_CHAR(t1.timestamp, 'YYYY-MM-DD HH24:MI:SS') AS timestamp,
        t1.total_kw,
        t1.energy_meter_id
      FROM modbus_data t1
      JOIN (
        SELECT
          energy_meter_id,
          MAX(timestamp) AS max_timestamp
        FROM modbus_data
        WHERE energy_meter_id IN (13,14)
          AND timestamp BETWEEN $1 AND $2
        GROUP BY energy_meter_id
      ) t2
      ON t1.energy_meter_id = t2.energy_meter_id 
      AND t1.timestamp = t2.max_timestamp
      ORDER BY t1.energy_meter_id, t1.timestamp DESC
    `;
  
    try {
      const result = await pool.query(query, [startDateTime, endDateTime]);
      console.log(`✅ DGDC query returned ${result.rows.length} rows`);
      console.log('🔎 DGDC DB rows:', result.rows);
  
      const formattedResult = result.rows.reduce((acc, row) => {
        acc[row.energy_meter_id] = {
          total_kW: row.total_kw, // <-- lowercase since Postgres returns it like that
          timestamp: row.timestamp
        };
        return acc;
      }, {});
  
      console.log('📝 DGDC formatted result:', formattedResult);
      return formattedResult;
    } catch (error) {
      console.error('❌ DGDC query failed:', error);
      throw error;
    }
  }

// ------------------ Route ------------------
router.get('/dashboardpt2test', async (req, res) => {
  console.log('📥 Incoming request to /dashboardpt2test with query:', req.query);

  try {
    const { startDateTime, endDateTime } = req.query;
    if (!startDateTime || !endDateTime) {
      console.warn('⚠️ Missing query parameters');
      return res.status(400).json({ error: 'startDateTime and endDateTime required' });
    }

    const [peakDemandTimeline, dgdcData] = await Promise.all([
      getPeakDemandForDate(startDateTime, endDateTime),
      fetchDGDC(startDateTime, endDateTime)
    ]);

    console.log('📤 Sending response with:', {
      peakDemandTimelineCount: peakDemandTimeline.length,
      dgdcData
    });

    res.status(200).json({
      peakDemandTimeline,
      dgdcData
    });

  } catch (err) {
    console.error('❌ Dashboard fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: err.message });
  }
});

module.exports = router;
