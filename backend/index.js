const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== Firebase Admin SDK setup =====
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ===== Example routes =====
app.get('/api/status', (req, res) => {
  res.send({ status: 'PetPulse API is running!' });
});

// Example: add a test pet
app.post('/api/pets', async (req, res) => {
  try {
    const { name, species, age } = req.body;
    const docRef = await db.collection('pets').add({ name, species, age, createdAt: new Date() });
    res.send({ message: 'Pet added!', id: docRef.id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Example: list all pets
app.get('/api/pets', async (req, res) => {
  try {
    const snapshot = await db.collection('pets').get();
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(pets);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running!`);
  console.log(`Status URL: http://localhost:${PORT}/api/status`);
  console.log(`Base URL: http://localhost:${PORT}`);
});

