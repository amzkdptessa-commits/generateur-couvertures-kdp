<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>GabaritKDP - Dashboard 12 Mois</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background-color: #0f172a; color: white; font-family: sans-serif; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; }
        .accent { color: #f97316; }
    </style>
</head>
<body class="p-6">
    <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-10">
            <h1 class="text-3xl font-bold">Rapport de Ventes <span class="accent">12 Mois</span></h1>
            <div class="text-right">
                <p id="syncTime" class="text-xs text-gray-500 mb-2">Dernière synchro : --</p>
                <button onclick="loadRealData()" class="bg-orange-600 px-6 py-2 rounded font-bold hover:bg-orange-700 transition">
                    <i class="fas fa-sync"></i> ACTUALISER
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div class="card text-center">
                <h4 class="text-gray-400 text-xs uppercase">Ventes Totales</h4>
                <div class="text-4xl font-bold" id="totalSales">0</div>
            </div>
            <div class="card text-center">
                <h4 class="text-gray-400 text-xs uppercase">Royalties Est.</h4>
                <div class="text-4xl font-bold accent" id="totalRoyalties">0.00 €</div>
            </div>
            <div class="card text-center">
                <h4 class="text-gray-400 text-xs uppercase">Livres</h4>
                <div class="text-4xl font-bold" id="bookCount">0</div>
            </div>
            <div class="card text-center">
                <h4 class="text-gray-400 text-xs uppercase">Top Pays</h4>
                <div class="text-4xl font-bold text-blue-400" id="topMarket">--</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 card">
                <h3 class="font-bold mb-4">Ventes par livre (Détail Annuel)</h3>
                <table class="w-full text-left">
                    <thead class="text-gray-500 border-b border-gray-700">
                        <tr><th class="pb-2">Titre</th><th class="pb-2">Ventes</th><th class="pb-2">Pays</th></tr>
                    </thead>
                    <tbody id="booksList" class="divide-y divide-gray-800">
                        <!-- Données réelles ici -->
                    </tbody>
                </table>
            </div>
            <div class="card">
                <h3 class="font-bold mb-4 text-center">Répartition par Pays</h3>
                <canvas id="marketChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        const SB_URL = 'https://bgcspojhiupcrpzlkwax.supabase.co';
        const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY3Nwb2poaXVwY3Jwemxrd2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Nzc1NjUsImV4cCI6MjA4MDM1MzU2NX0.8-kcGquwHwv8BCFYZtWu1Op7TLMIfWjXghES2IwJl7Q';
        const sb = window.supabase.createClient(SB_URL, SB_KEY);

        async function loadRealData() {
            const { data, error } = await sb.from('kdp_reports').select('*').eq('user_email', 'peacestreet@hotmail.com').order('created_at', { ascending: false });
            if (data && data.length > 0) {
                const report = data[0];
                document.getElementById('syncTime').textContent = "Dernière synchro : " + new Date(report.created_at).toLocaleString();
                
                // Ici on extrait les livres du rapport d'Amazon (payload.stats)
                // Amazon renvoie souvent une liste d'objets dans 'entries' ou 'sales'
                const books = report.payload.stats?.sales || [];
                const list = document.getElementById('booksList');
                list.innerHTML = '';
                
                if(books.length === 0) {
                    list.innerHTML = '<tr><td colspan="3" class="py-10 text-center text-gray-500">Synchronisez votre extension sur Amazon KDP pour voir les livres ici.</td></tr>';
                }

                books.forEach(b => {
                    list.innerHTML += `<tr class="hover:bg-gray-800/50"><td class="py-3">${b.title}</td><td>${b.units}</td><td>${b.marketplace}</td></tr>`;
                });
            }
        }
        window.onload = loadRealData;
    </script>
</body>
</html>