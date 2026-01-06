/**
 * 🔒 KDP STRICT - Export PDF via pdfcpu
 * 
 * Cette fonction reçoit une image PNG base64 et génère un PDF
 * avec les dimensions EXACTES requises par KDP.
 * 
 * Avantages par rapport à jsPDF :
 * - Dimensions physiques garanties (pas de fallback A4)
 * - MediaBox/CropBox correctement définis
 * - Compatible impression industrielle KDP
 */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }) 
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { imageBase64, widthMM, heightMM, widthIn, heightIn, filename, dpi } = body;

        // Validation
        if (!imageBase64) {
            return { 
                statusCode: 400, 
                headers,
                body: JSON.stringify({ error: 'Missing imageBase64' }) 
            };
        }

        if (!widthMM || !heightMM) {
            return { 
                statusCode: 400, 
                headers,
                body: JSON.stringify({ error: 'Missing dimensions (widthMM, heightMM)' }) 
            };
        }

        // Créer des fichiers temporaires
        const tmpDir = os.tmpdir();
        const timestamp = Date.now();
        const pngPath = path.join(tmpDir, `cover-${timestamp}.png`);
        const pdfPath = path.join(tmpDir, `cover-${timestamp}.pdf`);

        console.log(`[KDP] Création PDF: ${widthMM.toFixed(2)}mm × ${heightMM.toFixed(2)}mm`);
        if (widthIn && heightIn) {
            console.log(`[KDP] En pouces: ${widthIn.toFixed(4)}" × ${heightIn.toFixed(4)}"`);
        }

        // Écrire le PNG
        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(pngPath, buffer);
        console.log(`[KDP] PNG écrit: ${pngPath} (${buffer.length} bytes)`);

        // Chemin vers pdfcpu
        // Sur Netlify, les binaires doivent être dans le dossier functions
        // ou téléchargés dynamiquement
        const pdfcpuPath = process.platform === 'win32' 
            ? path.join(__dirname, 'bin', 'pdfcpu.exe')
            : path.join(__dirname, 'bin', 'pdfcpu');

        // Alternative : utiliser pdfcpu via npx ou téléchargement
        // Pour Netlify, on va utiliser une approche différente avec img2pdf ou similaire

        // ═══════════════════════════════════════════════════════════════════
        // SOLUTION ALTERNATIVE : Créer le PDF manuellement sans pdfcpu
        // Car Netlify Functions ne peuvent pas facilement exécuter des binaires
        // ═══════════════════════════════════════════════════════════════════

        // On va créer un PDF minimaliste avec les bonnes dimensions
        // en utilisant la structure PDF brute

        const pdfContent = createPDFWithExactDimensions(buffer, widthMM, heightMM, dpi || 300);
        
        console.log(`[KDP] PDF créé: ${pdfContent.length} bytes`);

        // Nettoyer
        try { fs.unlinkSync(pngPath); } catch (e) {}

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename || 'cover-kdp'}.pdf"`,
            },
            body: pdfContent.toString('base64'),
            isBase64Encoded: true,
        };

    } catch (err) {
        console.error('[KDP] Erreur:', err);
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: err.message }) 
        };
    }
};

/**
 * Crée un PDF avec dimensions exactes en utilisant la structure PDF brute
 * Cette méthode garantit que le MediaBox/CropBox sont EXACTEMENT ce qu'on demande
 */
function createPDFWithExactDimensions(pngBuffer, widthMM, heightMM, dpi) {
    // Conversion mm -> points (1 inch = 72 points, 1 inch = 25.4 mm)
    const mmToPoints = (mm) => mm * 72 / 25.4;
    
    const widthPt = mmToPoints(widthMM);
    const heightPt = mmToPoints(heightMM);

    console.log(`[KDP] Dimensions PDF: ${widthPt.toFixed(2)}pt × ${heightPt.toFixed(2)}pt`);
    console.log(`[KDP] Équivalent pouces: ${(widthPt/72).toFixed(4)}" × ${(heightPt/72).toFixed(4)}"`);

    // Encoder le PNG en base85 ou le garder tel quel
    const pngBase64 = pngBuffer.toString('base64');
    
    // Créer le PDF manuellement avec la structure exacte
    // Note: Cette approche crée un PDF valide avec les dimensions exactes
    
    const xref = [];
    let offset = 0;
    
    const addObject = (content) => {
        xref.push(offset);
        const obj = content + '\n';
        offset += Buffer.byteLength(obj, 'utf8');
        return obj;
    };
    
    let pdf = '';
    
    // Header
    pdf += '%PDF-1.4\n';
    pdf += '%âãÏÓ\n';
    offset = Buffer.byteLength(pdf, 'utf8');
    
    // Object 1: Catalog
    pdf += addObject(`1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj`);
    
    // Object 2: Pages
    pdf += addObject(`2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj`);
    
    // Object 3: Page avec dimensions EXACTES
    pdf += addObject(`3 0 obj
<< /Type /Page 
   /Parent 2 0 R 
   /MediaBox [0 0 ${widthPt.toFixed(4)} ${heightPt.toFixed(4)}]
   /CropBox [0 0 ${widthPt.toFixed(4)} ${heightPt.toFixed(4)}]
   /TrimBox [0 0 ${widthPt.toFixed(4)} ${heightPt.toFixed(4)}]
   /Resources << /XObject << /Im0 4 0 R >> >>
   /Contents 5 0 R
>>
endobj`);
    
    // Object 4: Image XObject (PNG)
    const pngLength = pngBuffer.length;
    pdf += addObject(`4 0 obj
<< /Type /XObject
   /Subtype /Image
   /Width ${Math.round(widthPt * dpi / 72)}
   /Height ${Math.round(heightPt * dpi / 72)}
   /ColorSpace /DeviceRGB
   /BitsPerComponent 8
   /Filter /DCTDecode
   /Length ${pngLength}
>>
stream
`);
    
    // On ne peut pas facilement intégrer un PNG brut dans un PDF
    // Il faudrait le convertir en JPEG ou utiliser une vraie lib
    // Pour l'instant, on va utiliser une approche simplifiée
    
    // SOLUTION: Utiliser pdf-lib côté serveur (npm package)
    // Je vais modifier pour utiliser pdf-lib qui est disponible sur Netlify
    
    return createPDFWithPdfLib(pngBuffer, widthMM, heightMM);
}

/**
 * Version avec pdf-lib (npm package disponible sur Netlify)
 */
async function createPDFWithPdfLib(pngBuffer, widthMM, heightMM) {
    // Cette fonction sera appelée si pdf-lib est disponible
    // Sinon, on retourne une erreur demandant d'installer pdf-lib
    
    try {
        const { PDFDocument } = require('pdf-lib');
        
        // Conversion mm -> points
        const mmToPoints = (mm) => mm * 72 / 25.4;
        const widthPt = mmToPoints(widthMM);
        const heightPt = mmToPoints(heightMM);
        
        // Créer le document PDF
        const pdfDoc = await PDFDocument.create();
        
        // Ajouter la page avec dimensions exactes
        const page = pdfDoc.addPage([widthPt, heightPt]);
        
        // Intégrer l'image PNG
        const pngImage = await pdfDoc.embedPng(pngBuffer);
        
        // Dessiner l'image sur toute la page
        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: widthPt,
            height: heightPt,
        });
        
        // Sauvegarder
        const pdfBytes = await pdfDoc.save();
        
        console.log(`[KDP] PDF créé avec pdf-lib: ${pdfBytes.length} bytes`);
        console.log(`[KDP] Page: ${widthPt.toFixed(2)}pt × ${heightPt.toFixed(2)}pt`);
        
        return Buffer.from(pdfBytes);
        
    } catch (err) {
        console.error('[KDP] pdf-lib non disponible ou erreur:', err.message);
        throw new Error('pdf-lib required. Run: npm install pdf-lib');
    }
}

// Export pour utilisation avec pdf-lib (async)
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const { imageBase64, widthMM, heightMM, widthIn, heightIn, filename } = body;

        if (!imageBase64 || !widthMM || !heightMM) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
        }

        console.log(`[KDP STRICT] Export PDF demandé:`);
        console.log(`  - Dimensions: ${widthMM.toFixed(2)}mm × ${heightMM.toFixed(2)}mm`);
        if (widthIn && heightIn) {
            console.log(`  - En pouces: ${widthIn.toFixed(4)}" × ${heightIn.toFixed(4)}"`);
        }

        // Décoder le PNG
        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
        const pngBuffer = Buffer.from(base64Data, 'base64');

        // Créer le PDF avec pdf-lib
        const { PDFDocument } = require('pdf-lib');
        
        const mmToPoints = (mm) => mm * 72 / 25.4;
        const widthPt = mmToPoints(widthMM);
        const heightPt = mmToPoints(heightMM);

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([widthPt, heightPt]);
        
        const pngImage = await pdfDoc.embedPng(pngBuffer);
        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: widthPt,
            height: heightPt,
        });

        const pdfBytes = await pdfDoc.save();

        console.log(`[KDP STRICT] PDF généré:`);
        console.log(`  - Taille: ${pdfBytes.length} bytes`);
        console.log(`  - Page: ${widthPt.toFixed(2)}pt × ${heightPt.toFixed(2)}pt`);
        console.log(`  - Pouces: ${(widthPt/72).toFixed(4)}" × ${(heightPt/72).toFixed(4)}"`);

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename || 'cover-kdp'}.pdf"`,
            },
            body: Buffer.from(pdfBytes).toString('base64'),
            isBase64Encoded: true,
        };

    } catch (err) {
        console.error('[KDP STRICT] Erreur:', err);
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: err.message, hint: 'Assurez-vous que pdf-lib est installé: npm install pdf-lib' }) 
        };
    }
};
