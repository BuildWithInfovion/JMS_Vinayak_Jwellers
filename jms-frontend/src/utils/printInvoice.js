import { siteConfig } from "./siteConfig";

/**
 * Opens a new browser window containing a standalone, print-ready A4 invoice
 * and triggers window.print() automatically.
 *
 * This approach (new window) is what Vyapar, Tally, Zoho Books, and all
 * market-standard billing software use. It avoids the modal-constrained
 * width, ₹-symbol corruption, and browser print CSS quirks of the old
 * window.print() approach.
 */
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

  // ── Item rows ────────────────────────────────────────────────────
  const itemRowsHtml = items
    .map((item, idx) => {
      const totalWt = (item.sellingWeight || 0) * (item.quantity || 1);
      const rate = item.sellingPricePerGram || 0;
      const mc = item.makingChargePerGram || 0;
      const amount = totalWt * rate + totalWt * mc;
      const nameCell =
        item.quantity > 1
          ? `${item.name} <span style="color:#666;font-size:8.5pt;">&times;${item.quantity}</span>`
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

  // ── Totals rows ──────────────────────────────────────────────────
  const gstBlock = applyGst
    ? `<tr class="divider-row">
         <td class="tlabel">Taxable Amount</td>
         <td class="tvalue">${rs(taxableAmount)}</td>
       </tr>
       <tr>
         <td class="tlabel small">CGST &nbsp;<span class="rate">(Metal @1.5% + MC @2.5%)</span></td>
         <td class="tvalue">${rs(cgstAmount)}</td>
       </tr>
       <tr>
         <td class="tlabel small">SGST &nbsp;<span class="rate">(Metal @1.5% + MC @2.5%)</span></td>
         <td class="tvalue">${rs(sgstAmount)}</td>
       </tr>`
    : "";

  const advanceBlock =
    (advancePayment || 0) > 0
      ? `<tr>
           <td class="tlabel" style="color:#14532d;">Advance / Old Gold &nbsp;<span style="font-size:8pt;">(&#2344;&#2327;&#2342;&#2368; &#2332;&#2350;&#2366;)</span></td>
           <td class="tvalue" style="color:#14532d;">&minus; ${rs(advancePayment)}</td>
         </tr>`
      : "";

  const discountBlock =
    (discount || 0) > 0
      ? `<tr>
           <td class="tlabel" style="color:#581c87;">Discount &nbsp;<span style="font-size:8pt;">(&#2360;&#2370;&#2335;)</span></td>
           <td class="tvalue" style="color:#581c87;">&minus; ${rs(discount)}</td>
         </tr>`
      : "";

  const oldGoldBlock =
    (oldGoldWeight || 0) > 0
      ? `<div class="old-gold-badge">Old Gold Returned: <strong>${oldGoldWeight}g</strong></div>`
      : "";

  const invoiceNumHtml = invoiceNumber
    ? `<span class="meta-val">#${invoiceNumber}</span>`
    : `<span class="meta-val draft">DRAFT &mdash; Not yet saved</span>`;

  const gstinHtml =
    applyGst && displayGstin
      ? `<div class="gstin">GSTIN: ${displayGstin}</div>`
      : "";

  // ── Full HTML document ───────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${invoiceNumber ? "Invoice #" + invoiceNumber : "Invoice Preview"} &mdash; ${siteConfig.shopName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 1.2cm 1.5cm 1.5cm 1.5cm;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Arial, Helvetica, "Liberation Sans", sans-serif;
      font-size: 10pt;
      color: #111;
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 10px;
      border-bottom: 2.5px solid #111;
      margin-bottom: 8px;
    }
    .logo { width: 62px; height: 62px; object-fit: contain; }
    .shop-name { font-size: 18pt; font-weight: 900; letter-spacing: 0.3px; color: #111; line-height: 1.1; }
    .shop-sub  { font-size: 10.5pt; color: #444; margin-top: 3px; }
    .shop-meta { font-size: 9pt; color: #333; margin-top: 2px; }
    .gstin     { font-size: 9.5pt; font-weight: 800; color: #111; margin-top: 3px; letter-spacing: 1px; }

    /* ── Invoice title ── */
    .inv-title {
      text-align: center;
      margin: 6px 0 7px;
      font-size: 12.5pt;
      font-weight: 900;
      letter-spacing: 4px;
      text-transform: uppercase;
      border-bottom: 1.5px solid #111;
      padding-bottom: 4px;
    }

    /* ── Meta bar ── */
    .meta-bar {
      display: flex;
      justify-content: space-between;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 5px 10px;
      font-size: 9.5pt;
      margin-bottom: 7px;
    }
    .meta-key { color: #555; }
    .meta-val { font-weight: 800; color: #111; margin-left: 4px; }
    .meta-val.draft { color: #b91c1c; }

    /* ── Customer section ── */
    .customer-section {
      display: flex;
      justify-content: space-between;
      border: 1px solid #d1d5db;
      padding: 7px 10px;
      margin-bottom: 8px;
      font-size: 9.5pt;
    }
    .sec-title {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 4px;
    }
    .cust-name { font-size: 11pt; font-weight: 700; }
    .old-gold-badge {
      background: #fef3c7;
      border: 1px solid #d97706;
      color: #92400e;
      padding: 3px 8px;
      font-size: 9pt;
      font-weight: 600;
      border-radius: 3px;
      margin-top: 4px;
      display: inline-block;
    }

    /* ── Items table ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .items-table thead tr {
      background: #1f2937;
      color: #fff;
    }
    .items-table thead th {
      padding: 7px 7px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .items-table tbody td {
      padding: 6px 7px;
      font-size: 9.5pt;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
    }
    .items-table tbody tr.alt td { background: #f9fafb; }
    .items-table tbody tr:last-child td {
      border-bottom: 2px solid #1f2937;
    }

    /* ── Totals ── */
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
    .totals-table {
      width: 56%;
      border-collapse: collapse;
    }
    .totals-table td { padding: 3.5px 8px; border: none; }
    .tlabel {
      text-align: right;
      color: #374151;
      white-space: nowrap;
      font-size: 9.5pt;
    }
    .tlabel.small { font-size: 8.5pt; }
    .tvalue {
      text-align: right;
      font-weight: 600;
      white-space: nowrap;
      min-width: 100px;
      font-size: 9.5pt;
    }
    .rate { color: #888; font-size: 8pt; }
    .divider-row td { border-top: 1px solid #9ca3af !important; padding-top: 6px; }
    .grand-total-row td {
      border-top: 2px solid #111 !important;
      padding-top: 7px;
      font-size: 12pt;
      font-weight: 900;
    }
    .balance-row td {
      border-top: 3px double #1d4ed8 !important;
      padding-top: 8px;
      font-size: 13pt;
      font-weight: 900;
      color: #1d4ed8;
    }

    /* ── Terms ── */
    .terms {
      border-top: 1px solid #d1d5db;
      border-bottom: 1px solid #d1d5db;
      padding: 5px 0;
      font-size: 8pt;
      color: #555;
      margin-bottom: 14px;
      line-height: 1.6;
    }
    .terms b { color: #111; }

    /* ── Signatures ── */
    .sigs {
      display: flex;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .sig-block { width: 40%; text-align: center; }
    .sig-line {
      border-top: 1.5px solid #555;
      padding-top: 5px;
      margin-top: 38px;
    }
    .sig-label { font-size: 9.5pt; font-weight: 700; color: #111; }
    .sig-name  { font-size: 8.5pt; color: #666; margin-top: 2px; }

    /* ── Footer ── */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #d1d5db;
      padding-top: 6px;
      font-size: 8pt;
      color: #666;
    }
    .footer-ty { font-weight: 700; font-size: 9pt; color: #111; margin-bottom: 2px; }
    .copy-stamp {
      border: 2px solid #999;
      padding: 3px 10px;
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #555;
    }

    /* ── Screen-only close button (hidden on print) ── */
    @media print {
      .no-print { display: none !important; }
    }
    .no-print {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1f2937;
      color: #fff;
      border: none;
      padding: 10px 20px;
      font-size: 11pt;
      font-family: Arial, sans-serif;
      cursor: pointer;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <img src="${logoUrl}" alt="" class="logo" onerror="this.style.display='none'">
  <div style="flex:1;">
    <div class="shop-name">${siteConfig.shopName}</div>
    <div class="shop-sub">&#2360;&#2379;&#2344;&#2375; &#2330;&#2366;&#2306;&#2342;&#2368;&#2330;&#2375; &#2357;&#2381;&#2351;&#2366;&#2346;&#2366;&#2352;&#2368;</div>
    <div class="shop-meta">
      ${siteConfig.ownerName}&nbsp;&nbsp;|&nbsp;&nbsp;Mo: ${siteConfig.ownerMobile}&nbsp;&nbsp;|&nbsp;&nbsp;${siteConfig.shopAddress}
    </div>
    ${gstinHtml}
  </div>
</div>

<!-- INVOICE TITLE -->
<div class="inv-title">${applyGst ? "Tax Invoice" : "Invoice"}</div>

<!-- META BAR -->
<div class="meta-bar">
  <div><span class="meta-key">Invoice&nbsp;No:</span>${invoiceNumHtml}</div>
  <div><span class="meta-key">Date:</span><span class="meta-val">${date}</span></div>
</div>

<!-- CUSTOMER -->
<div class="customer-section">
  <div>
    <div class="sec-title">Billed To</div>
    <div class="cust-name">${customerName || "Walk-in Customer"}</div>
    ${customerAddress ? `<div>${customerAddress}</div>` : ""}
    <div>Mo: ${customerMobile || "&mdash;"}</div>
    ${oldGoldBlock}
  </div>
</div>

<!-- ITEMS TABLE -->
<table class="items-table">
  <thead>
    <tr>
      <th style="width:4%;text-align:center;">Sr.</th>
      <th style="width:27%;text-align:left;">Description</th>
      <th style="width:7%;text-align:center;">HSN</th>
      <th style="width:9%;text-align:center;">Purity</th>
      <th style="width:10%;text-align:right;">Wt&nbsp;(g)</th>
      <th style="width:13%;text-align:right;">Rate/g&nbsp;(&#8377;)</th>
      <th style="width:11%;text-align:right;">MC/g&nbsp;(&#8377;)</th>
      <th style="width:15%;text-align:right;">Amount&nbsp;(&#8377;)</th>
    </tr>
  </thead>
  <tbody>
    ${itemRowsHtml}
  </tbody>
</table>

<!-- TOTALS -->
<div class="totals-wrapper">
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
      <td class="tlabel">Total &nbsp;<span style="font-size:9pt;">(&#2319;&#2325;&#2370;&#2339;)</span></td>
      <td class="tvalue">${rs(grandTotal)}</td>
    </tr>
    ${advanceBlock}
    ${discountBlock}
    <tr class="balance-row">
      <td class="tlabel">Balance Due &nbsp;<span style="font-size:8.5pt;">(&#2348;&#2366;&#2325;&#2368; &#2351;&#2375;&#2339;&#2375;)</span></td>
      <td class="tvalue">${rs(balanceDue)}</td>
    </tr>
  </table>
</div>

<!-- TERMS -->
<div class="terms">
  <b>Terms &amp; Conditions:</b>&nbsp;
  Goods once sold will not be taken back or exchanged.&nbsp;&nbsp;|&nbsp;&nbsp;
  Purity as hallmarked and declared.&nbsp;&nbsp;|&nbsp;&nbsp;
  All disputes subject to local jurisdiction.&nbsp;&nbsp;|&nbsp;&nbsp;
  E.&amp;O.E.
</div>

<!-- SIGNATURES -->
<div class="sigs">
  <div class="sig-block">
    <div class="sig-line">
      <div class="sig-label">Customer Signature</div>
      <div class="sig-name">${customerName || ""}</div>
    </div>
  </div>
  <div class="sig-block">
    <div class="sig-line">
      <div class="sig-label">Authorized Signatory</div>
      <div class="sig-name">${siteConfig.shopName}</div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  <div>
    <div class="footer-ty">Thank you for your business! &#2310;&#2346;&#2354;&#2381;&#2351;&#2366; &#2357;&#2367;&#2358;&#2381;&#2357;&#2366;&#2360;&#2366;&#2348;&#2342;&#2381;&#2342;&#2354; &#2343;&#2344;&#2381;&#2351;&#2357;&#2366;&#2342;.</div>
    <div>${siteConfig.shopAddress}</div>
  </div>
  <div class="copy-stamp">Customer Copy</div>
</div>

<!-- Screen-only close button (hidden when printing) -->
<button class="no-print" onclick="window.close()">&#x2715;&nbsp; Close</button>

<script>
  window.onload = function () {
    window.print();
  };
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
