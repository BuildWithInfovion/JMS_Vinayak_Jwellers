// frontend/src/components/pos/InvoicePreview.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";

// This component is now just a PREVIEW.
// It does NOT print. It just confirms the details.
const InvoicePreview = ({
  items,
  customerName,
  customerAddress,
  customerMobile,
  advancePayment,
  // *** NEW PROPS ***
  discount,
  oldGoldWeight,
  // ****************
  onClose,
  onConfirm, // This is the 'handleConfirmSale' function from PosPage
  isSaving,
}) => {
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

  const grandTotal = itemsSubtotal + totalMakingCharges;

  // *** UPDATED CALCULATION for Preview ***
  const balanceDue = grandTotal - (advancePayment || 0) - (discount || 0);

  // This function is called when the "Confirm" button is clicked
  const handleConfirmClick = () => {
    if (isSaving) return;

    // Pass all calculated data back to PosPage to be saved
    onConfirm({
      items: items,
      totalAmount: grandTotal,
      subtotal: itemsSubtotal,
      totalMakingCharges: totalMakingCharges,
      advancePayment: advancePayment,
      balanceDue: balanceDue,
      customerName: customerName,
      customerAddress: customerAddress,
      customerMobile: customerMobile,
      // *** Pass back new fields ***
      discount: discount,
      oldGoldWeight: oldGoldWeight,
    });
  };

  return (
    // Main container for on-screen preview
    <div
      id="invoice-container" // This ID is for styling the modal
      className="max-w-3xl mx-auto text-gray-900 bg-white rounded-lg"
    >
      <div id="invoice-content-printable">
        {/* --- Header --- */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
          {/* Logo from public folder */}
          <img src="/VJ.png" alt="Logo" className="h-16 w-auto mx-auto mb-3" />
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
            विनायक ज्वेलर्स, गंगाखेड
          </h2>
          <p className="text-lg text-gray-500 mt-1">सोने चांदीचे व्यापारी</p>
          <p className="text-sm text-gray-500 mt-2">
            {/* --- FIX: Corrected Spelling --- */}
            Prop. Vinayak D. Didshere | Mo. 9421462257
          </p>
        </div>

        {/* --- Customer Details Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
          {/* Billed To */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Billed To
            </h3>
            <p className="font-medium text-gray-800">{customerName || "N/A"}</p>
            <p className="text-gray-600">{customerAddress || "N/A"}</p>
            <p className="text-gray-600">{customerMobile || "N/A"}</p>
          </div>
          {/* Invoice Details */}
          <div className="md:text-right">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Invoice Details
            </h3>
            <div className="flex justify-between md:justify-end md:gap-4">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-800">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            {/* *** NEW: Old Gold Weight Display *** */}
            {oldGoldWeight > 0 && (
              <div className="flex justify-between md:justify-end md:gap-4 mt-1">
                <span className="text-amber-600 font-medium">Old Gold Wt:</span>
                <span className="font-bold text-gray-800">
                  {oldGoldWeight} g
                </span>
              </div>
            )}
            {/* *********************************** */}
          </div>
        </div>

        {/* --- Items Table --- */}
        <table className="w-full mb-8 text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purity
              </th>
              <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wt(g)
              </th>
              <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate/g
              </th>
              <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                MC/g
              </th>
              <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => {
              const itemWeight = item.sellingWeight || 0;
              const itemPricePerGram = item.sellingPricePerGram || 0;
              const itemMakingChargePerGram = item.makingChargePerGram || 0;
              const lineAmount =
                itemWeight * itemPricePerGram +
                itemWeight * itemMakingChargePerGram;
              const lineTotal = lineAmount * item.quantity;

              return (
                <tr key={item._id}>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500">
                      {" "}
                      (Qty: {item.quantity})
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {item.sellingPurity || "N/A"}
                  </td>
                  <td className="p-3 text-right">{itemWeight.toFixed(3)}</td>
                  <td className="p-3 text-right">
                    ₹{itemPricePerGram.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    ₹{itemMakingChargePerGram.toFixed(2)}{" "}
                  </td>
                  <td className="p-3 text-right font-medium">
                    ₹{lineTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* --- Totals Section --- */}
        <div className="flex justify-end totals-section">
          <div className="w-full max-w-sm space-y-2 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{itemsSubtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-gray-200">
              <span className="text-lg font-semibold text-gray-800">
                Total (एकूण):
              </span>
              <span className="text-lg font-semibold text-gray-800">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-2 text-green-600">
              <span className="font-medium">Advance (नगदी जमा):</span>
              <span className="font-medium">
                - ₹{(advancePayment || 0).toFixed(2)}
              </span>
            </div>

            {/* *** NEW: Discount Line *** */}
            <div className="flex justify-between py-2 text-purple-600">
              <span className="font-medium">Discount (सूट):</span>
              <span className="font-medium">
                - ₹{(discount || 0).toFixed(2)}
              </span>
            </div>
            {/* ************************** */}

            <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
              <span className="text-xl font-bold text-blue-600">
                Balance Due (बाकी येणे):
              </span>
              <span className="text-xl font-bold text-blue-600">
                ₹{balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Thank you for your business!</p>
        </div>
      </div>

      {/* --- Action Buttons (Hidden on Print) --- */}
      <div className="mt-8 flex justify-end space-x-3 print-hide">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <FaTimes />
          Cancel
        </button>
        <button
          onClick={handleConfirmClick} // Calls the handler that triggers onConfirm
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {isSaving ? "Saving..." : "Confirm Sale"}
        </button>
      </div>
    </div>
  );
};

export default InvoicePreview;
