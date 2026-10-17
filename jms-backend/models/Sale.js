const mongoose = require("mongoose");

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
  makingChargePerGram: { type: Number, default: 0 },
  // Hallmark Unique ID of the piece (BIS), when the jeweller records it at billing
  huid: { type: String, default: "", trim: true, uppercase: true },
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: Number, unique: true },
    customerName: { type: String, default: "Walk-in Customer" },
    customerAddress: { type: String, default: "" },
    customerMobile: { type: String, required: true },
    items: [soldItemSchema],
    subtotal: { type: Number, required: true },
    totalMakingCharges: { type: Number, default: 0 },

    discount: { type: Number, default: 0 },
    oldGoldWeight: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },

    // v2 bills: discount applied before GST, GST on the full value incl. making charges
    taxableAmount: { type: Number },
    taxMode: { type: String, default: "" },
    gstMetalRate: { type: Number },
    gstMakingRate: { type: Number },

    totalAmount: { type: Number, required: true },
    advancePayment: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

saleSchema.index({ createdAt: -1 });

const Sale = mongoose.model("Sale", saleSchema);
module.exports = Sale;
