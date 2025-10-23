const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

/* ✅ REGISTER USER */
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ ok: false, error: "All fields are required" });
    }

    // ✅ Check if user email exists
    const [existingEmail] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ ok: false, error: "Email already registered" });
    }

    // ✅ Generate unique username: gurpreet_singh, gurpreet_singh1, etc.
    let baseUsername = `${first_name}_${last_name}`.toLowerCase();
    let finalUsername = baseUsername;
    let counter = 1;

    while (true) {
      const [userCheck] = await db.query("SELECT * FROM users WHERE username = ?", [finalUsername]);
      if (userCheck.length === 0) break; // Username is available
      finalUsername = `${baseUsername}${counter}`; // Add number if taken
      counter++;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (username, first_name, last_name, email, phone_number, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?, 'user')`,
      [finalUsername, first_name, last_name, email, phone_number, hashedPassword]
    );

    console.log("✅ User Registered:", email);
    return res.json({ ok: true, redirect: "/login.html" });

  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ ok: false, error: "Server error during registration." });
  }
});

/* ✅ LOGIN USER */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: "User not found" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, error: "Incorrect password" });
    }

    req.session.user = {
      id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.first_name
    };

    req.session.save((err) => {
      if (err) {
        console.error("❌ Session Save Error:", err);
        return res.status(500).json({ ok: false, error: "Session could not be saved" });
      }
      return res.json({ ok: true, redirect: "/index.html" });
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ ok: false, error: "Server error during login." });
  }
});

/* ✅ LOGOUT USER */
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie(process.env.SESSION_NAME || "almalik.sid");
    return res.redirect("/login.html");
  });
});

module.exports = router;
