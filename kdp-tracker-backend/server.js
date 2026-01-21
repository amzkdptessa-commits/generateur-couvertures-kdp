const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

// Validation env
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is missing in .env");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in .env");
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "GabaritKDP Tracker API running" });
});

// Endpoint attendu par ton extension (à adapter si ton popup.js appelle /api/sync-kdp)
app.post("/api/sync-kdp", async (req, res) => {
  try {
    const { email, data } = req.body || {};

    if (!email || !data) {
      return res.status(400).json({ error: "Missing email or data" });
    }

    const { error } = await supabase
      .from("kdp_reports")
      .insert({
        user_email: email,
        payload: data,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("SYNC ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ KDP Tracker backend running on http://localhost:${PORT}`);
});

