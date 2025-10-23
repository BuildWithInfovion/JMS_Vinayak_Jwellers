// frontend/src/components/pos/Cart.jsx
import React from "react";

// --- Add onUpdatePurity to props ---
const Cart = ({
  items,
  makingCharges,
  advancePayment,
  onIncrease,
  onDecrease,
  onRemove,
  onGenerateInvoice,
  onUpdatePrice,
  onUpdateWeight,
  onUpdatePurity,
}) => {
  // ... (calculation logic is unchanged) ...
  const itemsSubtotal = items.reduce((total, item) => {
    const itemPrice =
      (item.sellingWeight || 0) * (item.sellingPricePerGram || 0);
    return total + itemPrice * item.quantity;
  }, 0);
  const grandTotal = itemsSubtotal + (makingCharges || 0);
  const balanceDue = grandTotal - (advancePayment || 0);

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col h-full">
      <h4 className="text-lg font-semibold mb-4">Current Bill</h4>
      <div className="flex-grow overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Item
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Qty
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Weight (g)
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Purity (K)
              </th>{" "}
              {/* <-- New Column */}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Price/Gram
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                {/* --- Update colSpan --- */}
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  Cart is empty
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  {/* Item Name */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    {item.name}
                  </td>

                  {/* Quantity */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                    {/* ... (buttons unchanged) ... */}
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onDecrease(item._id)}
                        className="w-6 h-6 bg-gray-200 rounded-full"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => onIncrease(item._id)}
                        className="w-6 h-6 bg-gray-200 rounded-full"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* Weight (g) Input */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {/* ... (input unchanged) ... */}
                    <input
                      type="number"
                      step="0.01"
                      className="w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2"
                      value={item.sellingWeight}
                      onChange={(e) =>
                        onUpdateWeight(
                          item._id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>

                  {/* --- Purity (K) Input - NEW --- */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input
                      type="text" // Use text for "22K" or "92.5"
                      className="w-16 border border-gray-300 rounded-md shadow-sm py-1 px-2"
                      value={item.sellingPurity}
                      onChange={(e) => onUpdatePurity(item._id, e.target.value)}
                    />
                  </td>

                  {/* Price/Gram Input */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {/* ... (input unchanged) ... */}
                    <input
                      type="number"
                      step="0.01"
                      className="w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2"
                      value={item.sellingPricePerGram}
                      onChange={(e) =>
                        onUpdatePrice(item._id, parseFloat(e.target.value) || 0)
                      }
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {/* ... (button unchanged) ... */}
                    <button
                      onClick={() => onRemove(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Totals Section (unchanged) --- */}
      <div className="border-t mt-4 pt-4 space-y-2">
        {/* ... (all totals are unchanged) ... */}
        <div className="flex justify-between text-md">
          <span>Subtotal (Item Total)</span>
          <span>₹{itemsSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-md">
          <span>Making Charges (मजुरी)</span>
          <span>₹{(makingCharges || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-1">
          <span>Total (एकूण)</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-md">
          <span>Advance Paid (नगदी जमा)</span>
          <span className="text-green-600">
            - ₹{(advancePayment || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-xl text-blue-600 border-t pt-2">
          <span>Balance Due (बाकी येणे)</span>
          <span>₹{balanceDue.toFixed(2)}</span>
        </div>

        <button
          onClick={onGenerateInvoice}
          className="w-full bg-green-600 text-white mt-4 py-3 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400"
          disabled={items.length === 0}
        >
          Generate Invoice
        </button>
      </div>
    </div>
  );
};

export default Cart;
