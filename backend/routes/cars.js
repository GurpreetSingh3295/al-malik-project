const express = require("express");
const db = require("../db");
const router = express.Router();

// ✅ Fetch all cars
router.get("/", async (req, res) => {
  try {
    const [cars] = await db.query("SELECT * FROM cars ORDER BY id DESC");
    res.json({ ok: true, cars });
  } catch (error) {
    console.error("❌ Error fetching cars:", error);
    res.status(500).json({ ok: false, error: "Failed to load cars" });
  }
});

module.exports = router;
