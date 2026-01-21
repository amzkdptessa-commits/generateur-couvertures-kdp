import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

/* ======================
   VALIDATION ENV
====================== */
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is missing in .env");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in .env");
}

/* ======================
   INIT
====================== */
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.json({ status: "GabaritKDP Tracker API running" });
});

/* ======================
   SYNC KDP DATA
====================== */
app.post("/sync", async (req, res) => {
  try {
    const { user_email, data } = req.body;

    if (!user_email || !data) {
      return res.status(400).json({ error: "Missing payload" });
    }

    const { error } = await supabase
      .from("kdp_reports")
      .insert({
        user_email,
        payload: data,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("SYNC ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   START SERVER
====================== */
app.listen(PORT, () => {
  console.log(`✅ KDP Tracker backend running on http://localhost:${PORT}`);
});
