const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY.trim());

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Augmenté pour les gros rapports

app.post("/api/sync-kdp", async (req, res) => {
    const { email, payload } = req.body;
    console.log(`📩 Données reçues pour : ${email}`);

    try {
        const { error } = await supabase.from("kdp_reports").insert([{
            user_email: email,
            payload: payload, // C'est le JSON propre d'Amazon
            created_at: new Date().toISOString()
        }]);

        if (error) throw error;
        console.log("✅ Rapport enregistré dans Supabase");
        res.json({ success: true });
    } catch (err) {
        console.error("❌ Erreur Supabase:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3001, "0.0.0.0", () => console.log("🔥 Serveur prêt sur le port 3001"));