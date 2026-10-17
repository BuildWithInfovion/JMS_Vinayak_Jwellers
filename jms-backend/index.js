// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set — refusing to start.");
  process.exit(1);
}

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Import routes
const productRoutes = require("./api/products");
const saleRoutes = require("./api/sales");
const authRoutes = require("./api/auth");
const gahanRoutes = require("./api/gahan");
const debtRoutes = require("./api/debt");
const settingsRoutes = require("./api/settings");
const exportRoutes = require("./api/exports");

// Middleware
// ALLOWED_ORIGINS="https://shop.example.com,https://www.shop.example.com" limits which sites may call the API.
// Left empty, any origin is allowed (the original behaviour).
const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors(allowed.length ? { origin: allowed } : undefined));
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("Jeweller Management System Backend is running!");
});

// --- UPDATE ROUTE ORDER ---
// Public routes first
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/sales", authMiddleware, saleRoutes);
// Assuming middleware is applied within gahan.js, if not, add it here.
// Based on our plan, it should be protected.
app.use("/api/gahan", authMiddleware, gahanRoutes);
app.use("/api/debt", authMiddleware, debtRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/exports", authMiddleware, exportRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
