// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware"); // <-- Import middleware

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Import routes
const productRoutes = require("./api/products");
const saleRoutes = require("./api/sales");
const authRoutes = require("./api/auth");
const gahanRoutes = require("./api/gahan"); // <-- Add this line

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Jeweller Management System Backend is running!");
});

// --- UPDATE ROUTE ORDER ---
// Public routes first
app.use("/api/auth", authRoutes);

// Protected routes - Add authMiddleware before these (or within the route file itself)
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/sales", authMiddleware, saleRoutes);
app.use("/api/gahan", gahanRoutes); // <-- Add this line (middleware is applied within gahan.js)
// --------------------------

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
