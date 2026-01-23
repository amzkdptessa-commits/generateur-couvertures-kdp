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
    console.log(`\n🚀 ASPIRATION DES VENTES (12 MOIS) POUR : ${email}`);

    try {
        const cookieStr = formatCookies(cookies);
        
        // On appelle l'API de rapports d'Amazon pour les 12 derniers mois
        // Note: period=past12months permet de voir tes ventes de l'année dernière
        const amazonUrl = "https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL";
        
        const response = await axios.get(amazonUrl, {
            headers: { 
                'Cookie': cookieStr,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0'
            }
        });

        // Les données réelles envoyées par Amazon
        const salesData = response.data; 

        // On enregistre TOUT (Ventes + Cookies) dans Supabase
        const { error } = await supabase
            .from("kdp_reports")
            .insert([{
                user_email: email,
                payload: salesData, 
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;

        console.log("✅ Ventes aspirées et enregistrées !");
        res.json({ success: true, message: "Aspiration réussie" });

    } catch (err) {
        console.error("❌ ERREUR AMAZON:", err.message);
        res.status(500).json({ error: "Amazon a bloqué la connexion. Re-connectez-vous à KDP." });
    }
});

app.listen(3001, "0.0.0.0", () => {
    console.log("\n🔥 SERVEUR ASPIRATEUR PRÊT (PORT 3001)");
});