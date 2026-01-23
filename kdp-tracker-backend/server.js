const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

// Chargement du fichier .env
dotenv.config();

// --- DIAGNOSTIC DES VARIABLES ---
// On nettoie les variables pour enlever les espaces ou retours à la ligne invisibles
const SB_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : null;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() : null;

console.log("--- Diagnostic de connexion ---");
console.log("URL Supabase :", SB_URL ? SB_URL : "❌ MANQUANTE");
console.log("Clé Service Role :", SB_KEY ? "✅ Présente (nettoyée)" : "❌ MANQUANTE");
console.log("-------------------------------");

if (!SB_URL || !SB_KEY) {
  console.error("❌ ERREUR FATALE: Vérifie ton fichier .env à la racine du dossier !");
  process.exit(1); // Arrête le serveur si les clés manquent
}

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "5mb" })); // Augmenté à 5mb au cas où les cookies sont lourds

// Initialisation du client Supabase avec les variables nettoyées
const supabase = createClient(SB_URL, SB_KEY);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Serveur KDP Tracker opérationnel" });
});

// Endpoint de synchro
app.post("/api/sync-kdp", async (req, res) => {
  try {
    const { email, cookies, marketplace } = req.body || {};

    if (!email || !cookies) {
      console.warn("⚠️ Requête reçue mais données incomplètes.");
      return res.status(400).json({ error: "Email ou cookies manquants" });
    }

    console.log(`📩 Tentative d'insertion pour: ${email}`);

    const { error } = await supabase
      .from("kdp_reports")
      .insert([
        {
          user_email: email,
          payload: { cookies, marketplace },
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error("❌ Erreur Supabase lors de l'insertion:", error.message);
      throw error;
    }

    console.log("✅ Données enregistrées avec succès dans Supabase !");
    return res.json({ success: true, message: "Synchro réussie" });

  } catch (err) {
    console.error("❌ SYNC ERROR:", err.message);
    // On renvoie une erreur plus détaillée
    return res.status(500).json({ 
        error: "Le serveur n'a pas pu contacter Supabase",
        details: err.message 
    });
  }
});

// Lancement du serveur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 SERVEUR DÉMARRÉ SUR LE PORT ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`📡 En attente de données de l'extension...\n`);
});