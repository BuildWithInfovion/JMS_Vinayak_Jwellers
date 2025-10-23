// frontend/src/pages/InventoryPage.jsx
import React, { useState, useEffect, useMemo } from "react"; // <-- Import useMemo
import ProductTable from "../components/inventory/ProductTable";
import Modal from "../components/common/Modal";
import AddProductForm from "../components/inventory/AddProductForm";
import EditProductForm from "../components/inventory/EditProductForm";
import { getProducts, addProduct, updateProduct } from "../services/api";

const InventoryPage = () => {
  // ... (existing state is unchanged) ...
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW: Search State ---
  const [searchTerm, setSearchTerm] = useState("");
  // -------------------------

  const fetchProducts = async () => {
    // ... (function is unchanged) ...
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

  // --- NEW: Filter products based on search term ---
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
  // ------------------------------------------------

  // ... (all handle... functions are unchanged) ...
  const handleAddProduct = async (newProductData) => {
    /* ... */ try {
      await addProduct(newProductData);
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Failed to save product. Please try again.");
    }
  };
  const handleOpenEditModal = (product) => {
    /* ... */ setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    /* ... */ setIsEditModalOpen(false);
    setSelectedProduct(null);
  };
  const handleUpdateProduct = async (productId, updatedData) => {
    /* ... */ try {
      await updateProduct(productId, updatedData);
      handleCloseEditModal();
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product. Please try again.");
    }
  };
  // --------------------------------------------------

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold">Stock Management</h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Add Product
        </button>
      </div>

      {/* --- NEW Search Input --- */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      {/* ------------------------- */}

      {isLoading ? (
        <p>Loading inventory...</p>
      ) : (
        // --- Pass filteredProducts to the table ---
        <ProductTable
          products={filteredProducts}
          onEdit={handleOpenEditModal}
        />
        // ------------------------------------------
      )}

      {/* ... (Modals remain unchanged) ... */}
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
