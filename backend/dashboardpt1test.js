const express = require('express');
const router = express.Router();
const pool = require('./dbpg'); 
const moment = require('moment-timezone');

// ✅ Meter-wise consumption + hlCons together
async function fetchConsumptionMeterWise(startDateTime, endDateTime) {
  const query = `
    SELECT energy_meter_id,
      ROUND((MAX(kvah) - MIN(kvah))::numeric, 1) AS consumption
    FROM modbus_data
    WHERE energy_meter_id BETWEEN 1 AND 12
      AND kvah > 0
      AND timestamp BETWEEN $1 AND $2
    GROUP BY energy_meter_id
    ORDER BY energy_meter_id;
  `;

  const { rows } = await pool.query(query, [startDateTime, endDateTime]);

  // Convert properly
  const meterWiseConsumption = rows.map(row => ({
    meter_id: Number(row.energy_meter_id),
    consumption: parseFloat(row.consumption) || 0,
  }));

  // 🚫 EXCLUDE meter 12 from zone calculations
  const filteredMeters = meterWiseConsumption.filter(m => m.meter_id !== 12);

  const validZones = filteredMeters.filter(zone => zone.consumption > 0);

  const highZone =
    validZones.length > 0
      ? validZones.reduce((prev, curr) =>
          curr.consumption > prev.consumption ? curr : prev
        )
      : { meter_id: "N/A", consumption: 0 };

  const lowZone =
    validZones.length > 0
      ? validZones.reduce((prev, curr) =>
          curr.consumption < prev.consumption ? curr : prev
        )
      : { meter_id: "N/A", consumption: 0 };

  const otherZoneConsumption = validZones
    .filter(
      zone =>
        zone.meter_id !== highZone.meter_id &&
        zone.meter_id !== lowZone.meter_id
    )
    .reduce((sum, zone) => sum + zone.consumption, 0);

  const hlCons = {
    highZone,
    lowZone,
    otherZoneConsumption: parseFloat(otherZoneConsumption.toFixed(1)),
  };

  console.log("✅ fetchConsumptionMeterWise result:", {
    meterWiseConsumption,
    hlCons,
  });

  return { meterWiseConsumption, hlCons };
}


// ✅ Peak demand
async function getPeakDemand(startDateTime, endDateTime) {
  try {
    const cutoff = moment.tz("2025-05-15 00:00:00", "Asia/Kolkata");
    const start = moment.tz(startDateTime, "Asia/Kolkata");

    let query;
    let params = [startDateTime, endDateTime];

    if (start.isAfter(cutoff)) {
      query = `
        SELECT ROUND(MAX(total_kva)::NUMERIC, 1) AS peak_demand
        FROM modbus_data
        WHERE energy_meter_id = 12
          AND timestamp BETWEEN $1 AND $2
      `;
    } else {
      query = `
        SELECT MAX(peak_demand) AS peak_demand
        FROM (
          SELECT SUM(ROUND(total_kva::NUMERIC, 1)) AS peak_demand
          FROM modbus_data
          WHERE timestamp BETWEEN $1 AND $2
            AND energy_meter_id BETWEEN 1 AND 11
          GROUP BY date_trunc('minute', timestamp)
        ) subquery
      `;
    }

    const { rows } = await pool.query(query, params);
    const peak = rows[0]?.peak_demand || 0;
    console.log("✅ getPeakDemand result:", peak);
    return peak;
  } catch (err) {
    throw err;
  }
}

// ✅ kWh consumption
async function getKWhConsumption(startDateTime, endDateTime) {
  const query = `
  SELECT COALESCE(ROUND(SUM(diff)::numeric, 1), 0) AS consumptionkwh
  FROM (
    SELECT COALESCE(MAX(kwh), 0) - COALESCE(MIN(kwh), 0) AS diff
    FROM modbus_data
    WHERE energy_meter_id BETWEEN 1 AND 11
      AND kvah > 0
      AND timestamp BETWEEN $1 AND $2
      AND kwh IS NOT NULL
    GROUP BY energy_meter_id
    HAVING COUNT(kwh) > 0
  ) AS sub
  WHERE diff > 0;
  `;

  const { rows } = await pool.query(query, [startDateTime, endDateTime]);
  return { consumptionkWh: parseFloat(rows[0]?.consumptionkwh || 0) };
}

// ✅ kVAh consumption
async function getKVAhConsumption(startDateTime, endDateTime) {
    const query = `
    SELECT COALESCE(ROUND(SUM(diff)::numeric, 1), 0) AS consumptionkvah
    FROM (
      SELECT COALESCE(MAX(kvah), 0) - COALESCE(MIN(kvah), 0) AS diff
      FROM modbus_data
      WHERE energy_meter_id BETWEEN 1 AND 11
        AND kvah > 0
        AND timestamp BETWEEN $1 AND $2
        AND kvah IS NOT NULL
      GROUP BY energy_meter_id
      HAVING COUNT(kvah) > 0
    ) AS sub
    WHERE diff > 0;
    `;
  
    const { rows } = await pool.query(query, [startDateTime, endDateTime]);
    return { consumptionkVAh: parseFloat(rows[0]?.consumptionkvah || 0) };
}

// ✅ Cost calculation
async function getConsumptionCost(startDateTime, endDateTime) {
    const query = `
      SELECT
        period,
        rate,
        SUM(consumption) AS totalConsumption,
        ROUND(SUM(consumption * rate)::numeric, 2) AS totalCost
      FROM (
        SELECT
          energy_meter_id,
          DATE(timestamp) AS day,
          CASE
            WHEN CAST(timestamp::time AS time) BETWEEN TIME '00:00:00' AND TIME '02:59:59' THEN '00:00-03:00'
            WHEN CAST(timestamp::time AS time) BETWEEN TIME '03:00:00' AND TIME '04:59:59' THEN '03:00-05:00'
            WHEN CAST(timestamp::time AS time) BETWEEN TIME '05:00:00' AND TIME '09:59:59' THEN '05:00-10:00'
            WHEN CAST(timestamp::time AS time) BETWEEN TIME '10:00:00' AND TIME '18:59:59' THEN '10:00-19:00'
            WHEN CAST(timestamp::time AS time) BETWEEN TIME '19:00:00' AND TIME '23:59:59' THEN '19:00-23:59'
          END AS period,
          MAX(kvah) - MIN(kvah) AS consumption
        FROM modbus_data
        WHERE timestamp BETWEEN $1 AND $2
          AND energy_meter_id BETWEEN 1 AND 11
          AND kvah > 0
        GROUP BY energy_meter_id, day, period
      ) AS daily_data
      JOIN (
        SELECT '00:00-03:00' AS period, 8.165 AS rate
        UNION ALL SELECT '03:00-05:00', 7.10
        UNION ALL SELECT '05:00-10:00', 6.035
        UNION ALL SELECT '10:00-19:00', 7.10
        UNION ALL SELECT '19:00-23:59', 8.165
      ) AS rates USING (period)
      GROUP BY period, rate
      ORDER BY CASE period
        WHEN '00:00-03:00' THEN 1
        WHEN '03:00-05:00' THEN 2
        WHEN '05:00-10:00' THEN 3
        WHEN '10:00-19:00' THEN 4
        WHEN '19:00-23:59' THEN 5
      END;
    `;
  
    const { rows } = await pool.query(query, [startDateTime, endDateTime]);
  
    const totalCost = parseFloat(
      rows.reduce((sum, row) => sum + (parseFloat(row.totalcost) || 0), 0).toFixed(2)
    );
  
    console.log("✅ getConsumptionCost result:", totalCost, " | Breakdown:", rows);
    return totalCost;
  }
  

// ✅ Hourly consumption
async function fetchHourlyConsumption(startDateTime, endDateTime) {
  const query = `
  WITH meter_hourly AS (
    SELECT
      DATE_TRUNC('hour', timestamp) AS hour,
      energy_meter_id,
      MAX(kvah) - MIN(kvah) AS meter_kvah
    FROM modbus_data
    WHERE timestamp BETWEEN $1 AND $2
      AND energy_meter_id BETWEEN 1 AND 11
      AND kvah > 0
    GROUP BY energy_meter_id, hour
  )
  SELECT
    TO_CHAR(hour, 'YYYY-MM-DD HH24:00:00') AS hour,
    ROUND(SUM(meter_kvah)::NUMERIC, 1) AS kVAh_difference
  FROM meter_hourly
  GROUP BY hour
  ORDER BY hour ASC;
  
  `;
  const { rows } = await pool.query(query, [startDateTime, endDateTime]);
  const hourlyConsumption = rows.reduce((acc, row) => {
    acc[row.hour] = parseFloat(row.kvah_difference);
    return acc;
  }, {});
  return hourlyConsumption;
}

// ------------------ Dashboard route ------------------
router.get('/dashboardpt1test', async (req, res) => {
    try {
      const { startDateTime, endDateTime } = req.query;
      if (!startDateTime || !endDateTime) {
        return res.status(400).json({ error: 'startDateTime and endDateTime required' });
      }
  
      console.time("dashboardpt1_total");
  
      const [
        meterData,
        kWh,
        kVAh,  // Add this to Promise.all instead of calling it separately
        peak, 
        totalCost, 
        hourlyConsumption
      ] = await Promise.all([
        fetchConsumptionMeterWise(startDateTime, endDateTime),
        getKWhConsumption(startDateTime, endDateTime),
        getKVAhConsumption(startDateTime, endDateTime),  // Move this here
        getPeakDemand(startDateTime, endDateTime),
        getConsumptionCost(startDateTime, endDateTime),
        fetchHourlyConsumption(startDateTime, endDateTime),
      ]);
  
      console.timeEnd("dashboardpt1_total");
  
  
      // Process meter-wise consumption for response format
      const processedMeterWiseConsumption = meterData.meterWiseConsumption.map(m => ({
        energy_meter_id: m.meter_id,
        consumption: m.consumption
      }));
  
      const responseData = {
        ...kVAh,  // Use the value from Promise.all
        ...kWh,
        peakDemand: peak,
        totalCost: totalCost,
        hlCons: { data: meterData.hlCons },
        meterWiseConsumption: processedMeterWiseConsumption,
        hourlyConsumption: hourlyConsumption,
      };
  
      console.log("📊 Final API Response Preview:", responseData);
      res.status(200).json(responseData);
  
    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard data', 
        details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }
  });

// ------------------ EXPORT ROUTER ------------------
module.exports = router;
