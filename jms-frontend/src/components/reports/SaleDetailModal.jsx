import React from "react";
import { FaPrint, FaWhatsapp } from "react-icons/fa";
import { FiDownload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { siteConfig } from "../../utils/siteConfig";
import { printInvoice } from "../../utils/printInvoice";
import { downloadInvoicePDF, shareInvoiceToWhatsApp } from "../../utils/invoicePDF";

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

  const handlePrint = () => {
    printInvoice({
      invoiceNumber: sale.invoiceNumber,
      invoiceDate: new Date(sale.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric",
      }),
      customerName: sale.customerName,
      customerAddress: sale.customerAddress,
      customerMobile: sale.customerMobile,
      oldGoldWeight: sale.oldGoldWeight || 0,
      items: sale.items,
      itemsSubtotal: sale.subtotal || 0,
      totalMakingCharges: sale.totalMakingCharges || 0,
      applyGst: (sale.gstAmount || 0) > 0,
      cgstAmount: sale.cgstAmount || 0,
      sgstAmount: sale.sgstAmount || 0,
      grandTotal: sale.totalAmount || 0,
      advancePayment: sale.advancePayment || 0,
      discount: sale.discount || 0,
      balanceDue: sale.balanceDue || 0,
      gstin: gstNumber,
    });
  };

  const handleWhatsApp = async () => {
    await shareInvoiceToWhatsApp(
      {
        invoiceNumber: sale.invoiceNumber,
        invoiceDate,
        customerName: sale.customerName,
        customerAddress: sale.customerAddress,
        customerMobile: sale.customerMobile,
        oldGoldWeight: sale.oldGoldWeight || 0,
        items: sale.items,
        itemsSubtotal: sale.subtotal || 0,
        totalMakingCharges: sale.totalMakingCharges || 0,
        applyGst: hasGst,
        cgstAmount: sale.cgstAmount || 0,
        sgstAmount: sale.sgstAmount || 0,
        grandTotal: sale.totalAmount || 0,
        advancePayment: sale.advancePayment || 0,
        discount: sale.discount || 0,
        balanceDue: sale.balanceDue || 0,
        gstin: gstNumber,
      },
      {
        onFallback: () =>
          toast.info("PDF downloaded — open WhatsApp and attach it to send.", {
            autoClose: 6000,
          }),
      }
    );
  };

  const handleDownloadPDF = async () => {
    await downloadInvoicePDF({
      invoiceNumber: sale.invoiceNumber,
      invoiceDate,
      customerName: sale.customerName,
      customerAddress: sale.customerAddress,
      customerMobile: sale.customerMobile,
      oldGoldWeight: sale.oldGoldWeight || 0,
      items: sale.items,
      itemsSubtotal: sale.subtotal || 0,
      totalMakingCharges: sale.totalMakingCharges || 0,
      applyGst: hasGst,
      cgstAmount: sale.cgstAmount || 0,
      sgstAmount: sale.sgstAmount || 0,
      grandTotal: sale.totalAmount || 0,
      advancePayment: sale.advancePayment || 0,
      discount: sale.discount || 0,
      balanceDue: sale.balanceDue || 0,
      gstin: gstNumber,
    });
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
              <span>Grand Total</span>
              <span>₹{(sale.totalAmount || 0).toFixed(2)}</span>
            </div>
            {(sale.advancePayment || 0) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Advance Paid</span>
                <span>– ₹{sale.advancePayment.toFixed(2)}</span>
              </div>
            )}
            {(sale.discount || 0) > 0 && (
              <div className="flex justify-between text-purple-700">
                <span>Discount</span>
                <span>– ₹{sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-lg text-blue-700 border-t-2 border-blue-700 pt-2">
              <span>Net Payable</span>
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
