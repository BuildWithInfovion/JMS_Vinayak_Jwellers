import React, { useState } from "react";
import { FiPlus, FiTag, FiFileText } from "react-icons/fi"; // Using Fi for consistency

const RestockProductForm = ({ product, onSave, onClose }) => {
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [weightToAdd, setWeightToAdd] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      quantityToAdd: parseInt(quantityToAdd, 10),
      weightToAdd: parseFloat(weightToAdd),
    };

    if (
      isNaN(data.quantityToAdd) ||
      isNaN(data.weightToAdd) ||
      data.quantityToAdd < 0 ||
      data.weightToAdd < 0
    ) {
      alert("Please enter valid, positive numbers for quantity and weight.");
      setIsLoading(false);
      return;
    }

    try {
      // onSave is the 'handleRestockProduct' function from InventoryPage.jsx
      await onSave(product._id, data);
    } catch (error) {
      console.error("Restock failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div>
        <label
          htmlFor="quantityToAdd"
          className="block text-sm font-medium text-gray-700"
        >
          Quantity to Add
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiPlus className="text-gray-400 w-5 h-5" />
          </div>
          <input
            type="number"
            name="quantityToAdd"
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

      <div>
        <label
          htmlFor="weightToAdd"
          className="block text-sm font-medium text-gray-700"
        >
          Weight (g) to Add
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFileText className="text-gray-400 w-5 h-5" />
          </div>
          <input
            type="number"
            name="weightToAdd"
            id="weightToAdd"
            value={weightToAdd}
            onChange={(e) => setWeightToAdd(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., 20.0"
            required
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Current Stock Info */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <h4 className="text-sm font-medium text-indigo-800">Current Stock</h4>
        <p className="text-gray-700">
          <span className="font-semibold">{product?.name}</span>
        </p>
        <p className="text-gray-600">
          Weight: {product?.weight}g | Quantity: {product?.stock}
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
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
