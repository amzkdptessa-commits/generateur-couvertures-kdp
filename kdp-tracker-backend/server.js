// server.js - Backend complet pour GabaritKDP Tracker (Version 1.4 - marketplaceOverview)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());

// ====================
// API ENDPOINTS
// ====================

app.post("/api/sync-kdp", async (req, res) => {
  try {
    const { email, cookies, marketplace, year, month, csrfToken } = req.body;

    console.log(`\n--- 📥 Demande reçue pour : ${email} ---`);
    console.log("Nombre de cookies reçus :", cookies ? cookies.length : 0);

    // ID de test pour le développement (à remplacer par le vrai user_id quand auth prête)
    const userId = "ed825c71-c523-4503-b705-02f818f7b71e";

    // 1) Sauvegarde cookies
    const { error: cookieError } = await supabase.from("kdp_cookies").upsert(
      {
        user_id: userId,
        cookies: JSON.stringify(cookies || []),
        marketplace: marketplace || "US",
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,marketplace" }
    );

    if (cookieError) {
      console.error("❌ Erreur Supabase Cookies:", cookieError.message);
      return res.status(500).json({ message: "Erreur sauvegarde cookies" });
    }

    console.log("✅ Cookies enregistrés avec succès.");

    // 2) Fetch marketplaceOverview (mois choisi ou mois en cours)
    const target = computeTargetMonth(year, month);

    const scrapedData = await fetchMarketplaceOverview({
      userId,
      cookies: cookies || [],
      marketplace: marketplace || "US",
      csrfToken,
      startDateISO: target.startISO,
      endDateISO: target.endISO
    });

    return res.json({
      success: true,
      userId,
      message: "Synchronisation réussie !",
      data: scrapedData
    });
  } catch (error) {
    console.error("❌ Erreur globale Sync:", error);
    res.status(500).json({ message: "Erreur serveur: " + error.message });
  }
});

app.get("/api/sales/:userId", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("kdp_sales")
      .select("*")
      .eq("user_id", req.params.userId)
      .order("sale_date", { ascending: false });

    if (error) throw error;
    res.json({ sales: data });
  } catch (error) {
    res.status(500).json({ message: "Erreur de récupération" });
  }
});

// ====================
// UTIL: Date range mensuelle
// ====================

function computeTargetMonth(year, month) {
  const now = new Date();
  const y = Number.isFinite(+year) ? +year : now.getUTCFullYear();
  const m = Number.isFinite(+month) ? +month : now.getUTCMonth() + 1; // 1-12

  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59)); // dernier jour du mois

  return {
    y,
    m,
    startISO: start.toISOString().replace(".000Z", "Z"),
    endISO: end.toISOString().replace(".000Z", "Z")
  };
}

// ====================
// CORE: marketplaceOverview
// ====================

async function fetchMarketplaceOverview({ userId, cookies, marketplace, csrfToken, startDateISO, endDateISO }) {
  try {
    console.log(`🚀 Appel Amazon marketplaceOverview: ${startDateISO} -> ${endDateISO}`);

    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    // Token CSRF: priorité à la valeur passée par l’extension, sinon on tente de le trouver dans les cookies
    const csrf =
      csrfToken ||
      cookies.find((c) => c.name === "csrf-token")?.value ||
      cookies.find((c) => c.name === "csrfToken")?.value ||
      cookies.find((c) => c.name === "csrf")?.value ||
      null;

    if (!csrf) {
      console.error("❌ CSRF token introuvable. Impossible d’appeler marketplaceOverview.");
      return {
        ok: false,
        error: "CSRF token introuvable (nécessaire).",
        totalSales: 0,
        totalRoyalties: 0,
        totalKenp: 0
      };
    }

    const url =
      `https://kdpreports.amazon.com/reports/pmr/print/marketplaceOverview` +
      `?startDate=${encodeURIComponent(startDateISO)}` +
      `&endDate=${encodeURIComponent(endDateISO)}` +
      `&shouldShowCreateSpace=false`;

    const headers = {
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/json",
      cookie: cookieString,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      referer: "https://kdpreports.amazon.com/pmr",
      origin: "https://kdpreports.amazon.com",
      "x-requested-with": "XMLHttpRequest",
      "x-csrf-token": csrf
    };

    const response = await axios.get(url, { headers, timeout: 20000 });
    console.log("📡 Réponse Amazon reçue. Status:", response.status);

    const parsed = parseMarketplaceOverview(response.data);

    const summaryData = {
      ok: true,
      marketplace,
      range: { startDateISO, endDateISO },
      totalSales: 0,
      totalRoyalties: parsed.totalRoyalties,
      totalKenp: parsed.totalKenp,
      breakdown: parsed.breakdown,
      scrapedAt: new Date().toISOString()
    };

    // Mise à jour kdp_summary (royalties + kenp)
    await supabase.from("kdp_summary").upsert(
      {
        user_id: userId,
        marketplace,
        total_sales: summaryData.totalSales,
        total_royalties: summaryData.totalRoyalties,
        total_kenp: summaryData.totalKenp,
        last_scraped: summaryData.scrapedAt,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,marketplace" }
    );

    console.log("💾 Supabase mis à jour avec marketplaceOverview.");
    return summaryData;
  } catch (error) {
    const status = error?.response?.status;
    console.error("❌ Erreur marketplaceOverview:", status ? `Status ${status}` : error.message);

    return {
      ok: false,
      error: status ? `Amazon responded ${status}` : error.message,
      totalSales: 0,
      totalRoyalties: 0,
      totalKenp: 0
    };
  }
}

// Best-effort parser (structure variable)
function parseMarketplaceOverview(data) {
  let totalRoyalties = 0;
  let totalKenp = 0;
  const breakdown = [];

  // Cas 1: data est un tableau
  if (Array.isArray(data)) {
    for (const row of data) {
      const r = toNumber(row?.royaltiesTotal ?? row?.totalRoyalties ?? row?.royalties ?? row?.total ?? 0);
      const k = toNumber(row?.kenp ?? row?.kenpPages ?? row?.kenpReads ?? 0);
      totalRoyalties += r;
      totalKenp += k;
      breakdown.push({ raw: row, royalties: r, kenp: k });
    }
    return { totalRoyalties, totalKenp, breakdown };
  }

  // Cas 2: data contient rows/items/marketplaces
  const rows = data?.rows || data?.items || data?.marketplaces || null;
  if (Array.isArray(rows)) {
    for (const row of rows) {
      const ebook = toNumber(row?.ebookRoyalties ?? row?.ebook ?? 0);
      const pb = toNumber(row?.paperbackRoyalties ?? row?.paperback ?? 0);
      const hc = toNumber(row?.hardcoverRoyalties ?? row?.hardcover ?? 0);
      const r = ebook + pb + hc;

      const k = toNumber(row?.kenp ?? row?.kenpPages ?? row?.kenpReads ?? 0);

      totalRoyalties += r;
      totalKenp += k;

      breakdown.push({
        marketplace: row?.marketplace || row?.market || row?.site || null,
        currency: row?.currency || row?.devise || null,
        ebookRoyalties: ebook,
        paperbackRoyalties: pb,
        hardcoverRoyalties: hc,
        kenp: k
      });
    }
    return { totalRoyalties, totalKenp, breakdown };
  }

  // Cas 3: inconnu
  breakdown.push({ raw: data });
  return { totalRoyalties, totalKenp, breakdown };
}

function toNumber(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v).replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

app.listen(PORT, () => {
  console.log(`\n🚀 KDP Tracker API running on port ${PORT}`);
});
