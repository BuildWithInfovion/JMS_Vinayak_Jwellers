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

    // Convert numeric fields
    const parsedWeight = parseFloat(weight);
    const parsedStock = parseInt(stock, 10);
    const parsedPurity = purity ? parseFloat(purity) : null;
    const parsedPricePerGram = pricePerGram ? parseFloat(pricePerGram) : null;
    const parsedUnitPrice = unitPrice ? parseFloat(unitPrice) : null;

    if (isNaN(parsedWeight) || isNaN(parsedStock)) {
      return res
        .status(400)
        .json({ message: "Invalid number format for weight or stock." });
    }
    // Optional fields validation
    if (purity && isNaN(parsedPurity))
      return res
        .status(400)
        .json({ message: "Invalid number format for purity." });
    if (pricePerGram && isNaN(parsedPricePerGram))
      return res
        .status(400)
        .json({ message: "Invalid number format for price per gram." });
    if (unitPrice && isNaN(parsedUnitPrice))
      return res
        .status(400)
        .json({ message: "Invalid number format for unit price." });

    const newProduct = new Product({
      name,
      category,
      weight: parsedWeight,
      stock: parsedStock,
      purity: parsedPurity,
      pricePerGram: parsedPricePerGram,
      unitPrice: parsedUnitPrice,
    });

    const savedProduct = await newProduct.save(); // Save to database

    console.log("Saved new product to DB:", savedProduct);
    res.status(201).json(savedProduct); // Return the saved product (which includes the _id)
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: `Validation Failed: ${messages.join(", ")}` });
    }
    console.error("Error saving product:", error);
    res.status(500).json({ message: "Server error while saving product." });
  }
});

// PUT /api/products/:id - Update an existing product
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Data Type Conversion
    if (updatedData.weight !== undefined && updatedData.weight !== null) {
      updatedData.weight = parseFloat(updatedData.weight);
      if (isNaN(updatedData.weight)) {
        return res.status(400).json({ message: "Invalid weight value." });
      }
    }
    if (updatedData.stock !== undefined && updatedData.stock !== null) {
      updatedData.stock = parseInt(updatedData.stock, 10);
      if (isNaN(updatedData.stock)) {
        return res.status(400).json({ message: "Invalid stock value." });
      }
    }
    if (
      updatedData.purity !== undefined &&
      updatedData.purity !== null &&
      updatedData.purity !== ""
    ) {
      updatedData.purity = parseFloat(updatedData.purity);
      if (isNaN(updatedData.purity)) {
        return res.status(400).json({ message: "Invalid purity value." });
      }
    } else if (updatedData.purity === "") {
      updatedData.purity = null; // Allow clearing optional fields
    }
    if (
      updatedData.pricePerGram !== undefined &&
      updatedData.pricePerGram !== null &&
      updatedData.pricePerGram !== ""
    ) {
      updatedData.pricePerGram = parseFloat(updatedData.pricePerGram);
      if (isNaN(updatedData.pricePerGram)) {
        return res.status(400).json({ message: "Invalid pricePerGram value." });
      }
    } else if (updatedData.pricePerGram === "") {
      updatedData.pricePerGram = null;
    }
    if (
      updatedData.unitPrice !== undefined &&
      updatedData.unitPrice !== null &&
      updatedData.unitPrice !== ""
    ) {
      updatedData.unitPrice = parseFloat(updatedData.unitPrice);
      if (isNaN(updatedData.unitPrice)) {
        return res.status(400).json({ message: "Invalid unitPrice value." });
      }
    } else if (updatedData.unitPrice === "") {
      updatedData.unitPrice = null;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true } // {new: true} returns the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    console.log("Updated product in DB:", updatedProduct);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: `Validation Failed: ${messages.join(", ")}` });
    }
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: `Invalid data format for field: ${error.path}` });
    }
    res.status(500).json({ message: "Server error while updating product." });
  }
});

module.exports = router;
