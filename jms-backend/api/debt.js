// jms-backend/api/debt.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Debt = require("../models/Debt");
const authMiddleware = require("../middleware/authMiddleware");

// All routes in this file are protected
// We are applying this in index.js, so it's not needed here.

// GET /api/debt - Get all pending debts
router.get("/", async (req, res) => {
  try {
    const pendingDebts = await Debt.find({ status: "Pending" }).sort({
      createdAt: -1,
    });
    res.status(200).json(pendingDebts);
  } catch (error) {
    console.error("Error fetching pending debts:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// --- NEW: POST /api/debt - Manually create a new debt record ---
router.post("/", async (req, res) => {
  const { customerName, customerMobile, initialAmount, dueDate } = req.body;

  // Validation
  if (!customerName || !customerMobile || !initialAmount) {
    return res
      .status(400)
      .json({ message: "Customer name, mobile, and amount are required." });
  }

  const amount = parseFloat(initialAmount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Invalid initial amount." });
  }

  try {
    const newDebt = new Debt({
      customerName,
      customerMobile,
      initialAmount: amount,
      amountRemaining: amount,
      dueDate: dueDate || null,
      lastPaymentDate: new Date(),
      // Note: saleId is omitted because this is a manual entry
    });

    await newDebt.save();
    res.status(201).json(newDebt);
  } catch (error) {
    console.error("Error creating new debt:", error.message);
    res.status(500).json({ message: "Server error creating debt." });
  }
});
// --- END NEW ROUTE ---

// POST /api/debt/:id/pay - Add a payment to a debt record
router.post("/:id/pay", async (req, res) => {
  const { paymentAmount } = req.body;
  const { id } = req.params;

  if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({ message: "Invalid payment amount." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const debt = await Debt.findById(id).session(session);
    if (!debt) {
      throw new Error("Debt record not found.");
    }
    if (debt.status === "Paid") {
      throw new Error("This debt is already fully paid.");
    }

    const newPaymentAmount = parseFloat(paymentAmount);
    if (newPaymentAmount > debt.amountRemaining) {
      throw new Error(
        `Payment (₹${newPaymentAmount}) exceeds remaining balance (₹${debt.amountRemaining}).`
      );
    }

    // Update the debt record
    debt.amountPaid += newPaymentAmount;
    // The pre-save middleware in Debt.js will handle amountRemaining and status

    // Add to payment history
    debt.payments.push({
      amount: newPaymentAmount,
      date: new Date(),
    });

    const updatedDebt = await debt.save({ session });

    await session.commitTransaction();
    res.status(200).json(updatedDebt);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error processing payment:", error.message);
    res.status(400).json({ message: error.message || "Payment failed." });
  } finally {
    session.endSession();
  }
});

module.exports = router; // <-- Use CommonJS export
