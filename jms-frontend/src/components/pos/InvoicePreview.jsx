// frontend/src/components/pos/InvoicePreview.jsx
import React from "react";

// Remove makingCharges prop, as it's calculated from items
const InvoicePreview = ({
  items,
  customerName,
  customerAddress,
  customerMobile,
  advancePayment,
  onClose,
  onConfirm,
  isSaving,
}) => {
  // Recalculate totals based on items array which includes per-item making charges
  const itemsSubtotal = items.reduce((total, item) => {
    const itemPrice =
      (item.sellingWeight || 0) * (item.sellingPricePerGram || 0);
    return total + itemPrice * item.quantity;
  }, 0);

  const totalMakingCharges = items.reduce((total, item) => {
    const itemMakingCharge =
      (item.sellingWeight || 0) * (item.makingChargePerGram || 0);
    return total + itemMakingCharge * item.quantity;
  }, 0);

  const grandTotal = itemsSubtotal + totalMakingCharges; // Calculation includes MC
  const balanceDue = grandTotal - (advancePayment || 0);

  const handleConfirmAndPrint = () => {
    if (isSaving) return;
    // Call the confirm handler first
    onConfirm({
      items: items, // Items now contain makingChargePerGram
      totalAmount: grandTotal,
      subtotal: itemsSubtotal,
      totalMakingCharges: totalMakingCharges, // Pass calculated total
      advancePayment: advancePayment,
      balanceDue: balanceDue,
      customerName: customerName,
      customerAddress: customerAddress,
      customerMobile: customerMobile,
    });

    // --- Add Delay before Print ---
    setTimeout(() => {
      window.print();
    }, 100); // Wait 100ms
    // ----------------------------
  };

  return (
    <div className="text-gray-800">
      <div id="invoice-content-printable">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Vinayak Jewellers, Gangakhed</h2>
          <p className="text-sm">सोने चांदीचे व्यापारी</p>
          <p className="text-sm">Prop. Vinayak D. Dishe</p>
          <p className="text-sm">Mo. 9421462257</p>
        </div>

        {/* Customer Details */}
        <div className="border-t border-b py-2 mb-6 text-sm">
          <div className="flex justify-between mb-1">
            <span>
              <strong>Name (श्री./सौ.):</strong> {customerName || "N/A"}
            </span>
            <span>
              <strong>Date:</strong>{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span>
              <strong>Mobile:</strong> {customerMobile || "N/A"}
            </span>
          </div>
          <div className="flex">
            <span>
              <strong>Address (रा.):</strong> {customerAddress || "N/A"}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-1 text-left font-medium">Item</th>
              <th className="p-1 text-center font-medium">Purity</th>
              <th className="p-1 text-right font-medium">Wt(g)</th>
              <th className="p-1 text-right font-medium">Rate/g</th>
              <th className="p-1 text-right font-medium">MC/g</th>
              <th className="p-1 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const itemWeight = item.sellingWeight || 0;
              const itemPricePerGram = item.sellingPricePerGram || 0;
              const itemMakingChargePerGram = item.makingChargePerGram || 0;
              const lineAmount =
                itemWeight * itemPricePerGram +
                itemWeight * itemMakingChargePerGram;
              const lineTotal = lineAmount * item.quantity;

              return (
                <tr key={item._id} className="border-b">
                  <td className="p-1">
                    {item.name} (Qty:{item.quantity})
                  </td>
                  <td className="p-1 text-center">
                    {item.sellingPurity || "N/A"}
                  </td>
                  <td className="p-1 text-right">{itemWeight.toFixed(2)}</td>
                  <td className="p-1 text-right">
                    ₹{itemPricePerGram.toFixed(2)}
                  </td>
                  <td className="p-1 text-right">
                    ₹{itemMakingChargePerGram.toFixed(2)}{" "}
                  </td>
                  <td className="p-1 text-right">₹{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals Section (Making charges line hidden) */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>₹{itemsSubtotal.toFixed(2)}</span>
            </div>
            {/* Making Charges line REMOVED from display */}
            <div className="flex justify-between py-2 border-t mt-2 font-bold text-lg">
              <span>Total (एकूण):</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-green-600">
              <span>Advance (नगदी जमा):</span>
              <span>- ₹{(advancePayment || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t mt-2 font-bold text-xl text-blue-600">
              <span>Balance Due (बाकी येणे):</span>
              <span>₹{balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (with print-hide class) */}
      <div className="mt-8 flex justify-end space-x-3 print-hide">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmAndPrint} // This now triggers the delayed print
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isSaving ? "Saving..." : "Confirm & Print"}
        </button>
      </div>
    </div>
  );
};

export default InvoicePreview;
