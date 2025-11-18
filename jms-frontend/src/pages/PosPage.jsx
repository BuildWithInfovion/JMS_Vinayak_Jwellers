// frontend/src/pages/PosPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import ProductSelector from "../components/pos/ProductSelector";
import Cart from "../components/pos/Cart";
import Modal from "../components/common/Modal";
import InvoicePreview from "../components/pos/InvoicePreview";
import { getProducts, createSale } from "../services/api";
import {
  FiShoppingCart,
  FiUser,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiPercent, // New icon for discount
  FiLayers, // New icon for old gold weight
} from "react-icons/fi";

const PosPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Customer & Payment State
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [advancePayment, setAdvancePayment] = useState(0);

  // *** NEW STATE VARIABLES ***
  const [discount, setDiscount] = useState(0);
  const [oldGoldWeight, setOldGoldWeight] = useState(0);
  // **************************

  const [searchTerm, setSearchTerm] = useState("");

  const fetchProductsForPOS = async () => {
    setIsLoading(true);
    try {
      const response = await getProducts();
      setAvailableProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products for POS:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsForPOS();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return availableProducts;
    }
    return availableProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableProducts, searchTerm]);

  const handleAddToCart = (productToAdd) => {
    setCartItems((prevItems) => {
      const productInDb = availableProducts.find(
        (p) => p._id === productToAdd._id
      );
      if (productInDb.stock <= 0) {
        alert("This item is out of stock.");
        return prevItems;
      }
      const existingItem = prevItems.find(
        (item) => item._id === productToAdd._id
      );
      if (existingItem) {
        if (existingItem.quantity >= productInDb.stock) {
          alert(`Max stock reached for ${productInDb.name}`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item._id === productToAdd._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevItems,
        {
          ...productToAdd,
          quantity: 1,
          sellingWeight: productToAdd.weight || 0,
          sellingPricePerGram: productToAdd.pricePerGram || 0,
          sellingPurity: productToAdd.purity || "",
          makingChargePerGram: 0,
        },
      ];
    });
  };

  const handleIncreaseQuantity = (productId) => {
    const productInDb = availableProducts.find((p) => p._id === productId);
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === productId) {
          if (item.quantity >= productInDb.stock) {
            alert(`Max stock reached for ${item.name}`);
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const handleDecreaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId)
    );
  };

  const handleUpdateCartPrice = (productId, price) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, sellingPricePerGram: price } : item
      )
    );
  };

  const handleUpdateCartWeight = (productId, weight) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, sellingWeight: weight } : item
      )
    );
  };

  const handleUpdateCartPurity = (productId, purity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, sellingPurity: purity } : item
      )
    );
  };

  const handleUpdateCartMakingCharge = (productId, charge) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, makingChargePerGram: charge } : item
      )
    );
  };

  const handleGenerateInvoice = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty.");
      return;
    }
    if (!customerMobile) {
      alert("Error: Please enter the Customer Mobile Number.");
      return;
    }
    const invalidItem = cartItems.find((item) => {
      const isPricedByGram = item.category !== "Others";
      if (
        isPricedByGram &&
        (!item.sellingPricePerGram || item.sellingPricePerGram <= 0)
      ) {
        return true;
      }
      if (isPricedByGram && (!item.sellingWeight || item.sellingWeight <= 0)) {
        return true;
      }
      return false;
    });
    if (invalidItem) {
      alert(
        `Error: Please enter a valid Weight and Price/Gram for "${invalidItem.name}".`
      );
      return;
    }
    setIsInvoiceModalOpen(true);
  };

  const handleConfirmSale = async (saleDataFromModal) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const salePayload = {
        items: saleDataFromModal.items.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          sellingWeight: item.sellingWeight,
          sellingPricePerGram: item.sellingPricePerGram,
          sellingPurity: item.sellingPurity,
          makingChargePerGram: item.makingChargePerGram || 0,
        })),
        subtotal: saleDataFromModal.subtotal,
        totalMakingCharges: saleDataFromModal.totalMakingCharges,
        totalAmount: saleDataFromModal.totalAmount,
        advancePayment: saleDataFromModal.advancePayment,
        balanceDue: saleDataFromModal.balanceDue,
        customerName: saleDataFromModal.customerName,
        customerAddress: saleDataFromModal.customerAddress,
        customerMobile: saleDataFromModal.customerMobile,
        // *** Pass the NEW fields to the backend ***
        discount: saleDataFromModal.discount,
        oldGoldWeight: saleDataFromModal.oldGoldWeight,
      };

      await createSale(salePayload);

      alert("Sale Confirmed & Saved!");

      setCartItems([]);
      setCustomerName("");
      setCustomerAddress("");
      setCustomerMobile("");
      setAdvancePayment(0);
      setDiscount(0); // Reset discount
      setOldGoldWeight(0); // Reset old gold weight
      setIsInvoiceModalOpen(false);
      fetchProductsForPOS();
    } catch (error) {
      console.error("Failed to create sale:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save sale.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
            <FiShoppingCart className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Point of Sale
          </h1>
        </div>
        <p className="text-gray-600 ml-16">
          Create invoices and process sales transactions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product Selector - Left Side */}
        <div className="lg:col-span-2">
          <ProductSelector
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Billing Section - Right Side */}
        <div className="lg:col-span-3 space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                <FiUser className="w-5 h-5" />
                <span>Customer & Payment Details</span>
              </h4>
            </div>

            {/* Form Fields */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiUser className="w-4 h-4 text-blue-500" />
                    <span>Customer Name</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiPhone className="w-4 h-4 text-blue-500" />
                    <span>Mobile Number *</span>
                  </label>
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="Enter mobile number"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiMapPin className="w-4 h-4 text-blue-500" />
                    <span>Address</span>
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>

                {/* *** NEW: Old Gold Weight (Grams) *** */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiLayers className="w-4 h-4 text-amber-600" />
                    <span>Old Gold WT(G)</span>
                  </label>
                  <input
                    type="number"
                    value={oldGoldWeight}
                    onChange={(e) =>
                      setOldGoldWeight(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Weight in grams"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300"
                    min="0"
                  />
                </div>

                {/* Advance / Old Gold Value */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiDollarSign className="w-4 h-4 text-green-500" />
                    <span>Advance / Old Gold (₹)</span>
                  </label>
                  <input
                    type="number"
                    value={advancePayment}
                    onChange={(e) =>
                      setAdvancePayment(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  />
                </div>

                {/* *** NEW: Discount Field *** */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiPercent className="w-4 h-4 text-purple-500" />
                    <span>Discount (₹)</span>
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Enter discount amount"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <Cart
            items={cartItems}
            advancePayment={advancePayment}
            // *** Pass new props to Cart for display calculations ***
            discount={discount}
            // ******************************************************
            onIncrease={handleIncreaseQuantity}
            onDecrease={handleDecreaseQuantity}
            onRemove={handleRemoveItem}
            onGenerateInvoice={handleGenerateInvoice}
            onUpdatePrice={handleUpdateCartPrice}
            onUpdateWeight={handleUpdateCartWeight}
            onUpdatePurity={handleUpdateCartPurity}
            onUpdateMakingCharge={handleUpdateCartMakingCharge}
          />
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Invoice Preview"
        maxWidth="max-w-2xl"
      >
        <InvoicePreview
          items={cartItems}
          customerName={customerName}
          customerAddress={customerAddress}
          customerMobile={customerMobile}
          advancePayment={advancePayment}
          // *** Pass NEW fields to InvoicePreview ***
          discount={discount}
          oldGoldWeight={oldGoldWeight}
          // ****************************************
          onClose={() => setIsInvoiceModalOpen(false)}
          onConfirm={handleConfirmSale}
          isSaving={isSaving}
        />
      </Modal>
    </div>
  );
};

export default PosPage;
