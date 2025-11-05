// jms-backend/models/Debt.js
const mongoose = require("mongoose");

const DebtSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerMobile: {
      type: String,
      required: true,
      trim: true,
    },
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
      unique: true, // A sale should only create one debt record
    },
    initialAmount: {
      type: Number,
      required: true,
      min: 0.01, // Should only be created if there is a balance
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    amountRemaining: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      default: null, // Optional due date
    },
    lastPaymentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    // To track payment history
    payments: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        method: { type: String, default: "Cash" },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Pre-save middleware to ensure amountRemaining is correct
DebtSchema.pre("save", function (next) {
  this.amountRemaining = this.initialAmount - this.amountPaid;
  if (this.amountRemaining <= 0) {
    this.status = "Paid";
    this.amountRemaining = 0; // Ensure it doesn't go negative
  } else {
    this.status = "Pending";
  }
  next();
});

const Debt = mongoose.model("Debt", DebtSchema);

module.exports = Debt; // <-- Changed to CommonJS export
