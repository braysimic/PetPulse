const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// ===== Serve Frontend =====
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== MongoDB connection =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ===== API Routes =====
app.get("/api/status", (req, res) => {
  res.send({ status: "PetPulse API is running!" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// ===== Start server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running!");
  console.log(`Status URL: http://localhost:${PORT}/api/status`);
  console.log(`Base URL: http://localhost:${PORT}`);
});




