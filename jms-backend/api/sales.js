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
  // *** DEBUG LOG: Print what the frontend sent ***
  console.log("--- NEW SALE REQUEST RECEIVED ---");
  console.log("Discount received:", req.body.discount);
  console.log("Old Gold Weight received:", req.body.oldGoldWeight);
  // **********************************************

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
    // New fields
    discount,
    oldGoldWeight,
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
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }

      if (product.type === "standard") {
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for: ${item.name}. Available: ${product.stock}`
          );
        }
        if (product.weight < item.sellingWeight) {
          throw new Error(
            `Insufficient weight for ${item.name}. Only ${product.weight}g left.`
          );
        }
        product.weight -= item.sellingWeight;
        product.stock -= item.quantity;
      } else if (product.type === "bulk_weight") {
        if (product.weight < item.sellingWeight) {
          throw new Error(
            `Insufficient weight for ${item.name}. Only ${product.weight}g left.`
          );
        }
        product.weight -= item.sellingWeight;
      }

      await product.save({ session });

      soldItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        sellingWeight: item.sellingWeight,
        sellingPricePerGram: item.sellingPricePerGram,
        sellingPurity: item.sellingPurity,
        makingChargePerGram: item.makingChargePerGram,
      });
    }

    const newSale = new Sale({
      invoiceNumber: nextInvoiceNumber,
      customerName,
      customerAddress,
      customerMobile,
      items: soldItems,
      subtotal,
      totalMakingCharges: totalMakingCharges,
      totalAmount,
      advancePayment,
      balanceDue,
      // *** Save the new fields ***
      discount: discount || 0,
      oldGoldWeight: oldGoldWeight || 0,
    });

    // *** DEBUG LOG: Check what Mongoose is about to save ***
    console.log("Saving Sale Object:", newSale);
    // ******************************************************

    await newSale.save({ session });

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
