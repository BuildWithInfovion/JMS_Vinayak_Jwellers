// backend/api/products.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product"); // Import the Product model

// GET /api/products - Get all products from MongoDB
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }); // Get all products, newest first
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products." });
  }
});

// POST /api/products - Add a new product to MongoDB
router.post("/", async (req, res) => {
  try {
    const { name, category, weight, stock, purity, pricePerGram, unitPrice } =
      req.body;

    // Basic validation
    if (!name || !category || !weight || !stock) {
      return res
        .status(400)
        .json({ message: "Missing required product fields." });
    }

    const newProduct = new Product({
      name,
      category,
      weight,
      stock,
      purity,
      pricePerGram,
      unitPrice,
    });

    const savedProduct = await newProduct.save(); // Save to database

    console.log("Saved new product to DB:", savedProduct);
    res.status(201).json(savedProduct); // Return the saved product (which includes the _id)
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ message: "Server error while saving product." });
  }
});

module.exports = router;
