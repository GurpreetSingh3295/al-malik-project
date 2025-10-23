const bcrypt = require("bcrypt");
const pool = require("../db");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: "Missing email or password" });

    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows || rows.length === 0) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    // Save minimal user in session
    req.session.user = { user_id: user.user_id, username: user.username, email: user.email, role: user.role };
    return res.json({ ok: true, redirect: "/index.html" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie(process.env.SESSION_NAME || "almalik.sid");
    res.redirect("/login.html");
  });
}

module.exports = { login, logout };
