// frontend/src/pages/ReportsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { getSales } from "../services/api";
import Modal from "../components/common/Modal";
import SaleDetailModal from "../components/reports/SaleDetailModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FiFileText,
  FiDownload,
  FiSearch,
  FiCalendar,
  FiDollarSign,
  FiShoppingBag,
} from "react-icons/fi";

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
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateMatch = saleDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateMatch = dateMatch && saleDate <= end;
      }

      const invoiceMatch = invoiceNumber.includes(searchInvoice);
      const customerMatch = customerName.includes(searchCustomer.toLowerCase());

      return dateMatch && invoiceMatch && customerMatch;
    });
  }, [sales, searchInvoice, searchCustomer, startDate, endDate]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );
    const totalBalance = filteredSales.reduce(
      (sum, sale) => sum + (sale.balanceDue || 0),
      0
    );
    const totalSales = filteredSales.length;
    return { totalRevenue, totalBalance, totalSales };
  }, [filteredSales]);

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

  // *** UPDATED PDF GENERATION LOGIC ***
  const generatePDF = () => {
    if (filteredSales.length === 0) {
      alert("No sales data to export...");
      return;
    }
    try {
      const doc = new jsPDF();
      // Updated columns to include Discount
      const tableColumn = [
        "Invoice #",
        "Date",
        "Customer",
        "Item Names",
        "Qty",
        "Total",
        "Discount", // New Column
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
        const totalQty = sale.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const saleData = [
          sale.invoiceNumber,
          formatDate(sale.createdAt),
          sale.customerName || "N/A",
          itemNames,
          totalQty,
          `Rs ${(sale.totalAmount || 0).toFixed(2)}`,
          // Show Discount
          `Rs ${(sale.discount || 0).toFixed(2)}`,
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
        columnStyles: { 3: { cellWidth: "auto" } },
      });

      const finalY = doc.lastAutoTable.finalY || 35;
      doc.setFontSize(10);
      doc.text(`Total Sales Count: ${stats.totalSales}`, 14, finalY + 10);
      doc.text(
        `Total Revenue: Rs ${stats.totalRevenue.toFixed(2)}`,
        14,
        finalY + 15
      );
      // New Total Discount line (optional, but good for reports)
      const totalDiscountGiven = filteredSales.reduce(
        (sum, s) => sum + (s.discount || 0),
        0
      );
      doc.text(
        `Total Discounts Given: Rs ${totalDiscountGiven.toFixed(2)}`,
        14,
        finalY + 20
      );

      doc.text(
        `Total Balance Due: Rs ${stats.totalBalance.toFixed(2)}`,
        14,
        finalY + 25
      );

      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `sales_report_${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("PDF Generation Error: " + error.message);
      console.error("PDF Error:", error);
    }
  };
  // ************************************

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
              <FiFileText className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Sales Reports
              </h1>
              <p className="text-gray-600">
                View and analyze sales transactions
              </p>
            </div>
          </div>

          {/* Download PDF Button */}
          <button
            onClick={generatePDF}
            disabled={filteredSales.length === 0}
            className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <FiDownload className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-semibold">Download PDF</span>
          </button>
        </div>

        {/* Stats Cards - Only 2 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Sales
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.totalSales}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl">
                <FiShoppingBag
                  className="w-6 h-6 text-white"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ₹{stats.totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl">
                <FiDollarSign
                  className="w-6 h-6 text-white"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Invoice Search */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FiSearch className="w-4 h-4 text-green-500" />
                <span>Invoice Number</span>
              </label>
              <input
                type="text"
                placeholder="Search by invoice #"
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              />
            </div>

            {/* Customer Search */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FiSearch className="w-4 h-4 text-green-500" />
                <span>Customer Name</span>
              </label>
              <input
                type="text"
                placeholder="Search by name"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FiCalendar className="w-4 h-4 text-green-500" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FiCalendar className="w-4 h-4 text-green-500" />
                <span>End Date</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Item Names
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FiFileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No sales match your filters
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your search criteria
                      </p>
                    </div>
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
                    <tr
                      key={sale._id}
                      className="hover:bg-green-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        #{sale.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.customerName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {itemNames}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {totalQty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                        ₹{(sale.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-orange-600">
                        ₹{(sale.balanceDue || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => handleViewSale(sale)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 font-medium shadow-md hover:shadow-lg"
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
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Invoice Details: #${selectedSale?.invoiceNumber}`}
        maxWidth="max-w-2xl"
      >
        <SaleDetailModal sale={selectedSale} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default ReportsPage;
