// index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== MongoDB connection =====
// Make sure your .env has MONGO_URI like:
// MONGO_URI=mongodb+srv://SDDcapstone:SDDcapstone%231@cluster0.abcd1.mongodb.net/petpulse?retryWrites=true&w=majority
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// ===== Pet Schema & Model =====
const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  age: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Pet = mongoose.model('Pet', petSchema);

// ===== Routes =====
app.get('/api/status', (req, res) => {
  res.send({ status: 'PetPulse API is running!' });
});

// Add a new pet
app.post('/api/pets', async (req, res) => {
  try {
    const { name, species, age } = req.body;
    const pet = new Pet({ name, species, age });
    await pet.save();
    res.send({ message: 'Pet added!', id: pet._id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// List all pets
app.get('/api/pets', async (req, res) => {
  try {
    const pets = await Pet.find();
    res.send(pets);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Get a pet by ID
app.get('/api/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).send({ error: 'Pet not found' });
    res.send(pet);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Update a pet
app.put('/api/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pet) return res.status(404).send({ error: 'Pet not found' });
    res.send({ message: 'Pet updated!', pet });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Delete a pet
app.delete('/api/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).send({ error: 'Pet not found' });
    res.send({ message: 'Pet deleted!' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ===== Start server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running!`);
  console.log(`Status URL: http://localhost:${PORT}/api/status`);
  console.log(`Base URL: http://localhost:${PORT}`);
});


