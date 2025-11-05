// backend/api/sales.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const { getNextSequence } = require("../models/Counter");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all sales routes
router.use(authMiddleware);

// GET /api/sales - Get all sales records (Protected)
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error.message);
    res.status(500).json({ message: "Server error while fetching sales." });
  }
});

// POST /api/sales - Create a new sale and deduct stock (Protected)
router.post("/", async (req, res) => {
  const {
    items,
    totalAmount,
    subtotal,
    totalMakingCharges,
    advancePayment,
    balanceDue,
    customerName,
    customerAddress,
    customerMobile,
  } = req.body;

  if (!items || items.length === 0 || !totalAmount || !customerMobile) {
    return res
      .status(400)
      .json({ message: "Invalid sale data. Customer mobile is required." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const nextInvoiceNumber = await getNextSequence("invoiceNumber");

    const soldItems = [];
    for (const item of items) {
      // --- THIS IS THE FIX ---
      // It now correctly reads item.productId from the frontend payload
      const product = await Product.findById(item.productId).session(session);
      // --- END OF FIX ---

      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for: ${item.name}. Available: ${product.stock}`
        );
      }
      product.stock -= item.quantity;
      await product.save({ session });

      soldItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        sellingWeight: item.sellingWeight,
        sellingPricePerGram: item.sellingPricePerGram,
        sellingPurity: item.sellingPurity,
        makingChargePerGram: item.makingChargePerGram, // This is now correct
      });
    }

    const newSale = new Sale({
      invoiceNumber: nextInvoiceNumber,
      customerName,
      customerAddress,
      customerMobile,
      items: soldItems, // This array now has the correct MC/g
      subtotal,
      totalMakingCharges: totalMakingCharges, // This is also correct
      totalAmount,
      advancePayment,
      balanceDue,
    });

    await newSale.save({ session });

    // Automatic debt logic is removed, as requested.

    await session.commitTransaction();
    res.status(201).json(newSale);
  } catch (error) {
    await session.abortTransaction();
    console.error("Sale transaction failed:", error.message);
    res.status(400).json({ message: error.message || "Transaction failed." });
  } finally {
    session.endSession();
  }
});

module.exports = router;
