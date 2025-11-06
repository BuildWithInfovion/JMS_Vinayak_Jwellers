// frontend/src/pages/InventoryPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import ProductTable from "../components/inventory/ProductTable";
import Modal from "../components/common/Modal";
import AddProductForm from "../components/inventory/AddProductForm";
import EditProductForm from "../components/inventory/EditProductForm";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/api";
import { FiPlus, FiSearch, FiPackage } from "react-icons/fi";

const InventoryPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // *** UPDATED: Calculate In Stock products correctly ***
  const inStockCount = useMemo(() => {
    return products.filter((product) => {
      if (product.type === "standard") {
        return product.stock > 0;
      } else if (product.type === "bulk_weight") {
        return product.weight > 0;
      }
      return false;
    }).length;
  }, [products]);

  // *** UPDATED: Calculate Out of Stock products correctly ***
  const outOfStockCount = useMemo(() => {
    return products.filter((product) => {
      if (product.type === "standard") {
        return product.stock <= 0;
      } else if (product.type === "bulk_weight") {
        return product.weight <= 0;
      }
      return false;
    }).length;
  }, [products]);

  const handleAddProduct = async (newProductData) => {
    try {
      await addProduct(newProductData);
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Failed to save product. Please try again.");
    }
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    try {
      await updateProduct(productId, updatedData);
      handleCloseEditModal();
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product. Please try again.");
    }
  };

  // *** NEW: handleDeleteProduct function ***
  const handleDeleteProduct = async (productId, productName) => {
    // Show confirmation dialog
    if (
      window.confirm(
        `Are you sure you want to delete "${productName}"?\n\nThis will hide it from inventory and POS, but sales records will remain intact.`
      )
    ) {
      try {
        await deleteProduct(productId);
        // Refresh the product list after successful deletion
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };
  // ****************************************

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Stock Management
            </h1>
            <p className="text-gray-600">
              Manage your jewelry inventory and product catalog
            </p>
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <FiPlus className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-semibold">Add Product</span>
          </button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Products
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {products.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl">
                <FiPackage className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  In Stock
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {/* *** UPDATED: Use inStockCount *** */}
                  {inStockCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Out of Stock
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  {/* *** UPDATED: Use outOfStockCount *** */}
                  {outOfStockCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-4 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <ProductTable
          products={filteredProducts}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteProduct}
        />
      </div>

      {/* Modals */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
      >
        <AddProductForm
          onSave={handleAddProduct}
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Product"
      >
        <EditProductForm
          product={selectedProduct}
          onSave={handleUpdateProduct}
          onClose={handleCloseEditModal}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;
