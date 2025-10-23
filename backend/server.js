require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const inventoryRoutes = require("./routes/inventory");

const app = express();

// ✅ Security & Logging
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));

// ✅ Don't cache login/logout pages
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ✅ Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session (must be BEFORE protected routes)
const oneDayMs = 1000 * 60 * 60 * 24;
app.use(
  session({
    name: process.env.SESSION_NAME || "almalik.sid",
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.SESSION_SECURE === "true",
      sameSite: "lax",
      maxAge: oneDayMs,
    },
  })
);

// ✅ API middleware (returns JSON instead of redirect)
function isAuthenticatedAPI(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
}

// ✅ Public pages
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});
app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/register.html"));
});
app.get("/forgot-password.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/forgot-password.html"));
});

// ✅ Auth routes first
app.use("/auth", authRoutes);

// ✅ Protect HTML pages (redirect if unauthorized)
function isAuthenticated(req, res, next) {
  if (!req.session.user) return res.redirect("/login.html");
  next();
}

// ✅ Protected HTML routes
app.get("/", (req, res) => {
  return req.session.user
    ? res.redirect("/index.html")
    : res.redirect("/login.html");
});
app.get("/index.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
app.get("/inventory.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/inventory.html"));
});

// ✅ Protected API route (must be after session!)
app.use("/api/inventory", isAuthenticatedAPI, inventoryRoutes);

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Health check
app.get("/healthz", (_req, res) => res.status(200).send("OK"));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
