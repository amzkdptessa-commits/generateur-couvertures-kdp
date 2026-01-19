// server.js - Backend complet pour GabaritKDP Tracker (Version Stable)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// ====================
// API ENDPOINTS
// ====================

// Endpoint: Synchroniser KDP (appelé par l'extension)
app.post('/api/sync-kdp', async (req, res) => {
  try {
    const { email, password, cookies, marketplace } = req.body;

    console.log(`\n--- Nouvelle demande de Sync ---`);
    console.log('Utilisateur:', email);
    console.log('Nombre de cookies reçus:', cookies ? cookies.length : 0);
    
    // ID de test pour le développement (bypass auth pour l'instant)
    const userId = 'ed825c71-c523-4503-b705-02f818f7b71e';

    // 1. Sauvegarder les cookies en base de données
    const { error: cookieError } = await supabase
      .from('kdp_cookies')
      .upsert({
        user_id: userId,
        cookies: JSON.stringify(cookies),
        marketplace: marketplace || 'US',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,marketplace' });

    if (cookieError) {
      console.error('❌ Erreur Supabase Cookies:', cookieError.message);
      return res.status(500).json({ message: 'Erreur lors de la sauvegarde des cookies' });
    }

    console.log('✅ Cookies enregistrés avec succès.');

    // 2. Lancer la récupération des données
    const scrapedData = await scrapeKDPData(userId, cookies, marketplace || 'US');
    
    res.json({
      success: true,
      userId: userId,
      message: 'Synchronisation réussie !',
      data: scrapedData
    });

  } catch (error) {
    console.error('❌ Erreur globale Sync:', error);
    res.status(500).json({ message: 'Erreur serveur: ' + error.message });
  }
});

// Endpoint: Récupérer les ventes pour le Dashboard
app.get('/api/sales/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('kdp_sales')
      .select('*')
      .eq('user_id', userId)
      .order('sale_date', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ sales: data });
  } catch (error) {
    console.error('❌ Erreur Get Sales:', error);
    res.status(500).json({ message: 'Erreur de récupération' });
  }
});

// ====================
// RÉCUPÉRATION DES DONNÉES KDP
// ====================

async function scrapeKDPData(userId, cookies, marketplace) {
  try {
    console.log('🚀 Début de l\'appel API KDP...');
    
    if (!cookies || cookies.length === 0) {
        throw new Error("Aucun cookie fourni");
    }

    // Reconstruction de la chaîne de cookies
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    const headers = {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://kdpreports.amazon.com/',
      'Origin': 'https://kdpreports.amazon.com'
    };

    // URL la plus stable de l'API KDP Reports
    const kdpApiUrl = 'https://kdpreports.amazon.com/api/v1/reports/sales';

    const response = await axios.get(kdpApiUrl, { headers, timeout: 10000 });

    console.log('📡 Réponse API KDP reçue ! Status:', response.status);

    let totalSales = 0;
    let totalRoyalties = 0;
    let sales = [];

    // Analyse de la réponse d'Amazon
    if (response.data && response.data.sales) {
        sales = response.data.sales.map(s => {
            const units = parseInt(s.unitsSold || s.units || 0);
            const royalty = parseFloat(s.royalty || 0);
            totalSales += units;
            totalRoyalties += royalty;
            return {
                title: s.title || "Livre KDP",
                units: units,
                royalty: royalty,
                date: s.date || new Date().toISOString().split('T')[0]
            };
        });
    }

    console.log(`📊 Résultat : ${totalSales} ventes, ${totalRoyalties.toFixed(2)} royalties.`);

    const salesData = {
      sales,
      totalSales,
      totalRoyalties,
      scrapedAt: new Date().toISOString()
    };

    // Sauvegarde dans les tables Supabase
    await saveSalesData(userId, salesData, marketplace);

    return salesData;

  } catch (error) {
    console.error('❌ Erreur API KDP:', error.response ? `Status ${error.response.status}` : error.message);
    return { sales: [], totalSales: 0, totalRoyalties: 0, error: error.message };
  }
}

async function saveSalesData(userId, salesData, marketplace) {
  try {
    // 1. Sauvegarder les lignes de ventes (si il y en a)
    if (salesData.sales.length > 0) {
        const salesToInsert = salesData.sales.map(s => ({
            user_id: userId,
            marketplace: marketplace,
            book_title: s.title,
            units_sold: s.units,
            royalty: s.royalty,
            sale_date: s.date,
            scraped_at: salesData.scrapedAt
        }));

        await supabase.from('kdp_sales').insert(salesToInsert);
    }

    // 2. Mettre à jour le résumé global
    await supabase.from('kdp_summary').upsert({
      user_id: userId,
      marketplace: marketplace,
      total_sales: salesData.totalSales,
      total_royalties: salesData.totalRoyalties,
      last_scraped: salesData.scrapedAt,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,marketplace' });

    console.log('💾 Données enregistrées en base de données.');
  } catch (error) {
    console.error('❌ Erreur sauvegarde DB:', error.message);
  }
}

// Démarrage
app.listen(PORT, () => {
  console.log(`\n🚀 KDP Tracker API running on port ${PORT}`);
  console.log(`Prêt à recevoir les données de l'extension.`);
});