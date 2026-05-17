import React, { useState } from "react";
import { FiPlus, FiFileText } from "react-icons/fi";

const RestockProductForm = ({ product, onSave, onClose }) => {
  const isBulk = product?.type === "bulk_weight";
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [weightToAdd, setWeightToAdd] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const parsedWeight = parseFloat(weightToAdd);
    const parsedQuantity = isBulk ? 0 : parseInt(quantityToAdd, 10);

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      alert("Please enter a valid weight greater than 0.");
      setIsLoading(false);
      return;
    }
    if (!isBulk && (isNaN(parsedQuantity) || parsedQuantity < 0)) {
      alert("Please enter a valid quantity.");
      setIsLoading(false);
      return;
    }

    try {
      await onSave(product._id, { quantityToAdd: parsedQuantity, weightToAdd: parsedWeight });
    } catch (error) {
      console.error("Restock failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">

      {/* Weight input — always shown */}
      <div>
        <label htmlFor="weightToAdd" className="block text-sm font-medium text-gray-700">
          {isBulk ? "Weight (g) to Add *" : "Weight (g) to Add"}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFileText className="text-gray-400 w-5 h-5" />
          </div>
          <input
            type="number"
            id="weightToAdd"
            value={weightToAdd}
            onChange={(e) => setWeightToAdd(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., 20.5"
            required
            min="0.001"
            step="0.001"
          />
        </div>
      </div>

      {/* Quantity input — only for standard products */}
      {!isBulk && (
        <div>
          <label htmlFor="quantityToAdd" className="block text-sm font-medium text-gray-700">
            Quantity (pcs) to Add
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiPlus className="text-gray-400 w-5 h-5" />
            </div>
            <input
              type="number"
              id="quantityToAdd"
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., 1"
              required
              min="0"
              step="1"
            />
          </div>
        </div>
      )}

      {/* Current stock info */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm">
        <h4 className="font-medium text-indigo-800 mb-1">Current Stock — {product?.name}</h4>
        {isBulk ? (
          <p className="text-gray-700">
            Available weight: <span className="font-semibold">{product?.weight?.toFixed(3)}g</span>
          </p>
        ) : (
          <p className="text-gray-700">
            Weight: <span className="font-semibold">{product?.weight?.toFixed(3)}g</span>
            &nbsp;|&nbsp; Quantity: <span className="font-semibold">{product?.stock} pcs</span>
          </p>
        )}
        {isBulk && (
          <p className="text-xs text-indigo-600 mt-1">
            Bulk Weight — inventory tracked by grams, not piece count.
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? "Adding..." : "Add Stock"}
        </button>
      </div>
    </form>
  );
};

export default RestockProductForm;
