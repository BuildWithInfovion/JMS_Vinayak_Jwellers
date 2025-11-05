// frontend/src/components/gahan/GahanReceiptModal.jsx
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { NotoSansDevanagariBase64 } from "../../utils/NotoSansDevanagariFont"; // Import the font
import VJLogo from "/VJ.png"; // Import the logo

const GahanReceiptModal = ({ gahanRecord, onClose }) => {
  if (!gahanRecord) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const generateGahanPDF = () => {
    if (!gahanRecord) return;

    // --- FIX: Set orientation to Portrait and format to A5 ---
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });
    const A5_WIDTH = 148;
    const MARGIN = 15;
    const rightAlign = A5_WIDTH - MARGIN;

    // --- FONT EMBEDDING ---
    try {
      doc.addFileToVFS(
        "NotoSansDevanagari-Regular.ttf",
        NotoSansDevanagariBase64
      );
      doc.addFont(
        "NotoSansDevanagari-Regular.ttf",
        "NotoSansDevanagari",
        "normal"
      );
      doc.setFont("NotoSansDevanagari");
    } catch (e) {
      console.error("Error embedding font:", e);
      alert(
        "Error embedding font. Marathi text may be garbled. Ensure the font file is correctly encoded."
      );
    }
    // --- END FONT EMBEDDING ---

    // --- PDF CONTENT ---

    // 1. Logo
    try {
      doc.addImage(VJLogo, "PNG", MARGIN, 10, 30, 15); // x, y, w, h
    } catch (e) {
      console.error("Error adding logo:", e);
    }

    // 2. Header (Shop Details & Title)
    doc.setFontSize(18);
    doc.setFont("NotoSansDevanagari", "normal");
    doc.text("Vinayak Jewellers, Gangakhed", A5_WIDTH / 2, 15, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.setFont("NotoSansDevanagari"); // Force font
    doc.text("Gahan Receipt (गहाण पावती)", A5_WIDTH / 2, 22, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("NotoSansDevanagari");
    doc.text("Prop. Vinayak D. Dishe | Mo. 9421462257", A5_WIDTH / 2, 28, {
      align: "center",
    });

    doc.setLineWidth(0.5);
    doc.line(MARGIN, 35, rightAlign, 35); // x1, y1, x2, y2

    // 3. Customer Details
    doc.setFontSize(10);
    doc.setFont("NotoSansDevanagari");
    doc.text(`Record #: ${gahanRecord.recordNumber}`, MARGIN, 45);
    doc.text(`Date: ${formatDate(gahanRecord.pawnDate)}`, rightAlign, 45, {
      align: "right",
    });
    doc.text(`Name (नाव): ${gahanRecord.customerName || "N/A"}`, MARGIN, 53);
    doc.text(`Mobile: ${gahanRecord.customerMobile || "N/A"}`, rightAlign, 53, {
      align: "right",
    });
    doc.text(
      `Address (पत्ता): ${gahanRecord.customerAddress || "N/A"}`,
      MARGIN,
      61
    );

    doc.line(MARGIN, 70, rightAlign, 70);

    // 4. Item Details
    doc.setFontSize(12);
    doc.setFont("NotoSansDevanagari", "bold");
    doc.text("Item Details (वस्तू तपशील)", MARGIN, 80);

    autoTable(doc, {
      startY: 83,
      theme: "grid",
      margin: { left: MARGIN, right: MARGIN },
      head: [["Description", "Value"]],
      body: [
        ["Item Name (वस्तू)", gahanRecord.itemName],
        ["Weight (g) (वजन)", gahanRecord.itemWeight.toFixed(3)],
        ["Purity (शुध्दता)", gahanRecord.itemPurity || "N/A"],
      ],
      headStyles: {
        font: "NotoSansDevanagari",
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
      },
      bodyStyles: {
        font: "NotoSansDevanagari",
      },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    // 5. Financial Details
    doc.setFontSize(12);
    doc.setFont("NotoSansDevanagari", "bold");
    doc.text("Financial Details (आर्थिक तपशील)", MARGIN, finalY);

    autoTable(doc, {
      startY: finalY + 3,
      theme: "grid",
      margin: { left: MARGIN, right: MARGIN },
      head: [["Description", "Value"]],
      body: [
        ["Amount Given (रक्कम)", `₹${gahanRecord.amountGiven.toFixed(2)}`],
        ["Interest Rate (व्याज दर)", `${gahanRecord.interestRate}% per month`],
        ["Due Date (अंतिम मुदत)", formatDate(gahanRecord.dueDate)],
      ],
      headStyles: {
        font: "NotoSansDevanagari",
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
      },
      bodyStyles: {
        font: "NotoSansDevanagari",
      },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    });

    finalY = doc.lastAutoTable.finalY + 10;

    // 6. Status
    doc.setFontSize(10);
    doc.setFont("NotoSansDevanagari", "bold");
    doc.text("Status:", MARGIN, finalY);
    doc.setFont("NotoSansDevanagari", "normal");
    doc.text(
      `${gahanRecord.status} ${
        gahanRecord.releaseDate
          ? `(on ${formatDate(gahanRecord.releaseDate)})`
          : ""
      }`,
      MARGIN + 15, // Indent value
      finalY
    );

    finalY += 7;

    // 7. Notes
    if (gahanRecord.notes) {
      doc.setFontSize(10);
      doc.setFont("NotoSansDevanagari", "bold");
      doc.text("Notes:", MARGIN, finalY);
      doc.setFont("NotoSansDevanagari", "normal");
      const notesLines = doc.splitTextToSize(
        gahanRecord.notes,
        A5_WIDTH - MARGIN * 2
      );
      doc.text(notesLines, MARGIN, finalY + 7);
    }

    // 8. Save
    const fileName = `gahan-${
      gahanRecord.recordNumber
    }-${gahanRecord.customerName.replace(/ /g, "_")}.pdf`;
    doc.save(fileName);
  };

  return (
    // This is the ON-SCREEN PREVIEW
    <div className="text-gray-800">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
          <img src="/VJ.png" alt="Logo" className="h-16 w-auto" />
          <div className="text-right">
            <h2 className="text-xl md:text-2xl font-bold">
              Vinayak Jewellers, Gangakhed
            </h2>
            <p className="text-sm font-semibold">Gahan Receipt (गहाण पावती)</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="border-t border-b py-2 mb-6 text-sm">
          <div className="flex justify-between mb-1">
            <span>
              <strong>Record #:</strong> {gahanRecord.recordNumber || "N/A"}
            </span>
            <span>
              <strong>Date:</strong> {formatDate(gahanRecord.pawnDate)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span>
              <strong>Name (नाव):</strong> {gahanRecord.customerName || "N/A"}
            </span>
            <span>
              <strong>Mobile:</strong> {gahanRecord.customerMobile || "N/A"}
            </span>
          </div>
          <div className="flex">
            <span>
              <strong>Address (पत्ता):</strong>{" "}
              {gahanRecord.customerAddress || "N/A"}
            </span>
          </div>
        </div>

        {/* Item Details */}
        <h3 className="text-lg font-semibold mb-2">
          Item Details (वस्तू तपशील)
        </h3>
        <table className="w-full mb-6 text-sm">
          <tbody>
            <tr className="border-b">
              <td className="p-1 font-medium w-1/3">Item Name:</td>
              <td className="p-1">{gahanRecord.itemName}</td>
            </tr>
            <tr className="border-b">
              <td className="p-1 font-medium">Weight (g):</td>
              <td className="p-1">{gahanRecord.itemWeight.toFixed(3)}</td>
            </tr>
            <tr className="border-b">
              <td className="p-1 font-medium">Purity:</td>
              <td className="p-1">{gahanRecord.itemPurity || "N/A"}</td>
            </tr>
          </tbody>
        </table>

        {/* Financial Details */}
        <h3 className="text-lg font-semibold mb-2">
          Financial Details (आर्थिक तपशील)
        </h3>
        <table className="w-full mb-6 text-sm">
          <tbody>
            <tr className="border-b">
              <td className="p-1 font-medium w-1/3">Amount Given (रक्कम):</td>
              <td className="p-1">₹{gahanRecord.amountGiven.toFixed(2)}</td>
            </tr>
            <tr className="border-b">
              <td className="p-1 font-medium">Interest Rate (व्याज दर):</td>
              <td className="p-1">{gahanRecord.interestRate}% per month</td>
            </tr>
            <tr className="border-b">
              <td className="p-1 font-medium">Due Date (अंतिम मुदत):</td>
              <td className="p-1">{formatDate(gahanRecord.dueDate)}</td>
            </tr>
            <tr className="border-b font-medium">
              <td className="p-1">Status:</td>
              <td className="p-1">
                {gahanRecord.status}{" "}
                {gahanRecord.releaseDate
                  ? `(on ${formatDate(gahanRecord.releaseDate)})`
                  : ""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Notes */}
        {gahanRecord.notes && (
          <div className="mt-4 text-sm">
            <h4 className="font-semibold">Notes:</h4>
            <p>{gahanRecord.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-3 print-hide">
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
        <button
          onClick={generateGahanPDF} // Triggers the PDF download
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default GahanReceiptModal;
