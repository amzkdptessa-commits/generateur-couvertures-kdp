import express from 'express';

const app = express();
const port = 3000; // Vous pouvez choisir un autre port si besoin

// Route de test pour /auth/callback
app.get('/auth/callback', (req, res) => {
  // On récupère le paramètre "code" de l'URL (ex: ?code=ABCDE12345)
  const { code } = req.query;

  if (code) {
    // Si on a bien reçu le code, on l'affiche
    console.log('Code d\'autorisation Canva reçu :', code);
    res.send(`
      <div style="font-family: sans-serif; padding: 20px;">
        <h1>✅ Redirection Canva réussie !</h1>
        <p>Canva vous a bien redirigé vers le serveur.</p>
        <p>Voici le code d'autorisation temporaire :</p>
        <pre style="background-color: #eee; padding: 15px; border-radius: 8px; word-wrap: break-word;">${code}</pre>
        <hr>
        <p><b>Prochaine étape :</b> Utiliser ce code en back-end pour obtenir le véritable <i>access_token</i>.</p>
      </div>
    `);
  } else {
    // Si Canva renvoie une erreur (ex: l'utilisateur a refusé l'accès)
    res.status(400).send(`
      <div style="font-family: sans-serif; padding: 20px;">
        <h1>❌ Oups, un problème est survenu.</h1>
        <p>Canva n'a pas pu fournir de code d'autorisation.</p>
        <p>Erreur possible : ${req.query.error_description || 'Aucune description.'}</p>
      </div>
    `);
  }
});

app.listen(port, () => {
  console.log(`Serveur de test démarré sur http://localhost:${port}`);
  console.log('Cliquez sur le bouton "Connecter Canva" sur votre page generator.html pour tester.');
});
