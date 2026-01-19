// server.js - Backend complet pour GabaritKDP Tracker (Version 1.3 - Vue Annuelle)
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
    
    // ID de test pour le développement
    const userId = 'ed825c71-c523-4503-b705-02f818f7b71e'; 

    // 1. Sauvegarde des cookies en DB
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
      return res.status(500).json({ message: 'Erreur sauvegarde cookies' });
    }

    console.log('✅ Cookies enregistrés avec succès.');

    // 2. Lancer la récupération des données (Année en cours)
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
// RÉCUPÉRATION DES DONNÉES (API SECURE - VUE ANNUELLE)
// ====================

async function scrapeKDPData(userId, cookies, marketplace) {
  try {
    console.log('🚀 Appel API Amazon (Vue Annuelle)...');
    
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    // On cherche le token CSRF dans les cookies (indispensable)
    const csrfToken = cookies.find(c => c.name === 'csrf-token')?.value || 
                      cookies.find(c => c.name === 'session-id')?.value;

    const headers = {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'x-csrf-token': csrfToken,
      'Referer': 'https://kdpreports.amazon.com/',
      'Origin': 'https://kdpreports.amazon.com'
    };

    // MODIFICATION : On demande l'année en cours (THIS_YEAR) pour être sûr de voir des données
    const kdpApiUrl = 'https://kdpreports.amazon.com/api/v1/reports/sales?dateRange=THIS_YEAR';

    const response = await axios.get(kdpApiUrl, { headers, timeout: 20000 });

    console.log('📡 Réponse API Amazon reçue. Status :', response.status);

    let totalSales = 0;
    let totalRoyalties = 0;
    let sales = [];

    // On traite les rapports reçus
    if (response.data && response.data.reports) {
        // Amazon renvoie souvent un tableau "reports", on prend le premier
        const mainReport = response.data.reports[0]?.data || [];
        
        sales = mainReport.map(item => {
            const units = parseInt(item.unitsSold || 0);
            const royalty = parseFloat(item.royalty || 0);
            totalSales += units;
            totalRoyalties += royalty;
            return {
                title: item.title || "Livre KDP",
                units: units,
                royalty: royalty,
                date: item.date
            };
        });
    }

    console.log(`📊 Résultat final : ${totalSales} ventes, ${totalRoyalties.toFixed(2)} royalties sur l'année.`);

    const salesData = { sales, totalSales, totalRoyalties, scrapedAt: new Date().toISOString() };
    
    // Sauvegarde DB
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
        // On utilise upsert ou on vide la table avant pour éviter les doublons de tests
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

    console.log('💾 Supabase mis à jour avec les chiffres de l\'année.');
  } catch (error) {
    console.error('❌ Erreur sauvegarde DB:', error.message);
  }
}

app.listen(PORT, () => {
  console.log(`\n🚀 KDP Tracker API running on port ${PORT}`);
});