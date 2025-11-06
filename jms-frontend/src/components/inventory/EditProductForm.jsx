// frontend/src/components/inventory/EditProductForm.jsx
import React, { useState, useEffect } from "react";

const EditProductForm = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Gold",
    weight: "",
    stock: "",
    purity: "",
    pricePerGram: "",
    unitPrice: "",
    type: "standard", // NEW: Product type
  });

  // Pre-fill form when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "Gold",
        weight: product.weight || "",
        stock: product.stock || "",
        purity: product.purity || "",
        pricePerGram: product.pricePerGram || "",
        unitPrice: product.unitPrice || "",
        type: product.type || "standard", // NEW: Load existing type
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product._id, formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Product Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option>Gold</option>
            <option>Silver</option>
            <option>Others</option>
          </select>
        </div>

        {/* NEW: Product Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Product Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="standard">Standard</option>
            <option value="bulk_weight">Bulk Weight</option>
          </select>
        </div>

        {/* Weight - Conditional Label */}
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700"
          >
            {formData.type === "bulk_weight"
              ? "Total Weight in Unit (g)"
              : "Weight (g)"}
          </label>
          <input
            type="number"
            id="weight"
            step="0.01"
            value={formData.weight}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Stock - Conditional Label */}
        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700"
          >
            {formData.type === "bulk_weight"
              ? "Units (e.g., 1 Box)"
              : "Stock Quantity"}
          </label>
          <input
            type="number"
            id="stock"
            value={formData.stock}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Update Product
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;
