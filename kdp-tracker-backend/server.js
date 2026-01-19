// server.js - Backend complet pour GabaritKDP Tracker (Version 1.2 - Anti-400)
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

app.use(cors());
app.use(express.json());

// ====================
// API ENDPOINTS
// ====================

app.post('/api/sync-kdp', async (req, res) => {
  try {
    const { email, cookies, marketplace } = req.body;

    console.log(`\n--- 📥 Demande reçue pour : ${email} ---`);
    console.log('Nombre de cookies reçus :', cookies ? cookies.length : 0);
    
    const userId = 'ed825c71-c523-4503-b705-02f818f7b71e'; // ID de test

    // Sauvegarde en DB
    const { error: cookieError } = await supabase
      .from('kdp_cookies')
      .upsert({
        user_id: userId,
        cookies: JSON.stringify(cookies),
        marketplace: marketplace || 'US',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,marketplace' });

    if (cookieError) {
      console.error('❌ Erreur Supabase :', cookieError.message);
      return res.status(500).json({ message: 'Erreur sauvegarde cookies' });
    }

    console.log('✅ Cookies mis à jour dans la base.');

    // Appel du scraper API
    const scrapedData = await scrapeKDPData(userId, cookies, marketplace || 'US');
    
    res.json({
      success: true,
      userId: userId,
      message: 'Synchronisation réussie !',
      data: scrapedData
    });

  } catch (error) {
    console.error('❌ Erreur globale :', error);
    res.status(500).json({ message: 'Erreur serveur: ' + error.message });
  }
});

app.get('/api/sales/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('kdp_sales')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('sale_date', { ascending: false });
    if (error) throw error;
    res.json({ sales: data });
  } catch (error) {
    res.status(500).json({ message: 'Erreur de récupération' });
  }
});

// ====================
// RÉCUPÉRATION DES DONNÉES (API SECURE)
// ====================

async function scrapeKDPData(userId, cookies, marketplace) {
  try {
    console.log('🚀 Tentative d\'accès à l\'API Amazon...');
    
    // 1. Reconstruction des cookies
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    // 2. Extraction du token CSRF (Crucial pour éviter l'erreur 400)
    // On cherche dans tous les cookies reçus
    const csrfToken = cookies.find(c => c.name === 'csrf-token')?.value || 
                      cookies.find(c => c.name === 'session-id')?.value;

    const headers = {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'x-csrf-token': csrfToken, // On injecte le token trouvé
      'Referer': 'https://kdpreports.amazon.com/',
      'Origin': 'https://kdpreports.amazon.com'
    };

    // On utilise l'URL de l'API de ventes
    const kdpApiUrl = 'https://kdpreports.amazon.com/api/v1/reports/sales';

    const response = await axios.get(kdpApiUrl, { headers, timeout: 15000 });

    console.log('📡 Réponse Amazon reçue ! Status :', response.status);

    let totalSales = 0;
    let totalRoyalties = 0;
    let sales = [];

    if (response.data && response.data.sales) {
        sales = response.data.sales.map(s => {
            const units = parseInt(s.unitsSold || 0);
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

    console.log(`📊 Résultat : ${totalSales} ventes trouvées.`);

    const salesData = { sales, totalSales, totalRoyalties, scrapedAt: new Date().toISOString() };
    await saveSalesData(userId, salesData, marketplace);

    return salesData;

  } catch (error) {
    if (error.response && error.response.status === 400) {
        console.error('❌ Erreur 400 persistante : Cookies insuffisants (manque le token de sécurité).');
    } else {
        console.error('❌ Erreur API KDP :', error.message);
    }
    return { sales: [], totalSales: 0, totalRoyalties: 0, error: error.message };
  }
}

async function saveSalesData(userId, salesData, marketplace) {
  try {
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

    await supabase.from('kdp_summary').upsert({
      user_id: userId,
      marketplace: marketplace,
      total_sales: salesData.totalSales,
      total_royalties: salesData.totalRoyalties,
      last_scraped: salesData.scrapedAt,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,marketplace' });

    console.log('💾 Données enregistrées dans Supabase.');
  } catch (error) {
    console.error('❌ Erreur sauvegarde DB :', error.message);
  }
}

app.listen(PORT, () => {
  console.log(`\n🚀 KDP Tracker API running on port ${PORT}`);
});