// frontend/src/pages/GahanPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import Modal from "../components/common/Modal";
import { addGahan, getGahanRecords, releaseGahan } from "../services/api";
import GahanReceiptModal from "../components/gahan/GahanReceiptModal";
import {
  FiTrendingUp,
  FiPlus,
  FiSearch,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

const GahanPage = () => {
  const [gahanRecords, setGahanRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedGahan, setSelectedGahan] = useState(null);
  const initialFormData = {
    customerName: "",
    customerAddress: "",
    customerMobile: "",
    itemName: "",
    itemWeight: "",
    itemPurity: "",
    amountGiven: "",
    interestRate: "",
    dueDate: "",
    notes: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchItem, setSearchItem] = useState("");

  const fetchGahanRecords = async () => {
    setIsLoading(true);
    try {
      const response = await getGahanRecords();
      setGahanRecords(response.data);
    } catch (error) {
      console.error("Failed to fetch Gahan records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGahanRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    return gahanRecords.filter((record) => {
      const customerName = (record.customerName || "").toLowerCase();
      const itemName = (record.itemName || "").toLowerCase();
      const customerMatch = customerName.includes(searchCustomer.toLowerCase());
      const itemMatch = itemName.includes(searchItem.toLowerCase());
      return customerMatch && itemMatch;
    });
  }, [gahanRecords, searchCustomer, searchItem]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeRecords = filteredRecords.length;
    const totalAmount = filteredRecords.reduce(
      (sum, record) => sum + (record.amountGiven || 0),
      0
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueCount = filteredRecords.filter((record) => {
      if (!record.dueDate) return false;
      const due = new Date(record.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    }).length;

    return { activeRecords, totalAmount, overdueCount };
  }, [filteredRecords]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddGahan = async (e) => {
    e.preventDefault();
    try {
      await addGahan(formData);
      setIsAddModalOpen(false);
      fetchGahanRecords();
      setFormData(initialFormData);
      alert("Gahan record added successfully!");
    } catch (error) {
      console.error("Failed to add Gahan record:", error);
      alert(
        "Error adding record: " +
          (error.response?.data?.message || "Server error")
      );
    }
  };

  const handleRelease = async (id) => {
    if (!window.confirm("Are you sure you want to mark this item as released?"))
      return;
    try {
      await releaseGahan(id);
      fetchGahanRecords();
      alert("Gahan item released successfully!");
    } catch (error) {
      console.error("Failed to release Gahan item:", error);
      alert(
        "Error releasing item: " +
          (error.response?.data?.message || "Server error")
      );
    }
  };

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
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedGahan(null);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return due >= today && due <= sevenDaysFromNow;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Gahan records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-yellow-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-3 rounded-xl shadow-lg">
              <FiTrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Gahan Management
              </h1>
              <p className="text-gray-600">Track pledged jewelry items</p>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <FiPlus className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-semibold">Add New Gahan</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Active Records
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.activeRecords}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl">
                <FiCheckCircle
                  className="w-6 h-6 text-white"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Amount
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  ₹{stats.totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-4 rounded-xl">
                <FiTrendingUp
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
                <FiAlertCircle
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
                <FiSearch className="w-4 h-4 text-amber-500" />
                <span>Customer Name</span>
              </label>
              <input
                type="text"
                placeholder="Search by customer name"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FiSearch className="w-4 h-4 text-amber-500" />
                <span>Item Name</span>
              </label>
              <input
                type="text"
                placeholder="Search by item name"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-amber-50 to-yellow-50">
              <tr>
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
                  Weight(g)
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Interest%
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Pawn Date
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Due Date
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
                        <FiTrendingUp className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No Gahan records found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your search
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const overdue = isOverdue(record.dueDate);
                  const dueSoon = !overdue && isDueSoon(record.dueDate);
                  let rowClass = "";
                  if (overdue) rowClass = "bg-red-50 hover:bg-red-100";
                  else if (dueSoon)
                    rowClass = "bg-yellow-50 hover:bg-yellow-100";
                  else rowClass = "hover:bg-amber-50";

                  return (
                    <tr
                      key={record._id}
                      className={`${rowClass} transition-colors duration-200`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.customerName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.customerMobile || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.itemName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {record.itemWeight.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-amber-600">
                        ₹{record.amountGiven.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                        {record.interestRate}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(record.pawnDate)}
                      </td>
                      <td
                        className={`px-4 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-1 ${
                          overdue
                            ? "text-red-600"
                            : dueSoon
                            ? "text-yellow-700"
                            : "text-gray-600"
                        }`}
                      >
                        {overdue && <FiAlertCircle className="w-4 h-4" />}
                        {dueSoon && <FiClock className="w-4 h-4" />}
                        <span>{formatDate(record.dueDate)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm space-x-2">
                        <button
                          onClick={() => handleViewGahan(record)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 font-medium shadow-md"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRelease(record._id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 font-medium shadow-md"
                        >
                          Release
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

      {/* Add Gahan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Gahan Record"
      >
        {/* Form code remains the same - just the visual styling will be inherited from Modal */}
        <form onSubmit={handleAddGahan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700"
              >
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="customerMobile"
                className="block text-sm font-medium text-gray-700"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                id="customerMobile"
                value={formData.customerMobile}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="customerAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Customer Address
              </label>
              <input
                type="text"
                id="customerAddress"
                value={formData.customerAddress}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="itemName"
                className="block text-sm font-medium text-gray-700"
              >
                Item Name *
              </label>
              <input
                type="text"
                id="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="itemWeight"
                className="block text-sm font-medium text-gray-700"
              >
                Item Weight (grams) *
              </label>
              <input
                type="number"
                step="0.01"
                id="itemWeight"
                value={formData.itemWeight}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="itemPurity"
                className="block text-sm font-medium text-gray-700"
              >
                Item Purity (e.g., 22K)
              </label>
              <input
                type="text"
                id="itemPurity"
                value={formData.itemPurity}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="amountGiven"
                className="block text-sm font-medium text-gray-700"
              >
                Amount Given (Rs) *
              </label>
              <input
                type="number"
                step="0.01"
                id="amountGiven"
                value={formData.amountGiven}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="interestRate"
                className="block text-sm font-medium text-gray-700"
              >
                Interest Rate (%) *
              </label>
              <input
                type="number"
                step="0.1"
                id="interestRate"
                value={formData.interestRate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700"
              >
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Gahan Receipt"
        maxWidth="max-w-xl"
      >
        <GahanReceiptModal
          gahanRecord={selectedGahan}
          onClose={handleCloseViewModal}
        />
      </Modal>
    </div>
  );
};

export default GahanPage;
