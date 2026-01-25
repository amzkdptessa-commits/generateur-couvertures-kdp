// server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // publishable
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // secret server-only
const PORT = process.env.PORT || 3001;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing env: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// ===== Helpers =====
async function sbAuthGetUser(accessToken) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) return null;
  return await res.json();
}

function requireDashboardAuth(req, res, next) {
  const token = req.cookies.sb_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function requireBearer(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing Bearer token" });
  req.bearerToken = token;
  next();
}

async function sbInsertKdpReport({ user_email, payload }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/kdp_reports`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([{
      user_email,
      payload,
      created_at: new Date().toISOString(),
    }]),
  });

  const txt = await res.text();
  if (!res.ok) throw new Error(`Supabase insert failed ${res.status}: ${txt}`);
  return JSON.parse(txt);
}

async function sbSelect(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  const txt = await res.text();
  let json;
  try { json = JSON.parse(txt); } catch { json = { raw: txt }; }
  return { status: res.status, json };
}

// ===== Auth (Dashboard) =====
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email/password required" });

    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await r.json();
    if (!r.ok) return res.status(401).json({ error: json?.error_description || "Invalid credentials" });

    // httpOnly cookies => RGPD-friendly (pas accessible JS)
    res.cookie("sb_access_token", json.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true si HTTPS
      maxAge: 7 * 24 * 3600 * 1000,
    });
    res.cookie("user_email", email, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("sb_access_token");
  res.clearCookie("user_email");
  res.json({ ok: true });
});

app.get("/api/me", requireDashboardAuth, async (req, res) => {
  const user = await sbAuthGetUser(req.cookies.sb_access_token);
  if (!user) return res.status(401).json({ error: "Session expired" });
  res.json({ email: user.email });
});

// ===== Auth (Extension) =====
// L’extension reçoit un access_token (stocké localement dans Chrome)
app.post("/api/ext/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email/password required" });

    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await r.json();
    if (!r.ok) return res.status(401).json({ error: json?.error_description || "Invalid credentials" });

    return res.json({
      ok: true,
      access_token: json.access_token,
      expires_in: json.expires_in,
      token_type: json.token_type,
      user_email: email,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ===== Ingest (Extension -> Server) =====
// L’extension envoie les JSON capturés ici (pas vers Supabase)
app.post("/api/ingest", requireBearer, async (req, res) => {
  try {
    const user = await sbAuthGetUser(req.bearerToken);
    if (!user?.email) return res.status(401).json({ error: "Invalid token" });

    const payload = req.body?.payload;
    if (!payload || typeof payload !== "object") return res.status(400).json({ error: "Missing payload" });

    const inserted = await sbInsertKdpReport({ user_email: user.email, payload });
    return res.json({ ok: true, inserted_id: inserted?.[0]?.id || null });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ===== Data (Dashboard) =====
app.get("/api/kdp/latest", requireDashboardAuth, async (req, res) => {
  const email = req.cookies.user_email;

  const q =
    `kdp_metrics_daily?select=metric_date,currency,royalties,kenp_read,print_orders,digital_orders,vvab_orders,source_report_id,created_at` +
    `&user_email=eq.${encodeURIComponent(email)}` +
    `&order=metric_date.desc&limit=1`;

  const r = await sbSelect(q);
  if (r.status !== 200) return res.status(r.status).json(r.json);
  res.json(r.json?.[0] || null);
});

app.get("/api/kdp/series", requireDashboardAuth, async (req, res) => {
  const email = req.cookies.user_email;
  const days = Math.min(parseInt(req.query.days || "30", 10) || 30, 365);

  const q =
    `kdp_metrics_daily?select=metric_date,currency,royalties,kenp_read,print_orders,digital_orders,vvab_orders` +
    `&user_email=eq.${encodeURIComponent(email)}` +
    `&order=metric_date.asc&limit=${days}`;

  const r = await sbSelect(q);
  if (r.status !== 200) return res.status(r.status).json(r.json);
  res.json(r.json || []);
});

// ===== Static =====
app.use(express.static(process.env.PUBLIC_DIR || "public"));

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
