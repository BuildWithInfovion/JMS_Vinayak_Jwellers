// frontend/src/pages/GahanReportsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { getAllGahanRecords } from "../services/api";
import Modal from "../components/common/Modal";
import GahanReceiptModal from "../components/gahan/GahanReceiptModal";
import {
  FiBarChart2,
  FiSearch,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
} from "react-icons/fi";

const GahanReportsPage = () => {
  const [allGahanRecords, setAllGahanRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchRecordNum, setSearchRecordNum] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedGahan, setSelectedGahan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllGahan = async () => {
      setIsLoading(true);
      try {
        const response = await getAllGahanRecords();
        setAllGahanRecords(response.data);
      } catch (error) {
        console.error("Failed to fetch all Gahan records:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllGahan();
  }, []);

  const filteredRecords = useMemo(() => {
    return allGahanRecords.filter((record) => {
      const customerName = (record.customerName || "").toLowerCase();
      const recordNumber = (record.recordNumber || "").toString();
      const recordMatch = recordNumber.includes(searchRecordNum);
      const customerMatch = customerName.includes(searchCustomer.toLowerCase());
      return recordMatch && customerMatch;
    });
  }, [allGahanRecords, searchRecordNum, searchCustomer]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRecords = filteredRecords.length;
    const activeCount = filteredRecords.filter(
      (r) => r.status === "Active"
    ).length;
    const releasedCount = filteredRecords.filter(
      (r) => r.status === "Released"
    ).length;
    const overdueCount = filteredRecords.filter(
      (r) => r.status === "Overdue"
    ).length;
    const totalAmount = filteredRecords.reduce(
      (sum, r) => sum + (r.amountGiven || 0),
      0
    );

    return {
      totalRecords,
      activeCount,
      releasedCount,
      overdueCount,
      totalAmount,
    };
  }, [filteredRecords]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleViewGahan = (record) => {
    setSelectedGahan(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGahan(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Gahan reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
            <FiBarChart2 className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gahan Reports
            </h1>
            <p className="text-gray-600">
              View all pledged jewelry records and history
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Records
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.totalRecords}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl">
                <FiBarChart2 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Active
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.activeCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl">
                <FiClock className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Released
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.releasedCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl">
                <FiCheckCircle
                  className="w-6 h-6 text-white"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Overdue
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.overdueCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-4 rounded-xl">
                <FiAlertTriangle
                  className="w-6 h-6 text-white"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FiSearch className="w-4 h-4 text-purple-500" />
                <span>Record Number</span>
              </label>
              <input
                type="text"
                placeholder="Search by record #"
                value={searchRecordNum}
                onChange={(e) => setSearchRecordNum(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FiSearch className="w-4 h-4 text-purple-500" />
                <span>Customer Name</span>
              </label>
              <input
                type="text"
                placeholder="Search by customer name"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Record #
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Pawn Date
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FiBarChart2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No records found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your search filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-purple-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      #{record.recordNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.customerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.customerMobile || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.itemName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-purple-600">
                      ₹{record.amountGiven.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(record.pawnDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(record.dueDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === "Released"
                            ? "bg-gray-100 text-gray-700 border border-gray-300"
                            : record.status === "Overdue"
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-green-100 text-green-700 border border-green-300"
                        }`}
                      >
                        {record.status === "Released" && (
                          <FiCheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {record.status === "Overdue" && (
                          <FiAlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {record.status === "Active" && (
                          <FiClock className="w-3 h-3 mr-1" />
                        )}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewGahan(record)}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 font-medium shadow-md hover:shadow-lg"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Gahan Receipt: #${selectedGahan?.recordNumber}`}
      >
        <GahanReceiptModal
          gahanRecord={selectedGahan}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default GahanReportsPage;
