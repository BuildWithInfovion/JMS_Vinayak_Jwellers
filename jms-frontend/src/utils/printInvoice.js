import { siteConfig } from "./siteConfig";

export const printInvoice = ({
  invoiceNumber = null,
  invoiceDate = null,
  customerName = "",
  customerAddress = "",
  customerMobile = "",
  oldGoldWeight = 0,
  items = [],
  itemsSubtotal = 0,
  totalMakingCharges = 0,
  applyGst = false,
  cgstAmount = 0,
  sgstAmount = 0,
  grandTotal = 0,
  advancePayment = 0,
  discount = 0,
  balanceDue = 0,
  gstin = "",
}) => {
  const origin = window.location.origin;
  const logoUrl = `${origin}/VJ.png`;
  const displayGstin = gstin || siteConfig.gstNumber || "";
  const taxableAmount = itemsSubtotal + totalMakingCharges;
  const date =
    invoiceDate ||
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const rs = (n) => `&#8377;${Number(n || 0).toFixed(2)}`;

  // ── Item rows ──────────────────────────────────────────────────────
  const itemRowsHtml = items
    .map((item, idx) => {
      const totalWt = (item.sellingWeight || 0) * (item.quantity || 1);
      const rate = item.sellingPricePerGram || 0;
      const mc = item.makingChargePerGram || 0;
      const amount = totalWt * rate + totalWt * mc;
      const nameCell =
        item.quantity > 1
          ? `${item.name} <span style="color:#b7791f;font-size:8pt;">&#215;${item.quantity}</span>`
          : item.name;
      return `
        <tr class="${idx % 2 === 1 ? "alt" : ""}">
          <td style="text-align:center;">${idx + 1}</td>
          <td>${nameCell}</td>
          <td style="text-align:center;">7113</td>
          <td style="text-align:center;">${item.sellingPurity || "&mdash;"}</td>
          <td style="text-align:right;">${totalWt.toFixed(3)}</td>
          <td style="text-align:right;">${rs(rate)}</td>
          <td style="text-align:right;">${rs(mc)}</td>
          <td style="text-align:right;font-weight:700;">${rs(amount)}</td>
        </tr>`;
    })
    .join("");

  // ── Totals blocks ──────────────────────────────────────────────────
  const gstBlock = applyGst
    ? `<tr class="divider-row">
         <td class="tlabel">Taxable Amount</td>
         <td class="tvalue">${rs(taxableAmount)}</td>
       </tr>
       <tr>
         <td class="tlabel small">CGST <span class="rate">(Metal @1.5% + MC @2.5%)</span></td>
         <td class="tvalue">${rs(cgstAmount)}</td>
       </tr>
       <tr>
         <td class="tlabel small">SGST <span class="rate">(Metal @1.5% + MC @2.5%)</span></td>
         <td class="tvalue">${rs(sgstAmount)}</td>
       </tr>`
    : "";

  const advanceBlock =
    (advancePayment || 0) > 0
      ? `<tr>
           <td class="tlabel" style="color:#14532d;">Advance Paid</td>
           <td class="tvalue" style="color:#14532d;">&minus; ${rs(advancePayment)}</td>
         </tr>`
      : "";

  const discountBlock =
    (discount || 0) > 0
      ? `<tr>
           <td class="tlabel" style="color:#6d28d9;">Discount</td>
           <td class="tvalue" style="color:#6d28d9;">&minus; ${rs(discount)}</td>
         </tr>`
      : "";

  const oldGoldBlock =
    (oldGoldWeight || 0) > 0
      ? `<div class="old-gold-badge">Old Gold Returned: <strong>${oldGoldWeight}g</strong></div>`
      : "";

  const invoiceNumHtml = invoiceNumber
    ? `<strong>#${invoiceNumber}</strong>`
    : `<strong style="color:#b91c1c;">DRAFT &mdash; Not yet confirmed</strong>`;

  const gstinHtml =
    applyGst && displayGstin
      ? `<div class="gstin">GSTIN: ${displayGstin}</div>`
      : "";

  // ── Full HTML ──────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${invoiceNumber ? "बिल #" + invoiceNumber : "बिल"} &mdash; ${siteConfig.shopName}</title>
  <style>
    @page { size: A4 portrait; margin: 1cm 1.4cm 1.4cm 1.4cm; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "Noto Sans Devanagari", "Mangal", Arial, sans-serif;
      font-size: 9.5pt;
      color: #1a1a1a;
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* ══ LETTERHEAD HEADER ══ */
    .header {
      text-align: center;
      padding-bottom: 8px;
      border-bottom: 3px double #92400e;
      margin-bottom: 6px;
    }
    .logo {
      width: 64px; height: 64px;
      object-fit: contain;
      margin-bottom: 4px;
    }
    .shop-name {
      font-size: 20pt;
      font-weight: 900;
      color: #1c1917;
      letter-spacing: 0.5px;
      line-height: 1.1;
    }
    .shop-tagline {
      font-size: 11pt;
      color: #78350f;
      margin-top: 2px;
    }
    .shop-meta {
      font-size: 8.5pt;
      color: #44403c;
      margin-top: 3px;
    }
    .gstin {
      font-size: 9pt;
      font-weight: 800;
      color: #1c1917;
      margin-top: 3px;
      letter-spacing: 1px;
    }

    /* ══ TITLE BAR ══ */
    .inv-title-bar {
      background: #1c1917;
      color: #fff;
      text-align: center;
      padding: 6px 0 5px;
      margin-bottom: 7px;
    }
    .inv-title-bar .mr { font-size: 13pt; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; }

    /* ══ META ROW ══ */
    .meta-row {
      display: flex;
      justify-content: space-between;
      background: #fef9f0;
      border: 1px solid #d6b896;
      border-radius: 2px;
      padding: 5px 10px;
      font-size: 9pt;
      margin-bottom: 6px;
    }
    .meta-label { color: #78350f; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; }
    .meta-val { font-weight: 800; color: #1c1917; font-size: 10pt; }

    /* ══ CUSTOMER SECTION ══ */
    .customer-box {
      border: 1px solid #d6b896;
      border-radius: 2px;
      padding: 7px 10px;
      margin-bottom: 8px;
      background: #fffbf5;
    }
    .sec-label {
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #92400e;
      margin-bottom: 4px;
      border-bottom: 1px solid #fde68a;
      padding-bottom: 2px;
    }
    .cust-name { font-size: 11pt; font-weight: 800; color: #1c1917; }
    .cust-detail { font-size: 8.5pt; color: #44403c; margin-top: 2px; }
    .old-gold-badge {
      display: inline-block;
      background: #fef3c7;
      border: 1px solid #d97706;
      color: #92400e;
      padding: 2px 8px;
      font-size: 8.5pt;
      font-weight: 600;
      border-radius: 2px;
      margin-top: 5px;
    }

    /* ══ ITEMS TABLE ══ */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .items-table thead tr { background: #1c1917; color: #fff; }
    .items-table thead th {
      padding: 6px 6px;
      font-size: 7.5pt;
      font-weight: 700;
      line-height: 1.3;
    }
    .items-table tbody td {
      padding: 5px 6px;
      font-size: 9.5pt;
      border-bottom: 1px solid #e7e5e4;
      vertical-align: middle;
    }
    .items-table tbody tr.alt td { background: #fafaf9; }
    .items-table tbody tr:last-child td { border-bottom: 2px solid #1c1917; }

    /* ══ TOTALS ══ */
    .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 8px; }
    .totals-table { width: 58%; border-collapse: collapse; }
    .totals-table td { padding: 3px 8px; border: none; }
    .tlabel {
      text-align: right;
      color: #44403c;
      white-space: nowrap;
      font-size: 9pt;
      line-height: 1.5;
    }
    .tlabel .sub { display: block; font-size: 7pt; color: #a8a29e; }
    .tlabel.small { font-size: 8pt; }
    .tvalue { text-align: right; font-weight: 600; white-space: nowrap; min-width: 110px; font-size: 9pt; }
    .rate { color: #a8a29e; font-size: 7.5pt; }
    .divider-row td { border-top: 1px solid #d6b896 !important; padding-top: 5px; }
    .grand-total-row td {
      border-top: 2px solid #1c1917 !important;
      padding-top: 6px;
      font-size: 11.5pt;
      font-weight: 900;
      background: #f5f5f4;
    }
    .balance-row td {
      border-top: 2px solid #92400e !important;
      padding-top: 7px;
      font-size: 13pt;
      font-weight: 900;
      color: #92400e;
      background: #fef9f0;
    }

    /* ══ TERMS ══ */
    .terms {
      border-top: 1px solid #d6b896;
      border-bottom: 1px solid #d6b896;
      padding: 4px 0;
      font-size: 7.5pt;
      color: #57534e;
      margin-bottom: 12px;
      line-height: 1.7;
    }
    .terms-label { font-weight: 800; color: #1c1917; }

    /* ══ SIGNATURES ══ */
    .sigs { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .sig-block { width: 42%; text-align: center; }
    .sig-line { border-top: 1.5px solid #78716c; padding-top: 5px; margin-top: 34px; }
    .sig-mr { font-size: 9pt; font-weight: 700; color: #1c1917; }
    .sig-en { font-size: 7.5pt; color: #78716c; margin-top: 1px; }
    .sig-name { font-size: 8pt; color: #a8a29e; margin-top: 2px; }

    /* ══ FOOTER ══ */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1.5px solid #d6b896;
      padding-top: 5px;
      font-size: 7.5pt;
      color: #78716c;
    }
    .footer-ty { font-weight: 700; font-size: 9pt; color: #92400e; }
    .footer-sub { font-size: 7.5pt; color: #78716c; margin-top: 2px; }
    .copy-stamp {
      border: 2px solid #92400e;
      padding: 3px 10px;
      font-size: 8pt;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #92400e;
      border-radius: 2px;
    }

    /* ══ CLOSE BUTTON (screen only) ══ */
    @media print { .no-print { display: none !important; } }
    .no-print {
      position: fixed; bottom: 18px; right: 18px;
      background: #1c1917; color: #fff; border: none;
      padding: 9px 20px; font-size: 10pt;
      font-family: Arial, sans-serif; cursor: pointer;
      border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
  </style>
</head>
<body>

<!-- ═══ LETTERHEAD HEADER ═══ -->
<div class="header">
  <img src="${logoUrl}" alt="" class="logo" onerror="this.style.display='none'">
  <div class="shop-name">${siteConfig.shopName}</div>
  <div class="shop-tagline">सोने चांदीचे व्यापारी</div>
  <div class="shop-meta">
    ${siteConfig.ownerName} &nbsp;|&nbsp; मो: ${siteConfig.ownerMobile} &nbsp;|&nbsp; ${siteConfig.shopAddress}
  </div>
  ${gstinHtml}
</div>

<!-- ═══ TITLE BAR ═══ -->
<div class="inv-title-bar">
  <div class="mr">${applyGst ? "TAX INVOICE" : "INVOICE"}</div>
</div>

<!-- ═══ META ROW ═══ -->
<div class="meta-row">
  <div>
    <div class="meta-label">Invoice No.</div>
    <div class="meta-val">${invoiceNumHtml}</div>
  </div>
  <div style="text-align:right;">
    <div class="meta-label">Date</div>
    <div class="meta-val">${date}</div>
  </div>
</div>

<!-- ═══ CUSTOMER BOX ═══ -->
<div class="customer-box">
  <div class="sec-label">Billed To</div>
  <div class="cust-name">${customerName || "Walk-in Customer"}</div>
  ${customerAddress ? `<div class="cust-detail">${customerAddress}</div>` : ""}
  <div class="cust-detail">Mo: ${customerMobile || "&mdash;"}</div>
  ${oldGoldBlock}
</div>

<!-- ═══ ITEMS TABLE ═══ -->
<table class="items-table">
  <thead>
    <tr>
      <th style="width:4%;text-align:center;">Sr.</th>
      <th style="width:27%;text-align:left;">Description</th>
      <th style="width:7%;text-align:center;">HSN</th>
      <th style="width:9%;text-align:center;">Purity</th>
      <th style="width:10%;text-align:right;">Wt&nbsp;(g)</th>
      <th style="width:14%;text-align:right;">Rate/g&nbsp;(&#8377;)</th>
      <th style="width:12%;text-align:right;">MC/g&nbsp;(&#8377;)</th>
      <th style="width:14%;text-align:right;">Amount&nbsp;(&#8377;)</th>
    </tr>
  </thead>
  <tbody>
    ${itemRowsHtml}
  </tbody>
</table>

<!-- ═══ TOTALS ═══ -->
<div class="totals-wrap">
  <table class="totals-table">
    <tr>
      <td class="tlabel">Metal Value</td>
      <td class="tvalue">${rs(itemsSubtotal)}</td>
    </tr>
    <tr>
      <td class="tlabel">Making Charges</td>
      <td class="tvalue">${rs(totalMakingCharges)}</td>
    </tr>
    ${gstBlock}
    <tr class="grand-total-row">
      <td class="tlabel">एकूण रक्कम <span class="sub" style="color:#57534e;">Grand Total</span></td>
      <td class="tvalue">${rs(grandTotal)}</td>
    </tr>
    ${advanceBlock}
    ${discountBlock}
    <tr class="balance-row">
      <td class="tlabel">देय रक्कम <span class="sub" style="color:#b45309;">Net Payable</span></td>
      <td class="tvalue">${rs(balanceDue)}</td>
    </tr>
  </table>
</div>

<!-- ═══ TERMS ═══ -->
<div class="terms">
  <span class="terms-label">Terms &amp; Conditions:</span>&nbsp;
  Goods once sold will not be taken back or exchanged.&nbsp;|&nbsp;
  Purity as hallmarked and declared.&nbsp;|&nbsp;
  All disputes subject to local jurisdiction.&nbsp;|&nbsp;
  E.&amp;O.E.
</div>

<!-- ═══ SIGNATURES ═══ -->
<div class="sigs">
  <div class="sig-block">
    <div class="sig-line">
      <div class="sig-mr">Customer Signature</div>
      <div class="sig-name">${customerName || ""}</div>
    </div>
  </div>
  <div class="sig-block">
    <div class="sig-line">
      <div class="sig-mr">Authorized Signatory</div>
      <div class="sig-name">${siteConfig.shopName}</div>
    </div>
  </div>
</div>

<!-- ═══ FOOTER ═══ -->
<div class="footer">
  <div>
    <div class="footer-ty">आपल्या विश्वासाबद्दल धन्यवाद!</div>
    <div class="footer-sub">Thank you for your business &nbsp;|&nbsp; ${siteConfig.shopAddress}</div>
  </div>
  <div class="copy-stamp">CUSTOMER COPY</div>
</div>

<button class="no-print" onclick="window.close()">&#x2715;&nbsp; Close</button>

<script>
  window.onload = function () { window.print(); };
</script>
</body>
</html>`;

  const w = window.open(
    "",
    "_blank",
    "width=920,height=700,scrollbars=yes,resizable=yes"
  );

  if (!w) {
    alert(
      "Popup blocked!\n\nPlease allow popups for this site to print invoices.\n" +
        "In Chrome: click the popup blocked icon in the address bar → Always allow."
    );
    return;
  }

  w.document.open();
  w.document.write(html);
  w.document.close();
};
