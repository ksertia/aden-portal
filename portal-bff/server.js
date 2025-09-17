const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

// Charger les variables d'environnement du fichier .env
dotenv.config();

// Afficher les variables pour tester
console.log("Strapi URL:", process.env.STRAPI_URL);
console.log("WS Métier URL:", process.env.WS_METIER_URL);
console.log("BFF Port:", process.env.PORT);

const app = express();
app.use(express.json());

// Route principale pour health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'BFF is running smoothly' });
});

// Route pour l'inscription
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Appel à Strapi pour enregistrer un utilisateur
    const strapiResponse = await axios.post(`${process.env.STRAPI_URL}/api/auth/local/register`, {
      username: username, 
      email: email, 
      password: password
    });

    // Vérification si la réponse contient bien le JWT et les données utilisateur
    if (strapiResponse.data && strapiResponse.data.jwt && strapiResponse.data.user) {
      const jwt = strapiResponse.data.jwt;
      const user = strapiResponse.data.user;

      // Retourner le JWT et les données utilisateur
      res.json({
        jwt: jwt,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          roles: user.roles,
        }
      });
    } else {
      // Si la réponse est malformée
      res.status(500).json({ message: "Réponse invalide de Strapi" });
    }

  } catch (error) {
    // Gérer les erreurs de connexion ou autres problèmes
    console.error('Erreur d\'inscription Strapi:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Erreur lors de l'inscription", error: error.response ? error.response.data : error.message });
  }
});

// Route pour la connexion
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Appel à Strapi pour obtenir le JWT
    const strapiResponse = await axios.post(`${process.env.STRAPI_URL}/api/auth/local`, {
      identifier: username,  // 'identifier' peut être un username ou un email
      password: password
    });

    // Vérification si la réponse contient bien le JWT et les données utilisateur
    if (strapiResponse.data && strapiResponse.data.jwt && strapiResponse.data.user) {
      const jwt = strapiResponse.data.jwt;
      const user = strapiResponse.data.user;

      // Retourner les informations de l'utilisateur et le JWT
      res.json({
        jwt: jwt,
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles,
        }
      });
    } else {
      // Si la réponse est malformée
      res.status(500).json({ message: "Réponse invalide de Strapi" });
    }

  } catch (error) {
    // Gérer les erreurs de connexion ou autres problèmes
    console.error('Erreur de connexion Strapi:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Erreur lors de la connexion", error: error.response ? error.response.data : error.message });
  }
});

// Lancer le serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
