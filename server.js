import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: './ok.env' });

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy OpenAI démarré sur le port ${PORT}`);
});
