// frontend/src/components/pos/InvoicePreview.jsx
import React from "react";

const InvoicePreview = ({
  items,
  customerName,
  customerAddress,
  customerMobile, // <-- Added mobile prop
  makingCharges,
  advancePayment,
  onClose,
  onConfirm,
  isSaving,
}) => {
  const itemsSubtotal = items.reduce((total, item) => {
    const itemPrice =
      (item.sellingWeight || 0) * (item.sellingPricePerGram || 0);
    return total + itemPrice * item.quantity;
  }, 0);
  const grandTotal = itemsSubtotal + (makingCharges || 0);
  const balanceDue = grandTotal - (advancePayment || 0);

  const handleConfirmAndPrint = () => {
    if (isSaving) return;
    onConfirm({
      items: items,
      totalAmount: grandTotal,
      subtotal: itemsSubtotal,
      makingCharges: makingCharges,
      advancePayment: advancePayment,
      balanceDue: balanceDue,
      customerName: customerName,
      customerAddress: customerAddress,
      customerMobile: customerMobile, // <-- Include mobile in confirm data
    });
  };

  return (
    <div className="text-gray-800">
      {/* --- ID for Print Styles --- */}
      <div id="invoice-content-printable">
        {/* --------------------------- */}
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Vinayak Jewellers,Gangakhed</h2>
          <p className="text-sm">सोने चांदीचे व्यापारी</p>
          <p className="text-sm">Prop. Vinayak D. Didshere</p>
          <p className="text-sm">Mo. 9421462257</p>
        </div>

        {/* --- Updated Customer Details --- */}
        <div className="border-t border-b py-2 mb-6 text-sm">
          <div className="flex justify-between mb-1">
            <span>
              <strong>Name (श्री./सौ.):</strong> {customerName || "N/A"}
            </span>
            <span>
              {/* Using localeDateString for just the date */}
              <strong>Date:</strong>{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
          {/* Display Mobile */}
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
        {/* -------------------------------- */}

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2 font-medium">
                Item (वस्तूचे वर्णन)
              </th>
              <th className="text-center p-2 font-medium">Purity (शुध्दता)</th>{" "}
              <th className="text-right p-2 font-medium">Weight (g)</th>
              <th className="text-right p-2 font-medium">Rate (दर)</th>
              <th className="text-right p-2 font-medium">Amount (किंमत)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const itemWeight = item.sellingWeight || 0;
              const itemPricePerGram = item.sellingPricePerGram || 0;
              const lineTotal = itemWeight * itemPricePerGram * item.quantity;
              return (
                <tr key={item._id} className="border-b">
                  <td className="p-2">
                    {item.name} (Qty: {item.quantity})
                  </td>
                  <td className="text-center p-2">
                    {item.sellingPurity || "N/A"}
                  </td>{" "}
                  <td className="text-right p-2">{itemWeight.toFixed(2)}</td>
                  <td className="text-right p-2">
                    ₹{itemPricePerGram.toFixed(2)}
                  </td>
                  <td className="text-right p-2">₹{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>₹{itemsSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Making Charges (मजुरी):</span>
              <span>₹{(makingCharges || 0).toFixed(2)}</span>
            </div>
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
          onClick={handleConfirmAndPrint}
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
