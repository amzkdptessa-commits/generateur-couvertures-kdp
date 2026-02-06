        const { useState, useRef, useEffect, useCallback, useMemo } = React;

        // === Cover-fit comme CSS background-size: cover ===
        function drawImageCover(ctx, img, box, cx = 0.5, cy = 0.5, zoom = 1, offsetX = 0, offsetY = 0) {
            const iw = img.naturalWidth, ih = img.naturalHeight;
            if (!iw || !ih) return;

            const scale = Math.max(box.width / iw, box.height / ih) * zoom;
            const dw = iw * scale, dh = ih * scale;

            // Position de base + offset manuel (en pixels de prévisualisation)
            const dx = box.x + (box.width - dw) * cx + offsetX;
            const dy = box.y + (box.height - dh) * cy + offsetY;

            // Clipper à la zone du livre pour ne pas déborder
            ctx.save();
            ctx.beginPath();
            ctx.rect(box.x, box.y, box.width, box.height);
            ctx.clip();
            
            ctx.drawImage(img, dx, dy, dw, dh);
            
            ctx.restore();
        }

        const texts = {
            fr: {
                title: "Générateur de Couvertures KDP",
                subtitle: "Aperçu 4K Ultra HD - De Canva à KDP en 3 clics",
                bookSettings: "Paramètres du livre",
                bindingType: "Type de reliure",
                paperback: "Livre broché (Paperback)",
                hardcover: "Livre relié (Hardcover)",
                kdpFormat: "Format KDP",
                selectFormat: "Sélectionner un format",
                popularSizes: "Tailles les plus courantes",
                otherSizes: "Autres tailles standard",
                hardcoverFormats: "Formats livre relié",
                pageCount: "Nombre de pages",
                bleed: "Fond perdu (images jusqu'au bord)",
                paperType: "Type d'encre et de papier",
                coverFinish: "Finition de la couverture",
                spineText: "Texte du dos (tranche)",
                spineTextHelp: "Titre ou auteur (optionnel)",
                spineTextAuto: "Géré automatiquement par Amazon",
                spineTextThin: "Tranche trop fine - non recommandé",
                calculatedDimensions: "Dimensions calculées",
                totalWidth: "Largeur totale",
                totalHeight: "Hauteur totale",
                spineThickness: "Épaisseur dos",
                thinSpine: "(tranche fine)",
                canvaDimensions: "📐 Dimensions pour Canva",
                canvaInches: "En pouces (recommandé)",
                canvaMM: "En millimètres",
                copyForCanva: "📋 Copier pour Canva",
                copiedToClipboard: "✅ Copié !",
                canvaInstructions: "Dans Canva : Dimension personnalisée → Collez ces valeurs",
                images: "Images",
                frontImage: "Image Face (1ère de couverture)",
                backImage: "Image Verso (4ème de couverture)",
                spineImage: "Image Dos (tranche) - Optionnel",
                spineColor: "Couleur de fond du dos",
                spineTextColor: "Couleur du texte du dos",
                spineTextSize: "Taille du texte du dos",
                spineTextFont: "Police du texte du dos",
                
                // 📚 COVER TEXT TRANSLATIONS
                coverTextSection: "📚 Texte de couverture",
                bookTitle: "Titre du livre",
                bookTitlePlaceholder: "Entrez le titre...",
                bookTitleSize: "Taille du titre",
                bookTitleColor: "Couleur du titre",
                bookTitleFont: "Police du titre",
                bookTitlePosition: "Position verticale (%)",
                authorName: "Nom de l'auteur",
                authorNamePlaceholder: "Entrez le nom de l'auteur...",
                authorNameSize: "Taille",
                authorNameColor: "Couleur",
                authorNamePosition: "Position (%)",
                
                // 📖 BACK COVER TRANSLATIONS
                backCoverSection: "📖 4ème de couverture",
                backCoverText: "Résumé / Description",
                backCoverTextPlaceholder: "Entrez le texte de votre 4ème de couverture...",
                backCoverTextSize: "Taille du texte",
                backCoverTextColor: "Couleur du texte",
                backCoverBgColor: "Couleur de fond (optionnel)",
                
                // 🎨 BACK COVER BACKGROUND
                backCoverBgSection: "🎨 Couleurs et textures de couverture",
                backCoverBgEnable: "Activer un fond personnalisé",
                backCoverBgColorLabel: "Couleur de fond",
                backCoverTextureLabel: "Texture / Image de fond",
                backCoverTextureUpload: "Uploader une texture",
                backCoverTextureRemove: "Supprimer la texture",
                backCoverBgTip: "Ajoutez une couleur unie ou une texture pour votre 4ème de couverture",
                
                // 📊 BARCODE ZONE
                barcodeSection: "📊 Zone code-barre ISBN",
                showBarcodeZone: "Afficher zone code-barre",
                barcodeZoneColor: "Couleur de fond",
                barcodeZoneHelp: "Amazon ajoute automatiquement le code-barre ISBN ici",
                barcodeAutoNote: "Code-barres ajouté automatiquement par Amazon lors de la publication.",
                barcodeChoiceTitle: "Mode code-barres",
                barcodeModeAmazon: "ISBN Amazon (recommandé)",
                barcodeModeCustom: "J’ai mon propre ISBN / code-barres",
                barcodeIsbnOptional: "ISBN (optionnel)",
                barcodeUploadLabel: "Uploader un PNG de code-barres",
                barcodeUploadHint: "Le PNG sera intégré dans la zone au moment de l’export (PDF/PNG/JPG).",
                barcodeRemove: "Retirer l’image",

                
                removeImage: "Supprimer l'image",
                canvaImport: "Import depuis Canva",
                canvaComingSoon: "🚀 Bientôt disponible",
                canvaTitle: "Importez depuis Canva",
                canvaDescription: "Connectez votre compte Canva pour importer vos designs directement dans le générateur",
                canvaConnectButton: "Se connecter à Canva",
                canvaDisconnectButton: "Se déconnecter de Canva",
                canvaAvailabilitySoon: "Cette fonctionnalité sera bientôt disponible",
                premium: "PREMIUM",
                preview4k: "Aperçu 4K Ultra HD",
                generating: "Génération 4K en cours...",
                resetForm: "Nouveau projet",
                qualityUltraHD: "4K Ultra HD",
                zoomIn: "Zoom +",
                zoomOut: "Zoom -",
                exportDesign: "EXPORTER LE DESIGN",
                exportFormat: "Format d'export",
                formatPDF: "PDF (Recommandé par Amazon)",
                formatPNG: "PNG 300 DPI",
                formatJPEG: "JPEG Haute Qualité",
                analysisTitle: "Analyse Intelligente KDP",
                scoreExcellent: "EXCELLENT",
                scoreTresBon: "TRÈS BON",
                scoreAcceptable: "ACCEPTABLE",
                scoreProblematique: "À AMÉLIORER",
                scoreSubtitleExcellent: "Prêt pour Amazon KDP",
                scoreSubtitleTresBon: "Quelques optimisations possibles",
                scoreSubtitleAcceptable: "Sera accepté mais peut être amélioré",
                scoreSubtitleProblematique: "Corrections recommandées",
                noImagesYet: "Ajoutez vos images pour voir l'analyse complète",
                kdpTips: "Conseils KDP",
                tipFormat: "Le format 6×9\" est le plus populaire sur Amazon.",
                tipBleed: "Activez le fond perdu pour éviter les liserés blancs.",
                tipSpine: "Les tranches fines (<2.5mm) rendent le texte difficile à lire.",
                tipResolution: "Même si votre image est en basse résolution (ex: 150 DPI), notre outil l'optimisera à 300 DPI pour l'export.",
                disclaimer: "Clause de non-responsabilité",
                disclaimerShort: "GabaritKDP garantit uniquement la conformité technique des dimensions selon les spécifications Amazon KDP.",
                disclaimerFull: "GabaritKDP n'est responsable que de la conformité technique des dimensions selon les spécifications officielles Amazon KDP. Nous ne sommes pas responsables du contenu créatif, de l'esthétique, de l'orthographe, de la grammaire, de la qualité des images fournies, du respect des droits d'auteur, ou de tout autre aspect créatif de votre couverture. L'utilisateur reste entièrement responsable du contenu de sa publication.",
                disclaimerExport: "En téléchargeant, vous confirmez être responsable du contenu créatif de votre couverture.",
                technicalOnly: "Validation technique uniquement",
                contentResponsibility: "Contenu sous votre responsabilité",
                format8511Warning: "⚠️ FORMAT COMPLEXE DÉTECTÉ",
                format8511Title: "Format 8.5×11\" - Attention Particulière Requise",
                format8511Message: "Ce format est particulièrement délicat pour KDP. Vérifiez IMPÉRATIVEMENT vos dimensions avant publication.",
                format8511Tips: "Conseils pour 8.5×11\" : Vérifiez deux fois les marges, utilisez PNG haute qualité, testez la conversion PDF.",
                canvaBetaTitle: "API Canva en développement",
                canvaBetaMessage: "L'intégration Canva est actuellement en cours de développement. Pour l'instant, vous pouvez tester le générateur en uploadant vos images manuellement.",
                canvaBetaEta: "Disponibilité prévue: Q2 2025",
                betaFeedback: "Vos retours nous aident à améliorer l'outil !",
                legendTrim: "Bord de coupe (Trim)",
                legendSafeZone: "Marge de sécurité (Texte)",
                howToTitle: "Guide Rapide",
                howToStep1: "1. Paramétrez votre livre (type de reliure, format, pages, fond perdu, encre, finition, codes-barres, textes et polices de la tranche, du titre, de l’auteur et de la quatrième de couverture. Options supplémentaires : choix de la zone de travail, couleurs, textures…).",
                howToStep2: "2. Importez vos images depuis votre ordinateur.",
                howToStep2Tip: "💡 Bientôt : import direct depuis Canva ! En manque d'inspiration ? Parcourez nos magnifiques",
                howToStep2Link: "templates prêts à l'emploi",
                howToStep3: "3. Vérifiez que votre texte est bien à l'intérieur des pointillés BLEUS (zone de sécurité).",
                howToStep3Tip: "ℹ️ Les pointillés BLEUS = zone de sécurité pour le texte. Les pointillés ROUGES = ligne de coupe (vos images peuvent aller jusque-là, mais pas le texte !). C'est requis par Amazon KDP.",
                howToStep4: "4. Exportez votre fichier PDF, prêt pour Amazon KDP, et réalisez votre rêve ! 🚀",
                betaBannerActive: "places Beta restantes ! Devenez Founding Tester - Accès illimité jusqu'à Noël 2025",
                betaBannerFull: "Programme Beta COMPLET - Inscription gratuite toujours disponible (3 exports/mois)",
            },
            en: {
                title: "KDP Cover Generator",
                subtitle: "4K Ultra HD Preview - From Canva to KDP in 3 clicks",
                bookSettings: "Book Settings",
                bindingType: "Binding Type",
                paperback: "Paperback",
                hardcover: "Hardcover",
                kdpFormat: "KDP Format",
                selectFormat: "Select a format",
                popularSizes: "Most Popular Sizes",
                otherSizes: "Other Standard Sizes",
                hardcoverFormats: "Hardcover Formats",
                pageCount: "Page Count",
                bleed: "Bleed (images to edge)",
                paperType: "Ink and Paper Type",
                coverFinish: "Cover Finish",
                spineText: "Spine Text",
                spineTextHelp: "Title or author (optional)",
                spineTextAuto: "Automatically managed by Amazon",
                spineTextThin: "Spine too thin - not recommended",
                calculatedDimensions: "Calculated Dimensions",
                totalWidth: "Total Width",
                totalHeight: "Total Height",
                spineThickness: "Spine Thickness",
                thinSpine: "(thin spine)",
                canvaDimensions: "📐 Dimensions for Canva",
                canvaInches: "In inches (recommended)",
                canvaMM: "In millimeters",
                copyForCanva: "📋 Copy for Canva",
                copiedToClipboard: "✅ Copied!",
                canvaInstructions: "In Canva: Custom size → Paste these values",
                images: "Images",
                frontImage: "Front Image (Front Cover)",
                backImage: "Back Image (Back Cover)",
                spineImage: "Spine Image - Optional",
                spineColor: "Spine Background Color",
                spineTextColor: "Spine Text Color",
                spineTextSize: "Spine Text Size",
                spineTextFont: "Spine Text Font",
                
                // 📚 COVER TEXT TRANSLATIONS
                coverTextSection: "📚 Cover Text",
                bookTitle: "Book Title",
                bookTitlePlaceholder: "Enter title...",
                bookTitleSize: "Title Size",
                bookTitleColor: "Title Color",
                bookTitleFont: "Title Font",
                bookTitlePosition: "Vertical Position (%)",
                authorName: "Author Name",
                authorNamePlaceholder: "Enter author name...",
                authorNameSize: "Size",
                authorNameColor: "Color",
                authorNamePosition: "Position (%)",
                
                // 📖 BACK COVER TRANSLATIONS
                backCoverSection: "📖 Back Cover",
                backCoverText: "Summary / Description",
                backCoverTextPlaceholder: "Enter your back cover text...",
                backCoverTextSize: "Text Size",
                backCoverTextColor: "Text Color",
                backCoverBgColor: "Background Color (optional)",
                
                // 🎨 BACK COVER BACKGROUND
                backCoverBgSection: "🎨 Cover colors & textures",
                backCoverBgEnable: "Enable custom background",
                backCoverBgColorLabel: "Background Color",
                backCoverTextureLabel: "Texture / Background Image",
                backCoverTextureUpload: "Upload texture",
                backCoverTextureRemove: "Remove texture",
                backCoverBgTip: "Add a solid color or texture for your back cover",
                
                // 📊 BARCODE ZONE
                barcodeSection: "📊 ISBN Barcode Zone",
                showBarcodeZone: "Show barcode zone",
                barcodeZoneColor: "Background Color",
                barcodeZoneHelp: "Amazon automatically adds the ISBN barcode here",
                barcodeAutoNote: "Barcode automatically added by Amazon during publishing.",
                barcodeChoiceTitle: "Barcode mode",
                barcodeModeAmazon: "Amazon ISBN (recommended)",
                barcodeModeCustom: "I have my own ISBN / barcode",
                barcodeIsbnOptional: "ISBN (optional)",
                barcodeUploadLabel: "Upload a PNG barcode",
                barcodeUploadHint: "The PNG will be drawn in the barcode zone at export (PDF/PNG/JPG).",
                barcodeRemove: "Remove image",

                
                removeImage: "Remove Image",
                canvaImport: "Import from Canva",
                canvaComingSoon: "🚀 Coming Soon",
                canvaTitle: "Import from Canva",
                canvaDescription: "Connect your Canva account to import your designs directly into the generator",
                canvaConnectButton: "Connect to Canva",
                canvaDisconnectButton: "Disconnect from Canva",
                canvaAvailabilitySoon: "This feature will be available soon",
                premium: "PREMIUM",
                preview4k: "4K Ultra HD Preview",
                generating: "4K Generation in progress...",
                resetForm: "New project",
                qualityUltraHD: "4K Ultra HD",
                zoomIn: "Zoom +",
                zoomOut: "Zoom -",
                exportDesign: "EXPORT DESIGN",
                exportFormat: "Export Format",
                formatPDF: "PDF (Recommended by Amazon)",
                formatPNG: "PNG 300 DPI",
                formatJPEG: "JPEG High Quality",
                analysisTitle: "Smart KDP Analysis",
                scoreExcellent: "EXCELLENT",
                scoreTresBon: "VERY GOOD",
                scoreAcceptable: "ACCEPTABLE",
                scoreProblematique: "NEEDS WORK",
                scoreSubtitleExcellent: "Ready for Amazon KDP",
                scoreSubtitleTresBon: "Some optimizations possible",
                scoreSubtitleAcceptable: "Will be accepted but can be improved",
                scoreSubtitleProblematique: "Corrections recommended",
                noImagesYet: "Add your images to see complete analysis",
                kdpTips: "KDP Tips",
                tipFormat: "The 6×9\" format is the most popular on Amazon.",
                tipBleed: "Enable bleed to avoid white borders.",
                tipSpine: "Thin spines (<2.5mm) make text hard to read.",
                tipResolution: "Even if your image has a low resolution (e.g., 150 DPI), our tool will optimize it to 300 DPI for export.",
                disclaimer: "Disclaimer",
                disclaimerShort: "GabaritKDP only guarantees technical compliance of dimensions according to Amazon KDP specifications.",
                disclaimerFull: "GabaritKDP is only responsible for technical compliance of dimensions according to official Amazon KDP specifications. We are not responsible for creative content, aesthetics, spelling, grammar, quality of provided images, copyright compliance, or any other creative aspect of your cover. The user remains entirely responsible for the content of their publication.",
                disclaimerExport: "By downloading, you confirm being responsible for the creative content of your cover.",
                technicalOnly: "Technical validation only",
                contentResponsibility: "Content under your responsibility",
                format8511Warning: "⚠️ COMPLEX FORMAT DETECTED",
                format8511Title: "8.5×11\" Format - Particular Attention Required",
                format8511Message: "This format is particularly delicate for KDP. IMPERATIVELY check your dimensions before publication.",
                format8511Tips: "Tips for 8.5×11\": Double-check margins, use high-quality PNG, test PDF conversion.",
                canvaBetaTitle: "Canva API in development",
                canvaBetaMessage: "Canva integration is currently under development. For now, you can test the generator by uploading your images manually.",
                canvaBetaEta: "Expected availability: Q2 2025",
                betaFeedback: "Your feedback helps us improve the tool!",
                legendTrim: "Trim Line",
                legendSafeZone: "Safe Zone (Text)",
                howToTitle: "Quick Guide",
howToStep1: "1. Set up your book (binding type, format, pages, bleed, ink, finish, barcode settings, spine text and fonts, title, author name and back cover. Additional options: workspace area, colors, textures…).",
                howToStep2: "2. Upload your images from your computer.",
                howToStep2Tip: "💡 Coming soon: direct import from Canva! Need inspiration? Browse our beautiful",
                howToStep2Link: "ready-to-use templates",
                howToStep3: "3. Check that your text is well within the BLUE dotted lines (safe zone).",
                howToStep3Tip: "ℹ️ BLUE dotted lines = text safe zone. RED dotted lines = trim line (your images can go there, but not text!). Required by Amazon KDP.",
                howToStep4: "4. Export your PDF file, ready for Amazon KDP, and make your dream come true! 🚀",
                betaBannerActive: "Beta spots left! Become a Founding Tester - Unlimited access until Christmas 2025",
                betaBannerFull: "Beta Program FULL - Free registration still available (3 exports/month)",
            }
        };
        
                // 🔤 COMPOSANT FONT SELECT - Avec aperçu des polices (lazy-load on demand)
        const FontSelect = ({ value, onChange, fonts, label }) => {
            const handleChange = async (e) => {
                const selectedFont = e.target.value;

                // ✅ Charge la police à la demande (sans bloquer l'UI)
                try {
                    if (window.ensureFontLoaded) {
                        await window.ensureFontLoaded(selectedFont);
                    } else if (window.loadFontOnDemand) {
                        await window.loadFontOnDemand(selectedFont);
                    }
                } catch (_) {}

                onChange(selectedFont);
            };

            // ✅ Précharge la police déjà sélectionnée (utile au premier rendu et pour l'export)
            try {
                if (value && window.loadFontOnDemand) window.loadFontOnDemand(value);
            } catch (_) {}



            return (
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <select
                        value={value}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        style={{ fontFamily: value }}
                    >
                        {fonts.map((font, idx) => (
                            <option
                                key={idx}
                                value={font.name}
                                style={{ fontFamily: font.name }}
                            >
                                {font.name} ({font.category})
                            </option>
                        ))}
                    </select>
                    <div
                        className="mt-1 p-2 bg-gray-100 rounded text-center text-lg"
                        style={{ fontFamily: value }}
                    >
                        Aperçu ABC abc 123
                    </div>
                </div>
            );
        };


const KDPCoverGenerator = ({ onReset }) => {

            // ✅ UX: keep active form fields visible (prevents constant manual scrolling)
            const scrollElementIntoView = (el) => {
                try {
                    if (!el || typeof el.getBoundingClientRect !== 'function') return;

                    const rect = el.getBoundingClientRect();
                    const padding = 90; // header + comfort

                    // If already comfortably visible in viewport, do nothing
                    if (rect.top >= padding && rect.bottom <= (window.innerHeight - 20)) return;

                    // Find nearest scrollable parent
                    let parent = el.parentElement;
                    let scrollParent = null;
                    while (parent && parent !== document.body) {
                        const style = window.getComputedStyle(parent);
                        const overflowY = style.overflowY;
                        if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
                            scrollParent = parent;
                            break;
                        }
                        parent = parent.parentElement;
                    }

                    // If no scroll parent, scroll window
                    if (!scrollParent) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        return;
                    }

                    // Scroll inside the parent container
                    const parentRect = scrollParent.getBoundingClientRect();
                    const currentTop = scrollParent.scrollTop;
                    const targetTop = (rect.top - parentRect.top) + currentTop - 80;

                    scrollParent.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
                } catch (err) {
                    // Fallback: native behavior
                    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(e) {}
                }
            };

            const handleFieldFocus = (e) => {
                const el = e?.currentTarget;
                requestAnimationFrame(() => scrollElementIntoView(el));
            };

            const handleFieldChange = (e, setter) => {
                setter(e.target.value);
                const el = e?.currentTarget;
                requestAnimationFrame(() => scrollElementIntoView(el));
            };

            const [language, setLanguage] = useState(() => {
                return window.currentLang || localStorage.getItem('selectedLanguage') || 'en';
            });
            const [format, setFormat] = useState('6x9');
            const [paperType, setPaperType] = useState('white');
            const [bindingType, setBindingType] = useState('paperback');
            const [coverFinish, setCoverFinish] = useState('matte');
            const [hasBleed, setHasBleed] = useState(true);
            const [pageCount, setPageCount] = useState(100);
            const [kdpStrictConfirmed, setKdpStrictConfirmed] = useState(false); // 🔒 KDP STRICT

            // --- Debounce only for pageCount input to smooth re-renders ---
            const pageCountDebounceRef = useRef(null);
            const setPageCountDebounced = useCallback((val) => {
                if (pageCountDebounceRef.current) clearTimeout(pageCountDebounceRef.current);
                pageCountDebounceRef.current = setTimeout(() => {
                    setPageCount(val);
                }, 250);
            }, []);
            const [isExporting, setIsExporting] = useState(false);
            const [spineText, setSpineText] = useState('');
            
            // 🎨 GÉNÉRATEUR DE TEXTURES PROCÉDURALES
            const generateTexture = (textureName, width, height, baseColor = '#f5f5f5') => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // Fonction de bruit simplifié
                const noise = () => Math.random();
                const lerp = (a, b, t) => a + (b - a) * t;
                
                // Couleur de base
                ctx.fillStyle = baseColor;
                ctx.fillRect(0, 0, width, height);
                
                switch(textureName) {
                    case 'paper':
                        // Texture papier - grain fin
                        ctx.fillStyle = '#f8f6f0';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < width * height * 0.3; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const gray = 200 + Math.random() * 55;
                            ctx.fillStyle = `rgba(${gray}, ${gray-5}, ${gray-10}, ${0.1 + Math.random() * 0.2})`;
                            ctx.fillRect(x, y, 1 + Math.random(), 1 + Math.random());
                        }
                        // Fibres subtiles
                        ctx.strokeStyle = 'rgba(180, 170, 160, 0.1)';
                        for (let i = 0; i < 50; i++) {
                            ctx.beginPath();
                            ctx.moveTo(Math.random() * width, Math.random() * height);
                            ctx.lineTo(Math.random() * width, Math.random() * height);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'wood':
                        // Texture bois - veines horizontales
                        const woodBase = '#d4a574';
                        const woodDark = '#8b5a2b';
                        ctx.fillStyle = woodBase;
                        ctx.fillRect(0, 0, width, height);
                        
                        for (let y = 0; y < height; y += 3) {
                            const offset = Math.sin(y * 0.02) * 20 + Math.sin(y * 0.05) * 10;
                            const thickness = 1 + Math.random() * 2;
                            const alpha = 0.1 + Math.random() * 0.2;
                            ctx.strokeStyle = `rgba(100, 60, 30, ${alpha})`;
                            ctx.lineWidth = thickness;
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            for (let x = 0; x < width; x += 10) {
                                const yOffset = y + Math.sin((x + offset) * 0.01) * 5;
                                ctx.lineTo(x, yOffset);
                            }
                            ctx.stroke();
                        }
                        // Noeuds
                        for (let i = 0; i < 3; i++) {
                            const kx = Math.random() * width;
                            const ky = Math.random() * height;
                            const gradient = ctx.createRadialGradient(kx, ky, 0, kx, ky, 15 + Math.random() * 10);
                            gradient.addColorStop(0, 'rgba(80, 40, 20, 0.4)');
                            gradient.addColorStop(1, 'rgba(80, 40, 20, 0)');
                            ctx.fillStyle = gradient;
                            ctx.beginPath();
                            ctx.ellipse(kx, ky, 20, 10, 0, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'linen':
                        // Texture lin - tissage croisé
                        ctx.fillStyle = '#e8dcc8';
                        ctx.fillRect(0, 0, width, height);
                        ctx.strokeStyle = 'rgba(180, 160, 140, 0.3)';
                        ctx.lineWidth = 1;
                        // Lignes horizontales
                        for (let y = 0; y < height; y += 4) {
                            ctx.beginPath();
                            ctx.moveTo(0, y + Math.random() * 2);
                            ctx.lineTo(width, y + Math.random() * 2);
                            ctx.stroke();
                        }
                        // Lignes verticales
                        for (let x = 0; x < width; x += 4) {
                            ctx.beginPath();
                            ctx.moveTo(x + Math.random() * 2, 0);
                            ctx.lineTo(x + Math.random() * 2, height);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'leather':
                        // Texture cuir - grain irrégulier
                        ctx.fillStyle = '#8b4513';
                        ctx.fillRect(0, 0, width, height);
                        // Grain
                        for (let i = 0; i < width * height * 0.1; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = 1 + Math.random() * 3;
                            ctx.fillStyle = `rgba(60, 30, 10, ${0.1 + Math.random() * 0.2})`;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        // Plis subtils
                        ctx.strokeStyle = 'rgba(40, 20, 5, 0.15)';
                        for (let i = 0; i < 20; i++) {
                            ctx.beginPath();
                            const startX = Math.random() * width;
                            const startY = Math.random() * height;
                            ctx.moveTo(startX, startY);
                            ctx.quadraticCurveTo(
                                startX + (Math.random() - 0.5) * 100,
                                startY + (Math.random() - 0.5) * 100,
                                startX + (Math.random() - 0.5) * 150,
                                startY + (Math.random() - 0.5) * 150
                            );
                            ctx.stroke();
                        }
                        break;
                        
                    case 'marble':
                        // Texture marbre - veines
                        ctx.fillStyle = '#f0ebe5';
                        ctx.fillRect(0, 0, width, height);
                        // Veines principales
                        ctx.strokeStyle = 'rgba(150, 140, 130, 0.4)';
                        ctx.lineWidth = 2;
                        for (let i = 0; i < 8; i++) {
                            ctx.beginPath();
                            let x = Math.random() * width;
                            let y = 0;
                            ctx.moveTo(x, y);
                            while (y < height) {
                                x += (Math.random() - 0.5) * 40;
                                y += 10 + Math.random() * 20;
                                ctx.lineTo(x, y);
                            }
                            ctx.stroke();
                        }
                        // Veines secondaires
                        ctx.strokeStyle = 'rgba(180, 170, 160, 0.2)';
                        ctx.lineWidth = 1;
                        for (let i = 0; i < 15; i++) {
                            ctx.beginPath();
                            let x = Math.random() * width;
                            let y = Math.random() * height;
                            ctx.moveTo(x, y);
                            for (let j = 0; j < 5; j++) {
                                x += (Math.random() - 0.5) * 30;
                                y += (Math.random() - 0.5) * 30;
                                ctx.lineTo(x, y);
                            }
                            ctx.stroke();
                        }
                        break;
                        
                    case 'concrete':
                        // Texture béton
                        ctx.fillStyle = '#a0a0a0';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < width * height * 0.2; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const gray = 130 + Math.random() * 60;
                            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${0.2 + Math.random() * 0.3})`;
                            const size = 1 + Math.random() * 4;
                            ctx.fillRect(x, y, size, size);
                        }
                        // Imperfections
                        for (let i = 0; i < 30; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            ctx.fillStyle = `rgba(80, 80, 80, ${0.1 + Math.random() * 0.1})`;
                            ctx.beginPath();
                            ctx.arc(x, y, 2 + Math.random() * 5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'canvas':
                        // Texture toile de peintre
                        ctx.fillStyle = '#f5f0e6';
                        ctx.fillRect(0, 0, width, height);
                        ctx.strokeStyle = 'rgba(200, 190, 170, 0.5)';
                        ctx.lineWidth = 1;
                        // Trame horizontale
                        for (let y = 0; y < height; y += 3) {
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(width, y);
                            ctx.stroke();
                        }
                        // Trame verticale
                        for (let x = 0; x < width; x += 3) {
                            ctx.beginPath();
                            ctx.moveTo(x, 0);
                            ctx.lineTo(x, height);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'cork':
                        // Texture liège
                        ctx.fillStyle = '#c9a66b';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < width * height * 0.15; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = 2 + Math.random() * 6;
                            ctx.fillStyle = `rgba(${150 + Math.random() * 50}, ${100 + Math.random() * 50}, ${50 + Math.random() * 30}, 0.3)`;
                            ctx.beginPath();
                            ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'denim':
                        // Texture denim/jean
                        ctx.fillStyle = '#4a6a8a';
                        ctx.fillRect(0, 0, width, height);
                        ctx.strokeStyle = 'rgba(30, 50, 80, 0.3)';
                        // Diagonales caractéristiques du denim
                        for (let i = -height; i < width + height; i += 2) {
                            ctx.beginPath();
                            ctx.moveTo(i, 0);
                            ctx.lineTo(i + height, height);
                            ctx.stroke();
                        }
                        // Usure légère
                        for (let i = 0; i < 100; i++) {
                            ctx.fillStyle = `rgba(100, 130, 160, ${Math.random() * 0.2})`;
                            ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
                        }
                        break;
                        
                    case 'velvet':
                        // Texture velours
                        ctx.fillStyle = '#722f37';
                        ctx.fillRect(0, 0, width, height);
                        // Effet de brillance
                        const velvetGradient = ctx.createLinearGradient(0, 0, width, height);
                        velvetGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
                        velvetGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
                        velvetGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
                        ctx.fillStyle = velvetGradient;
                        ctx.fillRect(0, 0, width, height);
                        // Fibres
                        for (let i = 0; i < width * height * 0.05; i++) {
                            ctx.strokeStyle = `rgba(100, 30, 40, ${0.1 + Math.random() * 0.1})`;
                            ctx.beginPath();
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + (Math.random() - 0.5) * 4, y + 2);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'silk':
                        // Texture soie
                        ctx.fillStyle = '#d4af37';
                        ctx.fillRect(0, 0, width, height);
                        // Reflets ondulés
                        for (let y = 0; y < height; y += 5) {
                            const wave = Math.sin(y * 0.05) * 0.1;
                            ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + wave})`;
                            ctx.fillRect(0, y, width, 3);
                        }
                        break;
                        
                    case 'grunge':
                        // Texture grunge/usée
                        ctx.fillStyle = '#3a3a3a';
                        ctx.fillRect(0, 0, width, height);
                        // Taches et usure
                        for (let i = 0; i < 200; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = 5 + Math.random() * 30;
                            ctx.fillStyle = `rgba(${Math.random() * 60}, ${Math.random() * 60}, ${Math.random() * 60}, ${Math.random() * 0.3})`;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        // Rayures
                        ctx.strokeStyle = 'rgba(80, 80, 80, 0.3)';
                        for (let i = 0; i < 50; i++) {
                            ctx.beginPath();
                            ctx.moveTo(Math.random() * width, Math.random() * height);
                            ctx.lineTo(Math.random() * width, Math.random() * height);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'watercolor':
                        // Texture aquarelle
                        ctx.fillStyle = '#f8f4e8';
                        ctx.fillRect(0, 0, width, height);
                        // Taches d'aquarelle
                        for (let i = 0; i < 15; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const radius = 30 + Math.random() * 80;
                            const hue = Math.random() * 60 + 180; // Bleus-verts
                            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                            gradient.addColorStop(0, `hsla(${hue}, 40%, 70%, 0.2)`);
                            gradient.addColorStop(0.5, `hsla(${hue}, 40%, 70%, 0.1)`);
                            gradient.addColorStop(1, `hsla(${hue}, 40%, 70%, 0)`);
                            ctx.fillStyle = gradient;
                            ctx.beginPath();
                            ctx.arc(x, y, radius, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'stars':
                        // Texture ciel étoilé
                        const starsGradient = ctx.createLinearGradient(0, 0, 0, height);
                        starsGradient.addColorStop(0, '#0a0a20');
                        starsGradient.addColorStop(1, '#1a1a40');
                        ctx.fillStyle = starsGradient;
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 100; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 2;
                            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                    
                    // === NOUVELLES TEXTURES ===
                    
                    case 'paper_old':
                        ctx.fillStyle = '#e8dcc0';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < width * height * 0.4; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            ctx.fillStyle = `rgba(${150 + Math.random() * 50}, ${130 + Math.random() * 40}, ${90 + Math.random() * 30}, ${0.1 + Math.random() * 0.2})`;
                            ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
                        }
                        // Taches d'usure
                        for (let i = 0; i < 10; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            ctx.fillStyle = `rgba(120, 100, 70, ${Math.random() * 0.15})`;
                            ctx.beginPath();
                            ctx.arc(x, y, 10 + Math.random() * 30, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'paper_craft':
                        ctx.fillStyle = '#c9a66b';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < width * height * 0.3; i++) {
                            ctx.fillStyle = `rgba(${160 + Math.random() * 40}, ${130 + Math.random() * 30}, ${80 + Math.random() * 20}, 0.2)`;
                            ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
                        }
                        break;
                        
                    case 'parchment':
                        ctx.fillStyle = '#f0e6d3';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 30; i++) {
                            ctx.strokeStyle = `rgba(180, 160, 130, ${0.1 + Math.random() * 0.1})`;
                            ctx.beginPath();
                            ctx.moveTo(Math.random() * width, Math.random() * height);
                            ctx.lineTo(Math.random() * width, Math.random() * height);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'cardboard':
                        ctx.fillStyle = '#b8956e';
                        ctx.fillRect(0, 0, width, height);
                        ctx.strokeStyle = 'rgba(100, 70, 40, 0.2)';
                        for (let y = 0; y < height; y += 5) {
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(width, y);
                            ctx.stroke();
                        }
                        break;
                    
                    case 'wool':
                        ctx.fillStyle = '#e8ddd0';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < width * height * 0.02; i++) {
                            ctx.strokeStyle = `rgba(200, 180, 160, 0.5)`;
                            ctx.beginPath();
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            ctx.arc(x, y, 2 + Math.random() * 4, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'burlap':
                        ctx.fillStyle = '#a08060';
                        ctx.fillRect(0, 0, width, height);
                        ctx.strokeStyle = 'rgba(70, 50, 30, 0.4)';
                        for (let y = 0; y < height; y += 3) {
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(width, y);
                            ctx.stroke();
                        }
                        for (let x = 0; x < width; x += 3) {
                            ctx.beginPath();
                            ctx.moveTo(x, 0);
                            ctx.lineTo(x, height);
                            ctx.stroke();
                        }
                        break;
                    
                    case 'wood_dark':
                        ctx.fillStyle = '#4a3728';
                        ctx.fillRect(0, 0, width, height);
                        for (let y = 0; y < height; y += 4) {
                            ctx.strokeStyle = `rgba(30, 20, 10, ${0.2 + Math.random() * 0.2})`;
                            ctx.lineWidth = 1 + Math.random() * 2;
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            for (let x = 0; x < width; x += 15) {
                                ctx.lineTo(x, y + Math.sin(x * 0.02) * 3);
                            }
                            ctx.stroke();
                        }
                        break;
                        
                    case 'wood_plank':
                        ctx.fillStyle = '#c9a66b';
                        ctx.fillRect(0, 0, width, height);
                        const plankWidth = width / 4;
                        for (let i = 0; i < 4; i++) {
                            ctx.strokeStyle = 'rgba(80, 50, 30, 0.5)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(i * plankWidth, 0);
                            ctx.lineTo(i * plankWidth, height);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'bamboo':
                        ctx.fillStyle = '#a8c090';
                        ctx.fillRect(0, 0, width, height);
                        const bambooWidth = width / 6;
                        for (let i = 0; i < 6; i++) {
                            ctx.strokeStyle = 'rgba(60, 80, 40, 0.4)';
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(i * bambooWidth, 0);
                            ctx.lineTo(i * bambooWidth, height);
                            ctx.stroke();
                            // Noeuds
                            for (let y = 30; y < height; y += 50 + Math.random() * 30) {
                                ctx.strokeStyle = 'rgba(60, 80, 40, 0.6)';
                                ctx.beginPath();
                                ctx.moveTo(i * bambooWidth, y);
                                ctx.lineTo((i + 1) * bambooWidth, y);
                                ctx.stroke();
                            }
                        }
                        break;
                    
                    case 'marble_black':
                        ctx.fillStyle = '#2a2a2a';
                        ctx.fillRect(0, 0, width, height);
                        ctx.strokeStyle = 'rgba(80, 80, 80, 0.4)';
                        for (let i = 0; i < 10; i++) {
                            ctx.beginPath();
                            let x = Math.random() * width;
                            let y = 0;
                            ctx.moveTo(x, y);
                            while (y < height) {
                                x += (Math.random() - 0.5) * 30;
                                y += 15 + Math.random() * 15;
                                ctx.lineTo(x, y);
                            }
                            ctx.stroke();
                        }
                        break;
                        
                    case 'granite':
                        ctx.fillStyle = '#808080';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < width * height * 0.3; i++) {
                            const gray = Math.random() > 0.5 ? 60 + Math.random() * 40 : 100 + Math.random() * 50;
                            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.5)`;
                            ctx.fillRect(Math.random() * width, Math.random() * height, 2 + Math.random() * 3, 2 + Math.random() * 3);
                        }
                        break;
                        
                    case 'slate':
                        ctx.fillStyle = '#4a5568';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 30; i++) {
                            ctx.strokeStyle = `rgba(60, 70, 85, ${0.3 + Math.random() * 0.3})`;
                            ctx.beginPath();
                            ctx.moveTo(0, Math.random() * height);
                            ctx.lineTo(width, Math.random() * height);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'brick':
                        ctx.fillStyle = '#8b4513';
                        ctx.fillRect(0, 0, width, height);
                        const brickH = 15;
                        const brickW = 30;
                        for (let row = 0; row < height / brickH; row++) {
                            const offset = row % 2 === 0 ? 0 : brickW / 2;
                            for (let col = -1; col < width / brickW + 1; col++) {
                                ctx.strokeStyle = 'rgba(60, 30, 10, 0.6)';
                                ctx.strokeRect(col * brickW + offset, row * brickH, brickW - 2, brickH - 2);
                            }
                        }
                        break;
                    
                    case 'metal_brushed':
                        ctx.fillStyle = '#a0a0a0';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < height; i += 1) {
                            ctx.strokeStyle = `rgba(${120 + Math.random() * 40}, ${120 + Math.random() * 40}, ${120 + Math.random() * 40}, 0.3)`;
                            ctx.beginPath();
                            ctx.moveTo(0, i);
                            ctx.lineTo(width, i);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'gold':
                        const goldGrad = ctx.createLinearGradient(0, 0, width, height);
                        goldGrad.addColorStop(0, '#bf953f');
                        goldGrad.addColorStop(0.3, '#fcf6ba');
                        goldGrad.addColorStop(0.5, '#b38728');
                        goldGrad.addColorStop(0.7, '#fcf6ba');
                        goldGrad.addColorStop(1, '#bf953f');
                        ctx.fillStyle = goldGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                        
                    case 'silver':
                        const silverGrad = ctx.createLinearGradient(0, 0, width, height);
                        silverGrad.addColorStop(0, '#c0c0c0');
                        silverGrad.addColorStop(0.3, '#ffffff');
                        silverGrad.addColorStop(0.5, '#a0a0a0');
                        silverGrad.addColorStop(0.7, '#ffffff');
                        silverGrad.addColorStop(1, '#c0c0c0');
                        ctx.fillStyle = silverGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                        
                    case 'copper':
                        const copperGrad = ctx.createLinearGradient(0, 0, width, height);
                        copperGrad.addColorStop(0, '#b87333');
                        copperGrad.addColorStop(0.5, '#da8a67');
                        copperGrad.addColorStop(1, '#b87333');
                        ctx.fillStyle = copperGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                        
                    case 'rust':
                        ctx.fillStyle = '#8b4513';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 100; i++) {
                            ctx.fillStyle = `rgba(${100 + Math.random() * 80}, ${40 + Math.random() * 40}, ${20 + Math.random() * 20}, ${0.2 + Math.random() * 0.3})`;
                            ctx.beginPath();
                            ctx.arc(Math.random() * width, Math.random() * height, 5 + Math.random() * 20, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                    
                    case 'leather_black':
                        ctx.fillStyle = '#1a1a1a';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < width * height * 0.08; i++) {
                            ctx.fillStyle = `rgba(40, 40, 40, ${0.3 + Math.random() * 0.3})`;
                            ctx.beginPath();
                            ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 3, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'leather_red':
                        ctx.fillStyle = '#8b0000';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < width * height * 0.08; i++) {
                            ctx.fillStyle = `rgba(60, 0, 0, ${0.2 + Math.random() * 0.2})`;
                            ctx.beginPath();
                            ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 3, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                    
                    case 'gradient_sunset':
                        const sunsetGrad = ctx.createLinearGradient(0, 0, 0, height);
                        sunsetGrad.addColorStop(0, '#ff7e5f');
                        sunsetGrad.addColorStop(0.5, '#feb47b');
                        sunsetGrad.addColorStop(1, '#ff6b6b');
                        ctx.fillStyle = sunsetGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                        
                    case 'gradient_ocean':
                        const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
                        oceanGrad.addColorStop(0, '#667eea');
                        oceanGrad.addColorStop(1, '#764ba2');
                        ctx.fillStyle = oceanGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                        
                    case 'gradient_forest':
                        const forestGrad = ctx.createLinearGradient(0, 0, 0, height);
                        forestGrad.addColorStop(0, '#134e5e');
                        forestGrad.addColorStop(1, '#71b280');
                        ctx.fillStyle = forestGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                        
                    case 'gradient_night':
                        const nightGrad = ctx.createLinearGradient(0, 0, 0, height);
                        nightGrad.addColorStop(0, '#0c1445');
                        nightGrad.addColorStop(0.5, '#1a237e');
                        nightGrad.addColorStop(1, '#0c1445');
                        ctx.fillStyle = nightGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                        
                    case 'gradient_fire':
                        const fireGrad = ctx.createLinearGradient(0, 0, 0, height);
                        fireGrad.addColorStop(0, '#f12711');
                        fireGrad.addColorStop(0.5, '#f5af19');
                        fireGrad.addColorStop(1, '#f12711');
                        ctx.fillStyle = fireGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                        
                    case 'gradient_purple':
                        const purpleGrad = ctx.createLinearGradient(0, 0, 0, height);
                        purpleGrad.addColorStop(0, '#7b4397');
                        purpleGrad.addColorStop(1, '#dc2430');
                        ctx.fillStyle = purpleGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                        
                    case 'gradient_teal':
                        const tealGrad = ctx.createLinearGradient(0, 0, 0, height);
                        tealGrad.addColorStop(0, '#11998e');
                        tealGrad.addColorStop(1, '#38ef7d');
                        ctx.fillStyle = tealGrad;
                        ctx.fillRect(0, 0, width, height);
                        break;
                    
                    case 'splatter':
                        ctx.fillStyle = '#f5f5f5';
                        ctx.fillRect(0, 0, width, height);
                        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
                        for (let i = 0; i < 50; i++) {
                            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                            ctx.globalAlpha = 0.3 + Math.random() * 0.4;
                            ctx.beginPath();
                            ctx.arc(Math.random() * width, Math.random() * height, 5 + Math.random() * 30, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.globalAlpha = 1;
                        break;
                        
                    case 'bokeh':
                        ctx.fillStyle = '#1a1a2e';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 30; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const r = 10 + Math.random() * 40;
                            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                            gradient.addColorStop(0, `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`);
                            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                            ctx.fillStyle = gradient;
                            ctx.beginPath();
                            ctx.arc(x, y, r, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'geometric':
                        ctx.fillStyle = '#2c3e50';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 20; i++) {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = 20 + Math.random() * 50;
                            ctx.moveTo(x, y - size);
                            ctx.lineTo(x + size, y + size);
                            ctx.lineTo(x - size, y + size);
                            ctx.closePath();
                            ctx.stroke();
                        }
                        break;
                        
                    case 'waves':
                        const wavesGrad = ctx.createLinearGradient(0, 0, 0, height);
                        wavesGrad.addColorStop(0, '#0077be');
                        wavesGrad.addColorStop(1, '#00a8cc');
                        ctx.fillStyle = wavesGrad;
                        ctx.fillRect(0, 0, width, height);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                        for (let y = 20; y < height; y += 30) {
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            for (let x = 0; x < width; x += 5) {
                                ctx.lineTo(x, y + Math.sin(x * 0.05) * 10);
                            }
                            ctx.stroke();
                        }
                        break;
                    
                    case 'clouds':
                        ctx.fillStyle = '#87ceeb';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 15; i++) {
                            const cx = Math.random() * width;
                            const cy = Math.random() * height * 0.6;
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            for (let j = 0; j < 5; j++) {
                                ctx.beginPath();
                                ctx.arc(cx + j * 15 - 30, cy + Math.random() * 10, 15 + Math.random() * 15, 0, Math.PI * 2);
                                ctx.fill();
                            }
                        }
                        break;
                        
                    case 'leaves':
                        ctx.fillStyle = '#228b22';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 50; i++) {
                            ctx.fillStyle = `rgba(${30 + Math.random() * 50}, ${100 + Math.random() * 80}, ${30 + Math.random() * 50}, 0.5)`;
                            ctx.beginPath();
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            ctx.ellipse(x, y, 5 + Math.random() * 10, 10 + Math.random() * 20, Math.random() * Math.PI, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'snow':
                        ctx.fillStyle = '#e8f4f8';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 200; i++) {
                            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
                            ctx.beginPath();
                            ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 3, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'rain':
                        ctx.fillStyle = '#4a5568';
                        ctx.fillRect(0, 0, width, height);
                        ctx.strokeStyle = 'rgba(200, 220, 255, 0.4)';
                        for (let i = 0; i < 100; i++) {
                            ctx.beginPath();
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            ctx.moveTo(x, y);
                            ctx.lineTo(x - 2, y + 10 + Math.random() * 10);
                            ctx.stroke();
                        }
                        break;
                    
                    case 'distressed':
                        ctx.fillStyle = '#d4c4a8';
                        ctx.fillRect(0, 0, width, height);
                        for (let i = 0; i < 100; i++) {
                            ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${90 + Math.random() * 40}, ${70 + Math.random() * 30}, ${Math.random() * 0.3})`;
                            ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 30, Math.random() * 30);
                        }
                        break;
                        
                    case 'noise':
                        ctx.fillStyle = '#808080';
                        ctx.fillRect(0, 0, width, height);
                        const imageData = ctx.getImageData(0, 0, width, height);
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            const noise = Math.random() * 60 - 30;
                            imageData.data[i] += noise;
                            imageData.data[i + 1] += noise;
                            imageData.data[i + 2] += noise;
                        }
                        ctx.putImageData(imageData, 0, 0);
                        break;
                        
                    case 'halftone':
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, width, height);
                        for (let y = 0; y < height; y += 6) {
                            for (let x = 0; x < width; x += 6) {
                                const size = 1 + Math.random() * 2;
                                ctx.fillStyle = '#000000';
                                ctx.beginPath();
                                ctx.arc(x, y, size, 0, Math.PI * 2);
                                ctx.fill();
                            }
                        }
                        break;
                        
                    default:
                        // Couleur unie par défaut
                        ctx.fillStyle = baseColor;
                        ctx.fillRect(0, 0, width, height);
                }
                
                return canvas;
            };
            
            // Liste des textures avec catégories
            const TEXTURE_LIST = [
                // 📄 PAPER - Papier
                { name: 'paper', title: 'Papier', category: 'paper' },
                { name: 'paper_old', title: 'Vieux papier', category: 'paper' },
                { name: 'paper_craft', title: 'Papier kraft', category: 'paper' },
                { name: 'parchment', title: 'Parchemin', category: 'paper' },
                { name: 'cardboard', title: 'Carton', category: 'paper' },
                
                // 🧵 FABRIC - Tissu
                { name: 'linen', title: 'Lin', category: 'fabric' },
                { name: 'canvas', title: 'Toile', category: 'fabric' },
                { name: 'denim', title: 'Jean', category: 'fabric' },
                { name: 'velvet', title: 'Velours', category: 'fabric' },
                { name: 'silk', title: 'Soie', category: 'fabric' },
                { name: 'wool', title: 'Laine', category: 'fabric' },
                { name: 'burlap', title: 'Toile de jute', category: 'fabric' },
                
                // 🪵 WOOD - Bois
                { name: 'wood', title: 'Bois clair', category: 'wood' },
                { name: 'wood_dark', title: 'Bois foncé', category: 'wood' },
                { name: 'wood_plank', title: 'Planches', category: 'wood' },
                { name: 'bamboo', title: 'Bambou', category: 'wood' },
                { name: 'cork', title: 'Liège', category: 'wood' },
                
                // 🪨 STONE - Pierre
                { name: 'marble', title: 'Marbre blanc', category: 'stone' },
                { name: 'marble_black', title: 'Marbre noir', category: 'stone' },
                { name: 'granite', title: 'Granit', category: 'stone' },
                { name: 'concrete', title: 'Béton', category: 'stone' },
                { name: 'slate', title: 'Ardoise', category: 'stone' },
                { name: 'brick', title: 'Brique', category: 'stone' },
                
                // ⚙️ METAL - Métal
                { name: 'metal_brushed', title: 'Métal brossé', category: 'metal' },
                { name: 'gold', title: 'Or', category: 'metal' },
                { name: 'silver', title: 'Argent', category: 'metal' },
                { name: 'copper', title: 'Cuivre', category: 'metal' },
                { name: 'rust', title: 'Rouille', category: 'metal' },
                
                // 👜 LEATHER - Cuir
                { name: 'leather', title: 'Cuir marron', category: 'leather' },
                { name: 'leather_black', title: 'Cuir noir', category: 'leather' },
                { name: 'leather_red', title: 'Cuir rouge', category: 'leather' },
                
                // 🌈 GRADIENT - Dégradés
                { name: 'gradient_sunset', title: 'Coucher de soleil', category: 'gradient' },
                { name: 'gradient_ocean', title: 'Océan', category: 'gradient' },
                { name: 'gradient_forest', title: 'Forêt', category: 'gradient' },
                { name: 'gradient_night', title: 'Nuit', category: 'gradient' },
                { name: 'gradient_fire', title: 'Feu', category: 'gradient' },
                { name: 'gradient_purple', title: 'Violet', category: 'gradient' },
                { name: 'gradient_teal', title: 'Turquoise', category: 'gradient' },
                
                // 🎨 ABSTRACT - Abstrait
                { name: 'watercolor', title: 'Aquarelle', category: 'abstract' },
                { name: 'splatter', title: 'Éclaboussures', category: 'abstract' },
                { name: 'bokeh', title: 'Bokeh', category: 'abstract' },
                { name: 'geometric', title: 'Géométrique', category: 'abstract' },
                { name: 'waves', title: 'Vagues', category: 'abstract' },
                
                // 🌿 NATURE - Nature
                { name: 'stars', title: 'Étoiles', category: 'nature' },
                { name: 'clouds', title: 'Nuages', category: 'nature' },
                { name: 'leaves', title: 'Feuilles', category: 'nature' },
                { name: 'snow', title: 'Neige', category: 'nature' },
                { name: 'rain', title: 'Pluie', category: 'nature' },
                
                // 📜 VINTAGE - Vintage
                { name: 'grunge', title: 'Grunge', category: 'vintage' },
                { name: 'distressed', title: 'Usé', category: 'vintage' },
                { name: 'noise', title: 'Bruit', category: 'vintage' },
                { name: 'halftone', title: 'Demi-teinte', category: 'vintage' },
            ];
            
            // Catégories de textures
            const TEXTURE_CATEGORIES = [
                { id: 'all', label: 'Tout', labelEn: 'All' },
                { id: 'paper', label: 'Papier', labelEn: 'Paper' },
                { id: 'fabric', label: 'Tissu', labelEn: 'Fabric' },
                { id: 'wood', label: 'Bois', labelEn: 'Wood' },
                { id: 'stone', label: 'Pierre', labelEn: 'Stone' },
                { id: 'metal', label: 'Métal', labelEn: 'Metal' },
                { id: 'leather', label: 'Cuir', labelEn: 'Leather' },
                { id: 'gradient', label: 'Dégradés', labelEn: 'Gradients' },
                { id: 'abstract', label: 'Abstrait', labelEn: 'Abstract' },
                { id: 'nature', label: 'Nature', labelEn: 'Nature' },
                { id: 'vintage', label: 'Vintage', labelEn: 'Vintage' },
            ];
            
            // 🔤 LISTE DES POLICES DISPONIBLES (avec catégories)
            const FONT_LIST = [
                // Serif - Classiques
                { name: 'Georgia', category: 'Serif Classique' },
                { name: 'Times New Roman', category: 'Serif Classique' },
                { name: 'Playfair Display', category: 'Serif Élégant' },
                { name: 'Merriweather', category: 'Serif Élégant' },
                { name: 'Cinzel', category: 'Serif Élégant' },
                { name: 'Cormorant Garamond', category: 'Serif Élégant' },
                { name: 'Libre Baskerville', category: 'Serif Classique' },
                { name: 'Lora', category: 'Serif Élégant' },
                { name: 'Spectral', category: 'Serif Moderne' },
                { name: 'Crimson Text', category: 'Serif Classique' },
                { name: 'EB Garamond', category: 'Serif Classique' },
                { name: 'Bitter', category: 'Serif Moderne' },
                { name: 'Roboto Slab', category: 'Serif Moderne' },
                // Sans-Serif - Modernes
                { name: 'Arial', category: 'Sans-Serif' },
                { name: 'Helvetica', category: 'Sans-Serif' },
                { name: 'Verdana', category: 'Sans-Serif' },
                { name: 'Oswald', category: 'Sans-Serif Impact' },
                { name: 'Montserrat', category: 'Sans-Serif Moderne' },
                { name: 'Raleway', category: 'Sans-Serif Élégant' },
                { name: 'Poppins', category: 'Sans-Serif Moderne' },
                { name: 'Open Sans', category: 'Sans-Serif' },
                { name: 'Lato', category: 'Sans-Serif' },
                // Script - Manuscrites
                { name: 'Dancing Script', category: 'Script Romance' },
                { name: 'Pacifico', category: 'Script Fun' },
                { name: 'Great Vibes', category: 'Script Élégant' },
                { name: 'Satisfy', category: 'Script Casual' },
                { name: 'Sacramento', category: 'Script Élégant' },
                { name: 'Allura', category: 'Script Élégant' },
                { name: 'Alex Brush', category: 'Script Élégant' },
                { name: 'Tangerine', category: 'Script Élégant' },
                { name: 'Pinyon Script', category: 'Script Formel' },
                // Display - Titrage
                { name: 'Impact', category: 'Display Bold' },
                { name: 'Berkshire Swash', category: 'Display Vintage' },
                { name: 'Abril Fatface', category: 'Display Élégant' },
                { name: 'Alfa Slab One', category: 'Display Bold' },
                { name: 'Bangers', category: 'Display Comics' },
                { name: 'Permanent Marker', category: 'Display Casual' },
                { name: 'Righteous', category: 'Display Moderne' },
                // Horror / Fantasy
                { name: 'Creepster', category: 'Horror' },
                { name: 'Nosifer', category: 'Horror' },
                { name: 'Metal Mania', category: 'Horror Metal' },
                { name: 'Butcherman', category: 'Horror' },
                // Sci-Fi / Futuriste
                { name: 'Orbitron', category: 'Sci-Fi' },
                { name: 'Rubik Glitch', category: 'Sci-Fi Glitch' },
                { name: 'Press Start 2P', category: 'Pixel Retro' },
                { name: 'VT323', category: 'Retro Terminal' },
            ];
            
            // 📚 COVER TEXT - Titre et Auteur (Face/Front) avec positions X/Y
            const [bookTitle, setBookTitle] = useState('');
            const [bookTitleSize, setBookTitleSize] = useState(48);
            const [bookTitleColor, setBookTitleColor] = useState('#ffffff');
            const [bookTitleFont, setBookTitleFont] = useState('Playfair Display');
            const [bookTitleX, setBookTitleX] = useState(50); // % depuis la gauche de la zone FRONT
            const [bookTitleY, setBookTitleY] = useState(30); // % depuis le haut
            
            const [authorName, setAuthorName] = useState('');
            const [authorNameSize, setAuthorNameSize] = useState(24);
            const [authorNameColor, setAuthorNameColor] = useState('#ffffff');
            const [authorNameFont, setAuthorNameFont] = useState('Montserrat');
            const [authorNameX, setAuthorNameX] = useState(50); // % depuis la gauche de la zone FRONT
            const [authorNameY, setAuthorNameY] = useState(85); // % depuis le haut
            
            // 📖 BACK COVER - 4ème de couverture (Dos/Back) avec positions X/Y
            const [backCoverText, setBackCoverText] = useState('');
            const [backCoverTextSize, setBackCoverTextSize] = useState(14);
            const [backCoverTextColor, setBackCoverTextColor] = useState('#333333');
            const [backCoverTextFont, setBackCoverTextFont] = useState('Lora');
            const [backCoverTextX, setBackCoverTextX] = useState(50); // % depuis la gauche de la zone BACK
            const [backCoverTextY, setBackCoverTextY] = useState(15); // % depuis le haut
            

// ⚡ Pré-charge les polices actives (utile pour l’aperçu + export canvas/pdf)
useEffect(() => {
    if (typeof window.ensureFontLoaded !== 'function') return;
    const fontsToLoad = [bookTitleFont, authorNameFont, backCoverTextFont, spineTextFont].filter(Boolean);
    fontsToLoad.forEach((f) => window.ensureFontLoaded(f));
}, [bookTitleFont, authorNameFont, backCoverTextFont, spineTextFont]);

            // 🖱️ DRAG & DROP STATE
            const [draggingElement, setDraggingElement] = useState(null); // 'title', 'author', 'backText'
            const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
            
            // 🎨 CUSTOM BACKGROUND - Fond personnalisé
            const [backCoverBgColor, setBackCoverBgColor] = useState('#f5f5f5');
            const [backgroundApplyTo, setBackgroundApplyTo] = useState('none'); // 'none', 'back', 'front', 'full'
            const [backCoverTexture, setBackCoverTexture] = useState(null); // Image de texture
            const [textureCategory, setTextureCategory] = useState('all'); // Filtre catégorie
            const [textureColorFilter, setTextureColorFilter] = useState(null); // Filtre couleur sur texture
            
            // 📊 ISBN BARCODE ZONE
            const [showBarcodeZone, setShowBarcodeZone] = useState(true);
            const [barcodeZoneColor, setBarcodeZoneColor] = useState('#ffffff');
            // 📦 CUSTOM ISBN / BARCODE
            const [useCustomBarcode, setUseCustomBarcode] = useState(false);
            const [customISBN, setCustomISBN] = useState('');
            const [customBarcodePng, setCustomBarcodePng] = useState(null); // { file, url }
            const barcodeImgRef = useRef(null);
const [frontImage, setFrontImage] = useState(null);
            const [backImage, setBackImage] = useState(null);
            const [spineImage, setSpineImage] = useState(null);
            const [spineColor, setSpineColor] = useState('#ffffff');
            const [spineTextColor, setSpineTextColor] = useState('#000000');
            const [spineTextSize, setSpineTextSize] = useState(12);
            const [spineTextFont, setSpineTextFont] = useState('Arial');
            // L'état 'dimensions' est supprimé
            const [warnings, setWarnings] = useState([]);
            const [overallScore, setOverallScore] = useState(0);
            const [zoomLevel, setZoomLevel] = useState(1.5);
            const [canvasQuality, setCanvasQuality] = useState('Standard');;
            const [exportFormat, setExportFormat] = useState('pdf');
            const [exportLimitInfo, setExportLimitInfo] = useState({ canExport: false, remaining: 0, level: 'anonymous' });
            const [viewMode, setViewMode] = useState('2d'); // '2d' ou '3d'
            const [mockup3dStyle, setMockup3dStyle] = useState('perspective'); // 'perspective', 'flat', 'standing'
            
            // 🎮 États pour le contrôle 3D interactif
            const [rotationY, setRotationY] = useState(-35); // Angle initial
            const [isAutoRotating, setIsAutoRotating] = useState(false);
            const animationRef = useRef(null);
            
            // 🖼️ États pour le drag & drop d'images (repositionnement)
            const [frontImageOffset, setFrontImageOffset] = useState({ x: 0, y: 0 });
            const [backImageOffset, setBackImageOffset] = useState({ x: 0, y: 0 });
            const [spineImageOffset, setSpineImageOffset] = useState({ x: 0, y: 0 });
            const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
            
            // 🔍 États pour le zoom des images
            const [frontImageZoom, setFrontImageZoom] = useState(1.0);
            const [backImageZoom, setBackImageZoom] = useState(1.0);
            const [spineImageZoom, setSpineImageZoom] = useState(1.0);
            
            // 🎯 Image actuellement sélectionnée (pour afficher les contrôles)
            const [selectedImage, setSelectedImage] = useState(null); // 'front', 'back', 'spine' ou null
            
            // 🛒 MARKETPLACE INTEGRATION - États pour les templates chargés via URL
            const [marketplaceTemplate, setMarketplaceTemplate] = useState(null);
            const [isMarketplacePreview, setIsMarketplacePreview] = useState(false);
            const [showStripeModal, setShowStripeModal] = useState(false); // Désactivé pour beta

            // 📚 Design Library (local) — historique + sauvegardes
            const [designsModalOpen, setDesignsModalOpen] = useState(false);
            const [designsList, setDesignsList] = useState([]);
            const [designTitle, setDesignTitle] = useState('');
            const [activeDesignId, setActiveDesignId] = useState(() => localStorage.getItem('gkdp_active_design_id') || null);

            
            const canvasRef = useRef(null);

            // 🎯 DEBUG - Vérifier que React monte bien le composant
            console.log('🎯 [DEBUG] KDPCoverGenerator component mounted!');
            console.log('🎯 [DEBUG] Current URL:', window.location.href);
            console.log('🎯 [DEBUG] URLSearchParams template:', new URLSearchParams(window.location.search).get('template'));
            console.log('🎯 [DEBUG] React version:', React.version);

            // 🔥 MARKETPLACE URL BOOTSTRAP — DOIT ÊTRE TOUT EN HAUT (après useState/useRef)
            useEffect(() => {
                console.log('🛒 [MARKETPLACE] useEffect MOUNT - Checking for template...');
                
                // Récupérer depuis capture early OU URL directe
                const imageUrl =
                    window.__GKDP_TEMPLATE_URL__ ||
                    sessionStorage.getItem("gkdp_template_url") ||
                    new URLSearchParams(window.location.search).get("template") ||
                    new URLSearchParams(window.location.search).get("img");
                
                console.log('🛒 [MARKETPLACE] imageUrl found:', imageUrl);

                if (!imageUrl) {
                    console.log('🛒 [MARKETPLACE] Aucun template - mode normal');
                    return;
                }

                console.log('🛒 [MARKETPLACE] ✅ Template détecté:', imageUrl);

                setMarketplaceTemplate(imageUrl);
                setIsMarketplacePreview(true);
                window.setActiveTemplateUrl && window.setActiveTemplateUrl(imageUrl);
// Détection du mode : Full Cover si l'URL contient 'fullcover' OU si le paramètre 'template' est utilisé
const params = new URLSearchParams(window.location.search);
const isFullCover = imageUrl.toLowerCase().includes('fullcover') || params.has('template');

console.log('🛒 [MARKETPLACE] Type:', isFullCover ? 'FULL COVER' : 'BACKGROUND');

                // Auto-sélectionner format/pages par défaut (sans écraser un choix utilisateur existant)
                if (!format) {
                    setFormat('6x9');
                }
                if (!pageCount || Number(pageCount) <= 0) {
                    setPageCount(100);
                }
                console.log('🛒 [MARKETPLACE] Valeurs par défaut (modifiables): 6x9, 100 pages');

                // ✅ IMPORTANT PERF: on pousse l'URL tout de suite à React (UI immédiate)
                // Le canvas chargera l'image de façon asynchrone.
                setFrontImage({
                    url: imageUrl,
                    naturalWidth: null,
                    naturalHeight: null,
                    file: null,
                    isMarketplace: true,
                    isFullCover: isFullCover,
                    loading: true
                });

                // Puis on récupère les dimensions en arrière-plan sans bloquer l'UI.
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    console.log('✅ [MARKETPLACE] Image chargée', img.naturalWidth, 'x', img.naturalHeight);
                    setFrontImage(prev => ({
                        ...(prev || {}),
                        url: imageUrl,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        file: null,
                        isMarketplace: true,
                        isFullCover: isFullCover,
                        loading: false
                    }));

                    console.log('🛒 [MARKETPLACE] Image dimensions applied');
                    sessionStorage.removeItem("gkdp_template_url");
                };

                img.onerror = () => {
                    console.error('❌ [MARKETPLACE] Erreur chargement image:', imageUrl);
                    // On enlève l'état loading pour éviter un état bloqué.
                    setFrontImage(prev => ({ ...(prev || {}), loading: false }));
                    sessionStorage.removeItem("gkdp_template_url");
                };

                img.src = imageUrl;
            }, []);

            const t = (key) => texts[language][key] || texts.en[key];

            const kdpFormats = {
                '5x8': { width: 127, height: 203.2, name: '12,7 × 20,32 cm (5" × 8")', binding: ['paperback'], popular: true },
                '5.25x8': { width: 133.4, height: 203.2, name: '13,34 × 20,32 cm (5,25" × 8")', binding: ['paperback'], popular: true },
                '5.5x8.5': { width: 139.7, height: 215.9, name: '13,97 × 21,59 cm (5,5" × 8,5")', binding: ['paperback'], popular: true },
                '6x9': { width: 152.4, height: 228.6, name: '15,24 × 22,86 cm (6" × 9") ⭐', binding: ['paperback'], popular: true },
                '5.06x7.81': { width: 128.5, height: 198.4, name: '12,85 × 19,84 cm (5,06" × 7,81")', binding: ['paperback'] },
                '6.14x9.21': { width: 156, height: 233.9, name: '15,6 × 23,39 cm (6,14" × 9,21")', binding: ['paperback'] },
                '6.69x9.61': { width: 169.9, height: 244, name: '16,99 × 24,4 cm (6,69" × 9,61")', binding: ['paperback'] },
                '7x10': { width: 177.8, height: 254, name: '17,78 × 25,4 cm (7" × 10")', binding: ['paperback'] },
                '8x10': { width: 203.2, height: 254, name: '20,32 × 25,4 cm (8" × 10")', binding: ['paperback'] },
                '8.5x11': { width: 215.9, height: 279.4, name: '21,59 × 27,94 cm (8,5" × 11") ⚠️ COMPLEXE', binding: ['paperback'], complex: true },
                '6x9-hc': { width: 152.4, height: 228.6, name: '15,24 × 22,86 cm (6" × 9") - Relié ⭐', binding: ['hardcover'], popular: true },
                '7x10-hc': { width: 177.8, height: 254, name: '17,78 × 25,4 cm (7" × 10") - Relié', binding: ['hardcover'] },
                '8.25x11-hc': { width: 209.5, height: 279.4, name: '20,95 × 27,94 cm (8,25" × 11") - Relié', binding: ['hardcover'] }
            };

            // 🔒 KDP STRICT - Table d'épaisseur par page (en pouces)
            // Source: spécifications officielles Amazon KDP
            const KDP_INCH_PER_PAGE = {
                paperback: {
                    bw_white: 0.002252,      // Noir & blanc sur papier blanc
                    bw_cream: 0.0025,        // Noir & blanc sur papier crème  
                    color_standard: 0.002347, // Couleur standard
                    color_premium: 0.002347,  // Couleur premium
                },
                hardcover: {
                    bw_white: 0.0025,
                    bw_cream: 0.002347,
                    color: 0.002347,
                },
            };

            // Mapping UI paperType -> preset KDP
            function getKdpPresetKey(bindingType, paperType) {
                if (bindingType === "paperback") {
                    if (paperType === "white") return "bw_white";
                    if (paperType === "cream") return "bw_cream";
                    if (paperType === "color_standard") return "color_standard";
                    if (paperType === "color_premium") return "color_premium";
                }
                if (bindingType === "hardcover") {
                    if (paperType === "white") return "bw_white";
                    if (paperType === "cream") return "bw_cream";
                    if (paperType === "color") return "color";
                }
                throw new Error(`Unsupported preset: ${bindingType}/${paperType}`);
            }

            // Calcul spine en mm avec preset KDP strict
            function computeSpineMm(bindingType, paperType, pageCount) {
                const presetKey = getKdpPresetKey(bindingType, paperType);
                const inchPerPage = KDP_INCH_PER_PAGE[bindingType]?.[presetKey];
                if (!inchPerPage) throw new Error(`Missing inchPerPage for ${bindingType}/${presetKey}`);
                return pageCount * inchPerPage * 25.4; // inch -> mm
            }

            // 🔒 KDP STRICT - Validation bloquante
            function assertFinite(name, v) {
                if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`${name} invalid: ${v}`);
            }

            function validateKdpStrict({ format, bindingType, paperType, pageCount, hasBleed, dimensions, kdpStrictConfirmed, language }) {
                if (!kdpStrictConfirmed) {
                    throw new Error(language === 'fr' 
                        ? "🔒 KDP Strict: Vous devez confirmer que vos paramètres correspondent à votre projet KDP."
                        : "🔒 KDP Strict: You must confirm your parameters match your KDP project.");
                }

                if (!format) throw new Error("KDP strict: format required.");
                if (!bindingType) throw new Error("KDP strict: bindingType required.");
                if (!paperType) throw new Error("KDP strict: paperType required.");

                const pc = Number(pageCount);
                const minPages = bindingType === 'hardcover' ? 75 : 24;
                if (!Number.isInteger(pc) || pc < minPages) {
                    throw new Error(`KDP strict: pageCount must be >= ${minPages}.`);
                }

                if (!dimensions?.total) throw new Error("KDP strict: dimensions not available.");

                assertFinite("totalWidthMm", dimensions.total.width);
                assertFinite("totalHeightMm", dimensions.total.height);

                if (dimensions.total.width < 50 || dimensions.total.height < 50) {
                    throw new Error("KDP strict: computed size looks wrong.");
                }

                return { pageCount: pc };
            }

            // 🔒 Helpers de conversion pour PDF
            const mmToIn = (mm) => mm / 25.4;
            const inToPt = (inch) => inch * 72;
            const mmToPt = (mm) => inToPt(mmToIn(mm));

            const paperOptions = {
                paperback: [
                    { value: 'white', labelFr: 'Intérieur noir et blanc avec papier blanc ⭐', labelEn: 'Black & white interior with white paper ⭐' },
                    { value: 'cream', labelFr: 'Intérieur noir et blanc avec papier crème', labelEn: 'Black & white interior with cream paper' },
                    { value: 'color_standard', labelFr: 'Intérieur couleur standard avec papier blanc', labelEn: 'Standard color interior with white paper' },
                    { value: 'color_premium', labelFr: 'Intérieur couleur premium avec papier blanc', labelEn: 'Premium color interior with white paper' }
                ],
                hardcover: [
                    { value: 'white', labelFr: 'Intérieur noir et blanc avec papier blanc ⭐', labelEn: 'Black & white interior with white paper ⭐' },
                    { value: 'cream', labelFr: 'Intérieur noir et blanc avec papier crème', labelEn: 'Black & white interior with cream paper' },
                    { value: 'color', labelFr: 'Intérieur couleur premium avec papier blanc', labelEn: 'Premium color interior with white paper' }
                ]
            };
            
            // Les dimensions sont maintenant calculées directement à chaque rendu via useMemo.
            // Cela évite la cascade de mises à jour d'état qui causait le bug.
            const dimensions = useMemo(() => {
                try {
                    if (!format || !pageCount || !bindingType) return null;
                    const formatData = kdpFormats[format];
                    if (!formatData || !formatData.binding.includes(bindingType)) return null;

                    // 🔒 KDP STRICT - Utiliser computeSpineMm avec preset
                    const spineWidth = computeSpineMm(bindingType, paperType, pageCount);
                    let bleed = 0;
                    if (hasBleed) {
                        bleed = bindingType === 'hardcover' ? 6.35 : 3.175;
                    }

                    if (bindingType === 'hardcover') {
    const totalWidth = (formatData.width * 2) + spineWidth + (bleed * 2);
    const totalHeight = formatData.height + (bleed * 2);
    return {
      format: formatData,
      spine: spineWidth,
      total: { width: totalWidth, height: totalHeight },
      bleed,
      safeZone: hasBleed ? 12.7 : 6.35,
      barcodeZone: { width: 51, height: 23 },
      bindingType: 'hardcover',
      hasBleed
    };
}

                    const totalWidth = (formatData.width * 2) + spineWidth + (bleed * 2);
                    const totalHeight = formatData.height + (bleed * 2);

                    return { format: formatData, spine: spineWidth, total: { width: totalWidth, height: totalHeight }, bleed, safeZone: hasBleed ? 6.35 : 3.175, barcodeZone: { width: 51, height: 23 }, bindingType: 'paperback', hasBleed };
                } catch (error) {
                    console.error('Erreur dans calculateDimensions:', error);
                    return null;
                }
            }, [format, pageCount, paperType, bindingType, hasBleed]);
            
            const getDeviceFingerprint = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    ctx.textBaseline = 'top';
                    ctx.font = '14px Arial';
                    ctx.fillText('GabaritKDP-Device', 2, 2);
                    const fingerprint = canvas.toDataURL().slice(-20) +
                        screen.width + 'x' + screen.height +
                        navigator.language;
                    return btoa(fingerprint).slice(0, 16);
                } catch (e) {
                    return 'fallback-' + Math.random().toString(36).substr(2, 9);
                }
            };
            const checkExportLimits = () => {
                if (localStorage.getItem('userProfile') === 'pro') {
                    return { canExport: true, remaining: Infinity, level: 'pro' };
                }
                const exportCredits = parseInt(localStorage.getItem('exportCredits') || '0', 10);
                if (exportCredits > 0) {
                    return { canExport: true, remaining: exportCredits, level: 'pack' };
                }
                const today = new Date().toDateString();
                const exportHistory = JSON.parse(localStorage.getItem('exportHistory') || '{}');
                const todayExports = exportHistory[today] || 0;
                const dailyLimit = 3;

                return { canExport: todayExports < dailyLimit, remaining: dailyLimit - todayExports, level: 'anonymous' };
            };
            const recordExport = () => {
                const exportCredits = parseInt(localStorage.getItem('exportCredits') || '0', 10);
                if (exportCredits > 0) {
                    localStorage.setItem('exportCredits', exportCredits - 1);
                    return;
                }
                const today = new Date().toDateString();
                const exportHistory = JSON.parse(localStorage.getItem('exportHistory') || '{}');
                exportHistory[today] = (exportHistory[today] || 0) + 1;
                localStorage.setItem('exportHistory', JSON.stringify(exportHistory));
            };
            
            const coverFinishOptions = [ { value: 'matte', label: 'Mat ⭐' }, { value: 'glossy', label: 'Brillant' } ];
            const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3.0));
            const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.3));

            const validateKDPCompliance = useCallback(() => {
                if (!dimensions) return { alerts: [], score: 0 };
                const alerts = [];
                let totalScore = 0;
                let scoreComponents = 0;
                const formatData = dimensions.format;

                if (format === '8.5x11') {
                    alerts.push({ type: 'critical', category: 'format_complex', message: t('format8511Message') });
                    alerts.push({ type: 'warning', category: 'format_complex', message: t('format8511Tips') });
                    totalScore -= 3;
                }
                
                if (pageCount < 24 || (bindingType === 'hardcover' && pageCount < 75)) {
                    alerts.push({ type: 'critical', category: 'pages', message: `REJET AMAZON: Minimum de pages non atteint (${pageCount})` });
                } else {
                    alerts.push({ type: 'excellent', category: 'pages', message: `Pages conformes: ${pageCount} pages` });
                    totalScore += 25;
                }
                scoreComponents++;
                
                [ { image: frontImage, name: 'Face' }, { image: backImage, name: 'Verso' } ].forEach(({ image, name }) => {
                    if (image) {
                        const actualDPI = Math.round((image.naturalWidth / formatData.width) * 25.4);
                        if (actualDPI >= 300) { totalScore += 25; alerts.push({ type: 'excellent', message: `${name}: Résolution PARFAITE (${actualDPI} DPI)` }); }
                        else if (actualDPI >= 200) { totalScore += 18; alerts.push({ type: 'warning', message: `${name}: Résolution acceptable (${actualDPI} DPI)` }); }
                        else { totalScore += 10; alerts.push({ type: 'critical', message: `${name}: Résolution CRITIQUE (${actualDPI} DPI)` }); }
                        scoreComponents++;
                    }
                });
                
                if (dimensions.bindingType === 'paperback') {
                     const spineWidthMM = dimensions.spine;
                    if (spineText && spineWidthMM < 2.8) {
                        alerts.push({ type: 'warning', category: 'spine', message: `Tranche fine (${spineWidthMM.toFixed(1)}mm): Texte possible mais peu lisible.` });
                    }
                    totalScore += 20;
                    scoreComponents++;
                }

                if (backImage) {
                    alerts.push({ type: 'info', category: 'barcode', message: `Amazon placera le code-barres en bas-droite.` });
                }
                if (!hasBleed && (frontImage || backImage)) {
                    alerts.push({ type: 'info', category: 'bleed', message: `Activez le fond perdu pour éviter les liserés blancs.` });
                }

                return { alerts, score: scoreComponents > 0 ? Math.round(totalScore / scoreComponents) : 0 };
            }, [dimensions, frontImage, backImage, spineText, hasBleed, pageCount, language, format]);

            useEffect(() => {
                const validation = validateKDPCompliance();
                setWarnings(validation.alerts);
                setOverallScore(validation.score);
            }, [validateKDPCompliance]);

            
            // 📦 Charger l'image du code-barres custom (PNG) en cache pour preview + export
            useEffect(() => {
                if (useCustomBarcode && customBarcodePng?.url) {
                    const img = new Image();
                    img.onload = () => { 
                        barcodeImgRef.current = img; 
                    };
                    img.onerror = () => { 
                        barcodeImgRef.current = null; 
                    };
                    img.src = customBarcodePng.url;
                } else {
                    barcodeImgRef.current = null;
                }
            }, [useCustomBarcode, customBarcodePng]);
const getScoreClass = (score) => {
                if (score >= 23) return 'score-excellent';
                if (score >= 19) return 'score-tres-bon';
                if (score >= 15) return 'score-acceptable';
                return 'score-problematique';
            };
            const getScoreLabel = (score) => {
                if (score >= 23) return { label: t('scoreExcellent'), subtitle: t('scoreSubtitleExcellent') };
                if (score >= 19) return { label: t('scoreTresBon'), subtitle: t('scoreSubtitleTresBon') };
                if (score >= 15) return { label: t('scoreAcceptable'), subtitle: t('scoreSubtitleAcceptable') };
                return { label: t('scoreProblematique'), subtitle: t('scoreSubtitleProblematique') };
            };
            // 📦 Upload / remove code-barres custom (PNG)
            const handleCustomBarcodeUpload = (file) => {
                if (!file) return;
                if (file.type !== 'image/png') {
                    alert(language === 'fr' 
                        ? "Veuillez uploader un fichier PNG pour le code-barres." 
                        : "Please upload a PNG file for the barcode.");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    setCustomBarcodePng({ file, url: e.target.result });
                    // Forcer l'affichage de la zone si l'utilisateur passe en custom
                    if (!showBarcodeZone) setShowBarcodeZone(true);
                };
                reader.readAsDataURL(file);
            };

            const removeCustomBarcode = () => {
                setCustomBarcodePng(null);
            };


            const handleImageUpload = (file, type) => {
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const imageData = {
                            file, url: e.target.result,
                            naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
                            quality: img.naturalWidth > 3000 ? 'Ultra HD 4K' : 'Standard',
                            source: 'upload'
                        };
                        switch (type) {
                            case 'front': 
                                setFrontImage(imageData); 
                                setFrontImageOffset({x:0, y:0}); 
                                setFrontImageZoom(1.0);
                                break;
                            case 'back': 
                                setBackImage(imageData); 
                                setBackImageOffset({x:0, y:0}); 
                                setBackImageZoom(1.0);
                                break;
                            case 'spine': 
                                setSpineImage(imageData); 
                                setSpineImageOffset({x:0, y:0}); 
                                setSpineImageZoom(1.0);
                                break;
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            };

            const removeImage = (type) => {
                switch (type) {
                    case 'front': 
                        setFrontImage(null); 
                        setFrontImageOffset({x:0, y:0}); 
                        setFrontImageZoom(1.0);
                        break;
                    case 'back': 
                        setBackImage(null); 
                        setBackImageOffset({x:0, y:0}); 
                        setBackImageZoom(1.0);
                        break;
                    case 'spine': 
                        setSpineImage(null); 
                        setSpineImageOffset({x:0, y:0}); 
                        setSpineImageZoom(1.0);
                        break;
                }
            };
            
            // Fonction pour importer une image depuis Canva
            const handleCanvaImageUpload = async (imageUrl, type) => {
                try {
                    console.log(`📥 Téléchargement image Canva pour ${type}:`, imageUrl);
                    
                    // Télécharger l'image depuis Canva
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    
                    // Convertir en data URL
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            const imageData = {
                                file: new File([blob], 'canva-design.png', { type: 'image/png' }),
                                url: e.target.result,
                                naturalWidth: img.naturalWidth,
                                naturalHeight: img.naturalHeight,
                                quality: img.naturalWidth > 3000 ? 'Ultra HD 4K' : 'Standard',
                                source: 'canva'
                            };
                            
                            console.log(`✅ Image Canva chargée pour ${type}:`, {
                                width: img.naturalWidth,
                                height: img.naturalHeight,
                                quality: imageData.quality
                            });
                            
                            // Mettre à jour l'état React
                            switch (type) {
                                case 'front': setFrontImage(imageData); break;
                                case 'back': setBackImage(imageData); break;
                                case 'spine': setSpineImage(imageData); break;
                            }
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(blob);
                    
                } catch (error) {
                    console.error(`❌ Erreur lors de l'import depuis Canva (${type}):`, error);
                    alert(`Erreur lors de l'import de l'image Canva. Veuillez réessayer.`);
                }
            };
            
            // Exposer la fonction globalement pour l'événement canva:design-imported
            React.useEffect(() => {
                window.__kdp_handleCanvaUpload = handleCanvaImageUpload;
                return () => {
                    delete window.__kdp_handleCanvaUpload;
                };
            }, []);
            
            const drawPreview = useCallback(() => {
                if (!dimensions || !canvasRef.current) return;

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                const displayWidth = 600;
                const displayHeight = 400;

                canvas.width = displayWidth; canvas.height = displayHeight;
                canvas.style.width = `${displayWidth}px`; canvas.style.height = `${displayHeight}px`;

                ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

                const bookWidth = displayWidth - 40; const bookHeight = displayHeight - 40;
                const startX = 20; const startY = 20;
                const scaleFactor = bookWidth / dimensions.total.width;
                const frontWidth = dimensions.format.width * scaleFactor;
                const spineWidth = dimensions.spine * scaleFactor;
                const backWidth = frontWidth;
                const bleedWidth = dimensions.bleed * scaleFactor;
                const bleedHeight = dimensions.bleed * scaleFactor;
                const exaggeratedSafeZoneReal = dimensions.safeZone + 5; 
                const safeZoneWidth = exaggeratedSafeZoneReal * scaleFactor;
                const safeZoneHeight = exaggeratedSafeZoneReal * scaleFactor;

                // 🛒 MARKETPLACE: Fonction pour dessiner le watermark
                const drawWatermark = () => {
                    if (!isMarketplacePreview) return;
                    
                    ctx.save();
                    ctx.globalAlpha = 0.15;
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 32px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Watermark en diagonale
                    ctx.translate(displayWidth / 2, displayHeight / 2);
                    ctx.rotate(-Math.PI / 6); // -30 degrés
                    ctx.fillText('GabaritKDP', 0, 0);
                    ctx.fillText('PREVIEW', 0, 40);
                    
                    ctx.restore();
                };

                const drawOverlays = () => {
                    ctx.strokeStyle = '#888888'; ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
                    if (spineWidth > 1) {
                        ctx.beginPath(); ctx.moveTo(startX + backWidth, startY); ctx.lineTo(startX + backWidth, startY + bookHeight); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(startX + backWidth + spineWidth, startY); ctx.lineTo(startX + backWidth + spineWidth, startY + bookHeight); ctx.stroke();
                    }
                    if (spineText && (dimensions?.spine || 0) >= 0.06 && spineWidth > 6) {
                        ctx.fillStyle = spineTextColor || '#333333'; ctx.font = `${Math.max(10, spineTextSize)}px ${spineTextFont}`; ctx.textAlign = 'center';
                        ctx.save(); ctx.translate(startX + backWidth + spineWidth / 2, startY + bookHeight / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(spineText, 0, 0); ctx.restore();
                    }
                    if (hasBleed) {
                        ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)'; ctx.lineWidth = 1; ctx.setLineDash([6, 3]);
                        ctx.strokeRect(startX + bleedWidth, startY + bleedHeight, bookWidth - (bleedWidth * 2), bookHeight - (bleedHeight * 2));
                    }
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
                    ctx.strokeRect(startX + safeZoneWidth, startY + safeZoneHeight, backWidth - (safeZoneWidth * 2), bookHeight - (safeZoneHeight * 2));
                    ctx.strokeRect(startX + backWidth + spineWidth + safeZoneWidth, startY + safeZoneHeight, frontWidth - (safeZoneWidth * 2), bookHeight - (safeZoneHeight * 2));
                    
                    ctx.setLineDash([]); ctx.strokeStyle = '#333333'; ctx.lineWidth = 2; ctx.strokeRect(10, 10, displayWidth - 20, displayHeight - 20);
                    ctx.fillStyle = '#374151'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'left';
                    ctx.fillText(`${Math.round(dimensions.total.width)}×${Math.round(dimensions.total.height)}mm`, 15, displayHeight - 15);
                    
                    // 🛒 MARKETPLACE: Dessiner watermark après les overlays
                    drawWatermark();
                    
                    // 📚 COVER TEXT: Dessiner titre, auteur, 4ème de couv et zone code-barre
                    drawCoverText();
                };
                
                // 📚 COVER TEXT FUNCTION
                const drawCoverText = () => {
                    // Zone FRONT (face) - pour titre et auteur
                    const frontStartX = startX + backWidth + spineWidth;
                    
                    // Zone BACK (dos) - pour 4ème de couv et code-barre
                    const backStartX = startX;
                    
                    // 📖 TITRE DU LIVRE (sur la face)
                    if (bookTitle) {
                        ctx.save();
                        ctx.fillStyle = bookTitleColor;
                        const titleFontSize = Math.max(12, bookTitleSize * scaleFactor / 5);
                        ctx.font = `bold ${titleFontSize}px ${bookTitleFont}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        // Position X/Y basée sur les pourcentages
                        const titleX = frontStartX + (frontWidth * bookTitleX / 100);
                        const titleY = startY + (bookHeight * bookTitleY / 100);
                        
                        // Dessiner avec ombre pour meilleure lisibilité
                        ctx.shadowColor = 'rgba(0,0,0,0.5)';
                        ctx.shadowBlur = 4;
                        ctx.shadowOffsetX = 2;
                        ctx.shadowOffsetY = 2;
                        
                        // Word wrap si le titre est long
                        const maxWidth = frontWidth - (safeZoneWidth * 2);
                        wrapText(ctx, bookTitle, titleX, titleY, maxWidth, titleFontSize * 1.2);
                        
                        // Indicateur de position si dragging
                        if (draggingElement === 'title') {
                            ctx.strokeStyle = '#ff00ff';
                            ctx.lineWidth = 2;
                            ctx.setLineDash([5, 5]);
                            ctx.strokeRect(titleX - 50, titleY - 20, 100, 40);
                            ctx.setLineDash([]);
                        }
                        
                        ctx.restore();
                    }
                    
                    // 👤 NOM DE L'AUTEUR (sur la face)
                    if (authorName) {
                        ctx.save();
                        ctx.fillStyle = authorNameColor;
                        const authorFontSize = Math.max(8, authorNameSize * scaleFactor / 5);
                        ctx.font = `${authorFontSize}px ${authorNameFont}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        const authorX = frontStartX + (frontWidth * authorNameX / 100);
                        const authorY = startY + (bookHeight * authorNameY / 100);
                        
                        ctx.shadowColor = 'rgba(0,0,0,0.5)';
                        ctx.shadowBlur = 3;
                        ctx.shadowOffsetX = 1;
                        ctx.shadowOffsetY = 1;
                        
                        ctx.fillText(authorName, authorX, authorY);
                        
                        // Indicateur de position si dragging
                        if (draggingElement === 'author') {
                            ctx.strokeStyle = '#00ffff';
                            ctx.lineWidth = 2;
                            ctx.setLineDash([5, 5]);
                            ctx.strokeRect(authorX - 40, authorY - 15, 80, 30);
                            ctx.setLineDash([]);
                        }
                        
                        ctx.restore();
                    }
                    
                    // 📖 4ÈME DE COUVERTURE (sur le dos/partie gauche)
                    if (backCoverText) {
                        ctx.save();
                        ctx.fillStyle = backCoverTextColor;
                        const backTextFontSize = Math.max(6, backCoverTextSize * scaleFactor / 6);
                        ctx.font = `${backTextFontSize}px ${backCoverTextFont}`;
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'top';

                        // Définition des marges internes (Safe Zone)
                        const marginInternal = 10 * scaleFactor; // Petit padding de confort
                        const safeLeft = startX + safeZoneWidth + marginInternal;
                        const safeRight = startX + backWidth - safeZoneWidth - marginInternal;
                        const maxWidth = safeRight - safeLeft; // Largeur exacte du cadre utilisable

                        // Position Y basée sur le curseur
                        const textY = startY + safeZoneHeight + ((bookHeight - (safeZoneHeight * 2)) * backCoverTextY / 100);

                        wrapText(ctx, backCoverText, safeLeft, textY, maxWidth, backTextFontSize * 1.4);
                        ctx.restore();
                    }

                    // 📊 ZONE CODE-BARRE ISBN (sur le dos, en bas à droite)
                    if (showBarcodeZone) {
                        ctx.save();
                        // Dimensions standards du code-barre ISBN: ~50.8mm x 30.5mm
                        const barcodeWidth = 50 * scaleFactor;
                        const barcodeHeight = 30 * scaleFactor;
                        const barcodeX = startX + backWidth - safeZoneWidth - barcodeWidth - 5;
                        const barcodeY = startY + bookHeight - safeZoneHeight - barcodeHeight - 5;

                        // Fond / zone (uniquement si code-barres custom)
                        if (useCustomBarcode) {
                            ctx.fillStyle = barcodeZoneColor;
                            ctx.fillRect(barcodeX, barcodeY, barcodeWidth, barcodeHeight);
                        }

                        // Bordure
                        ctx.strokeStyle = '#cccccc';
                        ctx.lineWidth = 1;
                        ctx.setLineDash([]);
                        ctx.strokeRect(barcodeX, barcodeY, barcodeWidth, barcodeHeight);

                        // Si l'utilisateur fournit son propre code-barres (PNG), on l'affiche
                        if (useCustomBarcode && barcodeImgRef.current) {
                            const img = barcodeImgRef.current;
                            // Contain sans déformation
                            const ratio = Math.min(barcodeWidth / img.width, barcodeHeight / img.height);
                            const w = img.width * ratio;
                            const h = img.height * ratio;
                            const ix = barcodeX + (barcodeWidth - w) / 2;
                            const iy = barcodeY + (barcodeHeight - h) / 2;
                            ctx.drawImage(img, ix, iy, w, h);

                            // ISBN optionnel en petit sous la zone (dans la safe zone)
                            if (customISBN) {
                                ctx.fillStyle = '#444444';
                                ctx.font = `${Math.max(6, 8 * scaleFactor / 4)}px Arial`;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'top';
                                ctx.fillText(customISBN, barcodeX + barcodeWidth / 2, barcodeY + barcodeHeight + 2);
                            }
                        } else if (useCustomBarcode) {
                            // Placeholder informatif (Amazon)
                            ctx.fillStyle = '#999999';
                            ctx.font = `${Math.max(6, 8 * scaleFactor / 4)}px Arial`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText('ISBN', barcodeX + barcodeWidth / 2, barcodeY + barcodeHeight / 2 - 5);
                            ctx.fillText('BARCODE', barcodeX + barcodeWidth / 2, barcodeY + barcodeHeight / 2 + 5);
                        }

                        ctx.restore();
                    }
                };
                
                // 📝 Helper function pour word wrap
                function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
                    const paragraphs = String(text || '').split('\n');
                    paragraphs.forEach(para => {
                        const words = para.split(' ');
                        let line = '';

                        for (let n = 0; n < words.length; n++) {
                            let word = words[n];
                            let testLine = line + word + ' ';
                            let metrics = ctx.measureText(testLine);

                            if (metrics.width > maxWidth && n > 0) {
                                ctx.fillText(line.trim(), x, y);
                                line = word + ' ';
                                y += lineHeight;
                            } else if (ctx.measureText(word).width > maxWidth) {
                                // Si UN SEUL MOT est plus large que le cadre (ex: rrrrrrrr...)
                                for (let i = 0; i < word.length; i++) {
                                    if (ctx.measureText(line + word[i]).width > maxWidth) {
                                        ctx.fillText(line, x, y);
                                        line = word[i];
                                        y += lineHeight;
                                    } else {
                                        line += word[i];
                                    }
                                }
                                line += ' ';
                            } else {
                                line = testLine;
                            }
                        }
                        ctx.fillText(line.trim(), x, y);
                        y += lineHeight * 1.5; // Espace entre les paragraphes
                    });
                };

                ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, displayWidth, displayHeight);

                // ✅ AJOUT: Afficher la couleur de la tranche dans l'aperçu (comme dans l'export)
                if (dimensions.spine >= 1.0 && spineColor && spineColor !== '#ffffff' && spineWidth > 0) {
                    ctx.fillStyle = spineColor;
                    ctx.fillRect(startX + backWidth, startY, spineWidth, bookHeight);
                }

                // 🎨 DESSIN DU FOND DE LA 4ÈME DE COUVERTURE
                // Fonction pour dessiner le fond personnalisé sur une zone
                const drawCustomBackground = (targetX, targetY, targetWidth, targetHeight, callback) => {
                    // Dessiner la couleur de fond
                    ctx.fillStyle = backCoverBgColor;
                    ctx.fillRect(targetX, targetY, targetWidth, targetHeight);
                    
                    // Si une texture est définie
                    if (backCoverTexture) {
                        // Si c'est une image custom (data URL ou URL externe)
                        if (backCoverTexture.url) {
                            const textureImg = new Image();
                            if (!backCoverTexture.url.startsWith('data:')) {
                                textureImg.crossOrigin = "anonymous";
                            }
                            textureImg.onload = () => {
                                ctx.drawImage(textureImg, targetX, targetY, targetWidth, targetHeight);
                                // Appliquer le filtre de couleur
                                if (textureColorFilter) {
                                    ctx.save();
                                    const hexToRgba = (hex, alpha) => {
                                        const r = parseInt(hex.slice(1, 3), 16);
                                        const g = parseInt(hex.slice(3, 5), 16);
                                        const b = parseInt(hex.slice(5, 7), 16);
                                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                                    };
                                    ctx.globalCompositeOperation = 'overlay';
                                    ctx.fillStyle = hexToRgba(textureColorFilter, 0.7);
                                    ctx.fillRect(targetX, targetY, targetWidth, targetHeight);
                                    ctx.restore();
                                }
                                callback();
                            };
                            textureImg.onerror = () => callback();
                            textureImg.src = backCoverTexture.url;
                        } 
                        // Si c'est une texture procédurale
                        else if (backCoverTexture.name) {
                            const textureCanvas = generateTexture(backCoverTexture.name, Math.round(targetWidth * 2), Math.round(targetHeight * 2), backCoverBgColor);
                            ctx.drawImage(textureCanvas, targetX, targetY, targetWidth, targetHeight);
                            
                            // Appliquer le filtre de couleur si défini
                            if (textureColorFilter) {
                                ctx.save();
                                const hexToRgba = (hex, alpha) => {
                                    const r = parseInt(hex.slice(1, 3), 16);
                                    const g = parseInt(hex.slice(3, 5), 16);
                                    const b = parseInt(hex.slice(5, 7), 16);
                                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                                };
                                ctx.globalCompositeOperation = 'overlay';
                                ctx.fillStyle = hexToRgba(textureColorFilter, 0.7);
                                ctx.fillRect(targetX, targetY, targetWidth, targetHeight);
                                ctx.restore();
                            }
                            callback();
                        } else {
                            callback();
                        }
                    } else {
                        callback();
                    }
                };

                // Dessiner le fond personnalisé selon la zone choisie
                const drawBackgroundByZone = (callback) => {
                    if (backgroundApplyTo === 'none') {
                        callback();
                        return;
                    }
                    
                    if (backgroundApplyTo === 'full') {
                        // Full cover: back + spine + front
                        drawCustomBackground(startX, startY, bookWidth, bookHeight, callback);
                    } else if (backgroundApplyTo === 'back') {
                        // Back only
                        drawCustomBackground(startX, startY, backWidth, bookHeight, callback);
                    } else if (backgroundApplyTo === 'front') {
                        // Front only
                        const frontX = startX + backWidth + spineWidth;
                        drawCustomBackground(frontX, startY, frontWidth, bookHeight, callback);
                    } else {
                        callback();
                    }
                };

                const images = [];
                
                // 🛒 FULL COVER: Si c'est un Full Cover, afficher sur tout le canvas
                if (frontImage && frontImage.isFullCover) {
                    images.push({ 
                        img: frontImage, 
                        x: startX, 
                        y: startY, 
                        w: bookWidth, // Toute la largeur (back + spine + front)
                        h: bookHeight,
                        isFullCover: true,
                        type: 'fullcover',
                        offsetX: frontImageOffset.x,
                        offsetY: frontImageOffset.y,
                        zoom: frontImageZoom
                    });
                } else {
                    // Mode normal: images séparées pour back, spine, front
                    // Ne pas ajouter backImage si le fond personnalisé couvre back ou full
                    if (backImage && backgroundApplyTo !== 'back' && backgroundApplyTo !== 'full') {
                        images.push({ 
                            img: backImage, 
                            x: startX, 
                            y: startY, 
                            w: backWidth, 
                            h: bookHeight,
                            type: 'back',
                            offsetX: backImageOffset.x,
                            offsetY: backImageOffset.y,
                            zoom: backImageZoom
                        });
                    }
                    if (spineImage && spineWidth > 10) {
                        images.push({ 
                            img: spineImage, 
                            x: startX + backWidth, 
                            y: startY, 
                            w: spineWidth, 
                            h: bookHeight,
                            type: 'spine',
                            offsetX: spineImageOffset.x,
                            offsetY: spineImageOffset.y,
                            zoom: spineImageZoom
                        });
                    }
                    // Ne pas ajouter frontImage si le fond personnalisé couvre front ou full
                    if (frontImage && backgroundApplyTo !== 'front' && backgroundApplyTo !== 'full') {
                        images.push({ 
                            img: frontImage, 
                            x: startX + backWidth + spineWidth, 
                            y: startY, 
                            w: frontWidth, 
                            h: bookHeight,
                            type: 'front',
                            offsetX: frontImageOffset.x,
                            offsetY: frontImageOffset.y,
                            zoom: frontImageZoom
                        });
                    }
                }

                // Fonction pour dessiner les images
                const drawImages = () => {
                    const bgActive = backgroundApplyTo !== 'none';
                    
                    // Cas 1: Pas d'images et pas de fond personnalisé
                    if (images.length === 0 && !bgActive) {
                        ctx.fillStyle = '#f3f4f6';
                        ctx.fillRect(startX, startY, backWidth, bookHeight);
                        ctx.fillRect(startX + backWidth + spineWidth, startY, frontWidth, bookHeight);
                        
                        if (spineWidth > 0) {
                            if (dimensions.spine >= 1.0 && spineColor && spineColor !== '#ffffff') {
                                ctx.fillStyle = spineColor;
                            } else {
                                ctx.fillStyle = '#f3f4f6';
                            }
                            ctx.fillRect(startX + backWidth, startY, spineWidth, bookHeight);
                        }
                        
                        ctx.fillStyle = '#6b7280'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
                        ctx.fillText('VERSO', startX + backWidth / 2, startY + bookHeight / 2);
                        ctx.fillText('FACE', startX + backWidth + spineWidth + frontWidth / 2, startY + bookHeight / 2);
                        drawOverlays();
                    } 
                    // Cas 2: Fond personnalisé actif
                    else if (bgActive) {
                        // Le fond est déjà dessiné par drawBackgroundByZone
                        
                        // Si back only ou full: rien à faire pour back
                        // Si front only: dessiner back normal
                        if (backgroundApplyTo === 'front') {
                            if (backImage) {
                                const backImg = new Image();
                                backImg.crossOrigin = "anonymous";
                                backImg.onload = () => {
                                    ctx.drawImage(backImg, startX, startY, backWidth, bookHeight);
                                };
                                backImg.src = backImage.url;
                            } else {
                                ctx.fillStyle = '#f3f4f6';
                                ctx.fillRect(startX, startY, backWidth, bookHeight);
                                ctx.fillStyle = '#6b7280'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
                                ctx.fillText('VERSO', startX + backWidth / 2, startY + bookHeight / 2);
                            }
                        }
                        
                        // Dessiner la tranche (sauf si full cover avec fond)
                        if (spineWidth > 0 && backgroundApplyTo !== 'full') {
                            if (spineImage) {
                                const spineImg = new Image();
                                spineImg.crossOrigin = "anonymous";
                                spineImg.onload = () => {
                                    ctx.drawImage(spineImg, startX + backWidth, startY, spineWidth, bookHeight);
                                };
                                spineImg.src = spineImage.url;
                            } else if (dimensions.spine >= 1.0 && spineColor && spineColor !== '#ffffff') {
                                ctx.fillStyle = spineColor;
                                ctx.fillRect(startX + backWidth, startY, spineWidth, bookHeight);
                            } else {
                                ctx.fillStyle = '#e5e7eb';
                                ctx.fillRect(startX + backWidth, startY, spineWidth, bookHeight);
                            }
                        }
                        
                        // Si back only: dessiner front normal
                        if (backgroundApplyTo === 'back') {
                            if (frontImage) {
                                const frontImg = new Image();
                                frontImg.crossOrigin = "anonymous";
                                frontImg.onload = () => {
                                    ctx.drawImage(frontImg, startX + backWidth + spineWidth, startY, frontWidth, bookHeight);
                                    drawOverlays();
                                };
                                frontImg.onerror = () => { drawOverlays(); };
                                frontImg.src = frontImage.url;
                            } else {
                                ctx.fillStyle = '#f3f4f6';
                                ctx.fillRect(startX + backWidth + spineWidth, startY, frontWidth, bookHeight);
                                ctx.fillStyle = '#6b7280'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
                                ctx.fillText('FACE', startX + backWidth + spineWidth + frontWidth / 2, startY + bookHeight / 2);
                                drawOverlays();
                            }
                        } else {
                            drawOverlays();
                        }
                    }
                    // Cas 3: Images présentes sans fond personnalisé
                    else {
                        let loadedCount = 0;
                        images.forEach(item => {
                            const img = new Image(); img.crossOrigin = "anonymous";
                            img.onload = () => {
                                // Utiliser drawImageCover avec offset et zoom
                                const box = { x: item.x, y: item.y, width: item.w, height: item.h };
                                const offsetX = item.offsetX || 0;
                                const offsetY = item.offsetY || 0;
                                const zoom = item.zoom || 1.0;
                                drawImageCover(ctx, img, box, 0.5, 0.5, zoom, offsetX, offsetY);
                                if (++loadedCount === images.length) drawOverlays();
                            };
                            img.onerror = () => { if (++loadedCount === images.length) drawOverlays(); };
                            img.src = item.img.url;
                        });
                    }
                };
                
                // Exécuter le dessin: d'abord le fond, puis les images
                drawBackgroundByZone(drawImages);
                
            }, [dimensions, frontImage, backImage, spineImage, spineText, spineColor, spineTextColor, spineTextSize, spineTextFont, hasBleed, isMarketplacePreview, bookTitle, bookTitleSize, bookTitleColor, bookTitleFont, bookTitleX, bookTitleY, authorName, authorNameSize, authorNameColor, authorNameFont, authorNameX, authorNameY, backCoverText, backCoverTextSize, backCoverTextColor, backCoverTextFont, backCoverTextX, backCoverTextY, showBarcodeZone, barcodeZoneColor, useCustomBarcode, customISBN, customBarcodePng, draggingElement, backgroundApplyTo, backCoverBgColor, backCoverTexture, textureColorFilter, viewMode, frontImageOffset, backImageOffset, spineImageOffset, frontImageZoom, backImageZoom, spineImageZoom]);
            
            
// 🚀 EXPORT PERFORMANCE: cache images between exports (avoids re-download + re-decode)
window.__GKDP_EXPORT_IMG_CACHE__ = window.__GKDP_EXPORT_IMG_CACHE__ || new Map();

const __gkdpLoadImage = (url) => {
    return new Promise((resolve) => {
        if (!url) return resolve(null);
        const cache = window.__GKDP_EXPORT_IMG_CACHE__;
        if (cache.has(url)) {
            const entry = cache.get(url);
            if (entry && entry.img && entry.img.complete) return resolve(entry.img);
            if (entry && entry.promise) return entry.promise.then(resolve);
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        const p = new Promise((res2) => {
            img.onload = () => res2(img);
            img.onerror = () => res2(null);
        });
        cache.set(url, { img, promise: p });
        img.src = url;
        p.then(resolve);
    });
};

// ✅ Safe PDF save without expensive base64 unless needed
const __gkdpSafeAddPdfImage = (pdf, exportCanvas, Wpt, Hpt) => {
                try {
                    pdf.addImage(exportCanvas, 'PNG', 0, 0, Wpt, Hpt);
                } catch (e) {
                    console.warn('PDF addImage(canvas) failed -> fallback toDataURL', e);
                    const imgData = exportCanvas.toDataURL('image/png', 1.0);
                    pdf.addImage(imgData, 'PNG', 0, 0, Wpt, Hpt);
                }
            };

// ✅ Safe image download without toDataURL
const __gkdpDownloadCanvasAsImage = (exportCanvas, exportFormat, baseFilename) => {
    return new Promise((resolve, reject) => {
        const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
        const filename = `${baseFilename}.${exportFormat === 'jpeg' ? 'jpg' : 'png'}`;
        exportCanvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Export blob empty'));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1500);
            resolve();
        }, mimeType, 0.95);
    });
};
const exportImage = () => {
                if (format === '8.5x11' && !confirm(t('format8511Message'))) return;
                setIsExporting(true);
                setTimeout(() => {
                    try {
                        const exportCanvas = document.createElement('canvas');
                        const exportCtx = exportCanvas.getContext('2d');
                        
                        // 🎯 DPI selon la qualité choisie ET le format d'export
                        // ⚠️ IMPORTANT: Pour PDF, on FORCE 300 DPI car KDP interprète les images à 300 DPI
                        // Si on exporte à 400 DPI, KDP recalcule les dimensions et obtient du A4 !
                        let baseDpiScale;
                        let qualityLabel;
                        
                        // Pour PDF: toujours 300 DPI (KDP standard)
                        // Pour PNG/JPEG: qualité choisie par l'utilisateur
                        const isPdfExport = exportFormat === 'pdf';
                        
                        if (isPdfExport) {
                            // 📄 PDF = 300 DPI obligatoire pour compatibilité KDP
                            baseDpiScale = 11.811; // 300 DPI
                            qualityLabel = '300 DPI (KDP)';
                            console.log('📄 [PDF] Export forcé à 300 DPI pour compatibilité KDP');
                        } else {
                            // PNG/JPEG: qualité au choix
                            
// 🔒 Perf gating: 4K/8K réservés aux PRO (sinon export trop lent / crash)
const isProUser = (localStorage.getItem('userProfile') === 'pro');

switch(canvasQuality) {
    case '8K':
        if (!isProUser) {
            baseDpiScale = 11.811; // 300 DPI
            qualityLabel = '300 DPI (Free)';
        } else {
            baseDpiScale = 23.622; // 600 DPI
            qualityLabel = '600 DPI';
        }
        break;
    case '4K':
        if (!isProUser) {
            baseDpiScale = 11.811; // 300 DPI
            qualityLabel = '300 DPI (Free)';
        } else {
            baseDpiScale = 15.748; // 400 DPI
            qualityLabel = '400 DPI';
        }
        break;
    case 'Standard':
    default:
        baseDpiScale = 11.811; // 300 DPI
        qualityLabel = '300 DPI';
        break;
}

                        }
                        
                        const dpiScale = format === '8.5x11' ? baseDpiScale * 1.2 : baseDpiScale;
                        const exportWidth = Math.round(dimensions.total.width * dpiScale);
                        const exportHeight = Math.round(dimensions.total.height * dpiScale);
                        
                        // Avertissement pour 8K (fichiers très lourds)
                        if (canvasQuality === '8K' && exportWidth * exportHeight > 50000000) {
                            if (!confirm(language === 'fr' 
                                ? `⚠️ Export 8K (${qualityLabel})\n\nLe fichier sera très volumineux (${Math.round(exportWidth)}×${Math.round(exportHeight)} pixels).\n\nCela peut prendre du temps et consommer beaucoup de mémoire.\n\nContinuer ?`
                                : `⚠️ 8K Export (${qualityLabel})\n\nThe file will be very large (${Math.round(exportWidth)}×${Math.round(exportHeight)} pixels).\n\nThis may take time and consume a lot of memory.\n\nContinue?`
                            )) {
                                setIsExporting(false);
                                return;
                            }
                        }
                        
                        console.log(`📐 Export: ${exportWidth}×${exportHeight}px @ ${qualityLabel}`);
                        
                        exportCanvas.width = exportWidth; exportCanvas.height = exportHeight;
                        exportCtx.imageSmoothingEnabled = true; exportCtx.imageSmoothingQuality = 'high';
                        exportCtx.fillStyle = '#ffffff'; exportCtx.fillRect(0, 0, exportWidth, exportHeight);

                        if (dimensions.bindingType === 'paperback') {
                            const frontWidth = dimensions.format.width * dpiScale;
                            const spineWidth = dimensions.spine * dpiScale;
                            const bleedMargin = dimensions.bleed * dpiScale;
                            
                            if (dimensions.spine >= 1.0 && spineColor && spineColor !== '#ffffff') {
                                exportCtx.fillStyle = spineColor;
                                exportCtx.fillRect(bleedMargin + frontWidth, 0, spineWidth, exportHeight);
                            }

                            const finalizeExport = async () => {
                                if (spineText && spineWidth > 40 && dimensions.spine > 1.5) {
                                    exportCtx.save();
                                    exportCtx.translate(bleedMargin + frontWidth + spineWidth / 2, exportHeight / 2);
                                    exportCtx.rotate(-Math.PI / 2);
                                    exportCtx.fillStyle = spineTextColor || '#333333';
                                    const fontSize = Math.max(24, spineTextSize * dpiScale / 2.5);
                                    exportCtx.font = `${fontSize}px ${spineTextFont}`;
                                    exportCtx.textAlign = 'center'; exportCtx.textBaseline = 'middle';
                                    exportCtx.fillText(spineText, 0, 0);
                                    exportCtx.restore();
                                }
                                
                                // 📚 EXPORT COVER TEXT - Titre, auteur, 4ème de couv, code-barre
                                const safeZone = dimensions.safeZone * dpiScale;
                                
                                // Zone FRONT pour titre et auteur
                                const frontStartX = bleedMargin + frontWidth + spineWidth;
                                
                                // Zone BACK pour 4ème de couv
                                const backStartXExport = bleedMargin;
                                
                                // 📖 TITRE DU LIVRE
                                if (bookTitle) {
                                    exportCtx.save();
                                    exportCtx.fillStyle = bookTitleColor;
                                    const titleFontSize = Math.max(48, bookTitleSize * dpiScale / 3);
                                    exportCtx.font = `bold ${titleFontSize}px ${bookTitleFont}`;
                                    exportCtx.textAlign = 'center';
                                    exportCtx.textBaseline = 'middle';
                                    
                                    // Positions X/Y basées sur les pourcentages
                                    const titleX = frontStartX + (frontWidth * bookTitleX / 100);
                                    const titleY = exportHeight * bookTitleY / 100;
                                    
                                    // Ombre
                                    exportCtx.shadowColor = 'rgba(0,0,0,0.5)';
                                    exportCtx.shadowBlur = 8;
                                    exportCtx.shadowOffsetX = 4;
                                    exportCtx.shadowOffsetY = 4;
                                    
                                    // Word wrap
                                    const maxTitleWidth = frontWidth - (safeZone * 2);
                                    wrapTextExport(exportCtx, bookTitle, titleX, titleY, maxTitleWidth, titleFontSize * 1.2);
                                    
                                    exportCtx.restore();
                                }
                                
                                // 👤 NOM DE L'AUTEUR
                                if (authorName) {
                                    exportCtx.save();
                                    exportCtx.fillStyle = authorNameColor;
                                    const authorFontSize = Math.max(24, authorNameSize * dpiScale / 3);
                                    exportCtx.font = `${authorFontSize}px ${authorNameFont}`;
                                    exportCtx.textAlign = 'center';
                                    exportCtx.textBaseline = 'middle';
                                    
                                    const authorX = frontStartX + (frontWidth * authorNameX / 100);
                                    const authorY = exportHeight * authorNameY / 100;
                                    
                                    exportCtx.shadowColor = 'rgba(0,0,0,0.5)';
                                    exportCtx.shadowBlur = 6;
                                    exportCtx.shadowOffsetX = 2;
                                    exportCtx.shadowOffsetY = 2;
                                    
                                    exportCtx.fillText(authorName, authorX, authorY);
                                    exportCtx.restore();
                                }
                                
                                // 📖 4ÈME DE COUVERTURE
                                if (backCoverText) {
                                    exportCtx.save();
                                    exportCtx.fillStyle = backCoverTextColor;
                                    const backTextFontSize = Math.max(12, backCoverTextSize * dpiScale / 3);
                                    exportCtx.font = `${backTextFontSize}px ${backCoverTextFont}`;
                                    exportCtx.textAlign = 'left';
                                    exportCtx.textBaseline = 'top';

                                    const safeLeft = backStartXExport + safeZone + (10 * dpiScale);
                                    const maxWidth = frontWidth - (safeZone * 2) - (20 * dpiScale);
                                    const textY = exportHeight * backCoverTextY / 100;

                                    wrapTextExport(exportCtx, backCoverText, safeLeft, textY, maxWidth, backTextFontSize * 1.5);
                                    exportCtx.restore();
                                }

                                // 📊 ZONE CODE-BARRE ISBN
                                if (showBarcodeZone && useCustomBarcode) {
                                    exportCtx.save();
                                    // Dimensions standards: 50.8mm x 30.5mm
                                    const barcodeWidth = 50.8 * dpiScale;
                                    const barcodeHeight = 30.5 * dpiScale;
                                    const barcodeX = bleedMargin + frontWidth - safeZone - barcodeWidth - 20;
                                    const barcodeY = exportHeight - safeZone - barcodeHeight - 20;

                                    exportCtx.fillStyle = barcodeZoneColor;
                                    exportCtx.fillRect(barcodeX, barcodeY, barcodeWidth, barcodeHeight);

                                    exportCtx.strokeStyle = '#cccccc';
                                    exportCtx.lineWidth = 2;
                                    exportCtx.strokeRect(barcodeX, barcodeY, barcodeWidth, barcodeHeight);

                                    // Si code-barres custom: dessiner le PNG (si déjà chargé)
                                    if (useCustomBarcode && barcodeImgRef.current) {
                                        const img = barcodeImgRef.current;
                                        const ratio = Math.min(barcodeWidth / img.width, barcodeHeight / img.height);
                                        const w = img.width * ratio;
                                        const h = img.height * ratio;
                                        const ix = barcodeX + (barcodeWidth - w) / 2;
                                        const iy = barcodeY + (barcodeHeight - h) / 2;
                                        exportCtx.drawImage(img, ix, iy, w, h);

                                        // ISBN optionnel en petit sous la zone
                                        if (customISBN) {
                                            exportCtx.fillStyle = '#444444';
                                            exportCtx.font = `${Math.max(10, 12 * dpiScale / 10)}px Arial`;
                                            exportCtx.textAlign = 'center';
                                            exportCtx.textBaseline = 'top';
                                            exportCtx.fillText(customISBN, barcodeX + barcodeWidth / 2, barcodeY + barcodeHeight + (4 * dpiScale / 10));
                                        }
                                    } else {
                                        // Placeholder informatif (Amazon)
                                        exportCtx.fillStyle = '#999999';
                                        exportCtx.font = `${Math.max(12, 16 * dpiScale / 10)}px Arial`;
                                        exportCtx.textAlign = 'center';
                                        exportCtx.textBaseline = 'middle';
                                        exportCtx.fillText('ISBN BARCODE', barcodeX + barcodeWidth / 2, barcodeY + barcodeHeight / 2);
                                    }

                                    exportCtx.restore();
                                }
                                
                                // Helper function pour word wrap export
                                function wrapTextExport(ctx, text, x, y, maxWidth, lineHeight) {
                                    const paragraphs = String(text || '').split('\n');

                                    paragraphs.forEach(para => {
                                        const words = para.split(' ');
                                        let line = '';

                                        for (let n = 0; n < words.length; n++) {
                                            let word = words[n];
                                            let testLine = line + word + ' ';
                                            let metrics = ctx.measureText(testLine);

                                            if (metrics.width > maxWidth && n > 0) {
                                                ctx.fillText(line.trim(), x, y);
                                                line = word + ' ';
                                                y += lineHeight;
                                            } else if (ctx.measureText(word).width > maxWidth) {
                                                // Si UN SEUL MOT est plus large que le cadre (ex: rrrrrrrr...)
                                                for (let i = 0; i < word.length; i++) {
                                                    if (ctx.measureText(line + word[i]).width > maxWidth) {
                                                        ctx.fillText(line, x, y);
                                                        line = word[i];
                                                        y += lineHeight;
                                                    } else {
                                                        line += word[i];
                                                    }
                                                }
                                                line += ' ';
                                            } else {
                                                line = testLine;
                                            }
                                        }
                                        ctx.fillText(line.trim(), x, y);
                                        y += lineHeight * 1.5; // Espace entre les paragraphes
                                    });
                                }

                                const userLevel = checkExportLimits().level;
                                const actualDPI = format === '8.5x11' ? '360' : '300';
                                // 🔒 KDP STRICT - Nom de fichier avec tous les paramètres
                                const baseFilename = `couverture-kdp-${userLevel}-${format}-${pageCount}pages-${actualDPI}dpi-${bindingType}-${paperType}-${hasBleed ? 'bleed' : 'nobleed'}`;

                                if (exportFormat === 'pdf') {
                                    try {
                                        // 🔒 KDP STRICT - Validation bloquante
                                        validateKdpStrict({
                                            format, bindingType, paperType, pageCount, hasBleed,
                                            dimensions,
                                            kdpStrictConfirmed,
                                            language
                                        });

                                        const { jsPDF } = window.jspdf;

// 🔒 Conversion dimensions mm -> points (pt)
const Wpt = mmToPt(dimensions.total.width);
const Hpt = mmToPt(dimensions.total.height);

const pdf = new jsPDF({
    orientation: (Wpt >= Hpt) ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [Wpt, Hpt],
    compress: true // Active la compression native
});

// OPTIMISATION : On ajoute le canvas DIRECTEMENT au lieu d'une image Base64
// Cela évite la saturation de la RAM sur les gros fichiers
pdf.addImage(exportCanvas, 'PNG', 0, 0, Wpt, Hpt, undefined, 'FAST');

console.log(`🔒 [KDP STRICT] Export PDF: ${Wpt.toFixed(2)}pt × ${Hpt.toFixed(2)}pt`);
pdf.save(`${baseFilename}.pdf`);

// LIBÉRATION MÉMOIRE IMMÉDIATE
exportCanvas.width = 0;
exportCanvas.height = 0;

                                        // Image placée exactement à la taille de page
                                        // Image placée exactement à la taille de page (sans base64)
                                        __gkdpSafeAddPdfImage(pdf, exportCanvas, Wpt, Hpt);
                                        

                                        console.log(`🔒 [KDP STRICT] Export PDF: ${Wpt.toFixed(2)}pt × ${Hpt.toFixed(2)}pt (${(Wpt/72).toFixed(3)}" × ${(Hpt/72).toFixed(3)}")`);

                                        pdf.save(`${baseFilename}.pdf`);
                                    } catch (err) {
                                        alert(err.message);
                                        setIsExporting(false);
                                        return;
                                    }
                                } else {
                                    const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
                                    const filename = `${baseFilename}.${exportFormat === 'jpeg' ? 'jpg' : 'png'}`;
                                    await __gkdpDownloadCanvasAsImage(exportCanvas, exportFormat, baseFilename);
                                }
                                alert(t('disclaimerExport'));

showFeedbackPrompt(document.documentElement.lang || 'en'); // feedback

                                setIsExporting(false);
                            };

                            
const processImage4K = async (imageData, box) => {
    if (!imageData?.url) {
        console.log('⚠️ [EXPORT] Image sans URL, skip');
        return;
    }
    console.log('🖼️ [EXPORT] Chargement image (cache):', imageData.url.substring(0, 50) + '...');
    const img = await __gkdpLoadImage(imageData.url);
    if (!img) {
        console.error('❌ [EXPORT] Erreur chargement image (cache miss/failed)');
        return;
    }
    exportCtx.drawImage(img, box.x, box.y, box.width, box.height);
};

                            
                            // ✅ CORRECTION FINALE : Layout KDP officiel avec bleed
                            // Le canvas total fait : totalWidth × totalHeight (avec bleed inclus)
                            // Les images DÉBORDENT dans le bleed, elles ne sont pas CONTENUES dedans
                            
                            const totalHeight = exportHeight; // Inclut déjà le bleed haut et bas
                            
                            // VERSO : commence à x=0 (déborde dans le bleed gauche)
                            const backBox = { 
                                x: 0, 
                                y: 0, 
                                width: frontWidth + bleedMargin,  // Inclut le bleed à droite du verso
                                height: totalHeight 
                            };
                            
                            // TRANCHE : au milieu (pas de bleed sur la tranche)
                            const spineBox = { 
                                x: frontWidth + bleedMargin, 
                                y: 0, 
                                width: spineWidth, 
                                height: totalHeight 
                            };
                            
                            // RECTO : commence après tranche, jusqu'au bout (déborde dans le bleed droit)
                            const frontBox = { 
                                x: frontWidth + bleedMargin + spineWidth, 
                                y: 0, 
                                width: frontWidth + bleedMargin,  // Inclut le bleed à droite du recto
                                height: totalHeight 
                            };

                            // 🎨 Fonction async pour dessiner toutes les images
                            const drawAllImages = async () => {
                                console.log('🎨 [EXPORT] Début du dessin des images...');
                                console.log('📊 [EXPORT] frontImage:', !!frontImage, 'backImage:', !!backImage, 'spineImage:', !!spineImage);
                                
                                // 🛒 FULL COVER: Si c'est un Full Cover, exporter l'image sur tout le canvas
                                if (frontImage && frontImage.isFullCover) {
                                    console.log('🛒 [EXPORT] Mode Full Cover');
                                    const fullCoverBox = {
                                        x: 0,
                                        y: 0,
                                        width: exportWidth,
                                        height: exportHeight
                                    };
                                    await processImage4K(frontImage, fullCoverBox);
                                } else {
                                    // 🎨 EXPORT: Fond personnalisé selon la zone choisie
                                    
const drawExportBackground = async (targetBox) => {
    // Dessiner la couleur de fond
    exportCtx.fillStyle = backCoverBgColor;
    exportCtx.fillRect(targetBox.x, targetBox.y, targetBox.width, targetBox.height);

    // Texture (cache) + filtre couleur éventuel
    if (backCoverTexture && backCoverTexture.url) {
        const textureImg = await __gkdpLoadImage(backCoverTexture.url);
        if (textureImg) {
            exportCtx.drawImage(textureImg, targetBox.x, targetBox.y, targetBox.width, targetBox.height);

            if (textureColorFilter) {
                exportCtx.save();
                const hexToRgba = (hex, alpha = 1.0) => {
                    try {
                        const h = String(hex || '').replace('#', '').trim();
                        const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
                        const r = (bigint >> 16) & 255;
                        const g = (bigint >> 8) & 255;
                        const b = bigint & 255;
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    } catch (e) {
                        return `rgba(0,0,0,0)`;
                    }
                };
                exportCtx.globalCompositeOperation = 'multiply';
                exportCtx.fillStyle = hexToRgba(textureColorFilter, 0.6);
                exportCtx.fillRect(targetBox.x, targetBox.y, targetBox.width, targetBox.height);
                exportCtx.restore();
            }
        }
    }
};

// Dessiner le fond si nécessaire
                                    if (backgroundApplyTo === 'full') {
                                        const fullBox = { x: backBox.x, y: backBox.y, width: backBox.width + spineBox.width + frontBox.width, height: backBox.height };
                                        await drawExportBackground(fullBox);
                                    } else if (backgroundApplyTo === 'back') {
                                        await drawExportBackground(backBox);
                                    } else if (backgroundApplyTo === 'front') {
                                        await drawExportBackground(frontBox);
                                    }

                                    // Dessiner les images selon la zone
                                    if (backgroundApplyTo === 'back') {
                                        // Back a le fond, dessiner front et spine
                                        if (frontImage) await processImage4K(frontImage, frontBox);
                                        if (dimensions.spine >= 2.0 && spineImage) await processImage4K(spineImage, spineBox);
                                    } else if (backgroundApplyTo === 'front') {
                                        // Front a le fond, dessiner back et spine
                                        if (backImage) await processImage4K(backImage, backBox);
                                        if (dimensions.spine >= 2.0 && spineImage) await processImage4K(spineImage, spineBox);
                                    } else if (backgroundApplyTo === 'full') {
                                        // Full cover - juste spine si présent
                                        if (dimensions.spine >= 2.0 && spineImage) await processImage4K(spineImage, spineBox);
                                    } else {
                                        // None - dessiner toutes les images
                                        if (backImage) await processImage4K(backImage, backBox);
                                        if (frontImage) await processImage4K(frontImage, frontBox);
                                        if (dimensions.spine >= 2.0 && spineImage) await processImage4K(spineImage, spineBox);
                                    }
                                }
                                
                                console.log('✅ [EXPORT] Toutes les images dessinées, finalisation...');
                                await finalizeExport();
                            };

                            // Lancer le dessin
                            drawAllImages();
                        }
                    } catch (error) {
                        alert(`Erreur lors de l'export: ${error.message}`);
                        setIsExporting(false);
                    }
                }, 200);
            };
            
            // 📚 EXPORT MOCKUP 3D
            const export3DMockup = async () => {
                const mockupContainer = document.getElementById('mockup-3d-export');
                if (!mockupContainer) {
                    alert(language === 'fr' ? 'Passez en mode 3D pour exporter le mockup' : 'Switch to 3D mode to export mockup');
                    return;
                }
                
                setIsExporting(true);
                
                try {
                    // Vérifier que html2canvas est chargé
                    if (typeof html2canvas === 'undefined') {
                        throw new Error('html2canvas not loaded');
                    }
                    
                    const canvas = await html2canvas(mockupContainer, {
                        backgroundColor: '#1a1a2e',
                        scale: 2, // Haute résolution
                        useCORS: true,
                        allowTaint: true,
                        logging: false
                    });
                    
                    // Télécharger l'image
                    const link = document.createElement('a');
                    const title = bookTitle || 'book';
                    const safeName = title.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
                    link.download = `${safeName}_3D_mockup.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    
                    // Incrémenter le compteur d'export si applicable
                    if (window.trackExport) window.trackExport();
                    
                } catch (error) {
                    console.error('Erreur export 3D:', error);
                    alert(language === 'fr' 
                        ? 'Erreur lors de l\'export 3D. Essayez de faire une capture d\'écran (Ctrl+Shift+S).' 
                        : '3D export error. Try taking a screenshot (Ctrl+Shift+S).');
                }
                
                setIsExporting(false);
            };

            // 🖱️ DRAG & DROP HANDLERS pour déplacer le texte sur le canvas
            const handleCanvasMouseDown = useCallback((e) => {
                if (!dimensions || !canvasRef.current) return;
                
                const canvas = canvasRef.current;
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Dimensions du canvas
                const displayWidth = 600;
                const displayHeight = 400;
                const bookWidth = displayWidth - 40;
                const bookHeight = displayHeight - 40;
                const startX = 20;
                const startY = 20;
                const scaleFactor = bookWidth / dimensions.total.width;
                const frontWidth = dimensions.format.width * scaleFactor;
                const spineWidth = dimensions.spine * scaleFactor;
                const backWidth = frontWidth;
                
                // Zone FRONT (face) - pour titre et auteur
                const frontStartX = startX + backWidth + spineWidth;
                const frontEndX = frontStartX + frontWidth;
                const endY = startY + bookHeight;
                
                // Zone BACK (dos) - pour 4ème de couverture
                const backStartX = startX;
                const backEndX = startX + backWidth;
                
                // Vérifier quel élément on touche (avec zone de tolérance)
                const tolerance = 30;
                
                // Titre (sur la face) - PRIORITÉ au texte
                if (bookTitle && x >= frontStartX && x <= frontEndX) {
                    const titleY = startY + (bookHeight * bookTitleY / 100);
                    if (Math.abs(y - titleY) < tolerance) {
                        setDraggingElement('title');
                        setDragOffset({ x: x - (frontStartX + frontWidth * bookTitleX / 100), y: y - titleY });
                        return;
                    }
                }
                
                // Auteur (sur la face)
                if (authorName && x >= frontStartX && x <= frontEndX) {
                    const authorY = startY + (bookHeight * authorNameY / 100);
                    if (Math.abs(y - authorY) < tolerance) {
                        setDraggingElement('author');
                        setDragOffset({ x: x - (frontStartX + frontWidth * authorNameX / 100), y: y - authorY });
                        return;
                    }
                }
                
                // Texte 4ème de couv (sur le dos)
                if (backCoverText && x >= backStartX && x <= backEndX) {
                    const backTextY = startY + (bookHeight * backCoverTextY / 100);
                    if (Math.abs(y - backTextY) < tolerance) {
                        setDraggingElement('backText');
                        setDragOffset({ x: x - (backStartX + backWidth * backCoverTextX / 100), y: y - backTextY });
                        return;
                    }
                }
                
                // 🖼️ DRAG IMAGE FRONT (si pas de texte touché)
                if (frontImage && x >= frontStartX && x <= frontEndX && y >= startY && y <= endY) {
                    setDraggingElement('frontImage');
                    setSelectedImage('front');
                    setDragStartPos({ x: x - frontImageOffset.x, y: y - frontImageOffset.y });
                    return;
                }
                
                // 🖼️ DRAG IMAGE BACK (4ème de couverture)
                if (backImage && x >= backStartX && x <= backEndX && y >= startY && y <= endY) {
                    setDraggingElement('backImage');
                    setSelectedImage('back');
                    setDragStartPos({ x: x - backImageOffset.x, y: y - backImageOffset.y });
                    return;
                }
                
                // 🖼️ DRAG IMAGE SPINE (tranche)
                const spineStartX = startX + backWidth;
                const spineEndX = spineStartX + spineWidth;
                if (spineImage && x >= spineStartX && x <= spineEndX && y >= startY && y <= endY) {
                    setDraggingElement('spineImage');
                    setSelectedImage('spine');
                    setDragStartPos({ x: x - spineImageOffset.x, y: y - spineImageOffset.y });
                    return;
                }
                
                // Si clic ailleurs, désélectionner
                setSelectedImage(null);
            }, [dimensions, bookTitle, bookTitleX, bookTitleY, authorName, authorNameX, authorNameY, backCoverText, backCoverTextX, backCoverTextY, frontImage, backImage, spineImage, frontImageOffset, backImageOffset, spineImageOffset]);
            
            const handleCanvasMouseMove = useCallback((e) => {
                if (!draggingElement || !dimensions || !canvasRef.current) return;
                
                const canvas = canvasRef.current;
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const displayWidth = 600;
                const displayHeight = 400;
                const bookWidth = displayWidth - 40;
                const bookHeight = displayHeight - 40;
                const startX = 20;
                const startY = 20;
                const scaleFactor = bookWidth / dimensions.total.width;
                const frontWidth = dimensions.format.width * scaleFactor;
                const spineWidth = dimensions.spine * scaleFactor;
                const backWidth = frontWidth;
                
                const frontStartX = startX + backWidth + spineWidth;
                const backStartX = startX;
                
                // 🖼️ DRAG IMAGE FRONT
                if (draggingElement === 'frontImage') {
                    setFrontImageOffset({
                        x: x - dragStartPos.x,
                        y: y - dragStartPos.y
                    });
                    return;
                }
                
                // 🖼️ DRAG IMAGE BACK
                if (draggingElement === 'backImage') {
                    setBackImageOffset({
                        x: x - dragStartPos.x,
                        y: y - dragStartPos.y
                    });
                    return;
                }
                
                // 🖼️ DRAG IMAGE SPINE
                if (draggingElement === 'spineImage') {
                    setSpineImageOffset({
                        x: x - dragStartPos.x,
                        y: y - dragStartPos.y
                    });
                    return;
                }
                
                // Calculer les nouvelles positions en pourcentage pour le TEXTE
                const xAdjusted = x - dragOffset.x;
                const yAdjusted = y - dragOffset.y;
                
                if (draggingElement === 'title') {
                    const newX = Math.max(10, Math.min(90, ((xAdjusted - frontStartX) / frontWidth) * 100));
                    const newY = Math.max(5, Math.min(95, ((yAdjusted - startY) / bookHeight) * 100));
                    setBookTitleX(newX);
                    setBookTitleY(newY);
                } else if (draggingElement === 'author') {
                    const newX = Math.max(10, Math.min(90, ((xAdjusted - frontStartX) / frontWidth) * 100));
                    const newY = Math.max(5, Math.min(95, ((yAdjusted - startY) / bookHeight) * 100));
                    setAuthorNameX(newX);
                    setAuthorNameY(newY);
                } else if (draggingElement === 'backText') {
                    const newX = Math.max(10, Math.min(90, ((xAdjusted - backStartX) / backWidth) * 100));
                    const newY = Math.max(5, Math.min(95, ((yAdjusted - startY) / bookHeight) * 100));
                    setBackCoverTextX(newX);
                    setBackCoverTextY(newY);
                }
            }, [draggingElement, dimensions, dragOffset, dragStartPos]);
            
            const handleCanvasMouseUp = useCallback(() => {
                setDraggingElement(null);
            }, []);

            // 🎯 FONCTION PRINCIPALE D'EXPORT avec gestion complète
            const getCurrentDesignData = () => {
                return {
                    format, pageCount, paperType, bindingType, coverFinish, hasBleed,
                    spineText, bookTitle, authorName, backCoverText,
                    spineColor, spineTextColor, spineTextFont,
                    bookTitleColor, bookTitleFont, bookTitleSize,
                    authorNameColor, authorNameFont, authorNameSize,
                    backCoverTextColor, backCoverTextFont, backCoverTextSize,
                    backCoverBgColor,
                    bookTitleX, bookTitleY, authorNameX, authorNameY,
                    isFullCover: !!(frontImage && frontImage.isFullCover),
                    frontImage: frontImage ? { 
                        url: frontImage.url, 
                        naturalWidth: frontImage.naturalWidth, 
                        naturalHeight: frontImage.naturalHeight,
                        isFullCover: frontImage.isFullCover,
                        isMarketplace: frontImage.isMarketplace
                    } : null,
                    backImage: backImage ? { 
                        url: backImage.url, 
                        naturalWidth: backImage.naturalWidth, 
                        naturalHeight: backImage.naturalHeight 
                    } : null,
                    templateUrl: (window.getActiveTemplateUrl ? window.getActiveTemplateUrl() : null),
                    title: (designTitle || bookTitle || 'Design').trim()
                };
            };
            
            // Exposer globalement pour la sauvegarde depuis window.gkdpSaveCurrentDesign
            window.getCurrentDesignData = getCurrentDesignData;

            const applyDesignData = (saved) => {
                if (!saved) return;
                // Paramètres livre
                if (saved.format) setFormat(saved.format);
                if (saved.pageCount) setPageCount(saved.pageCount);
                if (saved.paperType) setPaperType(saved.paperType);
                if (saved.bindingType) setBindingType(saved.bindingType);
                if (saved.coverFinish) setCoverFinish(saved.coverFinish);
                if (saved.hasBleed !== undefined) setHasBleed(saved.hasBleed);

                // Texte
                if (saved.spineText !== undefined) setSpineText(saved.spineText);
                if (saved.bookTitle !== undefined) setBookTitle(saved.bookTitle);
                if (saved.authorName !== undefined) setAuthorName(saved.authorName);
                if (saved.backCoverText !== undefined) setBackCoverText(saved.backCoverText);

                // Couleurs / polices
                if (saved.spineColor) setSpineColor(saved.spineColor);
                if (saved.spineTextColor) setSpineTextColor(saved.spineTextColor);
                if (saved.spineTextFont) setSpineTextFont(saved.spineTextFont);
                if (saved.bookTitleColor) setBookTitleColor(saved.bookTitleColor);
                if (saved.bookTitleFont) setBookTitleFont(saved.bookTitleFont);
                if (saved.bookTitleSize) setBookTitleSize(saved.bookTitleSize);
                if (saved.authorNameColor) setAuthorNameColor(saved.authorNameColor);
                if (saved.authorNameFont) setAuthorNameFont(saved.authorNameFont);
                if (saved.authorNameSize) setAuthorNameSize(saved.authorNameSize);
                if (saved.backCoverTextColor) setBackCoverTextColor(saved.backCoverTextColor);
                if (saved.backCoverTextFont) setBackCoverTextFont(saved.backCoverTextFont);
                if (saved.backCoverTextSize) setBackCoverTextSize(saved.backCoverTextSize);
                if (saved.backCoverBgColor) setBackCoverBgColor(saved.backCoverBgColor);

                // Positions
                if (saved.bookTitleX !== undefined) setBookTitleX(saved.bookTitleX);
                if (saved.bookTitleY !== undefined) setBookTitleY(saved.bookTitleY);
                if (saved.authorNameX !== undefined) setAuthorNameX(saved.authorNameX);
                if (saved.authorNameY !== undefined) setAuthorNameY(saved.authorNameY);

                // Images - charger depuis URL si nécessaire
                if (saved.frontImage && saved.frontImage.url) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        setFrontImage({
                            ...saved.frontImage,
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight
                        });
                        console.log('✅ [RESTORE] Front image loaded:', img.naturalWidth, 'x', img.naturalHeight);
                    };
                    img.onerror = (err) => {
                        console.error('❌ [RESTORE] Error loading front image:', err);
                    };
                    img.src = saved.frontImage.url;
                } else if (saved.frontImage) {
                    setFrontImage(saved.frontImage);
                }
                
                if (saved.backImage && saved.backImage.url) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        setBackImage({
                            ...saved.backImage,
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight
                        });
                        console.log('✅ [RESTORE] Back image loaded:', img.naturalWidth, 'x', img.naturalHeight);
                    };
                    img.onerror = (err) => {
                        console.error('❌ [RESTORE] Error loading back image:', err);
                    };
                    img.src = saved.backImage.url;
                } else if (saved.backImage) {
                    setBackImage(saved.backImage);
                }

                if (saved.templateUrl) window.setActiveTemplateUrl && window.setActiveTemplateUrl(saved.templateUrl);
                setDesignRestored(true);
            };

            const refreshDesignsList = () => {
                const items = window.gkdpListDesigns ? window.gkdpListDesigns() : [];
                setDesignsList(items || []);
            };

            const openDesignsModal = () => {
                refreshDesignsList();
                setDesignsModalOpen(true);
            };
            
            const openDesignById = (id) => {
                const rec = window.gkdpGetDesign ? window.gkdpGetDesign(id) : null;

                if (!rec) {
                    alert(language === 'fr' ? "Design introuvable." : "Design not found.");
                    return;
                }
                if (!rec.designData) {
                    alert(language === 'fr'
                        ? "Ce design est incomplet (données manquantes). Supprime-le et re-sauvegarde."
                        : "This design is incomplete (missing data). Delete it and save again."
                    );
                    return;
                }

                if (rec.templateUrl) window.setActiveTemplateUrl && window.setActiveTemplateUrl(rec.templateUrl);

                setActiveDesignId(rec.id);
                localStorage.setItem('gkdp_active_design_id', rec.id);
                setDesignTitle(rec.title || '');

                window.gkdpTouchDesign && window.gkdpTouchDesign(rec.id);

                applyDesignData(rec.designData);
                setDesignsModalOpen(false);
                
                console.log('✅ [DESIGN LIBRARY] Design opened:', rec.title);
            };

            const saveCurrentToLibrary = () => {
                const data = getCurrentDesignData();
                const title = (designTitle || bookTitle || 'Design').trim();
                const record = window.gkdpUpsertDesign ? window.gkdpUpsertDesign({
                    // NE PAS passer d'ID pour forcer la création d'un nouveau design
                    title,
                    templateUrl: data.templateUrl,
                    designData: data,
                    lastUsedAt: new Date().toISOString()
                }) : null;

                if (record && record.id) {
                    setActiveDesignId(record.id);
                    localStorage.setItem('gkdp_active_design_id', record.id);
                    setDesignTitle(record.title || title);
                    refreshDesignsList();
                    alert(language === 'fr' ? '✅ Design sauvegardé dans votre bibliothèque.' : '✅ Design saved to your library.');
                } else {
                    alert(language === 'fr' ? '❌ Impossible de sauvegarder le design.' : '❌ Could not save design.');
                }
            };

            const createNewDesign = () => {
                // 0) Empêcher la restauration auto au prochain mount (sinon le template/perma-save revient)
                try { sessionStorage.setItem('gkdp_skip_restore_once', '1'); } catch (e) {}

                // 1) Oublier le design actif
                setActiveDesignId(null);
                localStorage.removeItem('gkdp_active_design_id');
                setDesignTitle('');

                // 2) Effacer les sauvegardes (temp + permanente)
                try { localStorage.removeItem('gkdp_temp_design'); } catch (e) {}
                try { localStorage.removeItem('gkdp_saved_design'); } catch (e) {}
                window.clearTempDesign && window.clearTempDesign();
                window.clearPermanentDesign && window.clearPermanentDesign();

                // 3) Effacer le template actif (Marketplace) + sortir du mode preview
                window.setActiveTemplateUrl && window.setActiveTemplateUrl(null);
                setIsMarketplacePreview && setIsMarketplacePreview(false);

                // 4) Enlever ?template=... ET #template=... (si jamais il est dans le hash)
                try {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('template');

                    // Nettoyage hash
                    if (url.hash && url.hash.includes('template=')) {
                        const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
                        const hashParams = new URLSearchParams(hash);
                        hashParams.delete('template');
                        const newHash = hashParams.toString();
                        url.hash = newHash ? '#' + newHash : '';
                    }

                    window.history.replaceState({}, '', url.toString());
                } catch (e) {}

                // 5) Reset complet (UI + canvas)
                onReset && onReset();
            };

            useEffect(() => {
                if (!activeDesignId) return;
                const rec = window.gkdpGetDesign ? window.gkdpGetDesign(activeDesignId) : null;
                if (rec && rec.title && !designTitle) setDesignTitle(rec.title);
            }, [activeDesignId]);

            const handleExportClick = async () => {
                if (!dimensions) { 
                    alert(t('selectFormat')); 
                    return; 
                }
                
                // 1️⃣ VÉRIFIER SI L'UTILISATEUR EST CONNECTÉ (via Supabase OU localStorage)
                let isLoggedIn = false;
                let userEmail = localStorage.getItem('userEmail');
                
                // Double vérification: localStorage ET session Supabase
                if (userEmail) {
                    isLoggedIn = true;
                } else if (window.supabaseClient) {
                    try {
                        const { data: { session } } = await window.supabaseClient.auth.getSession();
                        if (session && session.user) {
                            isLoggedIn = true;
                            userEmail = session.user.email;
                            localStorage.setItem('userEmail', userEmail);
                            // Rafraîchir les crédits
                            if (window.refreshExportCredits) {
                                await window.refreshExportCredits();
                            }
                        }
                    } catch (e) {
                        console.log('Erreur vérification session:', e);
                    }
                }
                
                if (!isLoggedIn) {
                    // 💾 Sauvegarder le design AVANT de rediriger
                    const designData = {
                        format, pageCount, paperType, bindingType, coverFinish, hasBleed,
                        spineText, bookTitle, authorName, backCoverText,
                        spineColor, spineTextColor, spineTextFont,
                        bookTitleColor, bookTitleFont, bookTitleSize,
                        authorNameColor, authorNameFont, authorNameSize,
                        backCoverTextColor, backCoverTextFont, backCoverTextSize,
                        backCoverBgColor,
                        bookTitleX, bookTitleY, authorNameX, authorNameY,
                        // Sauvegarder aussi le mode full cover
                        isFullCover: !!(frontImage && frontImage.isFullCover),
                        frontImage: frontImage ? { 
                            url: frontImage.url, 
                            naturalWidth: frontImage.naturalWidth, 
                            naturalHeight: frontImage.naturalHeight,
                            isFullCover: frontImage.isFullCover 
                        } : null,
                        backImage: backImage ? { 
                            url: backImage.url, 
                            naturalWidth: backImage.naturalWidth, 
                            naturalHeight: backImage.naturalHeight 
                        } : null,
                    };
                    window.saveTempDesign && window.saveTempDesign(designData);
                    
                    // 🔀 Rediriger vers inscription
                    const msg = language === 'fr' 
                        ? '📝 Inscrivez-vous gratuitement pour exporter!\n\nVous recevrez 3 exports gratuits.\nVotre design sera sauvegardé.'
                        : '📝 Sign up for free to export!\n\nYou will get 3 free exports.\nYour design will be saved.';
                    alert(msg);
                    window.location.href = 'inscription.html';
                    return;
                }
                
                // 2️⃣ VÉRIFIER LES CRÉDITS
                const credits = window.getExportCredits ? window.getExportCredits() : 0;
                const isPro = localStorage.getItem('userProfile') === 'pro';
                
                if (!isPro && credits <= 0) {
                    const msg = language === 'fr'
                        ? '😢 Vous avez utilisé tous vos exports gratuits!\n\nPassez à PRO pour des exports illimités.'
                        : '😢 You have used all your free exports!\n\nUpgrade to PRO for unlimited exports.';
                    alert(msg);
                    window.location.href = 'index.html#tarifs';
                    return;
                }
                
                // 3️⃣ EXPORTER LE DESIGN
                exportImage();
                
                // 4️⃣ DÉCOMPTER LE CRÉDIT (si pas PRO)
                if (!isPro && window.decrementExportCredit) {
                    await window.decrementExportCredit();
                    // Mettre à jour l'affichage
                    const newCredits = window.getExportCredits ? window.getExportCredits() : 0;
                    setExportLimitInfo({ canExport: newCredits > 0, remaining: newCredits, level: 'free' });
                }
            };

            // 🛒 STRIPE - Gérer le paiement
            const handleStripePayment = (type) => {
                const lang = localStorage.getItem('preferredLanguage') || 'en';
                
                if (type === 'payPerExport') {
                    // Rediriger vers Stripe Pay-per-Export
                    window.open(STRIPE_LINKS.payPerExport, '_blank');
                } else if (type === 'proUnlimited') {
                    // Rediriger vers Stripe Pro Unlimited
                    window.open(STRIPE_LINKS.proUnlimited, '_blank');
                }
                
                setShowStripeModal(false);
                
                // Message d'information
                const msg = lang === 'fr'
                    ? '📧 Après le paiement, vous recevrez un email de confirmation. Rechargez cette page pour exporter.'
                    : '📧 After payment, you will receive a confirmation email. Reload this page to export.';
                alert(msg);
            };

            const resetForm = () => {
                if (confirm(t('resetForm') + '?')) {
                    onReset();
                }
            };
            
            useEffect(() => {
                window.reactSetLanguage = setLanguage;
            }, []);

            // Exposer les fonctions pour l'intégration Canva
            useEffect(() => {
                window.reactSetFrontImage = (imageData) => {
                    console.log('🎯 [REACT] setFrontImage appelé', imageData);
                    setFrontImage(imageData);
                };

                window.reactSetBackImage = (imageData) => {
                    console.log('🎯 [REACT] setBackImage appelé', imageData);
                    setBackImage(imageData);
                };

                window.reactSetSpineImage = (imageData) => {
                    console.log('🎯 [REACT] setSpineImage appelé', imageData);
                    setSpineImage(imageData);
                    setSpineImageOffset({ x: 0, y: 0 });
                    setSpineImageZoom(1.0);
                };

                return () => {
                    delete window.reactSetFrontImage;
                    delete window.reactSetBackImage;
                    delete window.reactSetSpineImage;
                };
            }, []);

            useEffect(() => {
                // Initialiser les crédits depuis localStorage
                const credits = window.getExportCredits ? window.getExportCredits() : 0;
                const isPro = localStorage.getItem('userProfile') === 'pro';
                setExportLimitInfo({ 
                    canExport: isPro || credits > 0, 
                    remaining: isPro ? Infinity : credits, 
                    level: isPro ? 'pro' : 'free' 
                });
            }, []);
            
            // 💾 STATE pour les notifications
            const [designRestored, setDesignRestored] = useState(false);
            
            // 💾 CHARGER LE DESIGN SAUVEGARDÉ AU MOUNT (temp ou permanent)
            useEffect(() => {
                const timer = setTimeout(() => {
                    // D'abord essayer de charger un design temporaire (après inscription)
                    let saved = window.loadTempDesign && window.loadTempDesign();
                    let isTemp = !!saved;

                    // Si l'utilisateur vient de cliquer sur NEW, on ignore toute restauration auto (temp/permanent)
                    try {
                        if (sessionStorage.getItem('gkdp_skip_restore_once') === '1') {
                            sessionStorage.removeItem('gkdp_skip_restore_once');
                            saved = null;
                            isTemp = false;
                        }
                    } catch (e) {}
                    
                    // Si pas de design temp, essayer le permanent (utilisateur connecté)
                    if (!saved && window.isUserLoggedIn && window.isUserLoggedIn()) {
                        saved = window.loadPermanentDesign && window.loadPermanentDesign();
                    }
                    
                    // ✅ Eviter de restaurer un ancien design sur un template différent
                    const activeTemplateUrl = (window.getActiveTemplateUrl ? window.getActiveTemplateUrl() : null);
                    if (activeTemplateUrl && saved && saved.templateUrl && saved.templateUrl !== activeTemplateUrl) {
                        console.log('💾 [RESTORE] Ignored: saved design is for another template.', saved.templateUrl, '!=', activeTemplateUrl);
                        saved = null;
                    }

                    if (saved && !isMarketplacePreview) {
                        console.log('💾 [RESTORE] Restauration du design...');
                        
                        // Restaurer les paramètres du livre
                        if (saved.format) setFormat(saved.format);
                        if (saved.pageCount) setPageCount(saved.pageCount);
                        if (saved.paperType) setPaperType(saved.paperType);
                        if (saved.bindingType) setBindingType(saved.bindingType);
                        if (saved.coverFinish) setCoverFinish(saved.coverFinish);
                        if (saved.hasBleed !== undefined) setHasBleed(saved.hasBleed);
                        
                        // Restaurer le texte
                        if (saved.spineText) setSpineText(saved.spineText);
                        if (saved.bookTitle) setBookTitle(saved.bookTitle);
                        if (saved.authorName) setAuthorName(saved.authorName);
                        if (saved.backCoverText) setBackCoverText(saved.backCoverText);
                        
                        // Restaurer les couleurs et polices
                        if (saved.spineColor) setSpineColor(saved.spineColor);
                        if (saved.spineTextColor) setSpineTextColor(saved.spineTextColor);
                        if (saved.spineTextFont) setSpineTextFont(saved.spineTextFont);
                        if (saved.bookTitleColor) setBookTitleColor(saved.bookTitleColor);
                        if (saved.bookTitleFont) setBookTitleFont(saved.bookTitleFont);
                        if (saved.authorNameColor) setAuthorNameColor(saved.authorNameColor);
                        if (saved.authorNameFont) setAuthorNameFont(saved.authorNameFont);
                        if (saved.backCoverTextColor) setBackCoverTextColor(saved.backCoverTextColor);
                        if (saved.backCoverTextFont) setBackCoverTextFont(saved.backCoverTextFont);
                        if (saved.backCoverBgColor) setBackCoverBgColor(saved.backCoverBgColor);
                        
                        // Restaurer les positions
                        if (saved.bookTitleX) setBookTitleX(saved.bookTitleX);
                        if (saved.bookTitleY) setBookTitleY(saved.bookTitleY);
                        if (saved.authorNameX) setAuthorNameX(saved.authorNameX);
                        if (saved.authorNameY) setAuthorNameY(saved.authorNameY);
                        
                        // Restaurer les images
                        if (saved.frontImage) setFrontImage(saved.frontImage);
                        if (saved.backImage) setBackImage(saved.backImage);
                        
                        setDesignRestored(true);
                        console.log('💾 [RESTORE] ✅ Design restauré!');
                        
                        // Si c'était un design temporaire, le supprimer et le sauvegarder en permanent
                        if (isTemp) {
                            // Si on n'est pas encore authentifié, on garde le temp design pour éviter toute perte après Sign Up / Login.
                            // Il sera converti en permanent dès que l'utilisateur sera connecté.
                            if (window.isUserLoggedIn && window.isUserLoggedIn()) {
                                window.clearTempDesign && window.clearTempDesign();
                                window.saveDesignPermanent && window.saveDesignPermanent(saved);
                            } else {
                                console.log("💾 [TEMP KEEP] Utilisateur non authentifié -> on conserve le design temporaire");
                            }
                        }
                    }
                    
                    // Rafraîchir les crédits depuis Supabase
                    if (window.isUserLoggedIn && window.isUserLoggedIn() && window.refreshExportCredits) {
                        window.refreshExportCredits().then(credits => {
                            const isPro = localStorage.getItem('userProfile') === 'pro';
                            setExportLimitInfo({ 
                                canExport: isPro || credits > 0, 
                                remaining: isPro ? Infinity : credits, 
                                level: isPro ? 'pro' : 'free' 
                            });
                        });
                    }
                }, 1000);
                return () => clearTimeout(timer);
            }, []);
            
            // 🛒 STRIPE PAYMENT LINKS
            const STRIPE_LINKS = {
                payPerExport: 'https://buy.stripe.com/8x228rd9b071c8afE5gUM01', // 2,50€
                proUnlimited: 'https://buy.stripe.com/cN17sLg1n2f9fkmeA1gUM03'   // 19,99€/mois
            };
            
            // Vérifier si l'utilisateur est Pro (abonné) ou UNLIMITED
            const isProUser = () => {
                const subscriptionType = localStorage.getItem('subscription_type');
                const isPro = localStorage.getItem('userProfile') === 'pro';
                const legacyPro = localStorage.getItem('gabaritkdp_pro') === 'true';
                
                // UNLIMITED = accès total, PRO = accès, ou ancien système
                return subscriptionType === 'unlimited' || subscriptionType === 'pro' || isPro || legacyPro;
            };
            
            useEffect(() => {
                if (dimensions && canvasRef.current) {
                    drawPreview();
                }
            }, [dimensions, drawPreview]);
            
            // 🎮 Gestion de l'auto-rotation 3D
            useEffect(() => {
                if (isAutoRotating) {
                    let lastTime = performance.now();
                    const animate = (time) => {
                        const delta = time - lastTime;
                        if (delta > 16) { // ~60fps cap
                            setRotationY(prev => (prev + 0.5) % 360);
                            lastTime = time;
                        }
                        animationRef.current = requestAnimationFrame(animate);
                    };
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    cancelAnimationFrame(animationRef.current);
                }
                return () => cancelAnimationFrame(animationRef.current);
            }, [isAutoRotating]);

            return (
                <div className="min-h-screen bg-gray-50">
                    {/* 💾 NOTIFICATION DE RESTAURATION */}

                    {/* 📚 DESIGN LIBRARY MODAL */}
                    {designsModalOpen && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.65)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                width: 'min(900px, 95vw)',
                                maxHeight: '85vh',
                                overflow: 'hidden',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{
                                    padding: '16px 18px',
                                    borderBottom: '1px solid #e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                }}>
                                    <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                                        <div style={{fontWeight: 800, fontSize: '16px', color:'#111827'}}>
                                            {language === 'fr' ? 'Mes designs' : 'My designs'}
                                        </div>
                                        <div style={{fontSize:'12px', color:'#6b7280'}}>
                                            {language === 'fr' ? 'Ouvrir, dupliquer ou supprimer un design.' : 'Open, duplicate, or delete a design.'}
                                        </div>
                                    </div>
                                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                        <button
                                            onClick={() => { refreshDesignsList(); }}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '10px',
                                                border: '1px solid #e5e7eb',
                                                background: 'white',
                                                cursor: 'pointer',
                                                fontWeight: 700,
                                                fontSize: '12px'
                                            }}
                                            type="button"
                                        >
                                            🔄 {language === 'fr' ? 'Rafraîchir' : 'Refresh'}
                                        </button>
                                        <button
                                            onClick={() => setDesignsModalOpen(false)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '10px',
                                                border: '1px solid #e5e7eb',
                                                background: 'white',
                                                cursor: 'pointer',
                                                fontWeight: 700,
                                                fontSize: '12px'
                                            }}
                                            type="button"
                                        >
                                            ✕ {language === 'fr' ? 'Fermer' : 'Close'}
                                        </button>
                                    </div>
                                </div>

                                <div style={{padding: '14px 18px', overflow:'auto'}}>
                                    {(!designsList || designsList.length === 0) ? (
                                        <div style={{padding:'28px 12px', textAlign:'center', color:'#6b7280'}}>
                                            {language === 'fr' ? 'Aucun design sauvegardé pour le moment.' : 'No saved designs yet.'}
                                        </div>
                                    ) : (
                                        <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'10px'}}>
                                            {designsList.map((d) => (
                                                <div 
                                                    key={d.id} 
                                                    onClick={() => openDesignById(d.id)}
                                                    style={{
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '12px',
                                                        padding: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        ':hover': {
                                                            borderColor: '#10b981',
                                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
                                                        }
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = '#10b981';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    {/* Miniature de l'image */}
                                                    {d.templateUrl && (
                                                        <div style={{
                                                            flexShrink: 0,
                                                            width: '80px',
                                                            height: '60px',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            background: '#f3f4f6',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <img 
                                                                src={d.templateUrl} 
                                                                alt={d.title || 'Design'}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = '<span style="font-size:24px">🖼️</span>';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    <div style={{minWidth:0, flex: 1}}>
                                                        <div style={{fontWeight: 800, color:'#111827', fontSize:'14px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                                            {d.title || (language === 'fr' ? 'Sans titre' : 'Untitled')}
                                                        </div>
                                                        <div style={{fontSize:'12px', color:'#6b7280'}}>
                                                            {(language === 'fr' ? 'Dernière utilisation' : 'Last used')}: {d.lastUsedAt ? new Date(d.lastUsedAt).toLocaleString() : (d.updatedAt ? new Date(d.updatedAt).toLocaleString() : '')}
                                                        </div>
                                                        <div style={{fontSize:'11px', color:'#9ca3af', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                                            {d.templateUrl ? d.templateUrl : (language === 'fr' ? 'Template: inconnu' : 'Template: unknown')}
                                                        </div>
                                                    </div>

                                                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'flex-end'}}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const rec = window.gkdpGetDesign ? window.gkdpGetDesign(d.id) : null;
                                                                if (!rec || !rec.designData) return;
                                                                const copyTitle = (rec.title || 'Design') + (language === 'fr' ? ' (copie)' : ' (copy)');
                                                                const created = window.gkdpUpsertDesign ? window.gkdpUpsertDesign({
                                                                    title: copyTitle,
                                                                    templateUrl: rec.templateUrl || null,
                                                                    designData: rec.designData,
                                                                    lastUsedAt: new Date().toISOString()
                                                                }) : null;
                                                                if (created) refreshDesignsList();
                                                            }}
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: '10px',
                                                                border: '1px solid #e5e7eb',
                                                                background: 'white',
                                                                cursor: 'pointer',
                                                                fontWeight: 800,
                                                                fontSize: '12px'
                                                            }}
                                                            type="button"
                                                        >
                                                            📄 {language === 'fr' ? 'Dupliquer' : 'Duplicate'}
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const ok = confirm(language === 'fr' ? 'Supprimer ce design ?' : 'Delete this design?');
                                                                if (!ok) return;
                                                                window.gkdpDeleteDesign && window.gkdpDeleteDesign(d.id);
                                                                if (activeDesignId === d.id) {
                                                                    setActiveDesignId(null);
                                                                    localStorage.removeItem('gkdp_active_design_id');
                                                                }
                                                                refreshDesignsList();
                                                            }}
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: '10px',
                                                                border: '1px solid #ef4444',
                                                                background: 'white',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                fontWeight: 900,
                                                                fontSize: '12px'
                                                            }}
                                                            type="button"
                                                        >
                                                            🗑️ {language === 'fr' ? 'Supprimer' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {designRestored && (
                        <div style={{
                            position: 'fixed',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 9999,
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: 'white',
                            padding: '14px 24px',
                            borderRadius: '12px',
                            boxShadow: '0 8px 25px rgba(99,102,241,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '0.95rem',
                            fontWeight: '600'
                        }}>
                            <span style={{fontSize: '1.3rem'}}>🎉</span>
                            <span>{language === 'fr' ? 'Votre design a été restauré! Cliquez sur EXPORTER pour télécharger.' : 'Your design has been restored! Click EXPORT to download.'}</span>
                            <button 
                                onClick={() => setDesignRestored(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginLeft: '8px'
                                }}
                            >OK</button>
                        </div>
                    )}
                    
                    {/* 🛒 MARKETPLACE PREVIEW BANNER */}
                    {/* Bandeau Mode Prévisualisation supprimé - déplacé sous le bouton EXPORT */}
                    
                    {/* 🛒 STRIPE PAYMENT MODAL - Désactivé pour beta testing
                    {showStripeModal && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '32px',
                                maxWidth: '500px',
                                width: '100%',
                                textAlign: 'center',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                            }}>
                                <button 
                                    onClick={() => setShowStripeModal(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        color: '#666'
                                    }}
                                >✕</button>
                                
                                <div style={{fontSize: '4rem', marginBottom: '16px'}}>💳</div>
                                <h2 style={{fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: '#1e293b'}}>
                                    {language === 'fr' ? 'Exporter ce template' : 'Export this template'}
                                </h2>
                                <p style={{color: '#64748b', marginBottom: '24px'}}>
                                    {language === 'fr' 
                                        ? 'Choisissez votre option pour télécharger l\'image HD sans watermark'
                                        : 'Choose your option to download the HD image without watermark'}
                                </p>
                                
                                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                    <button 
                                        onClick={() => handleStripePayment('payPerExport')}
                                        style={{
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: '2px solid #e2e8f0',
                                            background: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseOver={(e) => {e.currentTarget.style.borderColor = '#FF9900'; e.currentTarget.style.transform = 'scale(1.02)'}}
                                        onMouseOut={(e) => {e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'scale(1)'}}
                                    >
                                        <div style={{fontSize: '2rem'}}>📄</div>
                                        <div style={{textAlign: 'left', flex: 1}}>
                                            <div style={{fontWeight: '700', fontSize: '1.1rem', color: '#1e293b'}}>
                                                {language === 'fr' ? 'Achat unique' : 'One-time purchase'}
                                            </div>
                                            <div style={{color: '#64748b', fontSize: '0.875rem'}}>
                                                {language === 'fr' ? 'Un seul export' : 'Single export'}
                                            </div>
                                        </div>
                                        <div style={{fontWeight: '800', fontSize: '1.5rem', color: '#FF9900'}}>2,50€</div>
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleStripePayment('proUnlimited')}
                                        style={{
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: '2px solid #10b981',
                                            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            transition: 'all 0.3s',
                                            position: 'relative'
                                        }}
                                        onMouseOver={(e) => {e.currentTarget.style.transform = 'scale(1.02)'}}
                                        onMouseOut={(e) => {e.currentTarget.style.transform = 'scale(1)'}}
                                    >
                                        <span style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '16px',
                                            background: '#10b981',
                                            color: 'white',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700'
                                        }}>BEST VALUE</span>
                                        <div style={{fontSize: '2rem'}}>⭐</div>
                                        <div style={{textAlign: 'left', flex: 1}}>
                                            <div style={{fontWeight: '700', fontSize: '1.1rem', color: '#1e293b'}}>
                                                Pro Unlimited
                                            </div>
                                            <div style={{color: '#64748b', fontSize: '0.875rem'}}>
                                                {language === 'fr' ? 'Exports illimités / mois' : 'Unlimited exports / month'}
                                            </div>
                                        </div>
                                        <div style={{fontWeight: '800', fontSize: '1.5rem', color: '#10b981'}}>19,99€<span style={{fontSize: '0.875rem', fontWeight: '500'}}>/mo</span></div>
                                    </button>
                                </div>
                                
                                <p style={{marginTop: '20px', fontSize: '0.8rem', color: '#94a3b8'}}>
                                    <i className="fas fa-lock" style={{marginRight: '6px'}}></i>
                                    {language === 'fr' ? 'Paiement sécurisé par Stripe' : 'Secure payment by Stripe'}
                                </p>
                            </div>
                        </div>
                    )}
                    FIN MODAL STRIPE */}
                    
                    <div className="generator-layout">
                        <div className="sidebar sticky-left-panel">
                             <div className="sidebar-section">
                                <h2 className="sidebar-title">
                                    <i className="fas fa-book-open text-blue-500"></i>
                                    {t('howToTitle')}
                                </h2>
                                <div className="space-y-3 text-sm text-gray-700 bg-gradient-to-br from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                                    <p className="font-medium text-gray-800">{t('howToStep1')}</p>
                                    
                                    <div>
                                        <p className="font-medium text-gray-800 mb-1">{t('howToStep2')}</p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            {t('howToStep2Tip')} {' '}
                                            <a 
                                                href="https://gabaritkdp.com/marketplace.html" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="underline font-semibold hover:text-blue-800"
                                            >
                                                {t('howToStep2Link')}
                                            </a>
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <p className="font-medium text-gray-800 mb-1">{t('howToStep3')}</p>
                                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                                            {t('howToStep3Tip')}
                                        </p>
                                    </div>
                                    
                                    <p className="font-medium text-gray-800">{t('howToStep4')}</p>
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <h2 className="sidebar-title">
                                    <i className="fas fa-cog text-gray-500"></i>
                                    {t('bookSettings')}
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('bindingType')}</label>
                                        <select
                                            value={bindingType}
                                            onChange={(e) => setBindingType(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="paperback">{t('paperback')}</option>
                                            <option value="hardcover">{t('hardcover')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('kdpFormat')}</label>
                                        <select
                                            value={format}
                                            onChange={(e) => setFormat(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">{t('selectFormat')}</option>

                                            {bindingType === 'paperback' && (
                                                <optgroup label={`${t('popularSizes')}`}>
                                                    {Object.entries(kdpFormats)
                                                        .filter(([key, data]) => data.binding.includes(bindingType) && data.popular)
                                                        .map(([key, data]) => (
                                                            <option key={key} value={key}>{data.name}</option>
                                                        ))}
                                                </optgroup>
                                            )}

                                            <optgroup label={`${bindingType === 'paperback' ? t('otherSizes') : t('hardcoverFormats')}`}>
                                                {Object.entries(kdpFormats)
                                                    .filter(([key, data]) => data.binding.includes(bindingType) && !data.popular)
                                                    .map(([key, data]) => (
                                                        <option key={key} value={key}>{data.name}</option>
                                                    ))}
                                            </optgroup>
                                        </select>

                                        {format === '8.5x11' &&
                                            (
                                                <div className="format-alert-critical">
                                                    <div className="alert-title">
                                                        {t('format8511Warning')}
                                                    </div>
                                                    <div className="alert-content">
                                                        {t('format8511Message')}
                                                        <br /><br />
                                                        <strong>{t('format8511Tips')}</strong>
                                                    </div>
                                                </div>
                                            )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('pageCount')}</label>
                                        <input
                                            type="number"
                                            value={pageCount}
                                            onChange={(e) => setPageCountDebounced(parseInt(e.target.value) || 0)}
                                            min={bindingType === 'hardcover' ? 75 : 24}
                                            max={bindingType === 'hardcover' ? 550 : 828}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={hasBleed}
                                                onChange={(e) => setHasBleed(e.target.checked)}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{t('bleed')}</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('paperType')}</label>
                                        <select
                                            value={paperType}
                                            onChange={(e) => setPaperType(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {paperOptions[bindingType].map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {language === 'fr' ? option.labelFr : option.labelEn}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('coverFinish')}</label>
                                        <select
                                            value={coverFinish}
                                            onChange={(e) => setCoverFinish(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {coverFinishOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('spineText')}</label>
                                        <input
                                            type="text"
                                            value={spineText}
                                            onChange={(e) => setSpineText(e.target.value)}
                                            placeholder={bindingType === 'hardcover' ? t('spineTextAuto') : dimensions && dimensions.spine < 1.5 ? t('spineTextThin') : t('spineTextHelp')}
                                            disabled={bindingType === 'hardcover' || (dimensions && dimensions.spine < 1.5)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        />

                                        {spineText && bindingType === 'paperback' && dimensions && dimensions.spine > 1.5 && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                                                <h4 className="font-medium text-gray-700">Spine text options</h4>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('spineTextFont')}</label>
                                                        <select
                                                            value={spineTextFont}
                                                            onChange={(e) => setSpineTextFont(e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                        >
                                                            <option value="Arial">Arial</option>
                                                            <option value="Georgia">Georgia</option>
                                                            <option value="Times New Roman">Times New Roman</option>
                                                            <option value="Helvetica">Helvetica</option>
                                                            <option value="Verdana">Verdana</option>
                                                            <option value="Impact">Impact</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('spineTextSize')}</label>
                                                        <input
                                                            type="range"
                                                            min="8"
                                                            max="300"
                                                            value={spineTextSize}
                                                            onChange={(e) => setSpineTextSize(parseInt(e.target.value))}
                                                            className="w-full"
                                                        />
                                                        <div className="text-xs text-gray-500 text-center">{spineTextSize}px</div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('spineTextColor')}</label>
                                                        <div className="flex items-center space-x-3">
                                                            <input
                                                                type="color"
                                                                value={spineTextColor}
                                                                onChange={(e) => setSpineTextColor(e.target.value)}
                                                                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                                            />
                                                            <span className="text-sm text-gray-600">{spineTextColor}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 📚 COVER TEXT SECTION - Titre et Auteur */}
                                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                        <h3 className="font-bold text-purple-800 mb-4">
                                            {t('coverTextSection')}
                                        </h3>
                                        
                                        {/* Instruction drag & drop */}
                                        <div className="mb-4 p-2 bg-purple-100 rounded text-sm text-purple-700 flex items-center gap-2">
                                            <span>🖱️</span>
                                            {language === 'fr' 
                                                ? 'Glissez le texte directement sur le canvas pour le repositionner !' 
                                                : 'Drag text directly on the canvas to reposition it!'}
                                        </div>
                                        
                                        {/* Titre du livre */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookTitle')}</label>
                                            <input
                                                type="text"
                                                value={bookTitle}
                                                onChange={(e) => handleFieldChange(e, setBookTitle)}
                                                onFocus={handleFieldFocus}
                                                placeholder={t('bookTitlePlaceholder')}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            />
                                            
                                            {bookTitle && (
                                                <div className="mt-3 space-y-3">
                                                    {/* Police avec aperçu */}
                                                    <FontSelect 
                                                        value={bookTitleFont}
                                                        onChange={setBookTitleFont}
                                                        fonts={FONT_LIST}
                                                        label={t('bookTitleFont')}
                                                    />
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">{t('bookTitleSize')}: {bookTitleSize}px</label>
                                                            <input
                                                                type="range"
                                                                min="24"
                                                                max="300"
                                                                value={bookTitleSize}
                                                                onChange={(e) => setBookTitleSize(parseInt(e.target.value))}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">{t('bookTitleColor')}</label>
                                                            <input
                                                                type="color"
                                                                value={bookTitleColor}
                                                                onChange={(e) => setBookTitleColor(e.target.value)}
                                                                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Positions X et Y */}
                                                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-500">
                                                        📍 Position: X={Math.round(bookTitleX)}% Y={Math.round(bookTitleY)}%
                                                        <span className="ml-2 text-purple-600">(drag on canvas)</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Nom de l'auteur */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('authorName')}</label>
                                            <input
                                                type="text"
                                                value={authorName}
                                                onChange={(e) => handleFieldChange(e, setAuthorName)}
                                                onFocus={handleFieldFocus}
                                                placeholder={t('authorNamePlaceholder')}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            />
                                            
                                            {authorName && (
                                                <div className="mt-3 space-y-3">
                                                    {/* Police avec aperçu */}
                                                    <FontSelect 
                                                        value={authorNameFont}
                                                        onChange={setAuthorNameFont}
                                                        fonts={FONT_LIST}
                                                        label={language === 'fr' ? 'Police' : 'Font'}
                                                    />
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">{t('authorNameSize')}: {authorNameSize}px</label>
                                                            <input
                                                                type="range"
                                                                min="12"
                                                                max="300"
                                                                value={authorNameSize}
                                                                onChange={(e) => setAuthorNameSize(parseInt(e.target.value))}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">{t('authorNameColor')}</label>
                                                            <input
                                                                type="color"
                                                                value={authorNameColor}
                                                                onChange={(e) => setAuthorNameColor(e.target.value)}
                                                                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Positions X et Y */}
                                                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-500">
                                                        📍 Position: X={Math.round(authorNameX)}% Y={Math.round(authorNameY)}%
                                                        <span className="ml-2 text-purple-600">(drag on canvas)</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 📖 BACK COVER SECTION - 4ème de couverture */}
                                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                        <h3 className="font-bold text-amber-800 mb-4">
                                            {t('backCoverSection')}
                                        </h3>
                                        
                                        {/* 🎨 FOND DE LA 4ÈME DE COUVERTURE */}
                                        <div className="mb-6 p-4 bg-white rounded-lg border border-amber-200">
                                            <h4 className="font-medium text-amber-700 mb-3">
                                                {t('backCoverBgSection')}
                                            </h4>
                                            
                                            {/* Sélecteur de zone - Style Coverjig */}
                                            <div className="mb-4">
                                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                                    {language === 'fr' ? "Choisir la zone à remplir afin d'accéder à la palette de couleurs et de textures :" : "Choose the area to fill to access the color & texture palette:"}
                                                </label>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {/* None */}
                                                    <button
                                                        onClick={() => setBackgroundApplyTo('none')}
                                                        className={`p-2 rounded border-2 text-center transition-all ${backgroundApplyTo === 'none' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex justify-center gap-px mb-1">
                                                            <div className="w-3 h-5 border border-gray-300 rounded-sm"></div>


<div className="w-1 h-5 border border-gray-300"></div>
                                                            <div className="w-3 h-5 border border-gray-300 rounded-sm"></div>
                                                        </div>
                                                        <span className="text-xs">{language === 'fr' ? 'Non' : 'None'}</span>
                                                    </button>
                                                    
                                                    {/* Full Cover */}
                                                    <button
                                                        onClick={() => setBackgroundApplyTo('full')}
                                                        className={`p-2 rounded border-2 text-center transition-all ${backgroundApplyTo === 'full' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex justify-center gap-0 mb-1">
                                                            <div className="w-3 h-5 bg-amber-400 rounded-l-sm"></div>
                                                            <div className="w-1 h-5 bg-amber-400"></div>
                                                            <div className="w-3 h-5 bg-amber-400 rounded-r-sm"></div>
                                                        </div>
                                                        <span className="text-xs">Full</span>
                                                    </button>
                                                    
                                                    {/* Back Only */}
                                                    <button
                                                        onClick={() => setBackgroundApplyTo('back')}
                                                        className={`p-2 rounded border-2 text-center transition-all ${backgroundApplyTo === 'back' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex justify-center gap-px mb-1">
                                                            <div className="w-3 h-5 bg-amber-400 rounded-sm"></div>
                                                            <div className="w-1 h-5 border border-gray-300"></div>
                                                            <div className="w-3 h-5 border border-gray-300 rounded-sm"></div>
                                                        </div>
                                                        <span className="text-xs">Back</span>
                                                    </button>
                                                    
                                                    {/* Front Only */}
                                                    <button
                                                        onClick={() => setBackgroundApplyTo('front')}
                                                        className={`p-2 rounded border-2 text-center transition-all ${backgroundApplyTo === 'front' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex justify-center gap-px mb-1">
                                                            <div className="w-3 h-5 border border-gray-300 rounded-sm"></div>
                                                            <div className="w-1 h-5 border border-gray-300"></div>
                                                            <div className="w-3 h-5 bg-amber-400 rounded-sm"></div>
                                                        </div>
                                                        <span className="text-xs">Front</span>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {backgroundApplyTo !== 'none' && (
                                                <div className="space-y-4">
                                                    {/* Couleur de fond - Grille de couleurs */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-2">{t('backCoverBgColorLabel')}</label>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <input
                                                                type="color"
                                                                value={backCoverBgColor}
                                                                onChange={(e) => setBackCoverBgColor(e.target.value)}
                                                                className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                                                            />
                                                            <span className="text-xs text-gray-500">{backCoverBgColor}</span>
                                                        </div>
                                                        
                                                        {/* Grille de couleurs prédéfinies */}
                                                        <div className="grid grid-cols-10 gap-1">
                                                            {[
                                                                // Blancs et gris
                                                                '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529',
                                                                // Noirs et bruns
                                                                '#000000', '#1a1a1a', '#2d2d2d', '#3d3d3d', '#4a4a4a', '#8b4513', '#a0522d', '#cd853f', '#d2691e', '#deb887',
                                                                // Bleus
                                                                '#0d6efd', '#0dcaf0', '#6610f2', '#6f42c1', '#1e3a5f', '#2c3e50', '#34495e', '#1abc9c', '#16a085', '#17a2b8',
                                                                // Verts
                                                                '#198754', '#20c997', '#2d4a3e', '#27ae60', '#2ecc71', '#1d8348', '#145a32', '#0b5345', '#117a65', '#148f77',
                                                                // Rouges et oranges
                                                                '#dc3545', '#fd7e14', '#ffc107', '#e74c3c', '#c0392b', '#922b21', '#641e16', '#f39c12', '#d68910', '#b9770e',
                                                                // Roses et violets
                                                                '#d63384', '#e83e8c', '#9b59b6', '#8e44ad', '#7d3c98', '#6c3483', '#5b2c6f', '#4a235a', '#f1948a', '#d7bde2'
                                                            ].map(color => (
                                                                <button
                                                                    key={color}
                                                                    onClick={() => setBackCoverBgColor(color)}
                                                                    className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${backCoverBgColor === color ? 'border-amber-500 ring-2 ring-amber-300' : 'border-gray-200'}`}
                                                                    style={{ backgroundColor: color }}
                                                                    title={color}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Textures avec filtres */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-2">{t('backCoverTextureLabel')}</label>
                                                        
                                                        {/* Filtres de catégorie */}
                                                        <div className="flex flex-wrap gap-1 mb-3">
                                                            {TEXTURE_CATEGORIES.map(cat => (
                                                                <button
                                                                    key={cat.id}
                                                                    onClick={() => setTextureCategory(cat.id)}
                                                                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                                                        textureCategory === cat.id 
                                                                            ? 'bg-amber-500 text-white' 
                                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                    }`}
                                                                >
                                                                    {language === 'fr' ? cat.label : cat.labelEn}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Grille de textures filtrées */}
                                                        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
                                                            {/* Aucune texture */}
                                                            {textureCategory === 'all' && (
                                                                <button
                                                                    onClick={() => setBackCoverTexture(null)}
                                                                    className={`h-14 rounded border-2 flex items-center justify-center text-xs ${!backCoverTexture ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                                                                    title={language === 'fr' ? 'Aucune' : 'None'}
                                                                >
                                                                    ∅
                                                                </button>
                                                            )}
                                                            
                                                            {/* Textures filtrées par catégorie */}
                                                            {TEXTURE_LIST
                                                                .filter(texture => textureCategory === 'all' || texture.category === textureCategory)
                                                                .map(texture => {
                                                                    const previewCanvas = generateTexture(texture.name, 60, 50);
                                                                    const previewUrl = previewCanvas.toDataURL();
                                                                    
                                                                    return (
                                                                        <button
                                                                            key={texture.name}
                                                                            onClick={() => setBackCoverTexture({ 
                                                                                url: null, 
                                                                                name: texture.name 
                                                                            })}
                                                                            className={`h-14 rounded border-2 overflow-hidden transition-transform hover:scale-105 ${backCoverTexture?.name === texture.name ? 'border-amber-500 ring-2 ring-amber-300' : 'border-gray-200'}`}
                                                                            title={texture.title}
                                                                        >
                                                                            <img 
                                                                                src={previewUrl} 
                                                                                alt={texture.title}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </button>
                                                                    );
                                                                })
                                                            }
                                                        </div>
                                                        
                                                        {/* Nom de la texture sélectionnée */}
                                                        {backCoverTexture?.name && backCoverTexture.name !== 'custom' && (
                                                            <div className="mt-2 text-xs text-amber-600 font-medium">
                                                                ✓ {TEXTURE_LIST.find(t => t.name === backCoverTexture.name)?.title || backCoverTexture.name}
                                                            </div>
                                                        )}
                                                        
                                                        {/* 🎨 FILTRE DE COULEUR */}
                                                        {backCoverTexture?.name && backCoverTexture.name !== 'custom' && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                                                    🎨 {language === 'fr' ? 'Filtre de couleur' : 'Color Filter'}
                                                                </label>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {/* Pas de filtre */}
                                                                    <button
                                                                        onClick={() => setTextureColorFilter(null)}
                                                                        className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs ${!textureColorFilter ? 'border-amber-500 ring-1 ring-amber-300' : 'border-gray-300'}`}
                                                                        title={language === 'fr' ? 'Aucun filtre' : 'No filter'}
                                                                    >
                                                                        ∅
                                                                    </button>
                                                                    {/* Palette de couleurs pour le filtre */}
                                                                    {[
                                                                        // Rouges/Oranges
                                                                        '#ff6b6b', '#ff8c42', '#ffa502', '#ff7f50', '#e74c3c', '#c0392b',
                                                                        // Jaunes
                                                                        '#ffd93d', '#f1c40f', '#ffeaa7', '#fdcb6e',
                                                                        // Verts
                                                                        '#6bcb77', '#1dd1a1', '#00b894', '#27ae60', '#2ecc71', '#16a085',
                                                                        // Bleus/Cyans
                                                                        '#74b9ff', '#0984e3', '#00cec9', '#48dbfb', '#45aaf2', '#3498db', '#2980b9',
                                                                        // Violets/Roses
                                                                        '#a29bfe', '#6c5ce7', '#fd79a8', '#e84393', '#9b59b6', '#8e44ad',
                                                                        // Neutres
                                                                        '#dfe6e9', '#b2bec3', '#636e72', '#2d3436',
                                                                    ].map(color => (
                                                                        <button
                                                                            key={color}
                                                                            onClick={() => setTextureColorFilter(color)}
                                                                            className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${textureColorFilter === color ? 'border-amber-500 ring-1 ring-amber-300' : 'border-gray-200'}`}
                                                                            style={{ backgroundColor: color }}
                                                                            title={color}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                {textureColorFilter && (
                                                                    <div className="mt-1 text-xs text-gray-500">
                                                                        {language === 'fr' ? 'Filtre actif:' : 'Active filter:'} {textureColorFilter}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Upload personnalisé */}
                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-amber-600">
                                                                <span>📁</span>
                                                                <span>{language === 'fr' ? 'Ou importer votre propre image...' : 'Or upload your own image...'}</span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) {
                                                                            const reader = new FileReader();
                                                                            reader.onload = (event) => {
                                                                                setBackCoverTexture({
                                                                                    url: event.target.result,
                                                                                    name: 'custom'
                                                                                });
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                            
                                                            {/* Aperçu si image custom */}
                                                            {backCoverTexture?.name === 'custom' && backCoverTexture?.url && (
                                                                <div className="mt-2 relative inline-block">
                                                                    <img 
                                                                        src={backCoverTexture.url} 
                                                                        alt="Custom" 
                                                                        className="h-14 w-24 object-cover rounded border-2 border-amber-500"
                                                                    />
                                                                    <button
                                                                        onClick={() => setBackCoverTexture(null)}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-xs text-gray-500 italic">
                                                        💡 {t('backCoverBgTip')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('backCoverText')}</label>
                                            <textarea
                                                value={backCoverText}
                                                onChange={(e) => setBackCoverText(e.target.value)}
                                                placeholder={t('backCoverTextPlaceholder')}
                                                rows={4}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none"
                                            />
                                            
                                            {backCoverText && (
                                                <div className="mt-3 space-y-3">
                                                    {/* Police avec aperçu */}
                                                    <FontSelect 
                                                        value={backCoverTextFont}
                                                        onChange={setBackCoverTextFont}
                                                        fonts={FONT_LIST}
                                                        label={language === 'fr' ? 'Police du texte' : 'Text Font'}
                                                    />
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">{t('backCoverTextSize')}: {backCoverTextSize}px</label>
                                                            <input
                                                                type="range"
                                                                min="10"
                                                                max="300"
                                                                value={backCoverTextSize}
                                                                onChange={(e) => setBackCoverTextSize(parseInt(e.target.value))}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">{t('backCoverTextColor')}</label>
                                                            <input
                                                                type="color"
                                                                value={backCoverTextColor}
                                                                onChange={(e) => setBackCoverTextColor(e.target.value)}
                                                                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Positions X et Y */}
                                                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-500">
                                                        📍 Position: X={Math.round(backCoverTextX)}% Y={Math.round(backCoverTextY)}%
                                                        <span className="ml-2 text-amber-600">(drag on canvas)</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Zone code-barre ISBN */}
                                        <div className="pt-4 border-t border-amber-200">
                                            <h4 className="font-medium text-amber-700 mb-3">
                                                {t('barcodeSection')}
                                            </h4>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={showBarcodeZone}
                                                            onChange={(e) => setShowBarcodeZone(e.target.checked)}
                                                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                        />
                                                        {t('showBarcodeZone')}
                                                    </label>

                                                    {showBarcodeZone && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">{t('barcodeZoneColor')}:</span>
                                                            <input
                                                                type="color"
                                                                value={barcodeZoneColor}
                                                                onChange={(e) => setBarcodeZoneColor(e.target.value)}
                                                                className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Texte clair sous la zone (Amazon par défaut) */}
                                                {showBarcodeZone && !useCustomBarcode && (
                                                    <p className="text-xs text-gray-500">
                                                        {t('barcodeAutoNote')}
                                                    </p>
                                                )}

                                                {/* Choix Amazon vs code-barres custom */}
                                                {showBarcodeZone && (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                                                        <div className="text-sm font-medium text-amber-800">
                                                            {t('barcodeChoiceTitle')}
                                                        </div>

                                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                                            <input
                                                                type="radio"
                                                                name="barcodeMode"
                                                                checked={!useCustomBarcode}
                                                                onChange={() => setUseCustomBarcode(false)}
                                                            />
                                                            {t('barcodeModeAmazon')}
                                                        </label>

                                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                                            <input
                                                                type="radio"
                                                                name="barcodeMode"
                                                                checked={useCustomBarcode}
                                                                onChange={() => {
                                                                    setUseCustomBarcode(true);
                                                                    if (!showBarcodeZone) setShowBarcodeZone(true);
                                                                }}
                                                            />
                                                            {t('barcodeModeCustom')}
                                                        </label>

                                                        {useCustomBarcode && (
                                                            <div className="pt-2 space-y-2">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        {t('barcodeIsbnOptional')}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={customISBN}
                                                                        onChange={(e) => setCustomISBN(e.target.value)}
                                                                        placeholder="978-..."
                                                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        {t('barcodeUploadLabel')}
                                                                    </label>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/png"
                                                                        onChange={(e) => handleCustomBarcodeUpload(e.target.files?.[0])}
                                                                        className="w-full text-sm"
                                                                    />
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {t('barcodeUploadHint')}
                                                                    </p>
                                                                </div>

                                                                {customBarcodePng?.url && (
                                                                    <div className="flex items-center justify-between gap-3 bg-white rounded border border-gray-200 p-2">
                                                                        <img
                                                                            src={customBarcodePng.url}
                                                                            alt="Barcode"
                                                                            className="h-16 object-contain"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={removeCustomBarcode}
                                                                            className="text-xs text-red-600 hover:underline"
                                                                        >
                                                                            {t('barcodeRemove')}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-500">{t('barcodeZoneHelp')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {dimensions && (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h3 className="font-medium text-blue-900 mb-2">{t('calculatedDimensions')}</h3>
                                            <div className="text-sm text-blue-800 space-y-1">
                                                <div><strong>{t('totalWidth')}: {Math.round(dimensions.total.width * 10) / 10} mm</strong></div>
                                                <div><strong>{t('totalHeight')}: {Math.round(dimensions.total.height * 10) / 10} mm</strong></div>
                                                {dimensions.bindingType === 'paperback' && (
                                                    <div>
                                                        {t('spineThickness')}: {Math.round(dimensions.spine * 10) / 10} mm
                                                        {dimensions.spine < 1.5 && (
                                                            <span className="text-orange-600 ml-2">{t('thinSpine')}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* 🎨 CANVA DIMENSIONS SECTION */}
                                    {dimensions && (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                                            <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                                                <span>🎨</span> {t('canvaDimensions')}
                                            </h3>
                                            
                                            {/* Dimensions en POUCES - IMPORTANT */}
                                            <div className="bg-white p-3 rounded-lg mb-3 border border-purple-300">
                                                <div className="text-xs text-purple-600 font-medium mb-1">{t('canvaInches')}</div>
                                                <div className="text-2xl font-bold text-purple-900">
                                                    {(dimensions.total.width / 25.4).toFixed(3)}" × {(dimensions.total.height / 25.4).toFixed(3)}"
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {t('canvaInstructions')}
                                                </div>
                                            </div>

                                            {/* Bouton Copier */}
                                            <button
                                                onClick={() => {
                                                    const widthInches = (dimensions.total.width / 25.4).toFixed(3);
                                                    const heightInches = (dimensions.total.height / 25.4).toFixed(3);
                                                    const textToCopy = `${widthInches} x ${heightInches} in`;
                                                    navigator.clipboard.writeText(textToCopy).then(() => {
                                                        const btn = document.getElementById('canva-copy-btn');
                                                        const originalText = btn.innerText;
                                                        btn.innerText = t('copiedToClipboard');
                                                        btn.classList.add('bg-green-500');
                                                        btn.classList.remove('bg-purple-600');
                                                        setTimeout(() => {
                                                            btn.innerText = originalText;
                                                            btn.classList.remove('bg-green-500');
                                                            btn.classList.add('bg-purple-600');
                                                        }, 2000);
                                                    });
                                                }}
                                                id="canva-copy-btn"
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                {t('copyForCanva')}
                                            </button>

                                            {/* Alternative en mm */}
                                            <div className="mt-3 text-xs text-gray-500">
                                                <span className="font-medium">{t('canvaMM')}:</span> {Math.round(dimensions.total.width * 10) / 10} × {Math.round(dimensions.total.height * 10) / 10} mm
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <h2 className="sidebar-title">
                                    <i className="fas fa-image text-gray-500"></i>
                                    {t('images')}
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('frontImage')}</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e.target.files[0], 'front')}
                                            className="hidden"
                                            id="front-image-input"
                                        />
                                        <button
                                            onClick={() => document.getElementById('front-image-input').click()}
                                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all"
                                        >
                                            {language === 'fr' ? 'Choisir une image' : 'Choose image'}
                                        </button>
                                        {window.CanvaAuth && window.CanvaAuth.isAuthenticated() && window.CanvaDesignPicker && (
                                            <CanvaDesignPicker 
                                                onSelectImage={handleImageUpload} 
                                                imageType="front"
                                                language={language}
                                            />
                                        )}
                                        {frontImage && (
                                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                <img src={frontImage.url} alt="Face" className="w-full h-16 object-cover rounded mb-2" />
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                                    <span>{frontImage.naturalWidth}×{frontImage.naturalHeight}px</span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                                        {frontImage.quality}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2 text-center">
                                                    {language === 'fr' ? '🖱️ Cliquez sur l\'aperçu pour ajuster' : '🖱️ Click preview to adjust'}
                                                </p>
                                                <button
                                                    onClick={() => removeImage('front')}
                                                    className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                >
                                                    {t('removeImage')}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('backImage')}</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e.target.files[0], 'back')}
                                            className="hidden"
                                            id="back-image-input"
                                        />
                                        <button
                                            onClick={() => document.getElementById('back-image-input').click()}
                                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all"
                                        >
                                            {language === 'fr' ? 'Choisir une image' : 'Choose image'}
                                        </button>
                                        {window.CanvaAuth && window.CanvaAuth.isAuthenticated() && window.CanvaDesignPicker && (
                                            <CanvaDesignPicker 
                                                onSelectImage={handleImageUpload} 
                                                imageType="back"
                                                language={language}
                                            />
                                        )}
                                        {backImage && (
                                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                <img src={backImage.url} alt="Verso" className="w-full h-16 object-cover rounded mb-2" />
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                                    <span>{backImage.naturalWidth}×{backImage.naturalHeight}px</span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                                        {backImage.quality}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2 text-center">
                                                    {language === 'fr' ? '🖱️ Cliquez sur l\'aperçu pour ajuster' : '🖱️ Click preview to adjust'}
                                                </p>
                                                <button
                                                    onClick={() => removeImage('back')}
                                                    className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                >
                                                    {t('removeImage')}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {bindingType === 'paperback' && dimensions && dimensions.spine > 1.5 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('spineImage')}</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e.target.files[0], 'spine')}
                                                className="hidden"
                                                id="spine-image-input"
                                            />
                                            <button
                                                onClick={() => document.getElementById('spine-image-input').click()}
                                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all"
                                            >
                                                {language === 'fr' ? 'Choisir une image' : 'Choose image'}
                                            </button>
                                            {window.CanvaAuth && window.CanvaAuth.isAuthenticated() && window.CanvaDesignPicker && (
                                                <CanvaDesignPicker 
                                                    onSelectImage={handleImageUpload} 
                                                    imageType="spine"
                                                    language={language}
                                                />
                                            )}
                                            {spineImage && (
                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                    <img src={spineImage.url} alt="Dos" className="w-full h-16 object-cover rounded mb-2" />
                                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                                        <span>{spineImage.naturalWidth}×{spineImage.naturalHeight}px</span>
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                                            {spineImage.quality}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-2 text-center">
                                                        {language === 'fr' ? '🖱️ Cliquez sur l\'aperçu pour ajuster' : '🖱️ Click preview to adjust'}
                                                    </p>
                                                    <button
                                                        onClick={() => removeImage('spine')}
                                                        className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                    >
                                                        {t('removeImage')}
                                                    </button>
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('spineColor')}</label>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="color"
                                                        value={spineColor}
                                                        onChange={(e) => setSpineColor(e.target.value)}
                                                        className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={spineColor}
                                                        onChange={(e) => setSpineColor(e.target.value)}
                                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {bindingType === 'paperback' && dimensions && dimensions.spine > 0 && dimensions.spine <= 1.5 && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <h4 className="font-medium text-orange-900 mb-2 text-sm">
                                                {language === 'fr' ? 'Tranche fine détectée' : 'Thin spine detected'}
                                            </h4>
                                            <p className="text-orange-800 text-xs mb-3">
                                                {language === 'fr'
                                                    ?
                                                    `Épaisseur: ${Math.round(dimensions.spine * 10) / 10}mm - Tranche trop fine pour du texte ou une image. Seule la couleur de fond est recommandée.`
                                                    : `Thickness: ${Math.round(dimensions.spine * 10) / 10}mm - Spine too thin for text or image. Only background color is recommended.`
                                                }
                                            </p>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('spineColor')}</label>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="color"
                                                        value={spineColor}
                                                        onChange={(e) => setSpineColor(e.target.value)}
                                                        className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={spineColor}
                                                        onChange={(e) => setSpineColor(e.target.value)}
                                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="preview-zone">
                            <div className="preview-header">
                                <div className="preview-title">
                                    {t('preview4k')}
                                </div>

                                <div className="preview-controls">
                                    <button
                                        onClick={handleZoomOut}
                                        className="zoom-btn"
                                        title={t('zoomOut')}
                                    >
                                        -
                                    </button>

                                    <span className="text-sm font-medium text-gray-600 mx-2">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>

                                    <button
                                        onClick={handleZoomIn}
                                        className="zoom-btn"
                                        title={t('zoomIn')}
                                    >
                                        +
                                    </button>

                                    <select
                                        value={canvasQuality}
                                        onChange={(e) => setCanvasQuality(e.target.value)}
                                        className="ml-3 px-3 py-1 border border-gray-300 rounded text-sm"
                                        title={language === 'fr' ? 'Qualité d\'export' : 'Export quality'}
                                    >
                                        <option value="Standard">Standard (300 DPI)</option>
                                        <option value="4K">4K Ultra HD (400 DPI)</option>
                                        <option value="8K">8K Pro (600 DPI)</option>
                                    </select>
                                    
                                    {/* Toggle 2D / 3D */}
                                    <div className="view-toggle ml-3">
                                        <button 
                                            className={viewMode === '2d' ? 'active' : ''}
                                            onClick={() => setViewMode('2d')}
                                        >
                                            2D
                                        </button>
 <button
  className={viewMode === '3d' ? 'active' : ''}
  onClick={async () => {
    try {
      if (window.ensureThree) {
        await window.ensureThree();
      }
      setViewMode('3d');
    } catch (e) {
      console.error('Three.js load failed:', e);
      alert("Le mode 3D n'a pas pu se charger. Vérifie ta connexion puis réessaie.");
    }
  }}
>
  3D
</button>




                                    </div>

                                    <button
                                        onClick={resetForm}
                                        className="ml-2 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                        title={t('resetForm')}
                                    >
                                        🔄
                                    </button>
                                </div>
                            </div>

                            <div className="canvas-container">
                                {/* Mode 2D - Canvas classique */}
                                {viewMode === '2d' && (
                                    <>
                                        {dimensions && dimensions.bindingType === 'paperback' && (
                                            <div className="position-labels">
                                                <span>← BACK</span>
                                                <span>SPINE</span>
                                                <span>FRONT →</span>
                                            </div>
                                        )}

                                        <div className="quality-indicator">
                                            {canvasQuality === 'Standard' ? '300 DPI' : canvasQuality === '4K' ? '4K' : '8K'}
                                        </div>

                                        {dimensions ?
                                            (
                                                <React.Fragment key="canvas-active">
                                                    <canvas
                                                        ref={canvasRef}
                                                        className="canvas-4k"
                                                        style={{ cursor: draggingElement ? 'grabbing' : ((bookTitle || authorName || backCoverText || frontImage || backImage || spineImage) ? 'grab' : 'default') }}
                                                        onMouseDown={handleCanvasMouseDown}
                                                        onMouseMove={handleCanvasMouseMove}
                                                        onMouseUp={handleCanvasMouseUp}
                                                        onMouseLeave={handleCanvasMouseUp}
                                                    />
                                                    
                                                    {/* 📍 Instructions drag & drop */}
                                                    {(bookTitle || authorName || backCoverText || frontImage || backImage || spineImage) && (
                                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                            🖱️ {language === 'fr' ? 'Glissez texte ou images pour repositionner' : 'Drag text or images to reposition'}
                                                        </div>
                                                    )}

                                                    <div className="dimensions-overlay">
                                                        {Math.round(dimensions.total.width)}×{Math.round(dimensions.total.height)}mm | {canvasQuality === 'Standard' ? '300 DPI' : canvasQuality === '4K' ? '400 DPI' : '600 DPI'}
                                                        {format === '8.5x11' && (
                                                            <div className="text-orange-300 text-xs mt-1">
                                                                ⚠️ FORMAT COMPLEXE
                                                            </div>
                                                        )}
                                                    </div>
                                                </React.Fragment>
                                            ) : (
                                                <div key="canvas-placeholder" className="text-center py-20 text-gray-500">
                                                    <div className="text-6xl mb-4">📖</div>
                                                    <h3 className="text-xl font-semibold mb-2">
                                                        {language === 'fr' 
                                                            ? `Aperçu ${canvasQuality === 'Standard' ? 'Standard' : canvasQuality === '4K' ? '4K Ultra HD' : '8K Pro'}` 
                                                            : `${canvasQuality === 'Standard' ? 'Standard' : canvasQuality === '4K' ? '4K Ultra HD' : '8K Pro'} Preview`}
                                                    </h3>
                                                    <p className="text-gray-400 mb-4">
                                                        {language === 'fr' ? 'Sélectionnez un format pour voir l\'aperçu' : 'Select a format to see preview'}
                                            </p>

                                            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 mx-auto max-w-md">
                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    <div className="bg-gray-200 h-20 rounded flex items-center justify-center text-xs">BACK</div>
                                                    <div className="bg-gray-300 h-20 rounded flex items-center justify-center text-xs">SPINE</div>
                                                    <div className="bg-gray-200 h-20 rounded flex items-center justify-center text-xs">FRONT</div>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {language === 'fr' ? 'Modèle de couverture KDP' : 'KDP Cover Template'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    </>
                                )}
                                
                                {/* 🎛️ BARRE DE CONTRÔLE IMAGE - Zoom & Position */}
                                {viewMode === '2d' && selectedImage && dimensions && (
                                    <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-700">
                                                    🖼️ {selectedImage === 'front' ? (language === 'fr' ? 'Image Face' : 'Front Image') : 
                                                        selectedImage === 'back' ? (language === 'fr' ? 'Image Verso' : 'Back Image') : 
                                                        (language === 'fr' ? 'Image Tranche' : 'Spine Image')}
                                                </span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                    {selectedImage === 'front' ? `${Math.round(frontImageZoom * 100)}%` :
                                                     selectedImage === 'back' ? `${Math.round(backImageZoom * 100)}%` :
                                                     `${Math.round(spineImageZoom * 100)}%`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        if (selectedImage === 'front') { setFrontImageZoom(1.0); setFrontImageOffset({x:0, y:0}); }
                                                        if (selectedImage === 'back') { setBackImageZoom(1.0); setBackImageOffset({x:0, y:0}); }
                                                        if (selectedImage === 'spine') { setSpineImageZoom(1.0); setSpineImageOffset({x:0, y:0}); }
                                                    }}
                                                    className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                                                >
                                                    ↺ Reset
                                                </button>
                                                <button 
                                                    onClick={() => setSelectedImage(null)}
                                                    className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-500 w-8">50%</span>
                                            <input 
                                                type="range" 
                                                min="0.5" 
                                                max="3" 
                                                step="0.05" 
                                                value={selectedImage === 'front' ? frontImageZoom : selectedImage === 'back' ? backImageZoom : spineImageZoom}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (selectedImage === 'front') setFrontImageZoom(val);
                                                    if (selectedImage === 'back') setBackImageZoom(val);
                                                    if (selectedImage === 'spine') setSpineImageZoom(val);
                                                }}
                                                className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                                style={{ accentColor: '#FF9900' }}
                                            />
                                            <span className="text-xs text-gray-500 w-10">300%</span>
                                        </div>
                                        
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            {language === 'fr' 
                                                ? '🖱️ Glissez l\'image sur l\'aperçu pour la repositionner' 
                                                : '🖱️ Drag the image on preview to reposition'}
                                        </p>
                                    </div>
                                )}
                                
                                {/* 🎬 Mode 3D - THREE.JS MOCKUP */}
                                {viewMode === '3d' && (
                                    <div id="mockup-3d-wrapper" style={{
                                        width: '100%',
                                        minHeight: '550px',
                                        background: 'linear-gradient(135deg, #0d0f14 0%, #1a1d23 100%)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {dimensions && (frontImage || backImage || backCoverTexture) ? (
                                            <React.Fragment>
                                                {/* Container Three.js */}
                                                <div 
                                                    id="threejs-container" 
                                                    style={{width: '100%', height: '420px'}}
                                                    ref={(el) => {
                                                        if (el && !el.dataset.init && window.initBook3D) {
                                                            el.dataset.init = 'true';
                                                            setTimeout(() => {
                                                                // ✅ Fallback: si aucune image importée, on snapshot le canvas 2D (couverture complète)
                                                                const snapshot = (() => {
                                                                    try {
                                                                        return canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
                                                                    } catch (e) {
                                                                        console.warn('3D snapshot failed (tainted canvas?)', e);
                                                                        return null;
                                                                    }
                                                                })();

                                                                const isUsingSnapshot = !frontImage?.url && !!snapshot;
                                                                const isFullCoverFinal = (frontImage?.isFullCover === true) || isUsingSnapshot;
                                                                const coverUrlFinal = frontImage?.url || snapshot || null;
                                                                const backUrlFinal = isFullCoverFinal ? null : (backImage?.url || null);

                                                                window.initBook3D(el, {
                                                                    coverUrl: coverUrlFinal,
                                                                    backUrl: backUrlFinal,
                                                                    spineColor: spineColor || '#222222',
                                                                    bookWidth: dimensions.format.width,
                                                                    bookHeight: dimensions.format.height,
                                                                    spineWidth: dimensions.spine,
                                                                    isFullCover: isFullCoverFinal
                                                                });
                                                            }, 50);
                                                        }
                                                    }}
                                                ></div>
                                                
                                                {/* Contrôles 3D */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    gap: '15px',
                                                    padding: '15px',
                                                    background: 'rgba(0,0,0,0.5)',
                                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    {/* Presets de vue */}
                                                    <div style={{display:'flex', gap:'8px'}}>
                                                        {['Perspective', 'Flat', 'Standing'].map(style => (
                                                            <button
                                                                key={style}
                                                                onClick={() => {
                                                                    if (window.setBook3DPreset) window.setBook3DPreset(style.toLowerCase());
                                                                }}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    borderRadius: '20px',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    background: 'rgba(255,255,255,0.15)',
                                                                    color: '#fff',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseOver={(e) => e.target.style.background = '#FF9900'}
                                                                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                                                            >
                                                                {style}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Bouton Export PNG */}
                                                    <button
                                                        onClick={() => {
                                                            if (window.exportBook3DPNG) window.exportBook3DPNG();
                                                            else alert(language === 'fr' ? 'Mockup 3D non initialisé' : '3D Mockup not initialized');
                                                        }}
                                                        style={{
                                                            padding: '8px 20px',
                                                            borderRadius: '20px',
                                                            border: '2px solid #10B981',
                                                            cursor: 'pointer',
                                                            background: 'transparent',
                                                            color: '#10B981',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        📸 Export PNG
                                                    </button>
                                                </div>
                                                
                                                <p style={{
                                                    color: '#6B7280',
                                                    fontSize: '11px',
                                                    textAlign: 'center',
                                                    padding: '8px',
                                                    margin: 0
                                                }}>
                                                    {language === 'fr' 
                                                        ? '🖱️ Glissez pour faire pivoter • Molette pour zoomer' 
                                                        : '🖱️ Drag to rotate • Scroll to zoom'}
                                                </p>
                                            </React.Fragment>
                                        ) : (
                                            <div className="text-center text-white opacity-50" style={{padding: '150px 20px'}}>
                                               <div className="text-6xl mb-4">📚</div>
                                               <p>{language === 'fr' ? 'Chargez une couverture pour voir le mockup 3D' : 'Load a cover to see the 3D mockup'}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {dimensions && (
                                <div className="flex justify-center items-center space-x-6 mt-3 text-xs text-gray-700 p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-4 h-0 border-t-2 border-blue-500 border-dashed mr-2"></div>
                                        <span>{t('legendTrim')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-4 h-0 border-t-2 border-red-500 border-dashed mr-2"></div>
                                        <span>{t('legendSafeZone')}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col items-center">
                                <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm max-w-md w-full">
                                    <h4 className="font-semibold text-gray-800 mb-3 text-center">
                                        📁 {t('exportFormat')}
                                    </h4>

                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="exportFormat"
                                                value="pdf"
                                                checked={exportFormat === 'pdf'}
                                                onChange={(e) => setExportFormat(e.target.value)}
                                                className="text-orange-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">{t('formatPDF')}</div>
                                                <div className="text-xs text-gray-500">
                                                    {language === 'fr' ? 'Format standard pour Amazon KDP' : 'Standard format for Amazon KDP'}
                                                </div>
                                            </div>
                                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                ⭐
                                            </span>
                                        </label>

                                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="exportFormat"
                                                value="png"
                                                checked={exportFormat === 'png'}
                                                onChange={(e) => setExportFormat(e.target.value)}
                                                className="text-blue-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">{t('formatPNG')}</div>
                                                <div className="text-xs text-gray-500">
                                                    {language === 'fr' ? 'Excellente qualité, accepté par Amazon' : 'Excellent quality, accepted by Amazon'}
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="exportFormat"
                                                value="jpeg"
                                                checked={exportFormat === 'jpeg'}
                                                onChange={(e) => setExportFormat(e.target.value)}
                                                className="text-green-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">{t('formatJPEG')}</div>
                                                <div className="text-xs text-gray-500">
                                                    {language === 'fr' ? 'Fichier plus léger, bonne qualité' : 'Smaller file, good quality'}
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    {exportFormat === 'pdf' && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-xs text-blue-800">
                                                <span className="font-semibold">💡 Info PDF :</span> Le PDF sera généré directement, en utilisant l'image haute définition.
                                            </p>
                                        </div>
                                    )}

                                    {format === '8.5x11' && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-xs text-red-800">
                                                <span className="font-semibold">⚠️ Format 8.5×11" :</span>
                                                {language === 'fr' 
                                                    ? ' Exporté en 360 DPI pour ce format complexe. Vérifiez le PDF final.'
                                                    : ' Exported at 360 DPI for this complex format. Please check the final PDF.'
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* 🔒 KDP STRICT - Checkbox de confirmation obligatoire */}
                                    {exportFormat === 'pdf' && (
                                        <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={kdpStrictConfirmed}
                                                    onChange={(e) => setKdpStrictConfirmed(e.target.checked)}
                                                    className="mt-1 w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                                                />
                                                <span className="text-sm text-amber-900">
                                                    <strong>🔒 KDP Strict :</strong> {language === 'fr' 
                                                        ? `Je confirme que les paramètres KDP de mon livre correspondent EXACTEMENT : ${(kdpFormats[format]?.name || format)}, ${pageCount} pages${(isMarketplacePreview && String(pageCount) === '100') ? ' (valeur par défaut, modifiable)' : ''}, ${bindingType === 'paperback' ? 'Broché' : 'Relié'}, ${(paperOptions[bindingType]?.find(o => o.value === paperType)?.labelFr || paperType)}, ${hasBleed ? 'avec fond perdu' : 'sans fond perdu'}. Sinon KDP rejettera la couverture.`
                                                        : `I confirm that my KDP book parameters EXACTLY match: ${(kdpFormats[format]?.name || format)}, ${pageCount} pages${(isMarketplacePreview && String(pageCount) === '100') ? ' (default value, editable)' : ''}, ${bindingType === 'paperback' ? 'Paperback' : 'Hardcover'}, ${(paperOptions[bindingType]?.find(o => o.value === paperType)?.labelEn || paperType)}, ${hasBleed ? 'with bleed' : 'without bleed'}. Otherwise KDP will reject the cover.`
                                                    }
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* 📚 Design Library controls */}
                                {viewMode === '2d' && (
                                    <div className="flex flex-col gap-2 items-center mb-3">
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <button
                                                onClick={saveCurrentToLibrary}
                                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:shadow"
                                                type="button"
                                            >
                                                💾 {language === 'fr' ? 'Sauvegarder' : 'Save'}
                                            </button>
                                            <button
                                                onClick={openDesignsModal}
                                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:shadow"
                                                type="button"
                                            >
                                                📚 {language === 'fr' ? 'Mes designs' : 'My designs'}
                                            </button>
                                            <button
                                                onClick={createNewDesign}
                                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:shadow"
                                                type="button"
                                            >
                                                ➕ {language === 'fr' ? 'Nouveau' : 'New'}
                                            </button>
                                        </div>
                                        <div className="w-full max-w-md">
                                            <input
                                                value={designTitle}
                                                onChange={(e) => setDesignTitle(e.target.value)}
                                                placeholder={language === 'fr' ? 'Nom du design (optionnel)' : 'Design name (optional)'}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Bouton Export 2D classique */}
                                {viewMode === '2d' && (
                                    <button
                                        onClick={handleExportClick}
                                        disabled={!dimensions || isExporting || (exportFormat === 'pdf' && !kdpStrictConfirmed)}
                                        className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${
                                            isExporting
                                                ? 'bg-purple-500 cursor-wait scale-95'
                                                : !dimensions || (exportFormat === 'pdf' && !kdpStrictConfirmed)
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : format === '8.5x11'
                                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                                                        : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
                                        }`}
                                    >
                                        <span className="text-2xl">💾</span>
                                        <span>
                                            {isExporting 
                                                ? t('generating') 
                                                : !window.isUserLoggedIn || !window.isUserLoggedIn()
                                                    ? (language === 'fr' ? 'EXPORTER (Inscription gratuite)' : 'EXPORT (Free signup)')
                                                    : exportLimitInfo.level === 'pro'
                                                        ? t('exportDesign') + ' ∞'
                                                        : `${t('exportDesign')} (${exportLimitInfo.remaining} ${language === 'fr' ? 'restant' : 'left'})`
                                            }
                                        </span>
                                    </button>
                                )}
                                
                                {/* Texte Mode Prévisualisation sous le bouton EXPORT */}
                                {isMarketplacePreview && (
                                    <div style={{
                                        marginTop: '12px',
                                        textAlign: 'center',
                                        color: '#FF9900',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{fontSize: '1.2rem'}}>🎨</span>
                                        <span>{language === 'fr' ? 'Mode Prévisualisation - Exportez pour obtenir l\'image HD sans watermark' : 'Preview Mode - Export to get HD image without watermark'}</span>
                                    </div>
                                )}
                                
                                {/* Boutons Export 3D - THREE.JS */}
                                {viewMode === '3d' && (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => {
                                                if (window.exportBook3DPNG) {
                                                    window.exportBook3DPNG();
                                                } else {
                                                    alert(language === 'fr' ? 'Mockup 3D non initialisé' : '3D Mockup not initialized');
                                                }
                                            }}
                                            disabled={!dimensions || !(frontImage || backImage || backCoverTexture)}
                                            className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${
                                                !dimensions || !(frontImage || backImage || backCoverTexture)
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                                            }`}
                                        >
                                            <span className="text-2xl">📸</span>
                                            <span>
                                                {language === 'fr' ? 'Exporter Mockup 3D (PNG)' : 'Export 3D Mockup (PNG)'}
                                            </span>
                                        </button>
                                        
                                        <p className="text-xs text-gray-500 text-center">
                                            {language === 'fr' 
                                                ? '🎬 Export PNG haute résolution avec Three.js'
                                                : '🎬 High resolution PNG export with Three.js'}
                                        </p>
                                        
                                        {/* Bouton pour revenir à l'export 2D */}
                                        <button
                                            onClick={() => setViewMode('2d')}
                                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                                        >
                                            {language === 'fr' ? '← Revenir au mode 2D pour exporter PDF/PNG' : '← Back to 2D mode for PDF/PNG export'}
                                        </button>
                                    </div>
                                )}
                                
                                {/* Affichage de la résolution finale */}
                                {dimensions && viewMode === '2d' && (
                                    <div className="mt-2 text-xs text-gray-500 text-center">
                                        📐 {Math.round(dimensions.total.width * (canvasQuality === 'Standard' ? 11.811 : canvasQuality === '4K' ? 15.748 : 23.622))} × {Math.round(dimensions.total.height * (canvasQuality === 'Standard' ? 11.811 : canvasQuality === '4K' ? 15.748 : 23.622))} px
                                        <span className="ml-2 text-amber-600 font-medium">
                                            ({canvasQuality === 'Standard' ? '300' : canvasQuality === '4K' ? '400' : '600'} DPI)
                                        </span>
                                    </div>
                                )}

                                <div className="mt-4 max-w-lg text-center">
                                    <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                        <span className="font-medium">{t('disclaimerExport')}</span>
                                        <br />
                                        <span className="text-orange-600">{t('technicalOnly')}</span> • <span className="text-blue-600">{t('contentResponsibility')}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar">
                            <div className="sidebar-section">
                                <div className="mb-3">
                                    <h2 className="sidebar-title">
                                        <i className="fas fa-palette text-purple-500"></i>
                                        {t('canvaImport')}
                                    </h2>
                                    <p className="text-xs text-purple-600 bg-purple-50 border border-purple-200 rounded px-2 py-1 inline-block">
                                        {t('canvaComingSoon')}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-4xl mb-3">🎨</div>
                                        <h3 className="font-bold text-purple-900 mb-2">
                                            {t('canvaTitle')}
                                        </h3>
                                        <p className="text-sm text-purple-800 mb-4 leading-relaxed">
                                            {t('canvaDescription')}
                                        </p>
                                        {(window.CanvaAuth && window.CanvaAuth.isAuthenticated && window.CanvaAuth.isAuthenticated()) ? (
                                            <div className="space-y-2">
                                                <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                                                    ✅ {language === 'fr' ? 'Connecté à Canva' : 'Connected to Canva'}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const ok = confirm(language === 'fr'
                                                            ? 'Se déconnecter de Canva ?'
                                                            : 'Disconnect from Canva?');
                                                        if (!ok) return;
                                                        try {
                                                            if (window.CanvaAuth) window.CanvaAuth.logout();
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                        // Refresh UI (simple & reliable)
                                                        window.location.reload();
                                                    }}
                                                    className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg"
                                                >
                                                    {t('canvaDisconnectButton')}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    console.log('🔘 Bouton Canva cliqué');
                                                    if (window.CanvaAuth) {
                                                        window.CanvaAuth.initiateConnection();
                                                    } else {
                                                        alert('Fonctionnalité en cours de développement. Revenez bientôt ! 🚀');
                                                    }
                                                }}
                                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                            >
                                                {t('canvaConnectButton')}
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-500 mt-3">
                                            {t('canvaAvailabilitySoon')}
                                        </p>
                                    </div>
                                </div>

                                {/* Debug info - will be hidden in production */}
                                {false && (
                                    <div className="mt-2 text-xs text-gray-400">
                                        <p>Debug:</p>
                                        <p>CanvaAuth: {typeof window.CanvaAuth !== 'undefined' ? '✅ Chargé' : '❌ Non chargé'}</p>
                                        <p>CanvaDesigns: {typeof window.CanvaDesigns !== 'undefined' ? '✅ Chargé' : '❌ Non chargé'}</p>
                                    </div>
                                )}

                                {/* Container for Canva designs grid */}
                                <div id="canva-designs-container" className="mt-4" style={{minHeight: '100px'}}>
                                    {/* La grille Canva sera injectée ici par canva-designs-fetcher.js */}
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <div className="validation-smart">
                                    <div className="validation-header">
                                        <span className="text-xl">🎯</span>
                                        <h2 className="font-bold text-lg">{t('analysisTitle')}</h2>
                                    </div>

                                    <div className="validation-score">
                                        {(frontImage || backImage || dimensions) ? (
                                            <div>
                                                <div className={getScoreClass(overallScore)}>
                                                    <div className="font-bold text-lg">{getScoreLabel(overallScore).label}</div>
                                                    <div className="text-sm opacity-90">{getScoreLabel(overallScore).subtitle}</div>
                                                    <div className="text-xs mt-2 opacity-75">Score: {overallScore}/25</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="no-analysis">
                                                <div className="text-4xl mb-3">📊</div>
                                                <h3 className="font-semibold text-gray-700 mb-2">{t('analysisTitle')}</h3>
                                                <p className="text-sm text-gray-500">{t('noImagesYet')}</p>
                                            </div>
                                        )}
                                    </div>

                                    {warnings.length > 0 && (
                                        <div className="validation-alerts">
                                            {warnings.map((warning, index) => (
                                                <div key={index} className={`alert-item alert-${warning.type}`}>
                                                    <div className="alert-icon">
                                                        {warning.type === 'excellent' && '🏆'}
                                                        {warning.type === 'good' && '✅'}
                                                        {warning.type === 'warning' && '⚠️'}
                                                        {warning.type === 'critical' && '❌'}
                                                        {warning.type === 'info' && 'ℹ️'}
                                                    </div>
                                                    <div className="flex-1">
                                                        {warning.message}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="validation-tips">
                                        <div className="tips-title">
                                            <span>💡</span>
                                            {t('kdpTips')}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="tip-item">
                                                <span>📖</span>
                                                <span>{t('tipFormat')}</span>
                                            </div>

                                            <div className="tip-item">
                                                <span>🖼️</span>
                                                <span>{t('tipBleed')}</span>
                                            </div>

                                            <div className="tip-item">
                                                <span>📏</span>
                                                <span>{t('tipSpine')}</span>
                                            </div>

                                            <div className="tip-item">
                                                <span>✨</span>
                                                <span>{t('tipResolution')}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-300">
                                            <div className="tips-title">
                                                <span>⚠️</span>
                                                <span>{t('disclaimer')}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                {t('disclaimerShort')}
                                            </p>
                                            <details className="mt-2">
                                                <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                                                    {language === 'fr' ? 'Voir les détails' : 'See details'}
                                                </summary>
                                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                                    {t('disclaimerFull')}
                                                </p>
                                            </details>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        
        const AppContainer = () => {
            const [key, setKey] = useState(0); 
            return <KDPCoverGenerator key={key} onReset={() => setKey(prevKey => prevKey + 1)} />;
        }

        
  