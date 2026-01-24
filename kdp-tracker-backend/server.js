// server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ====== ENV ======
const SUPABASE_URL = process.env.SUPABASE_URL; // ex: https://xxxx.supabase.co
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // publishable (côté serveur OK)
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // SECRET (serveur uniquement)
const PORT = process.env.PORT || 3001;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing env: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// ====== Helpers ======
async function sbAuthGetUser(accessToken) {
  // Vérifie le token via Supabase Auth
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) return null;
  return await res.json();
}

function requireAuth(req, res, next) {
  const token = req.cookies.sb_access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// ====== Auth endpoints ======
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email/password required" });

    // Login via Supabase Auth REST (password grant)
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const json = await r.json();
    if (!r.ok) {
      return res.status(401).json({ error: json?.error_description || "Invalid credentials" });
    }

    // Cookie httpOnly (RGPD + sécurité : pas accessible JS)
    res.cookie("sb_access_token", json.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // mets true si tu es en https
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

app.get("/api/me", requireAuth, async (req, res) => {
  const token = req.cookies.sb_access_token;
  const user = await sbAuthGetUser(token);
  if (!user) return res.status(401).json({ error: "Session expired" });
  res.json({ email: user.email });
});

// ====== Data endpoints (server -> Supabase) ======
async function sbSelect(path, accessToken, serviceRole = false) {
  // Utilise PostgREST directement
  const key = serviceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };

  // Optionnel : valider token utilisateur avant d'autoriser une requête
  if (accessToken) {
    const user = await sbAuthGetUser(accessToken);
    if (!user) return { status: 401, json: { error: "Session expired" } };
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  const txt = await res.text();
  let json;
  try { json = JSON.parse(txt); } catch { json = { raw: txt }; }
  return { status: res.status, json };
}

// Latest daily metrics
app.get("/api/kdp/latest", requireAuth, async (req, res) => {
  const token = req.cookies.sb_access_token;
  const email = req.cookies.user_email;

  const q = `kdp_metrics_daily?select=metric_date,currency,royalties,kenp_read,print_orders,digital_orders,vvab_orders,source_report_id,created_at&user_email=eq.${encodeURIComponent(email)}&order=metric_date.desc&limit=1`;

  const r = await sbSelect(q, token, true);
  if (r.status !== 200) return res.status(r.status).json(r.json);
  res.json(r.json?.[0] || null);
});

// Series last N days
app.get("/api/kdp/series", requireAuth, async (req, res) => {
  const token = req.cookies.sb_access_token;
  const email = req.cookies.user_email;
  const days = Math.min(parseInt(req.query.days || "30", 10) || 30, 365);

  const q = `kdp_metrics_daily?select=metric_date,currency,royalties,kenp_read,print_orders,digital_orders,vvab_orders&user_email=eq.${encodeURIComponent(email)}&order=metric_date.asc&limit=${days}`;

  const r = await sbSelect(q, token, true);
  if (r.status !== 200) return res.status(r.status).json(r.json);
  res.json(r.json || []);
});

// ====== Static files (optionnel) ======
app.use(express.static(process.env.PUBLIC_DIR || "public"));

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
