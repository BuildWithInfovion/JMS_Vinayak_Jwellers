// frontend/src/pages/GahanReportsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { getAllGahanRecords } from "../services/api"; // Use the new API function
import Modal from "../components/common/Modal";
import GahanReceiptModal from "../components/gahan/GahanReceiptModal"; // Reuse the receipt modal

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

  return (
    <>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-2xl font-semibold mb-4">
          Gahan Reports (All Records)
        </h3>

        {/* Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by Record #..."
            value={searchRecordNum}
            onChange={(e) => setSearchRecordNum(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3"
          />
          <input
            type="text"
            placeholder="Search by Customer Name..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3"
          />
        </div>

        {isLoading ? (
          <p>Loading reports...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Record #
                  </th>
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
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pawn Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-gray-500">
                      No records match filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {record.recordNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {record.customerName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {record.customerMobile || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {record.itemName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                        ₹{record.amountGiven.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {formatDate(record.pawnDate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {formatDate(record.dueDate)}
                      </td>
                      <td
                        className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                          record.status === "Released"
                            ? "text-gray-500"
                            : record.status === "Overdue"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {record.status}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewGahan(record)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {" "}
                          View{" "}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Gahan Receipt Modal */}
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
    </>
  );
};

export default GahanReportsPage;
