// backend/routes/inventory.js
const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [cars] = await db.query("SELECT * FROM cars ORDER BY id DESC");
    return res.json({ ok: true, cars });
  } catch (err) {
    console.error("❌ Inventory fetch error:", err);
    return res.status(500).json({ ok: false, error: "Server error loading inventory" });
  }
});

module.exports = router;
