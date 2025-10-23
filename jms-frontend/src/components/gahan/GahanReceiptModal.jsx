// frontend/src/components/gahan/GahanReceiptModal.jsx
import React from "react";

const GahanReceiptModal = ({ gahanRecord, onClose }) => {
  // ... (handlePrint, formatDate functions unchanged) ...
  if (!gahanRecord) return null;
  const handlePrint = () => {
    window.print();
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="text-gray-800">
      <div id="invoice-content-printable">
        {/* Header (unchanged) */}
        <div className="text-center mb-8">
          {" "}
          <h2 className="text-2xl font-bold">Vinayak Jewellers,Gangakhed</h2>
          <p className="text-sm">सोने चांदीचे व्यापारी</p>
          <p className="text-sm">Mo. 9421462257</p>{" "}
          <p className="text-sm font-semibold">Gahan Receipt (गहाण पावती)</p>{" "}
        </div>

        {/* Customer Details */}
        <div className="border-t border-b py-2 mb-6 text-sm">
          <div className="flex justify-between mb-1">
            {/* --- Use recordNumber instead of _id --- */}
            <span>
              <strong>Record #:</strong> {gahanRecord.recordNumber || "N/A"}
            </span>
            {/* -------------------------------------- */}
            <span>
              <strong>Date:</strong> {formatDate(gahanRecord.pawnDate)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            {" "}
            <span>
              <strong>Name (नाव):</strong> {gahanRecord.customerName || "N/A"}
            </span>{" "}
            <span>
              <strong>Mobile:</strong> {gahanRecord.customerMobile || "N/A"}
            </span>{" "}
          </div>
          <div className="flex">
            {" "}
            <span>
              <strong>Address (पत्ता):</strong>{" "}
              {gahanRecord.customerAddress || "N/A"}
            </span>{" "}
          </div>
        </div>

        {/* ... (Item Details, Financial Details, Notes, Buttons unchanged) ... */}
        <h3 className="text-lg font-semibold mb-2">
          Item Details (वस्तू तपशील)
        </h3>
        <table className="w-full mb-6 text-sm">
          <tbody>
            {" "}
            <tr className="border-b">
              <td className="p-1 font-medium w-1/3">Item Name:</td>
              <td className="p-1">{gahanRecord.itemName}</td>
            </tr>{" "}
            <tr className="border-b">
              <td className="p-1 font-medium">Weight (g):</td>
              <td className="p-1">{gahanRecord.itemWeight.toFixed(2)}</td>
            </tr>{" "}
            <tr className="border-b">
              <td className="p-1 font-medium">Purity:</td>
              <td className="p-1">{gahanRecord.itemPurity || "N/A"}</td>
            </tr>{" "}
          </tbody>
        </table>
        <h3 className="text-lg font-semibold mb-2">
          Financial Details (आर्थिक तपशील)
        </h3>
        <table className="w-full mb-6 text-sm">
          <tbody>
            {" "}
            <tr className="border-b">
              <td className="p-1 font-medium w-1/3">Amount Given (रक्कम):</td>
              <td className="p-1">₹{gahanRecord.amountGiven.toFixed(2)}</td>
            </tr>{" "}
            <tr className="border-b">
              <td className="p-1 font-medium">Interest Rate (व्याज दर):</td>
              <td className="p-1">{gahanRecord.interestRate}% per month</td>
            </tr>{" "}
            <tr className="border-b">
              <td className="p-1 font-medium">Due Date (अंतिम मुदत):</td>
              <td className="p-1">{formatDate(gahanRecord.dueDate)}</td>
            </tr>{" "}
            <tr className="border-b font-medium">
              <td className="p-1">Status:</td>
              <td className="p-1">
                {gahanRecord.status}{" "}
                {gahanRecord.releaseDate
                  ? `(on ${formatDate(gahanRecord.releaseDate)})`
                  : ""}
              </td>
            </tr>{" "}
          </tbody>
        </table>
        {gahanRecord.notes && (
          <div className="mt-4 text-sm">
            <h4 className="font-semibold">Notes:</h4>
            <p>{gahanRecord.notes}</p>
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-end space-x-3 print-hide">
        {" "}
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          {" "}
          Close{" "}
        </button>{" "}
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {" "}
          Print Receipt{" "}
        </button>{" "}
      </div>
    </div>
  );
};

export default GahanReceiptModal;
