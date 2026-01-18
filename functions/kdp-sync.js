// netlify/functions/kdp-sync.js
const axios = require("axios");
const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");

const EXT_ORIGIN = "chrome-extension://mbngmlkggdapbbncgoijjcbmbcgeomip";

// IMPORTANT: mets SUPABASE_URL et SUPABASE_KEY dans Netlify -> Site settings -> Environment variables (scope: Functions)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": EXT_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}

// Transforme le payload extension:
// [{ url, cookies:[{name,value,...}] }, ...] -> [{name,value,...}, ...]
function flattenCookies(cookiesPayload) {
  if (!Array.isArray(cookiesPayload)) return [];
  const flat = [];
  for (const entry of cookiesPayload) {
    if (entry && Array.isArray(entry.cookies)) {
      for (const c of entry.cookies) {
        if (c && c.name && typeof c.value === "string") flat.push(c);
      }
    }
  }
  return flat;
}

function cookieStringFromFlat(flatCookies) {
  // "a=1; b=2"
  return flatCookies.map(c => `${c.name}=${c.value}`).join("; ");
}

function extractSalesData($) {
  // ⚠️ Ton parsing actuel est un placeholder (selectors .sales-row ...)
  // On le garde, mais il est très probable que KDP ne matche pas ces classes.
  // Si ça renvoie 0 ventes, il faudra adapter les sélecteurs.
  const sales = [];
  let totalSales = 0;
  let totalRoyalties = 0;

  $(".sales-row").each((i, elem) => {
    const title = $(elem).find(".book-title").text().trim();
    const units = parseInt($(elem).find(".units-sold").text().trim(), 10) || 0;
    const royalty = parseFloat(
      $(elem).find(".royalty").text().replace("$", "").replace("€", "").trim()
    ) || 0;
    const date = $(elem).find(".sale-date").text().trim();

    sales.push({ title, units, royalty, date });
    totalSales += units;
    totalRoyalties += royalty;
  });

  return {
    sales,
    totalSales,
    totalRoyalties,
    scrapedAt: new Date().toISOString(),
  };
}

async function saveSalesData(userId, salesData, marketplace) {
  // Insert ventes
  for (const sale of salesData.sales) {
    await supabase.from("kdp_sales").insert({
      user_id: userId,
      marketplace,
      book_title: sale.title,
      units_sold: sale.units,
      royalty: sale.royalty,
      sale_date: sale.date,
      scraped_at: salesData.scrapedAt,
    });
  }

  // Upsert summary
  await supabase
    .from("kdp_summary")
    .upsert(
      {
        user_id: userId,
        marketplace,
        total_sales: salesData.totalSales,
        total_royalties: salesData.totalRoyalties,
        last_scraped: salesData.scrapedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,marketplace" }
    );
}

async function scrapeKDPData(flatCookies, marketplace) {
  const cookieStr = cookieStringFromFlat(flatCookies);

  // Page de reports (ton server.js utilise kdpreports.amazon.com/dashboard)
  const kdpReportsUrl = "https://kdpreports.amazon.com/dashboard";

  const headers = {
    Cookie: cookieStr,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    Referer: "https://kdp.amazon.com/",
  };

  const resp = await axios.get(kdpReportsUrl, { headers });
  const $ = cheerio.load(resp.data);

  const salesData = extractSalesData($);
  return salesData;
}

exports.handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // Extension envoie: { cookies: response.data }
    const flatCookies = flattenCookies(body.cookies);

    if (!flatCookies.length) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "No cookies received",
        }),
      };
    }

    // Marketplace optionnel (sinon US)
    const marketplace = body.marketplace || "US";

    // ⚠️ Pour l’instant, on suit ton server.js : userId fixé (bypass auth)
    // Idéalement, tu passeras un userId réel depuis ton dashboard/extension.
    const userId = "ed825c71-c523-4503-b705-02f818f7b71e";

    // 1) Sauver cookies en DB (table kdp_cookies)
    const { error: cookieError } = await supabase
      .from("kdp_cookies")
      .upsert(
        {
          user_id: userId,
          cookies: JSON.stringify(flatCookies),
          marketplace,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,marketplace" }
      );

    if (cookieError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Failed to save cookies",
          details: cookieError,
        }),
      };
    }

    // 2) Scraper + sauvegarder
    const scrapedData = await scrapeKDPData(flatCookies, marketplace);

    // Sauvegarde même si 0 (comme ça tu vois last_scraped évoluer)
    await saveSalesData(userId, scrapedData, marketplace);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Sync completed",
        marketplace,
        scrapedAt: scrapedData.scrapedAt,
        salesCount: scrapedData.sales.length,
        totals: {
          totalSales: scrapedData.totalSales,
          totalRoyalties: scrapedData.totalRoyalties,
        },
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Server error",
        error: String(e?.message || e),
      }),
    };
  }
};
