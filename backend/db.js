require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined
});

async function ping() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log("✅ MySQL pool connected & ping successful");
}

ping().catch((e) => {
  console.error("❌ MySQL connection error:", e.message);
});

module.exports = pool;
