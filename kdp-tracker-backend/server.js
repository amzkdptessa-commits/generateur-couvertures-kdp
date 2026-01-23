const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY.trim());
const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.post("/api/sync-kdp", async (req, res) => {
    const { email, cookies } = req.body;
    console.log(`\n🚀 SYNCHRONISATION STYLE "PUBLISHER CHAMP" POUR : ${email}`);

    try {
        // 1. On transforme les cookies reçus pour Amazon
        const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        // 2. APPEL À L'API D'AMAZON (Past 12 Months / All Marketplaces)
        // C'est ici que la magie opère pour récupérer les titres et les pays
        const amazonUrl = "https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL";
        
        const response = await axios.get(amazonUrl, {
            headers: { 
                'Cookie': cookieStr,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0'
            }
        });

        // 3. Amazon renvoie un objet JSON structuré (Ventes, KENP, Royalties)
        const allSalesData = response.data; 

        // 4. On enregistre ce rapport COMPLET dans Supabase
        const { error } = await supabase.from("kdp_reports").insert([{
            user_email: email,
            payload: allSalesData, 
            created_at: new Date().toISOString()
        }]);

        if (error) throw error;

        console.log("✅ Données extraites avec succès !");
        res.json({ success: true, message: "Données synchronisées" });

    } catch (err) {
        console.error("❌ ERREUR AMAZON:", err.message);
        res.status(500).json({ error: "Erreur de connexion Amazon" });
    }
});

app.listen(3001, "0.0.0.0", () => console.log("🔥 BACKEND ANALYTICS PRÊT (PORT 3001)"));