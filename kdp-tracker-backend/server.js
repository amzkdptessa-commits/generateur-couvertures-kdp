const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

// Validation env
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Erreur: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans le .env");
}

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS complète
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "2mb" }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "GabaritKDP Tracker API running" });
});

// Endpoint de synchro
app.post("/api/sync-kdp", async (req, res) => {
  try {
    const { email, cookies, marketplace } = req.body || {};

    if (!email || !cookies) {
      return res.status(400).json({ error: "Email ou cookies manquants" });
    }

    console.log(`📩 Reçu synchro pour: ${email} (${marketplace})`);

    const { error } = await supabase
      .from("kdp_reports")
      .insert({
        user_email: email,
        payload: { cookies, marketplace },
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return res.json({ success: true, message: "Données reçues par le serveur" });
  } catch (err) {
    console.error("❌ SYNC ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// FIX : On force l'écoute sur 0.0.0.0 (IPv4)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveur prêt !`);
  console.log(`🚀 Local: http://127.0.0.1:${PORT}`);
  console.log(`📡 Testez avec: curl http://127.0.0.1:${PORT}`);
});