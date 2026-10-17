// Fills an EMPTY demo database with a realistic jewellery store, for sales demos.
//   MONGO_URI="mongodb+srv://…/jms_demo" node scripts/seed-demo.js --yes
// Safety: refuses unless the database name contains "demo" and the database has no users yet,
// so it can never write into a real shop's data. Logins: owner / demo123, counter1 / demo123.
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Gahan = require("../models/Gahan");
const Debt = require("../models/Debt");
const Setting = require("../models/Setting");
const { Counter } = require("../models/Counter");

(async () => {
  if (!process.argv.includes("--yes")) {
    console.error("Add --yes to confirm you are seeding a DEMO database.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db.databaseName;
  if (!/demo/i.test(db)) {
    console.error(`Refusing: database "${db}" does not look like a demo database (name must contain "demo").`);
    process.exit(1);
  }
  if ((await User.countDocuments()) > 0) {
    console.error(`Refusing: database "${db}" already has users.`);
    process.exit(1);
  }

  const owner = await User.create({ username: "owner", password: await bcrypt.hash("demo123", 10), role: "owner" });
  await User.create({ username: "counter1", password: await bcrypt.hash("demo123", 10), role: "staff" });
  await Setting.create({ key: "gst_enabled", value: true });

  const P = await Product.insertMany([
    { name: "22K Gold Ring — Floral", category: "Gold", weight: 48.6, stock: 12, purity: 91.6, pricePerGram: 7250 },
    { name: "22K Gold Chain — Rope 20\"", category: "Gold", weight: 96.4, stock: 8, purity: 91.6, pricePerGram: 7250 },
    { name: "22K Gold Bangles (pair)", category: "Gold", weight: 182.0, stock: 6, purity: 91.6, pricePerGram: 7250 },
    { name: "22K Mangalsutra — Vati", category: "Gold", weight: 74.8, stock: 5, purity: 91.6, pricePerGram: 7250 },
    { name: "18K Diamond Studs", category: "Gold", weight: 9.2, stock: 4, purity: 75, pricePerGram: 5930 },
    { name: "22K Jhumka Earrings", category: "Gold", weight: 38.5, stock: 7, purity: 91.6, pricePerGram: 7250 },
    { name: "Silver Payal (by weight)", category: "Silver", weight: 1850, stock: 1, purity: 92.5, pricePerGram: 92, type: "bulk_weight" },
    { name: "Silver Coins 10 g", category: "Silver", weight: 300, stock: 30, purity: 99.9, pricePerGram: 95 },
  ]);

  const names = [["Priya Kulkarni", "Kothrud"], ["Rahul Deshmukh", "Baner"], ["Sneha Patil", "Aundh"], ["Amit Joshi", "Hadapsar"], ["Kavita Shinde", "Wakad"]];
  const day = 86400000;
  const sales = [];
  for (let i = 0; i < 15; i++) {
    const p = P[i % 6];
    const [customerName, area] = names[i % names.length];
    const w = Math.round((p.weight / p.stock) * 1000) / 1000;
    const metal = w * p.pricePerGram;
    const mc = w * 650;
    const taxable = Math.round((metal + mc) * 100) / 100;
    const gst = Math.round(taxable * 0.03 * 100) / 100;
    const total = Math.round((taxable + gst) * 100) / 100;
    const adv = i % 4 === 0 ? Math.round(total * 0.6) : total;
    const createdAt = new Date(Date.now() - i * 1.3 * day);
    sales.push({
      invoiceNumber: i + 1, customerName, customerAddress: `${area}, Pune`, customerMobile: `98220${String(10000 + i * 37).padStart(5, "0")}`,
      items: [{ productId: p._id, name: p.name, quantity: 1, sellingWeight: w, sellingPricePerGram: p.pricePerGram, sellingPurity: "22K", makingChargePerGram: 650 }],
      subtotal: Math.round(metal * 100) / 100, totalMakingCharges: Math.round(mc * 100) / 100, taxableAmount: taxable, discount: 0,
      gstAmount: gst, cgstAmount: gst / 2, sgstAmount: gst / 2, totalAmount: total, advancePayment: adv, balanceDue: Math.round((total - adv) * 100) / 100,
      taxMode: "v2", gstMetalRate: 3, gstMakingRate: 3, createdAt, updatedAt: createdAt,
    });
  }
  const saved = await Sale.insertMany(sales, { timestamps: false });
  await Counter.create({ _id: "invoiceNumber", seq: sales.length });
  for (const s of saved.filter((x) => x.balanceDue > 0)) {
    await Debt.create({ customerName: s.customerName, customerMobile: s.customerMobile, saleId: s._id, initialAmount: s.balanceDue, amountPaid: 0, amountRemaining: s.balanceDue, dueDate: new Date(Date.now() + 20 * day) });
  }

  const pledges = [["Sunita Kale", "Gold Necklace 22K", 32.5, 120000, 1.5, -40, 140], ["Rajesh Gaikwad", "Gold Bangles 22K (pair)", 41.2, 150000, 1.25, -95, 85], ["Vaishali More", "Gold Chain 22K", 18, 65000, 1.5, -200, -20]];
  let rec = 0;
  for (const [customerName, itemName, itemWeight, amountGiven, interestRate, from, to] of pledges) {
    await Gahan.create({ recordNumber: ++rec, customerName, customerAddress: "Pune", customerMobile: `97300${String(44000 + rec * 53)}`, itemName, itemWeight, itemPurity: "22K", amountGiven, interestRate, pawnDate: new Date(Date.now() + from * day), dueDate: new Date(Date.now() + to * day), status: to < 0 ? "Overdue" : "Active", createdBy: owner._id });
  }
  await Counter.create({ _id: "gahanRecord", seq: rec });

  console.log(`Demo data written to "${db}". Log in as owner / demo123 (change it if the demo is public).`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
