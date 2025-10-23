// frontend/src/pages/PosPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import ProductSelector from "../components/pos/ProductSelector";
import Cart from "../components/pos/Cart";
import Modal from "../components/common/Modal";
import InvoicePreview from "../components/pos/InvoicePreview";
import { getProducts, createSale } from "../services/api";

const PosPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerMobile, setCustomerMobile] = useState(""); // Mobile state
  // Making charges state removed
  const [advancePayment, setAdvancePayment] = useState(0);
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
      // Add item with makingChargePerGram state
      return [
        ...prevItems,
        {
          ...productToAdd,
          quantity: 1,
          sellingWeight: productToAdd.weight || 0,
          sellingPricePerGram: productToAdd.pricePerGram || 0,
          sellingPurity: productToAdd.purity || "",
          makingChargePerGram: 0, // Initialize making charge per gram
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

  // Handler for updating per-item making charge
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
      // Making charge per gram is optional, no check needed here
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

  const handleConfirmSale = async (saleData) => {
    setIsSaving(true);
    try {
      // Calculate totalMakingCharges from cartItems before sending
      const totalMakingCharges = cartItems.reduce((total, item) => {
        const itemMakingCharge =
          (item.sellingWeight || 0) * (item.makingChargePerGram || 0);
        return total + itemMakingCharge * item.quantity;
      }, 0);

      const salePayload = {
        ...saleData, // Contains subtotal, totalAmount, balanceDue
        customerName: customerName,
        customerAddress: customerAddress,
        customerMobile: customerMobile,
        // makingCharges: makingCharges, // Removed old single charge
        totalMakingCharges: totalMakingCharges, // Send calculated total
        advancePayment: advancePayment,
        items: cartItems.map((item) => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          sellingWeight: item.sellingWeight,
          sellingPricePerGram: item.sellingPricePerGram,
          sellingPurity: item.sellingPurity,
          makingChargePerGram: item.makingChargePerGram || 0, // Send per-item charge
        })),
      };
      await createSale(salePayload);
      alert("Sale confirmed successfully!");
      setCartItems([]);
      setCustomerName("");
      setCustomerAddress("");
      setCustomerMobile("");
      // setMakingCharges(0); // Removed old charge reset
      setAdvancePayment(0);
      setIsInvoiceModalOpen(false);
      fetchProductsForPOS();
      window.print();
    } catch (error) {
      console.error("Failed to create sale:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save sale.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full md:h-[calc(100vh-10rem)]">
        {/* Product Selector */}
        <div className="md:col-span-2 h-full">
          {isLoading ? (
            <p>Loading products...</p>
          ) : (
            <ProductSelector
              products={filteredProducts}
              onAddToCart={handleAddToCart}
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </div>

        {/* Billing Section */}
        <div className="md:col-span-3 h-full overflow-y-auto">
          {/* Customer & Charges Form */}
          <div className="bg-white shadow rounded-lg p-4 mb-4">
            <h4 className="text-lg font-semibold mb-4">Customer & Charges</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>
              <div>
                <label
                  htmlFor="customerMobile"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="customerMobile"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>
              <div>
                <label
                  htmlFor="customerAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>
              {/* Making Charges Input Removed */}
              <div className="md:col-start-2">
                {" "}
                {/* Align Advance under Mobile */}
                <label
                  htmlFor="advancePayment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Advance / Old Gold
                </label>
                <input
                  type="number"
                  id="advancePayment"
                  value={advancePayment}
                  onChange={(e) =>
                    setAdvancePayment(parseFloat(e.target.value) || 0)
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>
            </div>
          </div>

          <Cart
            items={cartItems}
            // makingCharges prop removed
            advancePayment={advancePayment}
            onIncrease={handleIncreaseQuantity}
            onDecrease={handleDecreaseQuantity}
            onRemove={handleRemoveItem}
            onGenerateInvoice={handleGenerateInvoice}
            onUpdatePrice={handleUpdateCartPrice}
            onUpdateWeight={handleUpdateCartWeight}
            onUpdatePurity={handleUpdateCartPurity}
            onUpdateMakingCharge={handleUpdateCartMakingCharge} // Pass new handler
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Invoice Preview"
        maxWidth="max-w-2xl"
      >
        <InvoicePreview
          items={cartItems} // Pass items array which contains per-item making charge
          customerName={customerName}
          customerAddress={customerAddress}
          customerMobile={customerMobile}
          // makingCharges prop removed
          advancePayment={advancePayment}
          onClose={() => setIsInvoiceModalOpen(false)}
          onConfirm={handleConfirmSale}
          isSaving={isSaving}
        />
      </Modal>
    </>
  );
};

export default PosPage;
