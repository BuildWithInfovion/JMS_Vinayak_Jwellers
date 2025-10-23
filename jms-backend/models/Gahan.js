// backend/models/Gahan.js
const mongoose = require("mongoose");

const gahanSchema = new mongoose.Schema(
  {
    recordNumber: { type: Number, unique: true }, // <-- Add this
    customerName: { type: String, required: true },
    customerAddress: { type: String },
    customerMobile: { type: String },
    itemName: { type: String, required: true },
    itemWeight: { type: Number, required: true },
    itemPurity: { type: String },
    amountGiven: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    pawnDate: { type: Date, default: Date.now, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Released", "Overdue"],
      default: "Active",
      required: true,
    },
    releaseDate: { type: Date },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Gahan = mongoose.model("Gahan", gahanSchema);

module.exports = Gahan;
