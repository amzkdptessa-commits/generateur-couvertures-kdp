// server.js - Backend complet pour GabaritKDP Tracker
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

    console.log('Sync request received for:', email);
    console.log('Cookies reçus:', cookies ? cookies.length : 0);
    
    // ID de test pour le développement (bypass auth)
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
      console.error('Erreur Supabase Cookies:', cookieError);
      return res.status(500).json({ message: 'Erreur lors de la sauvegarde des cookies' });
    }

    console.log('Cookies enregistrés avec succès.');

    // 2. Lancer la récupération des données via l'API Amazon
    const scrapedData = await scrapeKDPData(userId, cookies, marketplace || 'US');
    
    res.json({
      success: true,
      userId: userId,
      message: 'Synchronisation réussie !',
      data: scrapedData
    });

  } catch (error) {
    console.error('Erreur globale Sync:', error);
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
    console.error('Erreur Get Sales:', error);
    res.status(500).json({ message: 'Erreur de récupération' });
  }
});

// ====================
// FONCTIONS DE RÉCUPÉRATION (API KDP)
// ====================

async function scrapeKDPData(userId, cookies, marketplace) {
  try {
    console.log('Début de la récupération API KDP...');
    
    // Transformer le tableau de cookies en string pour le header
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    const headers = {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Referer': 'https://kdpreports.amazon.com/'
    };

    // On vise l'API interne de KDP pour les 30 derniers jours
    const kdpApiUrl = 'https://kdpreports.amazon.com/api/v1/reports/sales?dateRange=last30Days';

    const response = await axios.get(kdpApiUrl, { headers });

    console.log('Réponse KDP API reçue, Status:', response.status);

    let sales = [];
    let totalSales = 0;
    let totalRoyalties = 0;

    // Si Amazon nous renvoie bien du JSON
    if (response.data && response.data.reports) {
        // Amazon renvoie souvent un tableau "reports"
        const reportData = response.data.reports[0] || {};
        const rawSales = reportData.data || [];

        sales = rawSales.map(item => {
            const units = parseInt(item.unitsSold) || 0;
            const royalty = parseFloat(item.royalty) || 0;
            totalSales += units;
            totalRoyalties += royalty;

            return {
                title: item.title || "Livre KDP",
                units: units,
                royalty: royalty,
                date: item.date || new Date().toISOString().split('T')[0]
            };
        });
    }

    console.log(`Données extraites : ${totalSales} ventes, ${totalRoyalties} royalties.`);

    const salesData = {
      sales,
      totalSales,
      totalRoyalties,
      scrapedAt: new Date().toISOString()
    };

    // Sauvegarder dans Supabase
    await saveSalesData(userId, salesData, marketplace);

    return salesData;

  } catch (error) {
    console.error('Erreur Scraping API:', error.message);
    return { sales: [], totalSales: 0, totalRoyalties: 0, error: error.message };
  }
}

async function saveSalesData(userId, salesData, marketplace) {
  try {
    // 1. Sauvegarder chaque ligne de vente
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

    // 2. Mettre à jour le résumé (Summary)
    await supabase.from('kdp_summary').upsert({
      user_id: userId,
      marketplace: marketplace,
      total_sales: salesData.totalSales,
      total_royalties: salesData.totalRoyalties,
      last_scraped: salesData.scrapedAt,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,marketplace' });

    console.log('Données sauvegardées en base de données.');
  } catch (error) {
    console.error('Erreur sauvegarde DB:', error);
  }
}

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 KDP Tracker API running on port ${PORT}`);
});