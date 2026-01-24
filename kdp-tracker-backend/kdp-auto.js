/**
 * kdp-auto.js — CommonJS stable (NO ESM)
 * npm i playwright @supabase/supabase-js dotenv
 */

const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const USER_EMAIL = "peacestreet@hotmail.com";
const SESSION_DIR = "./session_amazon";

let isRunning = false;

function nowIso() {
  return new Date().toISOString();
}

function isoDateOnly(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const VIEW_OPTIONS = [
  "TODAY",
  "YESTERDAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "MONTH_TO_DATE",
  "YEAR_TO_DATE",
  "LAST_12_MONTHS",
  "PAST_12_MONTHS",
];

async function ensureLoggedIn(page) {
  await page.goto("https://kdpreports.amazon.com/reports/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const loginDetected =
    page.url().includes("signin") ||
    (await page.locator("#ap_email").count()) > 0 ||
    (await page.locator('input[name="email"]').count()) > 0;

  if (loginDetected) {
    console.log("🔴 Robot déconnecté. Connecte-toi dans la fenêtre Playwright (OTP si demandé).");
    await page.waitForURL(/kdpreports\.amazon\.com\/.*/, { timeout: 0 });
    await page.waitForTimeout(4000);
  }
}

function shouldCaptureJson(url, contentType) {
  if (!contentType || !contentType.toLowerCase().includes("application/json")) return false;
  const patterns = ["/reports/dashboard/", "/api/v2/reports/", "/metadata/customer/", "/reports/"];
  return patterns.some((p) => url.includes(p));
}

function normalizeToPages(anyCaptured) {
  // Coercition string -> object
  let obj = anyCaptured;
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
      console.log("🧩 captured string → JSON.parse OK");
    } catch {
      obj = { raw_string: obj };
    }
  }

  // Wrapper canonique
  const normalized = {
    version: "collector-v7",
    captured_at: nowIso(),
    pages: {},
  };

  // Si déjà pages
  if (obj && typeof obj === "object" && obj.pages && typeof obj.pages === "object") {
    normalized.pages = obj.pages;
    if (obj.captured_at) normalized.captured_at = obj.captured_at;
    normalized.pages.__raw_run = { kind: "raw_run", payload: { captured_at: obj.captured_at || null } };
    return normalized;
  }

  // Ancien format overviewWidget direct
  if (obj && typeof obj === "object" && obj.overviewWidget) {
    normalized.pages.dashboard = { kind: "overviewWidget", payload: obj };
    return normalized;
  }

  // Dump réseau
  if (obj && typeof obj === "object" && (obj.urls || obj.payloads)) {
    normalized.pages.network = { kind: "network_dump", urls: obj.urls || [], payloads: obj.payloads || {} };
    if (obj.captured_at) normalized.captured_at = obj.captured_at;
    return normalized;
  }

  normalized.pages.raw = { kind: "raw", payload: obj };
  return normalized;
}

async function runCollector() {
  if (isRunning) {
    console.log("⏭️ Run ignoré (déjà en cours).");
    return;
  }
  isRunning = true;

  console.log(`\n🤖 Run collector — ${nowIso()}`);

  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    viewport: { width: 1400, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  const captured = {
    captured_at: nowIso(),
    pages: {},
  };

  let currentPageKey = "unknown";
  const initPageBucket = (key) => {
    if (!captured.pages[key]) captured.pages[key] = { urls: [], payloads: {} };
  };

  page.on("response", async (response) => {
    try {
      const url = response.url();
      const status = response.status();
      const ct = response.headers()["content-type"] || "";
      if (status !== 200) return;
      if (!shouldCaptureJson(url, ct)) return;

      const json = await response.json();
      initPageBucket(currentPageKey);

      const k = url.replace(/^https?:\/\//, "").slice(0, 240);
      captured.pages[currentPageKey].urls.push(url);
      captured.pages[currentPageKey].payloads[k] = json;

      console.log(`📦 [${currentPageKey}] JSON: ${url}`);
    } catch (_) {}
  });

  try {
    await ensureLoggedIn(page);

    // DASHBOARD
    currentPageKey = "dashboard";
    initPageBucket(currentPageKey);
    await page.goto("https://kdpreports.amazon.com/reports/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000);

    // Probe viewOption (12 mois / YTD sans UI)
    console.log("🧪 Probing viewOption (pour trouver 12 mois / YTD sans UI)...");
    const d = isoDateOnly(new Date());
    const endpoints = [
      (view) => `https://kdpreports.amazon.com/reports/dashboard/overview?date=${encodeURIComponent(d)}&viewOption=${encodeURIComponent(view)}`,
      (view) => `https://kdpreports.amazon.com/reports/dashboard/marketplaceDistributionOverview?date=${encodeURIComponent(d)}&viewOption=${encodeURIComponent(view)}`,
      (view) => `https://kdpreports.amazon.com/reports/dashboard/formatDistributionOverview?date=${encodeURIComponent(d)}&viewOption=${encodeURIComponent(view)}`,
      (view) => `https://kdpreports.amazon.com/reports/dashboard/topEarningTitles?date=${encodeURIComponent(d)}&viewOption=${encodeURIComponent(view)}`,
      (view) => `https://kdpreports.amazon.com/reports/dashboard/histogramOverview/ORDERS?date=${encodeURIComponent(d)}&viewOption=${encodeURIComponent(view)}`,
      (view) => `https://kdpreports.amazon.com/reports/dashboard/histogramOverview/KENP?date=${encodeURIComponent(d)}&viewOption=${encodeURIComponent(view)}`,
      (view) => `https://kdpreports.amazon.com/reports/dashboard/histogramOverview/ROYALTIES?date=${encodeURIComponent(d)}&viewOption=${encodeURIComponent(view)}`,
    ];

    for (const view of VIEW_OPTIONS) {
      for (const buildUrl of endpoints) {
        const url = buildUrl(view);
        try {
          const resp = await page.request.get(url);
          if (!resp.ok()) continue;
          const ct = resp.headers()["content-type"] || "";
          if (!ct.includes("application/json")) continue;

          const json = await resp.json();
          initPageBucket("dashboard_probe");
          const k = url.replace(/^https?:\/\//, "").slice(0, 240);
          captured.pages["dashboard_probe"].urls.push(url);
          captured.pages["dashboard_probe"].payloads[k] = json;

          console.log(`✅ [probe:${view}] ${url}`);
        } catch (_) {}
      }
    }

    // ORDERS
    currentPageKey = "orders";
    initPageBucket(currentPageKey);
    await page.goto("https://kdpreports.amazon.com/orders", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);

    // PREORDERS
    currentPageKey = "preorders";
    initPageBucket(currentPageKey);
    await page.goto("https://kdpreports.amazon.com/preorders", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);

    // PMR
    currentPageKey = "pmr";
    initPageBucket(currentPageKey);
    await page.goto("https://kdpreports.amazon.com/pmr", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);

    // PAYMENTS
    currentPageKey = "payments";
    initPageBucket(currentPageKey);
    await page.goto("https://kdpreports.amazon.com/payments", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);

    // MONTH CURRENT (via sidebar click)
    currentPageKey = "month_current";
    initPageBucket(currentPageKey);
    try {
      await page.goto("https://kdpreports.amazon.com/reports/dashboard", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
      const link = page.locator('a:has-text("Mois en cours")').first();
      if (await link.count()) {
        await link.click();
        await page.waitForTimeout(6000);
      } else {
        console.log("⚠️ Lien 'Mois en cours' non trouvé (sidebar). On skip.");
      }
    } catch (_) {}

    // INSERT SUPABASE (JSONB safe)
    const payloadToStore = normalizeToPages(captured);
    console.log("🧾 Payload pages =", Object.keys(payloadToStore.pages || {}));

    console.log("📤 Envoi Supabase...");
    const { error } = await supabase.from("kdp_reports").insert([
      {
        user_email: USER_EMAIL,
        payload: payloadToStore,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) console.error("❌ Supabase error:", error.message);
    else console.log("✅ Sauvegardé en base (JSONB + pages.*).");
  } catch (e) {
    console.error("❌ Crash:", e.message);
  } finally {
    await context.close();
    isRunning = false;
    console.log("🏁 Fin run.");
  }
}

// Run + hourly
runCollector();
setInterval(runCollector, 60 * 60 * 1000);

