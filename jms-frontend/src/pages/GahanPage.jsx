// frontend/src/pages/GahanPage.jsx
import React, { useState, useEffect, useMemo } from "react"; // <-- Import useMemo
import Modal from "../components/common/Modal";
import { addGahan, getGahanRecords, releaseGahan } from "../services/api";
import GahanReceiptModal from "../components/gahan/GahanReceiptModal";

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

  // --- NEW: Search State ---
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchItem, setSearchItem] = useState("");
  // -------------------------

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

  // --- NEW: Filter records based on search ---
  const filteredRecords = useMemo(() => {
    return gahanRecords.filter((record) => {
      const customerName = (record.customerName || "").toLowerCase();
      const itemName = (record.itemName || "").toLowerCase();

      const customerMatch = customerName.includes(searchCustomer.toLowerCase());
      const itemMatch = itemName.includes(searchItem.toLowerCase());

      return customerMatch && itemMatch; // Must match both
    });
  }, [gahanRecords, searchCustomer, searchItem]);
  // ------------------------------------------

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
    if (
      !window.confirm("Are you sure you want to mark this item as released?")
    ) {
      return;
    }
    try {
      await releaseGahan(id);
      fetchGahanRecords(); // Refresh the list
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

  return (
    <>
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Gahan Management</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            + Add New Gahan
          </button>
        </div>

        {/* --- NEW Search Inputs --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by Customer Name..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Search by Item Name..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* ------------------------- */}

        {isLoading ? (
          <p>Loading Gahan records...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Item
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Weight(g)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount Given
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Interest(%)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pawn Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* --- Use filteredRecords --- */}
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-gray-500">
                      No Gahan records match your search.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const overdue = isOverdue(record.dueDate);
                    const dueSoon = !overdue && isDueSoon(record.dueDate);
                    let rowClass = "";
                    if (overdue) rowClass = "bg-red-100";
                    else if (dueSoon) rowClass = "bg-yellow-100";
                    return (
                      <tr key={record._id} className={rowClass}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {record.customerName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {record.customerMobile || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {record.itemName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          {record.itemWeight.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          ₹{record.amountGiven.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          {record.interestRate}%
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {formatDate(record.pawnDate)}
                        </td>
                        <td
                          className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                            overdue
                              ? "text-red-600"
                              : dueSoon
                              ? "text-yellow-700"
                              : ""
                          }`}
                        >
                          {formatDate(record.dueDate)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleViewGahan(record)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleRelease(record._id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Release
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
                {/* --------------------------- */}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Gahan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Gahan Record"
      >
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
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* View Gahan Receipt Modal */}
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
    </>
  );
};

export default GahanPage;
