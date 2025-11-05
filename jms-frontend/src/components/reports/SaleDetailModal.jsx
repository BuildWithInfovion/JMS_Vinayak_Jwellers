// frontend/src/components/reports/SaleDetailModal.jsx
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SaleDetailModal = ({ sale, onClose }) => {
  if (!sale) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const generateSalePDF = () => {
    if (!sale) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const A4_WIDTH = 210;
    const A4_HEIGHT = 297;
    const MARGIN = 15;

    // ✅ Step 1: Add your custom design as background
    const designImage = new Image();
    designImage.src = "/Design.png";

    designImage.onload = () => {
      doc.addImage(designImage, "PNG", 0, 0, A4_WIDTH, A4_HEIGHT);

      // ✅ Step 2: Overlay Invoice Number and Date
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice #: ${sale.invoiceNumber}`, 20, 50);
      doc.text(`Date: ${formatDate(sale.createdAt)}`, 150, 50);

      // ✅ Step 3: Customer Details
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Name: ${sale.customerName || "N/A"}`, 20, 65);
      doc.text(`Mobile: ${sale.customerMobile || "N/A"}`, 20, 72);
      doc.text(`Address: ${sale.customerAddress || "N/A"}`, 20, 79);

      // ✅ Step 4: Items Table
      const tableColumn = [
        "Item (Qty)",
        "Purity",
        "Wt(g)",
        "Rate/g",
        "MC/g",
        "Amount",
      ];
      const tableRows = [];

      sale.items.forEach((item) => {
        const itemWeight = item.sellingWeight || 0;
        const itemPricePerGram = item.sellingPricePerGram || 0;
        const itemMakingChargePerGram = item.makingChargePerGram || 0;
        const lineTotal =
          (itemWeight * itemPricePerGram +
            itemWeight * itemMakingChargePerGram) *
          item.quantity;

        tableRows.push([
          `${item.name} (Qty: ${item.quantity})`,
          item.sellingPurity || "N/A",
          itemWeight.toFixed(3),
          `Rs.${itemPricePerGram.toFixed(2)}`,
          `Rs.${itemMakingChargePerGram.toFixed(2)}`,
          `Rs.${lineTotal.toFixed(2)}`,
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        margin: { left: MARGIN, right: MARGIN },
        theme: "grid",
        headStyles: {
          font: "Helvetica",
          fontSize: 9,
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        bodyStyles: {
          font: "Helvetica",
          fontSize: 8,
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 20, halign: "center" },
          2: { cellWidth: 25, halign: "right" },
          3: { cellWidth: 30, halign: "right" },
          4: { cellWidth: 25, halign: "right" },
          5: { cellWidth: 35, halign: "right", fontStyle: "bold" },
        },
      });

      // ✅ Step 5: Totals Section
      let finalY = doc.lastAutoTable.finalY + 15;
      const rightAlign = A4_WIDTH - MARGIN;
      const labelX = 130;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);

      // Subtotal
      doc.text("Subtotal:", labelX, finalY, { align: "right" });
      doc.text(`Rs.${(sale.subtotal || 0).toFixed(2)}`, rightAlign, finalY, {
        align: "right",
      });

      // ✅ REMOVED Total Making Charges line - MC/g is shown in table

      // Line separator
      finalY += 5;
      doc.setLineWidth(0.5);
      doc.line(labelX - 10, finalY, rightAlign, finalY);

      // Total
      finalY += 7;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Total:", labelX, finalY, { align: "right" });
      doc.text(`Rs.${(sale.totalAmount || 0).toFixed(2)}`, rightAlign, finalY, {
        align: "right",
      });

      // Advance Payment
      finalY += 8;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 150, 0);
      doc.text("Advance:", labelX, finalY, { align: "right" });
      doc.text(
        `- Rs.${(sale.advancePayment || 0).toFixed(2)}`,
        rightAlign,
        finalY,
        { align: "right" }
      );

      // Line separator
      finalY += 5;
      doc.setTextColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(labelX - 10, finalY, rightAlign, finalY);

      // Balance Due
      finalY += 7;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 200);
      doc.text("Total Bill:", labelX, finalY, { align: "right" });
      doc.text(`Rs.${(sale.balanceDue || 0).toFixed(2)}`, rightAlign, finalY, {
        align: "right",
      });

      doc.setTextColor(0, 0, 0);

      // ✅ Step 6: Save PDF
      const fileName = `${sale.customerName.replace(/ /g, "_")}-${
        sale.invoiceNumber
      }.pdf`;
      doc.save(fileName);
    };

    // Trigger image load
    designImage.onerror = () => {
      alert(
        "Failed to load Design.png. Please check if the file exists in the public folder."
      );
    };
  };

  return (
    <div className="text-gray-800">
      <div id="invoice-content-modal">
        <div className="text-center mb-8">
          <img src="/VJ.png" alt="Logo" className="h-16 w-auto mx-auto mb-3" />
          <h2 className="text-2xl font-bold">विनायक ज्वेलर्स, गंगाखेड</h2>
          <p className="text-sm">सोने चांदीचे व्यापारी</p>
          <p className="text-sm">Prop. Vinayak D. Didshere</p>
          <p className="text-sm">Mo. 9421462257</p>
        </div>

        <div className="border-t border-b py-2 mb-6 text-sm">
          <div className="flex justify-between mb-1">
            <span>
              <strong>Invoice #:</strong> {sale.invoiceNumber || "N/A"}
            </span>
            <span>
              <strong>Date:</strong> {formatDate(sale.createdAt)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span>
              <strong>Name (श्री./सौ.):</strong> {sale.customerName || "N/A"}
            </span>
            <span>
              <strong>Mobile:</strong> {sale.customerMobile || "N/A"}
            </span>
          </div>
          <div className="flex">
            <span>
              <strong>Address (रा.):</strong> {sale.customerAddress || "N/A"}
            </span>
          </div>
        </div>

        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2 font-medium">Item (Qty)</th>
              <th className="text-center p-2 font-medium">Purity</th>
              <th className="text-right p-2 font-medium">Weight (g)</th>
              <th className="text-right p-2 font-medium">Rate/g</th>
              <th className="text-right p-2 font-medium">MC/g</th>
              <th className="text-right p-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items &&
              sale.items.map((item) => {
                const itemWeight = item.sellingWeight || 0;
                const itemPricePerGram = item.sellingPricePerGram || 0;
                const itemMakingChargePerGram = item.makingChargePerGram || 0;
                const linePrice = itemWeight * itemPricePerGram;
                const lineMC = itemWeight * itemMakingChargePerGram;
                const lineTotal = (linePrice + lineMC) * item.quantity;
                return (
                  <tr key={item._id || item.productId} className="border-b">
                    <td className="p-2">
                      {item.name} (Qty: {item.quantity})
                    </td>
                    <td className="text-center p-2">
                      {item.sellingPurity || "N/A"}
                    </td>
                    <td className="text-right p-2">{itemWeight.toFixed(3)}</td>
                    <td className="text-right p-2">
                      ₹{itemPricePerGram.toFixed(2)}
                    </td>
                    <td className="text-right p-2">
                      ₹{itemMakingChargePerGram.toFixed(2)}
                    </td>
                    <td className="text-right p-2 font-medium">
                      ₹{lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-full max-w-sm text-sm">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>₹{(sale.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Total Making Charges (मजुरी):</span>
              <span>₹{(sale.totalMakingCharges || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t mt-2 font-bold text-lg">
              <span>Total (एकूण):</span>
              <span>₹{(sale.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-green-600 font-medium">
              <span>Advance (नगदी जमा):</span>
              <span>- ₹{(sale.advancePayment || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t mt-2 font-bold text-xl text-blue-600">
              <span>Total Bill (एकूण बिल):</span>
              <span>₹{(sale.balanceDue || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
        <button
          onClick={generateSalePDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default SaleDetailModal;
