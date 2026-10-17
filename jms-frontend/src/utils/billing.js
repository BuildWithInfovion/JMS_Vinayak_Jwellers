// One place for every bill calculation (cart, invoice preview, print, PDF, WhatsApp).
//
// GST on a retail sale of jewellery is charged on the total value of the jewellery,
// making charges included (CBIC sectoral FAQ on gems & jewellery: 3% "whether the making
// charge is shown separately or not"). A discount shown on the invoice reduces the value
// GST is charged on (CGST Act s.15(3)), so it is applied BEFORE tax.
//
// Rates can be set per deployment (VITE_GST_METAL_RATE / VITE_GST_MAKING_RATE, total %
// split equally into CGST and SGST) — confirm them with the store's CA.

const num = (v, d) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};

export const TAX = {
  metalRate: num(import.meta.env.VITE_GST_METAL_RATE, 3),
  makingRate: num(import.meta.env.VITE_GST_MAKING_RATE, 3),
};

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const lineMetal = (item) => (item.sellingWeight || 0) * (item.sellingPricePerGram || 0) * (item.quantity || 1);
export const lineMaking = (item) => (item.sellingWeight || 0) * (item.makingChargePerGram || 0) * (item.quantity || 1);

/** Totals for a bill being made now (always the current, discount-before-tax method). */
export function computeBill(items, { discount = 0, advance = 0, applyGst = false } = {}) {
  const metal = items.reduce((t, i) => t + lineMetal(i), 0);
  const making = items.reduce((t, i) => t + lineMaking(i), 0);
  const gross = metal + making;
  const disc = Math.min(Math.max(discount || 0, 0), gross);
  const taxable = gross - disc;
  let gst = 0;
  if (applyGst && gross > 0) {
    // The discount is spread over metal and making in proportion, so each part keeps its own rate
    const share = disc / gross;
    gst = (metal * (1 - share) * TAX.metalRate + making * (1 - share) * TAX.makingRate) / 100;
  }
  const cgst = r2(gst / 2);
  const sgst = r2(gst / 2);
  const total = r2(taxable + cgst + sgst);
  return {
    metal: r2(metal),
    making: r2(making),
    discount: r2(disc),
    taxable: r2(taxable),
    cgst,
    sgst,
    gst: r2(cgst + sgst),
    total,
    advance: r2(advance || 0),
    balance: r2(total - (advance || 0)),
    taxMode: "v2",
    gstMetalRate: TAX.metalRate,
    gstMakingRate: TAX.makingRate,
  };
}

/** How to show the tax lines of a bill. Sales saved before v2 keep their original layout and rates. */
export function taxPresentation({ taxMode, gstMetalRate, gstMakingRate } = {}) {
  const v2 = taxMode === "v2";
  const metal = v2 ? gstMetalRate ?? TAX.metalRate : 3;
  const making = v2 ? gstMakingRate ?? TAX.makingRate : 5;
  const half = (r) => `${+(r / 2).toFixed(2)}%`;
  const rateLabel = metal === making ? `@${half(metal)}` : `(Metal @${half(metal)} + MC @${half(making)})`;
  return { discountBeforeTax: v2, rateLabel };
}

/** Plain-text description of the GST in force, for the POS toggle. */
export const gstSummary = () =>
  TAX.metalRate === TAX.makingRate
    ? `GST ${TAX.metalRate}% on the full value incl. making charges (CGST ${TAX.metalRate / 2}% + SGST ${TAX.metalRate / 2}%)`
    : `GST — Metal ${TAX.metalRate}%, Making ${TAX.makingRate}% (CGST + SGST)`;
