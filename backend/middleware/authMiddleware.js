function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ ok: false, error: "Unauthorized" });
}

module.exports = { ensureAuth };
