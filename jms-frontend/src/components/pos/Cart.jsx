// frontend/src/components/pos/Cart.jsx
import React from "react";

const Cart = ({
  items,
  advancePayment,
  onIncrease,
  onDecrease,
  onRemove,
  onGenerateInvoice,
  onUpdatePrice,
  onUpdateWeight,
  onUpdatePurity,
  onUpdateMakingCharge,
}) => {
  const itemsSubtotal = items.reduce((total, item) => {
    const itemPrice =
      (item.sellingWeight || 0) * (item.sellingPricePerGram || 0);
    return total + itemPrice * item.quantity;
  }, 0);

  const totalMakingCharges = items.reduce((total, item) => {
    const itemMakingCharge =
      (item.sellingWeight || 0) * (item.makingChargePerGram || 0);
    return total + itemMakingCharge * item.quantity;
  }, 0);

  const grandTotal = itemsSubtotal + totalMakingCharges; // Calculation includes MC
  const balanceDue = grandTotal - (advancePayment || 0);

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col h-full">
      <h4 className="text-lg font-semibold mb-4">Current Bill</h4>
      <div className="flex-grow overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {/* Table Headers (Including MC/g) */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Item
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Qty
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Wt(g)
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Purity
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Rate/g
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                MC/g
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Table Rows (Including MC/g input) */}
            {items.length === 0 ? (
              <tr>
                {" "}
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  Cart is empty
                </td>{" "}
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  {/* ... item details, quantity, weight, purity, rate/g ... */}
                  <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                    {item.name}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                    {" "}
                    <div className="flex items-center justify-center space-x-1">
                      {" "}
                      <button
                        onClick={() => onDecrease(item._id)}
                        className="w-5 h-5 bg-gray-200 rounded-full text-xs"
                      >
                        -
                      </button>{" "}
                      <span>{item.quantity}</span>{" "}
                      <button
                        onClick={() => onIncrease(item._id)}
                        className="w-5 h-5 bg-gray-200 rounded-full text-xs"
                      >
                        +
                      </button>{" "}
                    </div>{" "}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {" "}
                    <input
                      type="number"
                      step="0.01"
                      className="w-16 border border-gray-300 rounded px-1 py-0.5 text-sm"
                      value={item.sellingWeight}
                      onChange={(e) =>
                        onUpdateWeight(
                          item._id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />{" "}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {" "}
                    <input
                      type="text"
                      className="w-14 border border-gray-300 rounded px-1 py-0.5 text-sm"
                      value={item.sellingPurity}
                      onChange={(e) => onUpdatePurity(item._id, e.target.value)}
                    />{" "}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {" "}
                    <input
                      type="number"
                      step="0.01"
                      className="w-20 border border-gray-300 rounded px-1 py-0.5 text-sm"
                      value={item.sellingPricePerGram}
                      onChange={(e) =>
                        onUpdatePrice(item._id, parseFloat(e.target.value) || 0)
                      }
                    />{" "}
                  </td>
                  {/* MC/g Input */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.01"
                      className="w-16 border border-gray-300 rounded px-1 py-0.5 text-sm"
                      value={item.makingChargePerGram || 0}
                      onChange={(e) =>
                        onUpdateMakingCharge(
                          item._id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm">
                    {" "}
                    <button
                      onClick={() => onRemove(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>{" "}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Updated Totals Section --- */}
      <div className="border-t mt-4 pt-4 space-y-2">
        <div className="flex justify-between text-md">
          <span>Subtotal (Item Total)</span>
          <span>₹{itemsSubtotal.toFixed(2)}</span>
        </div>
        {/* Making Charges line is REMOVED from display */}
        {/*
        <div className="flex justify-between text-md">
          <span>Making Charges (मजुरी)</span>
          <span>₹{totalMakingCharges.toFixed(2)}</span>
        </div>
        */}
        <div className="flex justify-between font-bold text-lg border-t pt-1">
          {/* Grand Total STILL INCLUDES making charges */}
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
          {/* Balance Due STILL INCLUDES making charges */}
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
      {/* ----------------------------- */}
    </div>
  );
};

export default Cart;
