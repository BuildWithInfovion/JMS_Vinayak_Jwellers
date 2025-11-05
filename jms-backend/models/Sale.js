// backend/models/Sale.js
const mongoose = require("mongoose");

// ✅ FIXED: Added makingChargePerGram to soldItemSchema
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
  makingChargePerGram: { type: Number, default: 0 }, // ✅ ADDED THIS FIELD
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: Number, unique: true },
    customerName: { type: String, default: "Walk-in Customer" },
    customerAddress: { type: String, default: "" },
    customerMobile: { type: String, required: true },
    items: [soldItemSchema],
    subtotal: { type: Number, required: true },
    totalMakingCharges: { type: Number, default: 0 }, // ✅ FIXED: Changed from makingCharges
    totalAmount: { type: Number, required: true },
    advancePayment: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Sale = mongoose.model("Sale", saleSchema);
module.exports = Sale;
