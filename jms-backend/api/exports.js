// Exports for the shop's CA: Tally (TallyPrime XML import) and Excel-ready registers.
//
// Tally import is two steps, matching Tally's own menus:
//   1. Gateway of Tally → Import → Masters       ← /api/exports/tally?part=masters
//   2. Gateway of Tally → Import → Transactions  ← /api/exports/tally?part=vouchers
// Ledger names come from Settings (tally_*), so they can match the CA's existing books.
const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Debt = require("../models/Debt");
const Gahan = require("../models/Gahan");
const Setting = require("../models/Setting");

const LEDGER_DEFAULTS = {
  tally_company: "",
  tally_sales_ledger: "Sales - Jewellery",
  tally_cgst_ledger: "Output CGST",
  tally_sgst_ledger: "Output SGST",
  tally_cash_ledger: "Cash",
  tally_bank_ledger: "Bank (UPI / Card)",
  tally_roundoff_ledger: "Round Off",
  tally_discount_ledger: "Discount Allowed",
  tally_girvi_ledger: "Girvi Loans Given",
  tally_interest_ledger: "Interest on Girvi",
};

// Only the owner can export the books
router.use((req, res, next) => {
  if (req.user.role !== "owner") return res.status(403).json({ message: "Only the owner can export accounts." });
  next();
});

// ── Helpers ──────────────────────────────────────────────────────────────────
const IST = 330 * 60000;
const istRange = (from, to) => {
  const ok = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || "");
  if (!ok(from) || !ok(to)) return null;
  const start = new Date(Date.parse(`${from}T00:00:00Z`) - IST);
  const end = new Date(Date.parse(`${to}T00:00:00Z`) - IST + 86400000);
  return end > start ? { start, end } : null;
};
const ymd = (d) => new Date(new Date(d).getTime() + IST).toISOString().slice(0, 10); // IST calendar date
const d8 = (d) => ymd(d).replace(/-/g, "");
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const amt = (n) => r2(n).toFixed(2);
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

async function ledgers() {
  const rows = await Setting.find({ key: { $in: Object.keys(LEDGER_DEFAULTS) } });
  const L = { ...LEDGER_DEFAULTS };
  rows.forEach((r) => { if (String(r.value || "").trim()) L[r.key] = String(r.value).trim(); });
  return L;
}

// One ledger per credit customer, e.g. "Priya Kulkarni - 9822001122"
const customerLedger = (name, mobile) => `${(name || "Walk-in Customer").trim()}${mobile ? ` - ${String(mobile).trim()}` : ""}`.slice(0, 90);

// A ledger line: debits are negative with ISDEEMEDPOSITIVE=Yes, credits positive with No (Tally's convention)
const line = (ledger, amount, debit, party = false) =>
  `<ALLLEDGERENTRIES.LIST><LEDGERNAME>${esc(ledger)}</LEDGERNAME><ISDEEMEDPOSITIVE>${debit ? "Yes" : "No"}</ISDEEMEDPOSITIVE>${party ? "<ISPARTYLEDGER>Yes</ISPARTYLEDGER>" : ""}<AMOUNT>${debit ? "-" : ""}${amt(amount)}</AMOUNT></ALLLEDGERENTRIES.LIST>`;

function voucher({ type, date, number, party, narration, lines }) {
  // Every voucher must balance; refuse to emit one that doesn't
  const sum = r2(lines.reduce((t, l) => t + (l.debit ? -l.amount : l.amount), 0));
  if (Math.abs(sum) > 0.009) throw new Error(`Voucher ${type} ${number} does not balance (${sum})`);
  const body = lines.filter((l) => r2(l.amount) !== 0).map((l) => line(l.ledger, l.amount, l.debit, l.party)).join("");
  return `<TALLYMESSAGE xmlns:UDF="TallyUDF"><VOUCHER VCHTYPE="${esc(type)}" ACTION="Create" OBJVIEW="Accounting Voucher View"><DATE>${d8(date)}</DATE><EFFECTIVEDATE>${d8(date)}</EFFECTIVEDATE><VOUCHERTYPENAME>${esc(type)}</VOUCHERTYPENAME><VOUCHERNUMBER>${esc(number)}</VOUCHERNUMBER>${party ? `<PARTYLEDGERNAME>${esc(party)}</PARTYLEDGERNAME>` : ""}<PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW><NARRATION>${esc(String(narration || "").slice(0, 900))}</NARRATION>${body}</VOUCHER></TALLYMESSAGE>`;
}

const envelope = (report, company, messages) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>${report}</REPORTNAME>${company ? `<STATICVARIABLES><SVCURRENTCOMPANY>${esc(company)}</SVCURRENTCOMPANY></STATICVARIABLES>` : ""}</REQUESTDESC><REQUESTDATA>\n${messages.join("\n")}\n</REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>\n`;

function ledgerMaster(name, parent, extra = "") {
  return `<TALLYMESSAGE xmlns:UDF="TallyUDF"><LEDGER NAME="${esc(name)}" ACTION="Create"><NAME.LIST><NAME>${esc(name)}</NAME></NAME.LIST><PARENT>${esc(parent)}</PARENT>${extra}</LEDGER></TALLYMESSAGE>`;
}

// Amounts of a sale, whether it was billed before or after v2 (discount before GST)
function saleFigures(s) {
  const metal = r2(s.subtotal);
  const making = r2(s.totalMakingCharges);
  const discount = r2(s.discount);
  const cgst = r2(s.cgstAmount);
  const sgst = r2(s.sgstAmount);
  const v2 = s.taxMode === "v2";
  const taxable = v2 ? r2(s.taxableAmount ?? metal + making - discount) : r2(metal + making);
  // What the customer owes for this invoice
  const invoiceValue = v2 ? r2(s.totalAmount) : r2(s.totalAmount - discount);
  return { metal, making, discount, cgst, sgst, v2, taxable, invoiceValue, advance: r2(s.advancePayment), balance: r2(s.balanceDue) };
}

const itemsText = (s) =>
  (s.items || []).map((i) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ""} ${((i.sellingWeight || 0) * (i.quantity || 1)).toFixed(3)}g${i.sellingPurity ? ` ${i.sellingPurity}` : ""} @${i.sellingPricePerGram}${i.makingChargePerGram ? ` MC ${i.makingChargePerGram}/g` : ""}${i.huid ? ` HUID ${i.huid}` : ""}`).join("; ");

async function load(range) {
  const [sales, debts, gahanOut, gahanBack] = await Promise.all([
    Sale.find({ createdAt: { $gte: range.start, $lt: range.end } }).sort({ createdAt: 1, invoiceNumber: 1 }),
    Debt.find({ "payments.date": { $gte: range.start, $lt: range.end } }),
    Gahan.find({ pawnDate: { $gte: range.start, $lt: range.end } }).sort({ pawnDate: 1 }),
    Gahan.find({ status: "Released", releaseDate: { $gte: range.start, $lt: range.end } }).sort({ releaseDate: 1 }),
  ]);
  return { sales, debts, gahanOut, gahanBack };
}

// ── Tally XML ────────────────────────────────────────────────────────────────
router.get("/tally", async (req, res) => {
  const range = istRange(req.query.from, req.query.to);
  if (!range) return res.status(400).json({ message: "Give from and to dates as YYYY-MM-DD." });
  const part = req.query.part === "masters" ? "masters" : "vouchers";
  try {
    const L = await ledgers();
    const { sales, debts, gahanOut, gahanBack } = await load(range);
    const saleById = new Map(sales.map((s) => [String(s._id), s]));
    const linkedSales = await Sale.find({ _id: { $in: debts.map((d) => d.saleId).filter(Boolean) } });
    linkedSales.forEach((s) => saleById.set(String(s._id), s));

    if (part === "masters") {
      const customers = new Map();
      sales.forEach((s) => { if (saleFigures(s).balance > 0.005) customers.set(customerLedger(s.customerName, s.customerMobile), s); });
      debts.forEach((d) => customers.set(customerLedger(d.customerName, d.customerMobile), d));
      const msgs = [
        ledgerMaster(L.tally_sales_ledger, "Sales Accounts", "<ISBILLWISEON>No</ISBILLWISEON>"),
        ledgerMaster(L.tally_cgst_ledger, "Duties & Taxes", "<TAXTYPE>GST</TAXTYPE><GSTDUTYHEAD>Central Tax</GSTDUTYHEAD>"),
        ledgerMaster(L.tally_sgst_ledger, "Duties & Taxes", "<TAXTYPE>GST</TAXTYPE><GSTDUTYHEAD>State Tax</GSTDUTYHEAD>"),
        ledgerMaster(L.tally_bank_ledger, "Bank Accounts"),
        ledgerMaster(L.tally_roundoff_ledger, "Indirect Expenses"),
        ledgerMaster(L.tally_discount_ledger, "Indirect Expenses"),
        ledgerMaster(L.tally_girvi_ledger, "Loans & Advances (Asset)"),
        ledgerMaster(L.tally_interest_ledger, "Indirect Incomes"),
        ...(L.tally_cash_ledger.toLowerCase() === "cash" ? [] : [ledgerMaster(L.tally_cash_ledger, "Cash-in-Hand")]),
        ...[...customers.entries()].map(([name, c]) =>
          ledgerMaster(name, "Sundry Debtors", `<ISBILLWISEON>No</ISBILLWISEON>${c.customerMobile ? `<LEDGERMOBILE>${esc(c.customerMobile)}</LEDGERMOBILE>` : ""}${c.customerAddress ? `<ADDRESS.LIST TYPE="String"><ADDRESS>${esc(c.customerAddress)}</ADDRESS></ADDRESS.LIST>` : ""}<COUNTRYOFRESIDENCE>India</COUNTRYOFRESIDENCE>`)),
      ];
      return send(res, `JMS-Tally-Masters-${req.query.from}-to-${req.query.to}.xml`, "application/xml", envelope("All Masters", L.tally_company, msgs));
    }

    const msgs = [];
    for (const s of sales) {
      const f = saleFigures(s);
      const onCredit = f.balance > 0.005;
      const party = onCredit ? customerLedger(s.customerName, s.customerMobile) : L.tally_cash_ledger;
      const lines = [
        { ledger: party, amount: f.invoiceValue, debit: true, party: true },
        ...(f.v2 || !f.discount ? [] : [{ ledger: L.tally_discount_ledger, amount: f.discount, debit: true }]),
        { ledger: L.tally_sales_ledger, amount: f.taxable, debit: false },
        { ledger: L.tally_cgst_ledger, amount: f.cgst, debit: false },
        { ledger: L.tally_sgst_ledger, amount: f.sgst, debit: false },
      ];
      const diff = r2(lines.reduce((t, l) => t + (l.debit ? l.amount : -l.amount), 0)); // debits − credits
      if (diff) lines.push({ ledger: L.tally_roundoff_ledger, amount: Math.abs(diff), debit: diff < 0 });
      const narration = `JMS invoice #${s.invoiceNumber} · ${s.customerName || "Walk-in"}${s.customerMobile ? ` (${s.customerMobile})` : ""} · ${itemsText(s)}${s.oldGoldWeight ? ` · Old gold ${s.oldGoldWeight} g` : ""}${f.v2 ? "" : " · billed before v2"}`;
      msgs.push(voucher({ type: "Sales", date: s.createdAt, number: s.invoiceNumber, party, narration, lines }));
      // Advance / old gold paid at the counter on a credit sale
      if (onCredit && f.advance > 0) {
        msgs.push(voucher({
          type: "Receipt", date: s.createdAt, number: `ADV-${s.invoiceNumber}`, party,
          narration: `Advance / old gold received from ${s.customerName || "customer"} against JMS invoice #${s.invoiceNumber}${s.oldGoldWeight ? ` (old gold ${s.oldGoldWeight} g)` : ""}`,
          lines: [{ ledger: L.tally_cash_ledger, amount: f.advance, debit: true }, { ledger: party, amount: f.advance, debit: false, party: true }],
        }));
      }
    }
    // Udhaar payments received in the period
    for (const d of debts) {
      const party = customerLedger(d.customerName, d.customerMobile);
      const sale = d.saleId ? saleById.get(String(d.saleId)) : null;
      (d.payments || []).forEach((p, i) => {
        if (!(new Date(p.date) >= range.start && new Date(p.date) < range.end) || !(p.amount > 0)) return;
        const bank = /upi|card|bank|neft|imps|cheque/i.test(p.method || "");
        msgs.push(voucher({
          type: "Receipt", date: p.date, number: `UDH-${String(d._id).slice(-6)}-${i + 1}`, party,
          narration: `Udhaar payment from ${d.customerName} (${p.method || "Cash"})${sale ? ` against JMS invoice #${sale.invoiceNumber}` : ""}`,
          lines: [{ ledger: bank ? L.tally_bank_ledger : L.tally_cash_ledger, amount: p.amount, debit: true }, { ledger: party, amount: p.amount, debit: false, party: true }],
        }));
      });
    }
    // Girvi: money lent, and money (principal + interest) received on release
    for (const g of gahanOut) {
      msgs.push(voucher({
        type: "Payment", date: g.pawnDate, number: `GIR-${g.recordNumber}`,
        narration: `Girvi #${g.recordNumber} · ${g.customerName}${g.customerMobile ? ` (${g.customerMobile})` : ""} · ${g.itemName} ${g.itemWeight} g${g.itemPurity ? ` ${g.itemPurity}` : ""} · ${g.interestRate}% per month`,
        lines: [{ ledger: L.tally_girvi_ledger, amount: g.amountGiven, debit: true }, { ledger: L.tally_cash_ledger, amount: g.amountGiven, debit: false }],
      }));
    }
    for (const g of gahanBack) {
      const interest = r2(g.interestReceived);
      msgs.push(voucher({
        type: "Receipt", date: g.releaseDate, number: `GIR-${g.recordNumber}-R`,
        narration: `Girvi #${g.recordNumber} released · ${g.customerName} · ${g.itemName}${interest ? ` · interest ${amt(interest)}` : " · interest not recorded in JMS"}`,
        lines: [
          { ledger: L.tally_cash_ledger, amount: r2(g.amountGiven + interest), debit: true },
          { ledger: L.tally_girvi_ledger, amount: g.amountGiven, debit: false },
          { ledger: L.tally_interest_ledger, amount: interest, debit: false },
        ],
      }));
    }
    return send(res, `JMS-Tally-Vouchers-${req.query.from}-to-${req.query.to}.xml`, "application/xml", envelope("Vouchers", L.tally_company, msgs));
  } catch (error) {
    console.error("Tally export failed:", error.message);
    res.status(500).json({ message: `Export failed: ${error.message}` });
  }
});

// ── Registers for Excel (CSV) ─────────────────────────────────────────────────
const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (rows) => "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";

router.get("/register", async (req, res) => {
  const range = istRange(req.query.from, req.query.to);
  if (!range) return res.status(400).json({ message: "Give from and to dates as YYYY-MM-DD." });
  const type = req.query.type === "girvi" ? "girvi" : "sales";
  try {
    if (type === "girvi") {
      const list = await Gahan.find({ $or: [{ pawnDate: { $gte: range.start, $lt: range.end } }, { releaseDate: { $gte: range.start, $lt: range.end } }] }).sort({ pawnDate: 1 });
      const rows = [["Record No", "Pledge Date", "Customer", "Mobile", "Item", "Weight (g)", "Purity", "Amount Given", "Interest % per month", "Due Date", "Status", "Release Date", "Interest Received", "Amount Received"]];
      list.forEach((g) => rows.push([g.recordNumber, ymd(g.pawnDate), g.customerName, g.customerMobile, g.itemName, g.itemWeight, g.itemPurity, amt(g.amountGiven), g.interestRate, ymd(g.dueDate), g.status, g.releaseDate ? ymd(g.releaseDate) : "", amt(g.interestReceived), amt(g.amountReceived)]));
      return send(res, `JMS-Girvi-Register-${req.query.from}-to-${req.query.to}.csv`, "text/csv; charset=utf-8", csv(rows));
    }
    const sales = await Sale.find({ createdAt: { $gte: range.start, $lt: range.end } }).sort({ createdAt: 1, invoiceNumber: 1 });
    const rows = [["Invoice No", "Date", "Customer", "Mobile", "Items", "HSN", "Net Weight (g)", "Metal Value", "Making Charges", "Discount", "Taxable Value", "CGST", "SGST", "Total GST", "Invoice Value", "Advance / Old Gold", "Balance (Udhaar)", "Old Gold (g)", "HUIDs"]];
    const T = { w: 0, metal: 0, making: 0, discount: 0, taxable: 0, cgst: 0, sgst: 0, inv: 0, adv: 0, bal: 0 };
    for (const s of sales) {
      const f = saleFigures(s);
      const w = (s.items || []).reduce((t, i) => t + (i.sellingWeight || 0) * (i.quantity || 1), 0);
      rows.push([s.invoiceNumber, ymd(s.createdAt), s.customerName, s.customerMobile, itemsText(s), "7113", w.toFixed(3), amt(f.metal), amt(f.making), amt(f.discount), amt(f.taxable), amt(f.cgst), amt(f.sgst), amt(f.cgst + f.sgst), amt(f.invoiceValue), amt(f.advance), amt(f.balance), s.oldGoldWeight || 0, (s.items || []).map((i) => i.huid).filter(Boolean).join(" ")]);
      T.w += w; T.metal += f.metal; T.making += f.making; T.discount += f.discount; T.taxable += f.taxable; T.cgst += f.cgst; T.sgst += f.sgst; T.inv += f.invoiceValue; T.adv += f.advance; T.bal += f.balance;
    }
    rows.push(["TOTAL", "", `${sales.length} invoices`, "", "", "", T.w.toFixed(3), amt(T.metal), amt(T.making), amt(T.discount), amt(T.taxable), amt(T.cgst), amt(T.sgst), amt(T.cgst + T.sgst), amt(T.inv), amt(T.adv), amt(T.bal), "", ""]);
    return send(res, `JMS-Sales-Register-${req.query.from}-to-${req.query.to}.csv`, "text/csv; charset=utf-8", csv(rows));
  } catch (error) {
    console.error("Register export failed:", error.message);
    res.status(500).json({ message: "Export failed." });
  }
});

// ── Summary for the export screen ─────────────────────────────────────────────
router.get("/summary", async (req, res) => {
  const range = istRange(req.query.from, req.query.to);
  if (!range) return res.status(400).json({ message: "Give from and to dates as YYYY-MM-DD." });
  try {
    const { sales, debts, gahanOut, gahanBack } = await load(range);
    const figs = sales.map(saleFigures);
    const sum = (k) => r2(figs.reduce((t, f) => t + f[k], 0));
    const udhaarReceived = r2(debts.reduce((t, d) => t + (d.payments || []).filter((p) => new Date(p.date) >= range.start && new Date(p.date) < range.end).reduce((a, p) => a + (p.amount || 0), 0), 0));
    res.json({
      invoices: sales.length,
      taxable: sum("taxable"),
      cgst: sum("cgst"),
      sgst: sum("sgst"),
      invoiceValue: sum("invoiceValue"),
      udhaarReceived,
      girviLent: r2(gahanOut.reduce((t, g) => t + g.amountGiven, 0)),
      girviReleased: gahanBack.length,
      girviInterest: r2(gahanBack.reduce((t, g) => t + (g.interestReceived || 0), 0)),
    });
  } catch (error) {
    console.error("Export summary failed:", error.message);
    res.status(500).json({ message: "Server error." });
  }
});

function send(res, filename, type, body) {
  res.setHeader("Content-Type", type);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(body);
}

module.exports = router;
module.exports.LEDGER_DEFAULTS = LEDGER_DEFAULTS;
