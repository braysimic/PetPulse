const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const petRoutes = require("./routes/petRoutes");



const app = express();

// ===== Middleware =====
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ===== Sessions (MUST COME BEFORE ROUTES) =====
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/pets", petRoutes);


// ===== Start server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running!");
  console.log(`Status URL: http://localhost:${PORT}/api/status`);
  console.log(`Base URL: http://localhost:${PORT}`);
});
