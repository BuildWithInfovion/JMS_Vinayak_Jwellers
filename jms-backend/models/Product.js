// backend/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    weight: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    purity: { type: Number }, // Optional
    pricePerGram: { type: Number }, // Optional, for Gold/Silver
    unitPrice: { type: Number }, // Optional, for 'Others'
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
