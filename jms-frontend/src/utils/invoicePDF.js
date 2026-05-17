import { siteConfig } from "./siteConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── WhatsApp text ────────────────────────────────────────────────────────────
const buildWhatsAppText = ({
  invoiceNumber,
  invoiceDate,
  customerName,
  items,
  itemsSubtotal,
  totalMakingCharges,
  cgstAmount,
  sgstAmount,
  grandTotal,
  advancePayment,
  discount,
  balanceDue,
  applyGst,
}) => {
  const date =
    invoiceDate ||
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const itemLines = items
    .map((item) => {
      const wt = (item.sellingWeight || 0) * (item.quantity || 1);
      const amt =
        wt * (item.sellingPricePerGram || 0) +
        wt * (item.makingChargePerGram || 0);
      return `• ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""} (${wt.toFixed(3)}g) — ₹${amt.toFixed(2)}`;
    })
    .join("\n");

  let msg = `*${siteConfig.shopName}*\nInvoice #${invoiceNumber || "—"} | ${date}\n\n`;
  msg += `Dear ${customerName || "Customer"},\nThank you for your purchase!\n\n`;
  msg += `*Items:*\n${itemLines}\n\n`;
  msg += `Metal Value: ₹${(itemsSubtotal || 0).toFixed(2)}\n`;
  msg += `Making Charges: ₹${(totalMakingCharges || 0).toFixed(2)}\n`;
  if (applyGst) {
    msg += `CGST: ₹${(cgstAmount || 0).toFixed(2)}\n`;
    msg += `SGST: ₹${(sgstAmount || 0).toFixed(2)}\n`;
  }
  msg += `*Total: ₹${(grandTotal || 0).toFixed(2)}*\n`;
  if ((advancePayment || 0) > 0)
    msg += `Advance Paid: — ₹${Number(advancePayment).toFixed(2)}\n`;
  if ((discount || 0) > 0)
    msg += `Discount: — ₹${Number(discount).toFixed(2)}\n`;
  msg += `*Balance Due: ₹${(balanceDue || 0).toFixed(2)}*\n\n`;
  msg += `Goods once sold will not be exchanged.\n${siteConfig.shopAddress}`;
  return msg;
};

// ─── Logo loader (canvas → data URL) ─────────────────────────────────────────
const loadLogoDataUrl = () =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = `${window.location.origin}/VJ.png`;
  });

// ─── Core PDF builder ─────────────────────────────────────────────────────────
const buildPDFDoc = async (data) => {
  const {
    invoiceNumber,
    invoiceDate,
    customerName,
    customerAddress,
    customerMobile,
    oldGoldWeight,
    items,
    itemsSubtotal,
    totalMakingCharges,
    applyGst,
    cgstAmount,
    sgstAmount,
    grandTotal,
    advancePayment,
    discount,
    balanceDue,
    gstin,
  } = data;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const M = 15;        // left/right margin
  const PW = 210;      // page width
  const CW = PW - M * 2; // content width (180mm)
  const Rs = (n) => `Rs.${Number(n || 0).toFixed(2)}`;

  const date =
    invoiceDate ||
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const displayGstin = gstin || siteConfig.gstNumber || "";

  // ── Header ──────────────────────────────────────────────────────────────────
  let y = 12;
  const logoDataUrl = await loadLogoDataUrl();
  const LOGO_SIZE = 18;

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", M, y, LOGO_SIZE, LOGO_SIZE);
  }

  const textX = logoDataUrl ? M + LOGO_SIZE + 4 : M;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text(siteConfig.shopName, textX, y + 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text("सोने चांदीचे व्यापारी", textX, y + 10);
  doc.text(`${siteConfig.ownerName}  |  Mo: ${siteConfig.ownerMobile}`, textX, y + 15);
  doc.text(siteConfig.shopAddress, textX, y + 20);

  if (applyGst && displayGstin) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`GSTIN: ${displayGstin}`, textX, y + 25);
    y += 5;
  }

  y += 28;
  doc.setLineWidth(0.5);
  doc.line(M, y, PW - M, y);
  y += 5;

  // ── Invoice title ────────────────────────────────────────────────────────────
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text(applyGst ? "TAX INVOICE" : "INVOICE", PW / 2, y, {
    align: "center",
  });
  y += 6;

  // ── Meta bar ─────────────────────────────────────────────────────────────────
  doc.setFillColor(243, 244, 246);
  doc.rect(M, y, CW, 7, "F");
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Invoice No:", M + 2, y + 5);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceNumber ? `#${invoiceNumber}` : "DRAFT", M + 22, y + 5);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Date:", PW - M - 32, y + 5);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(date, PW - M - 20, y + 5);
  y += 10;

  // ── Customer section ──────────────────────────────────────────────────────────
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.rect(M, y, CW, (oldGoldWeight || 0) > 0 ? 20 : 16, "S");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(136, 136, 136);
  doc.text("BILLED TO", M + 3, y + 5);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(customerName || "Walk-in Customer", M + 3, y + 10);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  if (customerAddress) doc.text(customerAddress, M + 3, y + 15);
  doc.text(`Mo: ${customerMobile || "—"}`, M + 3, customerAddress ? y + 19 : y + 15);

  if ((oldGoldWeight || 0) > 0) {
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text(`Old Gold Returned: ${oldGoldWeight}g`, PW - M - 3, y + 10, {
      align: "right",
    });
    doc.setTextColor(0, 0, 0);
    y += 4;
  }

  y += (oldGoldWeight || 0) > 0 ? 26 : 22;

  // ── Items table ───────────────────────────────────────────────────────────────
  const tableRows = items.map((item, idx) => {
    const totalWt = (item.sellingWeight || 0) * (item.quantity || 1);
    const rate = item.sellingPricePerGram || 0;
    const mc = item.makingChargePerGram || 0;
    const amount = totalWt * rate + totalWt * mc;
    const nameLabel =
      item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name;
    return [
      idx + 1,
      nameLabel,
      "7113",
      item.sellingPurity || "—",
      totalWt.toFixed(3),
      `Rs.${rate.toFixed(2)}`,
      `Rs.${mc.toFixed(2)}`,
      `Rs.${amount.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["Sr.", "Description", "HSN", "Purity", "Wt(g)", "Rate/g", "MC/g", "Amount"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: { fontSize: 8.5, textColor: [17, 17, 17] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 8,  halign: "center" },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: 18, halign: "right" },
      7: { cellWidth: 24, halign: "right", fontStyle: "bold" },
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── Totals ─────────────────────────────────────────────────────────────────────
  const LX = 145; // label right-align x
  const RX = PW - M; // value right-align x
  const LH = 5.5;
  const taxable = (itemsSubtotal || 0) + (totalMakingCharges || 0);

  const addTotalRow = (label, value, bold = false, color = [0, 0, 0]) => {
    doc.setFont("Helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(...color);
    doc.text(label, LX, y, { align: "right" });
    doc.text(value, RX, y, { align: "right" });
    y += LH;
  };

  doc.setTextColor(0, 0, 0);
  addTotalRow("Metal Value:", Rs(itemsSubtotal));
  addTotalRow("Making Charges:", Rs(totalMakingCharges));

  if (applyGst) {
    doc.setLineWidth(0.2);
    doc.line(LX - 15, y - 1, RX, y - 1);
    addTotalRow("Taxable Amount:", Rs(taxable));
    addTotalRow("CGST (Metal@1.5% + MC@2.5%):", Rs(cgstAmount), false, [55, 65, 81]);
    addTotalRow("SGST (Metal@1.5% + MC@2.5%):", Rs(sgstAmount), false, [55, 65, 81]);
  }

  doc.setLineWidth(0.5);
  doc.line(LX - 15, y - 1, RX, y - 1);
  addTotalRow("Grand Total:", Rs(grandTotal), true);

  if ((advancePayment || 0) > 0)
    addTotalRow("Advance Paid:", `— ${Rs(advancePayment)}`, false, [20, 83, 45]);
  if ((discount || 0) > 0)
    addTotalRow("Discount:", `— ${Rs(discount)}`, false, [88, 28, 135]);

  doc.setLineWidth(1);
  doc.setDrawColor(29, 78, 216);
  doc.line(LX - 15, y - 1, RX, y - 1);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  addTotalRow("Net Payable:", Rs(balanceDue), true, [29, 78, 216]);

  y += 4;

  // ── Terms ─────────────────────────────────────────────────────────────────────
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.setLineWidth(0.2);
  doc.line(M, y, PW - M, y);
  y += 4;
  doc.text(
    "Terms & Conditions: Goods once sold will not be taken back or exchanged. Purity as hallmarked and declared. E.&O.E.",
    M,
    y,
    { maxWidth: CW }
  );
  y += 10;

  // ── Signatures ────────────────────────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  const sig1X = M + CW * 0.2;
  const sig2X = M + CW * 0.78;

  doc.line(M, y + 12, M + CW * 0.4, y + 12);
  doc.line(M + CW * 0.6, y + 12, PW - M, y + 12);
  y += 14;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Customer Signature", sig1X, y, { align: "center" });
  doc.text("Authorized Signatory", sig2X, y, { align: "center" });
  y += 4;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(customerName || "", sig1X, y, { align: "center" });
  doc.text(siteConfig.shopName, sig2X, y, { align: "center" });
  y += 8;

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.setLineWidth(0.3);
  doc.line(M, y, PW - M, y);
  y += 4;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text("Thank you for your business!", M, y);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(siteConfig.shopAddress, PW - M, y, { align: "right" });
  y += 4;
  doc.setFontSize(7.5);
  doc.text(
    "आपल्या विश्वासाबद्दल धन्यवाद.",
    M,
    y
  );

  // "CUSTOMER COPY" stamp (right side of footer)
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  const stampText = "CUSTOMER COPY";
  const stampX = PW - M - 36;
  const stampY = y - 10;
  doc.rect(stampX, stampY, 34, 7, "S");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(stampText, stampX + 17, stampY + 4.5, { align: "center" });

  return doc;
};

// ─── Public: download PDF ─────────────────────────────────────────────────────
export const downloadInvoicePDF = async (data) => {
  const doc = await buildPDFDoc(data);
  const name = (data.customerName || "Customer").replace(/\s+/g, "_");
  const num = data.invoiceNumber || "Draft";
  doc.save(`Invoice_${num}_${name}.pdf`);
};

// ─── Public: share to WhatsApp (PDF + text) ───────────────────────────────────
/**
 * On mobile (Android Chrome, iOS Safari) — uses Web Share API:
 *   generates the PDF, opens native share sheet, user picks WhatsApp.
 *   PDF + text go together in one tap.
 *
 * On desktop (Chrome, Firefox, Edge) — fallback:
 *   PDF downloads automatically, then wa.me opens with text pre-filled.
 *   User attaches the downloaded PDF in WhatsApp manually.
 *   onFallback() is called so the caller can show a toast/hint.
 */
export const shareInvoiceToWhatsApp = async (data, { onFallback } = {}) => {
  const mobile = (data.customerMobile || "").replace(/\D/g, "");
  const waNumber = mobile.startsWith("91") ? mobile : `91${mobile}`;
  const text = buildWhatsAppText(data);
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

  const name = (data.customerName || "Customer").replace(/\s+/g, "_");
  const num = data.invoiceNumber || "Draft";
  const fileName = `Invoice_${num}_${name}.pdf`;

  // ── Try Web Share API (mobile browsers) ──────────────────────────────────────
  if (typeof navigator.canShare === "function") {
    try {
      const doc = await buildPDFDoc(data);
      const blob = doc.output("blob");
      const file = new File([blob], fileName, { type: "application/pdf" });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice #${data.invoiceNumber || "—"} — ${siteConfig.shopName}`,
          text,
        });
        return; // ✓ shared via native sheet
      }
    } catch (err) {
      if (err.name === "AbortError") return; // user cancelled share sheet
      // Otherwise fall through to desktop fallback
    }
  }

  // ── Desktop fallback: download PDF + open WhatsApp text ──────────────────────
  const doc = await buildPDFDoc(data);
  doc.save(fileName);
  if (onFallback) onFallback();
  setTimeout(() => window.open(waUrl, "_blank"), 700);
};
