import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: './ok.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Ajouter une route pour la racine
app.get('/', (req, res) => {
  res.send('Proxy OpenAI fonctionnel. Utilisez la route POST /api/openai pour faire des requêtes à l\'API OpenAI.');
});

app.post('/api/openai', async (req, res) => {
  try {
    console.log("Requête reçue :", JSON.stringify(req.body));
    
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await openaiRes.json();
    console.log("Réponse OpenAI :", JSON.stringify(data));
    
    // Si la réponse contient une erreur, loggez-la
    if (data.error) {
      console.error("Erreur OpenAI :", data.error);
    }
    
    res.status(openaiRes.status).json(data);
  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ error: 'Erreur serveur OpenAI proxy.' });
  }
});

// Ajouter une route ping pour vérifier que le serveur est actif
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy OpenAI démarré sur le port ${PORT}`);
});

// Fonction pour garder le serveur actif
function keepWarm() {
  console.log("Auto-ping pour maintenir le serveur actif");
  // Ne pas utiliser localhost car on est dans un environnement de production
  fetch(`https://openai-proxy-gqhc.onrender.com/ping`)
    .then(() => console.log("Ping réussi"))
    .catch(err => console.error("Erreur d'auto-ping:", err));
  
  // Répéter toutes les 10 minutes
  setTimeout(keepWarm, 10 * 60 * 1000);
}

// Démarrer le réchauffeur après un court délai pour que le serveur démarre
setTimeout(keepWarm, 10000);
