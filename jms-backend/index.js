// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Import routes
const productRoutes = require("./api/products");
const saleRoutes = require("./api/sales");
const authRoutes = require("./api/auth");
const gahanRoutes = require("./api/gahan");
const debtRoutes = require("./api/debt"); // <-- 1. Import Debt routes

// Middleware
app.use(cors());
app.use(express.json());

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
app.use("/api/debt", authMiddleware, debtRoutes); // <-- 2. Add Debt routes

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
