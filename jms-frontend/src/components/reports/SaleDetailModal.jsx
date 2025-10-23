// frontend/src/components/reports/SaleDetailModal.jsx
import React from "react";

const SaleDetailModal = ({ sale, onClose }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    // Format date without time for this modal
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="text-gray-800">
      {/* This 'printable-area' ID is what we'll use for printing */}
      <div id="invoice-content-printable">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Vinayak Jewellers, Gangakhed</h2>{" "}
          {/* Added Location */}
          <p className="text-sm">सोने चांदीचे व्यापारी</p>
          <p className="text-sm">Prop. Vinayak D. Didshere</p>{" "}
          {/* Corrected Spelling */}
          <p className="text-sm">Mo. 9421462257</p>
        </div>

        {/* Customer Details */}
        <div className="border-t border-b py-2 mb-6 text-sm">
          <div className="flex justify-between mb-1">
            <span>
              <strong>Invoice #:</strong> {sale.invoiceNumber || "N/A"}{" "}
              {/* Added Fallback */}
            </span>
            <span>
              <strong>Date:</strong> {formatDate(sale.createdAt)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span>
              <strong>Name (श्री./सौ.):</strong> {sale.customerName || "N/A"}
            </span>
            {/* --- ADD Mobile Number --- */}
            <span>
              <strong>Mobile:</strong> {sale.customerMobile || "N/A"}
            </span>
            {/* ------------------------- */}
          </div>
          <div className="flex">
            <span>
              <strong>Address (रा.):</strong> {sale.customerAddress || "N/A"}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2 font-medium">
                Item (वस्तूचे वर्णन)
              </th>
              <th className="text-center p-2 font-medium">Purity (शुध्दता)</th>
              <th className="text-right p-2 font-medium">Weight (g)</th>
              <th className="text-right p-2 font-medium">Rate (दर)</th>
              <th className="text-right p-2 font-medium">Amount (किंमत)</th>
            </tr>
          </thead>
          <tbody>
            {sale.items &&
              sale.items.map(
                (
                  item // Added check for sale.items
                ) => (
                  <tr key={item._id || item.productId} className="border-b">
                    {" "}
                    {/* Added fallback key */}
                    <td className="p-2">
                      {item.name} (Qty: {item.quantity})
                    </td>
                    <td className="text-center p-2">
                      {item.sellingPurity || "N/A"}
                    </td>
                    <td className="text-right p-2">
                      {(item.sellingWeight || 0).toFixed(2)}{" "}
                      {/* Added Fallback */}
                    </td>
                    <td className="text-right p-2">
                      ₹{(item.sellingPricePerGram || 0).toFixed(2)}{" "}
                      {/* Added Fallback */}
                    </td>
                    <td className="text-right p-2">
                      ₹
                      {(
                        (item.sellingWeight || 0) *
                        (item.sellingPricePerGram || 0) *
                        item.quantity
                      ).toFixed(2)}
                    </td>
                  </tr>
                )
              )}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>₹{(sale.subtotal || 0).toFixed(2)}</span>{" "}
              {/* Added Fallback */}
            </div>
            <div className="flex justify-between py-1">
              <span>Making Charges (मजुरी):</span>
              <span>₹{(sale.makingCharges || 0).toFixed(2)}</span>{" "}
              {/* Added Fallback */}
            </div>
            <div className="flex justify-between py-2 border-t mt-2 font-bold text-lg">
              <span>Total (एकूण):</span>
              <span>₹{(sale.totalAmount || 0).toFixed(2)}</span>{" "}
              {/* Added Fallback */}
            </div>
            <div className="flex justify-between py-1 text-green-600">
              <span>Advance (नगदी जमा):</span>
              <span>- ₹{(sale.advancePayment || 0).toFixed(2)}</span>{" "}
              {/* Added Fallback */}
            </div>
            <div className="flex justify-between py-2 border-t mt-2 font-bold text-xl text-blue-600">
              <span>Balance Due (बाकी येणे):</span>
              <span>₹{(sale.balanceDue || 0).toFixed(2)}</span>{" "}
              {/* Added Fallback */}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - These will be hidden on print */}
      <div className="mt-8 flex justify-end space-x-3 print-hide">
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default SaleDetailModal;
