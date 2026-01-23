const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const sbUrl = process.env.SUPABASE_URL.trim();
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
const supabase = createClient(sbUrl, sbKey);

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Prépare les cookies pour Amazon
function formatCookies(cookies) {
    return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

app.post("/api/sync-kdp", async (req, res) => {
    const { email, cookies } = req.body;
    console.log(`\n🚀 RÉCUPÉRATION DES VENTES SUR 12 MOIS : ${email}`);

    try {
        const cookieStr = formatCookies(cookies);
        
        // On interroge l'API officielle des rapports KDP pour les 12 derniers mois
        const amazonUrl = "https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL";
        
        const response = await axios.get(amazonUrl, {
            headers: { 
                'Cookie': cookieStr,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // Amazon renvoie un gros JSON avec toutes tes ventes par livre et par pays
        const salesData = response.data; 

        const { error } = await supabase
            .from("kdp_reports")
            .insert([{
                user_email: email,
                payload: salesData, // On stocke tout le rapport d'un coup
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;

        console.log("✅ Données annuelles enregistrées dans Supabase !");
        res.json({ success: true, message: "Analyse 12 mois terminée" });

    } catch (err) {
        console.error("❌ ERREUR AMAZON:", err.message);
        res.status(500).json({ error: "Amazon refuse l'accès. Re-connectez-vous à KDP." });
    }
});

app.listen(3001, "0.0.0.0", () => {
    console.log("\n🔥 SERVEUR KDP ANALYTICS PRÊT (PORT 3001)");
});