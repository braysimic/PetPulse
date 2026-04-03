const express = require("express");
const router = express.Router();
const axios = require("axios");

const MedicalRecord = require("../models/MedicalRecord");
const Pet = require("../models/Pet");

router.post("/chat", async (req, res) => {

  if (!req.session.userId) {
    return res.status(401).send({ error: "Not logged in" });
  }

  const { message } = req.body;

  try {

    // ===== USER DATA =====
    const pets = await Pet.find({ owner: req.session.userId });
    const records = await MedicalRecord.find({ owner: req.session.userId })
      .sort({ date: -1 })
      .limit(10);

    let context = "User Pet Data:\n";

    pets.forEach(p => {
      context += `Pet: ${p.name}, ${p.species}, ${p.breed}\n`;
    });

    context += "\nMedical Records:\n";

    records.forEach(r => {
      context += `${r.type} - ${r.description}\n`;
    });

    const prompt = `
You are a helpful pet care assistant.

${context}

User question: ${message}

Be clear and helpful. Keep it simple.
Always remind this is not a substitute for a vet.
`;

    // ===== OPENROUTER CALL =====
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      response.data.choices?.[0]?.message?.content ||
      "AI failed to respond";

    res.send({ reply });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send({ error: "AI failed" });
  }

});

module.exports = router;