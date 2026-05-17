import React from "react";
import { FaPrint, FaWhatsapp } from "react-icons/fa";
import { FiDownload, FiX } from "react-icons/fi";
import { siteConfig } from "../../utils/siteConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Build WhatsApp message from a saved sale record
const buildWhatsAppMessage = (sale) => {
  const date = new Date(sale.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const name = sale.customerName || "Customer";

  const itemLines = sale.items.map((item) => {
    const wt = (item.sellingWeight || 0) * item.quantity;
    const amt = (wt * (item.sellingPricePerGram || 0)) + (wt * (item.makingChargePerGram || 0));
    return `• ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""} (${wt.toFixed(3)}g) — ₹${amt.toFixed(2)}`;
  }).join("\n");

  const hasGst = (sale.gstAmount || 0) > 0;

  let msg = `*${siteConfig.shopName}*\nInvoice #${sale.invoiceNumber} | ${date}\n\nDear ${name},\nThank you for your purchase!\n\n*Items:*\n${itemLines}\n\n`;
  msg += `Metal Value: ₹${(sale.subtotal || 0).toFixed(2)}\nMaking Charges: ₹${(sale.totalMakingCharges || 0).toFixed(2)}\n`;
  if (hasGst) {
    msg += `CGST: ₹${(sale.cgstAmount || 0).toFixed(2)}\nSGST: ₹${(sale.sgstAmount || 0).toFixed(2)}\n`;
  }
  msg += `*Total: ₹${(sale.totalAmount || 0).toFixed(2)}*\n`;
  if ((sale.advancePayment || 0) > 0) msg += `Advance Paid: — ₹${sale.advancePayment.toFixed(2)}\n`;
  if ((sale.discount || 0) > 0) msg += `Discount: — ₹${sale.discount.toFixed(2)}\n`;
  msg += `*Balance Due: ₹${(sale.balanceDue || 0).toFixed(2)}*\n\n`;
  msg += `Goods once sold will not be exchanged.\n${siteConfig.shopAddress}`;
  return msg;
};

const SaleDetailModal = ({ sale, onClose, gstNumber }) => {
  if (!sale) return null;

  const invoiceDate = new Date(sale.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const hasGst = (sale.gstAmount || 0) > 0;
  const displayGstNumber = gstNumber || siteConfig.gstNumber;

  // Recompute item line totals from stored data
  const getLineTotal = (item) => {
    const wt = (item.sellingWeight || 0) * item.quantity;
    return (wt * (item.sellingPricePerGram || 0)) + (wt * (item.makingChargePerGram || 0));
  };

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const mobile = (sale.customerMobile || "").replace(/\D/g, "");
    const waNumber = mobile.startsWith("91") ? mobile : `91${mobile}`;
    const text = buildWhatsAppMessage(sale);
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const MARGIN = 15;
    const PAGE_W = 210;

    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text(siteConfig.shopName, PAGE_W / 2, 20, { align: "center" });
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text("सोने चांदीचे व्यापारी", PAGE_W / 2, 26, { align: "center" });
    doc.text(`${siteConfig.ownerName} | Mo: ${siteConfig.ownerMobile}`, PAGE_W / 2, 31, { align: "center" });
    doc.text(siteConfig.shopAddress, PAGE_W / 2, 36, { align: "center" });
    if (hasGst && displayGstNumber) {
      doc.setFont("Helvetica", "bold");
      doc.text(`GSTIN: ${displayGstNumber}`, PAGE_W / 2, 41, { align: "center" });
    }

    // Divider
    doc.setLineWidth(0.5);
    doc.line(MARGIN, 44, PAGE_W - MARGIN, 44);

    // Invoice title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TAX INVOICE", PAGE_W / 2, 51, { align: "center" });

    // Customer + Invoice details
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Invoice #: ${sale.invoiceNumber}`, MARGIN, 59);
    doc.text(`Date: ${invoiceDate}`, PAGE_W - MARGIN, 59, { align: "right" });
    doc.text(`Name: ${sale.customerName || "Walk-in Customer"}`, MARGIN, 65);
    doc.text(`Mobile: ${sale.customerMobile || "—"}`, PAGE_W - MARGIN, 65, { align: "right" });
    if (sale.customerAddress) {
      doc.text(`Address: ${sale.customerAddress}`, MARGIN, 71);
    }
    if ((sale.oldGoldWeight || 0) > 0) {
      doc.setTextColor(180, 100, 0);
      doc.text(`Old Gold: ${sale.oldGoldWeight}g`, PAGE_W - MARGIN, 71, { align: "right" });
      doc.setTextColor(0, 0, 0);
    }

    // Items table
    const tableRows = sale.items.map((item, idx) => {
      const wt = (item.sellingWeight || 0) * item.quantity;
      const lineTotal = getLineTotal(item);
      return [
        idx + 1,
        item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name,
        item.sellingPurity || "—",
        wt.toFixed(3),
        `₹${(item.sellingPricePerGram || 0).toFixed(2)}`,
        `₹${(item.makingChargePerGram || 0).toFixed(2)}`,
        `₹${lineTotal.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      head: [["Sr.", "Item", "Purity", "Wt(g)", "Rate/g", "MC/g", "Amount"]],
      body: tableRows,
      startY: 77,
      margin: { left: MARGIN, right: MARGIN },
      theme: "grid",
      headStyles: { fillColor: [50, 50, 50], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        2: { cellWidth: 16, halign: "center" },
        3: { cellWidth: 18, halign: "right" },
        4: { cellWidth: 22, halign: "right" },
        5: { cellWidth: 18, halign: "right" },
        6: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      },
    });

    // Totals
    let y = doc.lastAutoTable.finalY + 6;
    const lx = 145;
    const rx = PAGE_W - MARGIN;
    const lh = 5.5;

    const addRow = (label, value, bold = false, color = [0, 0, 0]) => {
      doc.setFont("Helvetica", bold ? "bold" : "normal");
      doc.setFontSize(bold ? 10 : 9);
      doc.setTextColor(...color);
      doc.text(label, lx, y, { align: "right" });
      doc.text(value, rx, y, { align: "right" });
      y += lh;
    };

    doc.setTextColor(0, 0, 0);
    addRow("Metal Value:", `₹${(sale.subtotal || 0).toFixed(2)}`);
    addRow("Making Charges:", `₹${(sale.totalMakingCharges || 0).toFixed(2)}`);
    if (hasGst) {
      addRow("CGST:", `₹${(sale.cgstAmount || 0).toFixed(2)}`);
      addRow("SGST:", `₹${(sale.sgstAmount || 0).toFixed(2)}`);
    }
    doc.setLineWidth(0.3);
    doc.line(lx - 10, y - 1, rx, y - 1);
    addRow("Total (एकूण):", `₹${(sale.totalAmount || 0).toFixed(2)}`, true);
    if ((sale.advancePayment || 0) > 0) addRow("Advance:", `— ₹${sale.advancePayment.toFixed(2)}`, false, [0, 120, 0]);
    if ((sale.discount || 0) > 0) addRow("Discount:", `— ₹${sale.discount.toFixed(2)}`, false, [120, 0, 120]);
    doc.setLineWidth(0.5);
    doc.line(lx - 10, y - 1, rx, y - 1);
    addRow("Balance Due:", `₹${(sale.balanceDue || 0).toFixed(2)}`, true, [0, 0, 180]);

    // Signature lines
    y += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.line(MARGIN, y, MARGIN + 60, y);
    doc.line(PAGE_W - MARGIN - 60, y, PAGE_W - MARGIN, y);
    y += 4;
    doc.text("Customer Signature", MARGIN + 30, y, { align: "center" });
    doc.text("Authorized Signatory", PAGE_W - MARGIN - 30, y, { align: "center" });

    // Footer
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for your business! Goods once sold will not be taken back or exchanged.", PAGE_W / 2, y, { align: "center" });
    doc.text(siteConfig.shopAddress, PAGE_W / 2, y + 4, { align: "center" });

    const fileName = `Invoice_${sale.invoiceNumber}_${(sale.customerName || "Customer").replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="text-gray-900">

      {/* ══════════════════════════════════════════ */}
      {/* PRINTABLE INVOICE AREA                    */}
      {/* ══════════════════════════════════════════ */}
      <div id="invoice-content-printable" className="p-2">

        {/* Shop Header */}
        <div className="text-center mb-5 pb-4 border-b-2 border-gray-300">
          <img src="/VJ.png" alt="Logo" className="h-14 w-auto mx-auto mb-2" />
          <h1 className="text-xl font-extrabold text-gray-900">{siteConfig.shopName}</h1>
          <p className="text-sm text-gray-500">सोने चांदीचे व्यापारी</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {siteConfig.ownerName} &nbsp;|&nbsp; Mo: {siteConfig.ownerMobile}
          </p>
          <p className="text-xs text-gray-500">{siteConfig.shopAddress}</p>
          {hasGst && displayGstNumber && (
            <p className="text-xs font-bold text-gray-800 mt-0.5 tracking-widest">GSTIN: {displayGstNumber}</p>
          )}
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-4">
          <span className="text-base font-bold uppercase tracking-widest text-gray-700 border-b-2 border-gray-700 pb-0.5">
            Tax Invoice
          </span>
        </div>

        {/* Customer + Invoice Details */}
        <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Billed To</p>
            <p className="font-semibold text-gray-900">{sale.customerName || "Walk-in Customer"}</p>
            {sale.customerAddress && <p className="text-gray-600">{sale.customerAddress}</p>}
            <p className="text-gray-600">Mo: {sale.customerMobile || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Invoice Details</p>
            <p className="font-bold text-gray-900">
              Invoice #: <span className="text-blue-700">{sale.invoiceNumber}</span>
            </p>
            <p className="text-gray-600">Date: <span className="font-medium text-gray-800">{invoiceDate}</span></p>
            {(sale.oldGoldWeight || 0) > 0 && (
              <p className="text-amber-700 font-medium mt-1">Old Gold: {sale.oldGoldWeight}g</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-5 text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-y-2 border-gray-300">
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase">Sr.</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
              <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 uppercase">Purity</th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-gray-600 uppercase">Wt (g)</th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-gray-600 uppercase">Rate/g</th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-gray-600 uppercase">MC/g</th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, idx) => (
              <tr key={item._id || idx} className="border-b border-gray-200">
                <td className="py-2 px-2 text-gray-500">{idx + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900">
                  {item.name}
                  {item.quantity > 1 && <span className="ml-1 text-xs text-gray-500">(×{item.quantity})</span>}
                </td>
                <td className="py-2 px-2 text-center text-gray-600">{item.sellingPurity || "—"}</td>
                <td className="py-2 px-2 text-right text-gray-700">{((item.sellingWeight || 0) * item.quantity).toFixed(3)}</td>
                <td className="py-2 px-2 text-right text-gray-700">₹{(item.sellingPricePerGram || 0).toFixed(2)}</td>
                <td className="py-2 px-2 text-right text-gray-700">₹{(item.makingChargePerGram || 0).toFixed(2)}</td>
                <td className="py-2 px-2 text-right font-semibold text-gray-900">₹{getLineTotal(item).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-68 text-sm space-y-1.5" style={{ minWidth: "260px" }}>
            <div className="flex justify-between text-gray-600">
              <span>Metal Value</span>
              <span>₹{(sale.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Making Charges</span>
              <span>₹{(sale.totalMakingCharges || 0).toFixed(2)}</span>
            </div>
            {hasGst && (
              <>
                <div className="border-t border-gray-200 pt-1 flex justify-between text-gray-600">
                  <span>Taxable Amount</span>
                  <span>₹{((sale.subtotal || 0) + (sale.totalMakingCharges || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>CGST <span className="text-xs text-gray-400">(Metal 1.5% + MC 2.5%)</span></span>
                  <span>₹{(sale.cgstAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>SGST <span className="text-xs text-gray-400">(Metal 1.5% + MC 2.5%)</span></span>
                  <span>₹{(sale.sgstAmount || 0).toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-base border-t-2 border-gray-800 pt-2">
              <span>Total (एकूण)</span>
              <span>₹{(sale.totalAmount || 0).toFixed(2)}</span>
            </div>
            {(sale.advancePayment || 0) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Advance / Old Gold (नगदी जमा)</span>
                <span>– ₹{sale.advancePayment.toFixed(2)}</span>
              </div>
            )}
            {(sale.discount || 0) > 0 && (
              <div className="flex justify-between text-purple-700">
                <span>Discount (सूट)</span>
                <span>– ₹{sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-lg text-blue-700 border-t-2 border-blue-700 pt-2">
              <span>Balance Due (बाकी येणे)</span>
              <span>₹{(sale.balanceDue || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signature Lines */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-8">
              <p className="font-medium text-gray-700">Customer Signature</p>
              <p className="text-xs text-gray-500 mt-0.5">{sale.customerName || ""}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-8">
              <p className="font-medium text-gray-700">Authorized Signatory</p>
              <p className="text-xs text-gray-500 mt-0.5">{siteConfig.shopName}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="font-medium text-gray-700">Thank you for your business! आपल्या विश्वासाबद्दल धन्यवाद.</p>
              <p>Goods once sold will not be taken back or exchanged.</p>
              <p>{siteConfig.shopAddress}</p>
            </div>
            <span className="flex-shrink-0 ml-4 inline-block border-2 border-gray-400 text-gray-500 font-bold text-xs px-3 py-1 rounded tracking-widest uppercase">
              Customer Copy
            </span>
          </div>
        </div>
      </div>
      {/* ══════════════════════════════════════════ */}

      {/* Action Buttons — never printed */}
      <div className="mt-5 pt-4 border-t flex justify-between items-center print-hide">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          <FaPrint className="w-4 h-4" />
          Print Invoice
        </button>

        <div className="flex gap-3">
          {sale.customerMobile && (
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
            >
              <FaWhatsapp className="w-4 h-4" />
              Share on WhatsApp
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <FiDownload className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <FiX className="w-4 h-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;
