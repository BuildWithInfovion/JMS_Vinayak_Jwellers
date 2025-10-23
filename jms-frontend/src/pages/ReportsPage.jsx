// frontend/src/pages/ReportsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { getSales } from "../services/api";
import Modal from "../components/common/Modal";
import SaleDetailModal from "../components/reports/SaleDetailModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportsPage = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        const response = await getSales();
        setSales(response.data);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      const customerName = (sale.customerName || "").toLowerCase();
      const invoiceNumber = (sale.invoiceNumber || "").toString();
      let dateMatch = true;
      if (startDate) {
        dateMatch = saleDate >= new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setDate(endOfDay.getDate() + 1);
        dateMatch = dateMatch && saleDate < endOfDay;
      }
      const invoiceMatch = invoiceNumber.includes(searchInvoice);
      const customerMatch = customerName.includes(searchCustomer.toLowerCase());
      return dateMatch && invoiceMatch && customerMatch;
    });
  }, [sales, searchInvoice, searchCustomer, startDate, endDate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
  };

  const generatePDF = () => {
    if (filteredSales.length === 0) {
      alert("No sales data to export for the selected filters.");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = [
      "Invoice #",
      "Date",
      "Customer",
      "Item Names",
      "Qty",
      "Total",
      "Balance Due",
    ];
    const tableRows = [];

    doc.setFontSize(18);
    doc.text("Sales Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateRangeText =
      startDate || endDate
        ? `From: ${startDate || "Start"} To: ${endDate || "End"}`
        : "All Time";
    doc.text(dateRangeText, 14, 30);

    filteredSales.forEach((sale) => {
      const itemNames = sale.items.map((item) => item.name).join(", ");
      const totalQty = sale.items.reduce((sum, item) => sum + item.quantity, 0);
      const saleData = [
        sale.invoiceNumber,
        formatDate(sale.createdAt),
        sale.customerName || "N/A",
        itemNames,
        totalQty,
        `Rs ${(sale.totalAmount || 0).toFixed(2)}`,
        `Rs ${(sale.balanceDue || 0).toFixed(2)}`,
      ];
      tableRows.push(saleData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { cellWidth: "auto" },
      },
    });

    const finalY = doc.lastAutoTable.finalY || 35;
    doc.setFontSize(10);
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );
    const totalBalance = filteredSales.reduce(
      (sum, sale) => sum + (sale.balanceDue || 0),
      0
    );
    doc.text(`Total Sales Count: ${filteredSales.length}`, 14, finalY + 10);
    doc.text(`Total Revenue: Rs ${totalRevenue.toFixed(2)}`, 14, finalY + 15);
    doc.text(
      `Total Balance Due: Rs ${totalBalance.toFixed(2)}`,
      14,
      finalY + 20
    );

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`sales_report_${dateStr}.pdf`);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Sales Reports</h3>
          <button
            onClick={generatePDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isLoading || filteredSales.length === 0}
          >
            Download PDF
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by Invoice #"
            value={searchInvoice}
            onChange={(e) => setSearchInvoice(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3"
          />
          <input
            type="text"
            placeholder="Search by Customer Name"
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3"
          />
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-500"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 w-full"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-500"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <p>Loading reports...</p>
        ) : (
          // --- UPDATED: Ensured overflow-x-auto wrapper is present ---
          <div className="overflow-x-auto">
            {/* -------------------------------------------------------- */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Item Names
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Balance Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-500">
                      No sales match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => {
                    const itemNames = sale.items
                      .map((item) => item.name)
                      .join(", ");
                    const totalQty = sale.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    return (
                      <tr key={sale._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {sale.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(sale.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {sale.customerName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {itemNames}
                        </td>{" "}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {totalQty}
                        </td>{" "}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          ₹{(sale.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                          ₹{(sale.balanceDue || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewSale(sale)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal remains the same */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Invoice Details: #${selectedSale?.invoiceNumber}`}
        maxWidth="max-w-2xl"
      >
        <SaleDetailModal sale={selectedSale} onClose={handleCloseModal} />
      </Modal>
    </>
  );
};

export default ReportsPage;
