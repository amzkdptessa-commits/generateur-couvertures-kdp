const { chromium } = require('playwright');
require('dotenv').config();

async function runSpy() {
    console.log("🕵️ Lancement de l'Espion...");
    
    // On lance Chrome en visible
    const context = await chromium.launchPersistentContext('./session_amazon', {
        headless: false, 
        viewport: { width: 1400, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // L'ESPION : Il affiche tout ce qui passe sur le réseau
    page.on('response', async response => {
        const url = response.url();
        // On ne s'intéresse qu'aux données (JSON) venant d'Amazon
        if (url.includes('kdpreports.amazon.com') && response.headers()['content-type']?.includes('json')) {
            console.log(`📦 PAQUET DÉTECTÉ : ${url}`);
            try {
                const json = await response.json();
                // On affiche un tout petit bout du contenu pour voir si c'est ça
                console.log(`   contenu: ${JSON.stringify(json).substring(0, 100)}...`);
            } catch(e) {}
        }
    });

    console.log("🌐 Navigation vers le Dashboard...");
    await page.goto('https://kdpreports.amazon.com/reports/dashboard', { waitUntil: 'networkidle' });

    console.log("🛑 STOP ! Regarde le terminal ci-dessus.");
    console.log("Cherche une ligne qui contient tes chiffres ou le mot 'dashboard'.");
    
    // On laisse ouvert pour que vous ayez le temps de voir
    await page.waitForTimeout(60000);
    await context.close();
}

runSpy();