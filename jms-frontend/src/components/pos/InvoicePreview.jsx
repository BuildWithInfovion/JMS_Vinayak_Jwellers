import React from "react";
import { FaTimes, FaPrint, FaCheckCircle, FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "../../utils/siteConfig";

const buildWhatsAppMessage = ({ invoiceNumber, items, customerName, itemsSubtotal, totalMakingCharges, cgstAmount, sgstAmount, grandTotal, advancePayment, discount, balanceDue, applyGst }) => {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const name = customerName || "Customer";

  const itemLines = items.map((item) => {
    const wt = (item.sellingWeight || 0) * item.quantity;
    const amt = (wt * (item.sellingPricePerGram || 0)) + (wt * (item.makingChargePerGram || 0));
    return `• ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""} (${wt.toFixed(3)}g) — ₹${amt.toFixed(2)}`;
  }).join("\n");

  let msg = `*${siteConfig.shopName}*\nInvoice #${invoiceNumber} | ${date}\n\nDear ${name},\nThank you for your purchase!\n\n*Items:*\n${itemLines}\n\n`;
  msg += `Metal Value: ₹${itemsSubtotal.toFixed(2)}\nMaking Charges: ₹${totalMakingCharges.toFixed(2)}\n`;
  if (applyGst) {
    msg += `CGST: ₹${cgstAmount.toFixed(2)}\nSGST: ₹${sgstAmount.toFixed(2)}\n`;
  }
  msg += `*Total: ₹${grandTotal.toFixed(2)}*\n`;
  if ((advancePayment || 0) > 0) msg += `Advance Paid: — ₹${(advancePayment || 0).toFixed(2)}\n`;
  if ((discount || 0) > 0) msg += `Discount: — ₹${(discount || 0).toFixed(2)}\n`;
  msg += `*Balance Due: ₹${balanceDue.toFixed(2)}*\n\n`;
  msg += `Goods once sold will not be exchanged.\n${siteConfig.shopAddress}`;
  return msg;
};

const InvoicePreview = ({
  items,
  customerName,
  customerAddress,
  customerMobile,
  advancePayment,
  discount,
  oldGoldWeight,
  applyGst,
  gstNumber,
  confirmedSaleData,
  onClose,
  onConfirm,
  onDone,
  isSaving,
}) => {
  const isConfirmed = !!confirmedSaleData;

  // Base calculations
  const itemsSubtotal = items.reduce((total, item) => {
    return total + (item.sellingWeight || 0) * (item.sellingPricePerGram || 0) * item.quantity;
  }, 0);

  const totalMakingCharges = items.reduce((total, item) => {
    return total + (item.sellingWeight || 0) * (item.makingChargePerGram || 0) * item.quantity;
  }, 0);

  // GST: Metal @ 3% (1.5% CGST + 1.5% SGST), Making @ 5% (2.5% CGST + 2.5% SGST)
  const cgstAmount = applyGst
    ? itemsSubtotal * 0.015 + totalMakingCharges * 0.025
    : 0;
  const sgstAmount = cgstAmount;
  const gstAmount = cgstAmount + sgstAmount;

  const grandTotal = itemsSubtotal + totalMakingCharges + gstAmount;
  const balanceDue = grandTotal - (advancePayment || 0) - (discount || 0);

  const handleConfirmClick = () => {
    if (isSaving) return;
    onConfirm({
      items,
      totalAmount: grandTotal,
      subtotal: itemsSubtotal,
      totalMakingCharges,
      gstAmount,
      cgstAmount,
      sgstAmount,
      advancePayment,
      balanceDue,
      customerName,
      customerAddress,
      customerMobile,
      discount,
      oldGoldWeight,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const mobile = (customerMobile || "").replace(/\D/g, "");
    const waNumber = mobile.startsWith("91") ? mobile : `91${mobile}`;
    const text = buildWhatsAppMessage({
      invoiceNumber: confirmedSaleData?.invoiceNumber,
      items,
      customerName,
      itemsSubtotal,
      totalMakingCharges,
      cgstAmount,
      sgstAmount,
      grandTotal,
      advancePayment,
      discount,
      balanceDue,
      applyGst,
    });
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const invoiceDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const displayGstNumber = gstNumber || siteConfig.gstNumber;

  return (
    <div className="max-w-3xl mx-auto text-gray-900 bg-white rounded-lg">

      {/* Confirmed banner (outside printable area) */}
      {isConfirmed && (
        <div className="print-hide flex items-center gap-2 bg-green-50 border border-green-300 text-green-800 rounded-lg px-4 py-3 mb-4 text-sm font-medium">
          <FaCheckCircle className="w-4 h-4 flex-shrink-0" />
          Sale confirmed. Invoice #{confirmedSaleData.invoiceNumber} saved. You can now print or close.
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/*   PRINTABLE AREA — do NOT add anything here    */}
      {/* ═══════════════════════════════════════════════ */}
      <div id="invoice-content-printable" className="p-6">

        {/* ── Shop Header ── */}
        <div className="text-center mb-6 pb-5 border-b-2 border-gray-300">
          <img src="/VJ.png" alt="Logo" className="h-16 w-auto mx-auto mb-2" />
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-wide">
            {siteConfig.shopName}
          </h1>
          <p className="text-base text-gray-500 mt-0.5">सोने चांदीचे व्यापारी</p>
          <p className="text-sm text-gray-600 mt-1">
            {siteConfig.ownerName} &nbsp;|&nbsp; Mo: {siteConfig.ownerMobile}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{siteConfig.shopAddress}</p>
          {applyGst && displayGstNumber && (
            <p className="text-sm font-bold text-gray-800 mt-1 tracking-widest">
              GSTIN: {displayGstNumber}
            </p>
          )}
        </div>

        {/* ── Invoice Title ── */}
        <div className="text-center mb-5">
          <span className="text-lg font-bold uppercase tracking-widest text-gray-700 border-b-2 border-gray-700 pb-0.5">
            Tax Invoice
          </span>
        </div>

        {/* ── Customer & Invoice Details ── */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Billed To</p>
            <p className="font-semibold text-gray-900">{customerName || "Walk-in Customer"}</p>
            {customerAddress && <p className="text-gray-600">{customerAddress}</p>}
            <p className="text-gray-600">Mo: {customerMobile || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Invoice Details</p>
            {isConfirmed && (
              <p className="font-bold text-gray-900">
                Invoice #: <span className="text-blue-700">{confirmedSaleData.invoiceNumber}</span>
              </p>
            )}
            <p className="text-gray-600">Date: <span className="font-medium text-gray-800">{invoiceDate}</span></p>
            {oldGoldWeight > 0 && (
              <p className="text-amber-700 font-medium mt-1">Old Gold: {oldGoldWeight} g</p>
            )}
          </div>
        </div>

        {/* ── Items Table ── */}
        <table className="w-full mb-6 text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-y-2 border-gray-300">
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase">Sr.</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
              <th className="py-2 px-3 text-center text-xs font-semibold text-gray-600 uppercase">Purity</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-gray-600 uppercase">Wt (g)</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-gray-600 uppercase">Rate/g (₹)</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-gray-600 uppercase">MC/g (₹)</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const wt = item.sellingWeight || 0;
              const rate = item.sellingPricePerGram || 0;
              const mc = item.makingChargePerGram || 0;
              const lineTotal = (wt * rate + wt * mc) * item.quantity;
              return (
                <tr key={item._id} className="border-b border-gray-200">
                  <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="ml-1 text-xs text-gray-500">(×{item.quantity})</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{item.sellingPurity || "—"}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{(wt * item.quantity).toFixed(3)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{rate.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{mc.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-gray-900">{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── Totals Section ── */}
        <div className="flex justify-end">
          <div className="w-72 text-sm space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>Metal Value</span>
              <span>₹{itemsSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Making Charges</span>
              <span>₹{totalMakingCharges.toFixed(2)}</span>
            </div>

            {applyGst ? (
              <>
                <div className="border-t border-gray-200 pt-1.5 flex justify-between text-gray-600">
                  <span>Taxable Amount</span>
                  <span>₹{(itemsSubtotal + totalMakingCharges).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>CGST <span className="text-xs text-gray-400">(Metal 1.5% + MC 2.5%)</span></span>
                  <span>₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>SGST <span className="text-xs text-gray-400">(Metal 1.5% + MC 2.5%)</span></span>
                  <span>₹{sgstAmount.toFixed(2)}</span>
                </div>
              </>
            ) : null}

            <div className="flex justify-between font-bold text-base border-t-2 border-gray-800 pt-2 mt-1">
              <span>Total (एकूण)</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            {(advancePayment || 0) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Advance / Old Gold (नगदी जमा)</span>
                <span>– ₹{(advancePayment || 0).toFixed(2)}</span>
              </div>
            )}
            {(discount || 0) > 0 && (
              <div className="flex justify-between text-purple-700">
                <span>Discount (सूट)</span>
                <span>– ₹{(discount || 0).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-extrabold text-lg text-blue-700 border-t-2 border-blue-700 pt-2 mt-1">
              <span>Balance Due (बाकी येणे)</span>
              <span>₹{balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Signature Lines ── */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-8">
              <p className="font-medium text-gray-700">Customer Signature</p>
              <p className="text-xs text-gray-500 mt-0.5">{customerName || ""}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-8">
              <p className="font-medium text-gray-700">Authorized Signatory</p>
              <p className="text-xs text-gray-500 mt-0.5">{siteConfig.shopName}</p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 pt-5 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="font-medium text-gray-700">Thank you for your business! आपल्या विश्वासाबद्दल धन्यवाद.</p>
              <p>Goods once sold will not be taken back or exchanged.</p>
              <p>{siteConfig.shopAddress}</p>
            </div>
            <div className="flex-shrink-0 ml-4 text-right">
              <span className="inline-block border-2 border-gray-400 text-gray-500 font-bold text-xs px-3 py-1 rounded tracking-widest uppercase">
                Customer Copy
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* ═══════════════════════════════════════════════ */}
      {/*   END PRINTABLE AREA                           */}
      {/* ═══════════════════════════════════════════════ */}

      {/* ── Action Buttons (never printed) ── */}
      <div className="mt-6 flex justify-between items-center print-hide border-t pt-4">
        {/* Print button always visible */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <FaPrint className="w-4 h-4" />
          Print Invoice
        </button>

        <div className="flex gap-3">
          {isConfirmed ? (
            /* After confirmation: WhatsApp + Done */
            <>
              {customerMobile && (
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  Share on WhatsApp
                </button>
              )}
              <button
                onClick={onDone}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <FaCheckCircle className="w-4 h-4" />
                Done
              </button>
            </>
          ) : (
            /* Before confirmation: Cancel + Confirm Sale */
            <>
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <FaTimes className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleConfirmClick}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-semibold"
              >
                {isSaving ? "Saving..." : "Confirm Sale"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
