require('dotenv').config();

const express = require("express");
const router = express.Router();
const pool = require('./dbpg');

const API_KEY = process.env.API_KEY;

router.post("/ingest", async (req, res) => {
  try {
    const clientKey = req.headers["x-api-key"];

    if (!clientKey || clientKey !== API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      energy_meter_id,
      kWh,
      kVAh,
      kVArh,
      avg_vln_value,
      avg_vll_value,
      avg_current_value,
      system_power_factor,
      avg_power_factor,
      system_frequency,
      total_kW,
      total_kVA,
      timestamp,
    } = req.body;

    // Basic validation
    if (!energy_meter_id || !timestamp) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO public.modbus_data
      (energy_meter_id, kWh, kVAh, kVArh, avg_vln_value, avg_vll_value,
       avg_current_value, system_power_factor, avg_power_factor,
       system_frequency, total_kW, total_kVA, timestamp)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    `;

    await pool.query(query, [
      energy_meter_id,
      kWh,
      kVAh,
      kVArh,
      avg_vln_value,
      avg_vll_value,
      avg_current_value,
      system_power_factor,
      avg_power_factor,
      system_frequency,
      total_kW,
      total_kVA,
      timestamp,
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Modbus ingest error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
