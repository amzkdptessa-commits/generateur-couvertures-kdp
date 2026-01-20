// server.js - Backend pour tracker KDP avec cookies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
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

// Endpoint: Synchroniser KDP (première connexion)
app.post('/api/sync-kdp', async (req, res) => {
  try {
    const { email, password, cookies, marketplace } = req.body;

    // TEMPORAIRE : Bypass auth pour test
    console.log('Sync request received:', { email, marketplace, cookiesCount: cookies.length });
    
    // Utilise directement l'UID de ton utilisateur Supabase
    const userId = 'ed825c71-c523-4503-b705-02f818f7b71e';

    /* AUTHENTIFICATION DÉSACTIVÉE POUR TEST
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }

    const userId = authData.user.id;
    */

    // 2. Sauvegarder les cookies en DB
    const { error: cookieError } = await supabase
      .from('kdp_cookies')
      .upsert({
        user_id: userId,
        cookies: JSON.stringify(cookies),
        marketplace: marketplace,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,marketplace' });

    if (cookieError) {
      console.error('Error saving cookies:', cookieError);
      return res.status(500).json({ message: 'Erreur lors de la sauvegarde des cookies' });
    }

    console.log('Cookies saved successfully');

    // 3. Scraper immédiatement les données
    const scrapedData = await scrapeKDPData(userId, cookies, marketplace);
    
    console.log('Scraped data:', scrapedData);

    res.json({
      success: true,
      userId: userId,
      message: 'Synchronisation réussie !',
      data: scrapedData
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ message: 'Erreur serveur: ' + error.message });
  }
});

// Endpoint: Auto-sync (appelé par l'extension toutes les 10 min)
app.post('/api/auto-sync', async (req, res) => {
  try {
    const { userId, cookies } = req.body;

    // Récupérer les anciennes données pour comparer
    const { data: oldSales } = await supabase
      .from('kdp_sales')
      .select('*')
      .eq('user_id', userId)
      .order('sale_date', { ascending: false })
      .limit(1);

    // Scraper les nouvelles données
    const newData = await scrapeKDPData(userId, cookies, 'US');

    // Compter les nouvelles ventes
    let newSalesCount = 0;
    if (oldSales && oldSales.length > 0) {
      newSalesCount = newData.totalSales - (oldSales[0].cumulative_sales || 0);
    }

    res.json({
      success: true,
      newSales: newSalesCount,
      totalSales: newData.totalSales,
      totalRoyalties: newData.totalRoyalties
    });

  } catch (error) {
    console.error('Auto-sync error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Endpoint: Get sales data
app.get('/api/sales/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('kdp_sales')
      .select('*')
      .eq('user_id', userId)
      .order('sale_date', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ message: 'Erreur de récupération' });
    }

    res.json({ sales: data });

  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====================
// SCRAPING FUNCTIONS
// ====================

async function scrapeKDPData(userId, cookies, marketplace) {
  try {
    console.log('Starting scrape for user:', userId);
    
    // Construire les headers avec cookies
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    const headers = {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://kdp.amazon.com/'
    };

    // URL des rapports KDP
    const kdpReportsUrl = 'https://kdpreports.amazon.com/dashboard';

    console.log('Fetching KDP data...');
    
    // Faire la requête
    const response = await axios.get(kdpReportsUrl, { headers });

    console.log('KDP page fetched, status:', response.status);

    // Parser avec Cheerio
    const $ = cheerio.load(response.data);

    // Extraire les données
    const salesData = extractSalesData($);

    console.log('Sales data extracted:', salesData);

    // Sauvegarder en DB
    if (salesData.sales.length > 0) {
      await saveSalesData(userId, salesData, marketplace);
      console.log('Sales data saved to DB');
    } else {
      console.log('No sales data found - HTML structure may need adaptation');
    }

    return salesData;

  } catch (error) {
    console.error('Scraping error:', error.message);
    // Retourner des données vides au lieu de throw
    return {
      sales: [],
      totalSales: 0,
      totalRoyalties: 0,
      scrapedAt: new Date().toISOString(),
      error: error.message
    };
  }
}

function extractSalesData($) {
  // IMPORTANT: Cette partie dépend de la structure HTML réelle de KDP
  // Tu devras inspecter la page KDP pour adapter ces sélecteurs

  const sales = [];
  let totalSales = 0;
  let totalRoyalties = 0;

  console.log('Attempting to extract sales data from HTML...');

  // Exemple de parsing (à adapter selon structure réelle)
  $('.sales-row').each((i, elem) => {
    const title = $(elem).find('.book-title').text().trim();
    const units = parseInt($(elem).find('.units-sold').text().trim()) || 0;
    const royalty = parseFloat($(elem).find('.royalty').text().replace('$', '').replace('€', '')) || 0;
    const date = $(elem).find('.sale-date').text().trim();

    sales.push({
      title,
      units,
      royalty,
      date
    });

    totalSales += units;
    totalRoyalties += royalty;
  });

  console.log(`Found ${sales.length} sales entries`);

  return {
    sales,
    totalSales,
    totalRoyalties,
    scrapedAt: new Date().toISOString()
  };
}

async function saveSalesData(userId, salesData, marketplace) {
  try {
    // Sauvegarder chaque vente
    for (const sale of salesData.sales) {
      await supabase.from('kdp_sales').insert({
        user_id: userId,
        marketplace: marketplace,
        book_title: sale.title,
        units_sold: sale.units,
        royalty: sale.royalty,
        sale_date: sale.date,
        scraped_at: salesData.scrapedAt
      });
    }

    // Sauvegarder le résumé
    await supabase.from('kdp_summary').upsert({
      user_id: userId,
      marketplace: marketplace,
      total_sales: salesData.totalSales,
      total_royalties: salesData.totalRoyalties,
      last_scraped: salesData.scrapedAt,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,marketplace' });

  } catch (error) {
    console.error('Error saving sales data:', error);
    throw error;
  }
}

// ====================
// START SERVER
// ====================

app.listen(PORT, () => {
  console.log(`🚀 KDP Tracker API running on port ${PORT}`);
});

module.exports = app;
