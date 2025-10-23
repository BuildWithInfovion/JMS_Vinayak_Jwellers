// backend/models/Sale.js
const mongoose = require("mongoose");

// soldItemSchema includes: productId, name, quantity, sellingWeight, sellingPricePerGram, sellingPurity
const soldItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  sellingWeight: { type: Number, required: true },
  sellingPricePerGram: { type: Number, required: true },
  sellingPurity: { type: String },
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: Number, unique: true },
    customerName: { type: String, default: "Walk-in Customer" },
    customerAddress: { type: String, default: "" },
    // --- Add Mobile (Required) ---
    customerMobile: { type: String, required: true },
    // -----------------------------
    items: [soldItemSchema],
    subtotal: { type: Number, required: true }, // (Items total)
    makingCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, // (Subtotal + Making Charges)
    advancePayment: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true }, // (Total - Advance)
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Sale = mongoose.model("Sale", saleSchema);
module.exports = Sale;
