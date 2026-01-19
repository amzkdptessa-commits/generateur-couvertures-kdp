require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => res.send("OK"));

app.post("/api/ingest-kdp", async (req, res) => {
  try {
    const { email, source, range, raw } = req.body || {};
    if (!email || !raw) {
      return res.status(400).json({ message: "email/raw required" });
    }

    // ID: à connecter à ton auth plus tard
    const userId = "ed825c71-c523-4503-b705-02f818f7b71e";

    // On stocke la payload brute (utile pour debug et parsing futur)
    const { error } = await supabase.from("kdp_raw_reports").insert({
      user_id: userId,
      email,
      source: source || "marketplaceOverview",
      start_date: range?.startISO || null,
      end_date: range?.endISO || null,
      payload: raw,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      return res.status(500).json({ message: error.message });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.listen(PORT, () => console.log(`🚀 API running on ${PORT}`));
