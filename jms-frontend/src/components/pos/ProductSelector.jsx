// frontend/src/components/pos/ProductSelector.jsx
import React from "react";

// --- Add onSearchChange and searchTerm props ---
const ProductSelector = ({
  products,
  onAddToCart,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h4 className="text-lg font-semibold mb-4">Available Products</h4>

      {/* --- NEW Search Input --- */}
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 mb-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
      {/* ------------------------ */}

      <div className="max-h-[50vh] overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {products.length === 0 ? (
            <li className="py-3 text-center text-gray-500">
              No products match.
            </li>
          ) : (
            products.map((product) => (
              <li
                key={product._id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {product.name}{" "}
                    <span className="text-xs text-gray-500">
                      ({product.category})
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </p>
                </div>
                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={product.stock <= 0}
                >
                  {product.stock > 0 ? "Add" : "Out"}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProductSelector;
