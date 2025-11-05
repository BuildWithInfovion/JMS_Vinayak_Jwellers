// jms-frontend/src/pages/DebtPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getActiveDebts, addDebtPayment, createDebt } from "../services/api";
import { toast } from "react-toastify";
import Modal from "../components/common/Modal";
import {
  FiBook,
  FiPlus,
  FiDollarSign,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";

const DebtPage = () => {
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDebtData, setNewDebtData] = useState({
    customerName: "",
    customerMobile: "",
    initialAmount: "",
    dueDate: "",
  });

  const fetchDebts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getActiveDebts();
      setDebts(response.data);
    } catch (error) {
      console.error("Error fetching debts:", error);
      toast.error("Failed to load active debts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalDebts = debts.length;
    const totalAmount = debts.reduce(
      (sum, debt) => sum + (debt.amountRemaining || 0),
      0
    );
    const activeCount = debts.filter((debt) => debt.amountRemaining > 0).length;

    return { totalDebts, totalAmount, activeCount };
  }, [debts]);

  const openPaymentModal = (debt) => {
    setSelectedDebt(debt);
    setPaymentAmount("");
    setIsPayModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPayModalOpen(false);
    setSelectedDebt(null);
    setPaymentAmount("");
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive payment amount.");
      return;
    }
    if (amount > selectedDebt.amountRemaining) {
      toast.error(
        `Payment (₹${amount}) exceeds remaining balance (₹${selectedDebt.amountRemaining}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await addDebtPayment(selectedDebt._id, amount);
      toast.success(
        `Payment of ₹${amount} for ${selectedDebt.customerName} successful!`
      );
      closePaymentModal();
      fetchDebts();
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error(
        error.response?.data?.message || "Failed to process payment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewDebtData({
      customerName: "",
      customerMobile: "",
      initialAmount: "",
      dueDate: "",
    });
  };

  const handleNewDebtChange = (e) => {
    const { name, value } = e.target;
    setNewDebtData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDebtSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const amount = parseFloat(newDebtData.initialAmount);
    if (!newDebtData.customerName || !newDebtData.customerMobile) {
      toast.error("Customer Name and Mobile are required.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newDebtData,
        initialAmount: amount,
        amountRemaining: amount,
      };
      await createDebt(payload);
      toast.success("New debt record added successfully!");
      closeAddModal();
      fetchDebts();
    } catch (error) {
      console.error("Error creating debt:", error);
      toast.error(error.response?.data?.message || "Failed to create debt.");
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading debt records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <FiBook className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Debt Management
              </h1>
              <p className="text-gray-600">
                Track active customer debts (Khata)
              </p>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={openAddModal}
            className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <FiPlus className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-semibold">Add New Debt</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Active Debts
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.activeCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl">
                <FiUsers className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Amount Due
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  ₹{stats.totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-4 rounded-xl">
                <FiDollarSign
                  className="w-6 h-6 text-white"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100 hover:border-orange-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Records
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  {stats.totalDebts}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-yellow-600 p-4 rounded-xl">
                <FiBook className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-red-50 to-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Remaining (₹)
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Last Payment
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {debts.length > 0 ? (
                debts.map((debt) => (
                  <tr
                    key={debt._id}
                    className="hover:bg-red-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {debt.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {debt.customerMobile}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <FiAlertCircle className="w-4 h-4 text-red-500" />
                        <span className="font-bold text-red-600">
                          ₹{debt.amountRemaining.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(debt.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(debt.lastPaymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => openPaymentModal(debt)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 font-medium shadow-md hover:shadow-lg"
                      >
                        Add Payment
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FiBook className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No active debts found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        All customers have cleared their debts!
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={closePaymentModal}
        title="Add Payment"
      >
        {selectedDebt && (
          <form onSubmit={handlePaymentSubmit}>
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border-2 border-red-100">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Customer:</strong> {selectedDebt.customerName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Mobile:</strong> {selectedDebt.customerMobile}
                </p>
                <p className="text-xl font-bold text-red-600 flex items-center space-x-2">
                  <FiAlertCircle className="w-5 h-5" />
                  <span>
                    Remaining: ₹{selectedDebt.amountRemaining.toFixed(2)}
                  </span>
                </p>
              </div>

              <div>
                <label
                  htmlFor="paymentAmount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  id="paymentAmount"
                  name="paymentAmount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closePaymentModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Submit Payment"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Debt Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Add New Debt Record"
      >
        <form onSubmit={handleAddDebtSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={newDebtData.customerName}
                onChange={handleNewDebtChange}
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label
                htmlFor="customerMobile"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Customer Mobile *
              </label>
              <input
                type="tel"
                id="customerMobile"
                name="customerMobile"
                value={newDebtData.customerMobile}
                onChange={handleNewDebtChange}
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label
                htmlFor="initialAmount"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Initial Amount Due (₹) *
              </label>
              <input
                type="number"
                id="initialAmount"
                name="initialAmount"
                value={newDebtData.initialAmount}
                onChange={handleNewDebtChange}
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Due Date (Optional)
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={newDebtData.dueDate}
                onChange={handleNewDebtChange}
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300"
              />
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Debt Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DebtPage;
