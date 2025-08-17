import React from "react";

const Checkout: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-6">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>

        {/* Order Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
          <div className="flex justify-between text-neutral-300 mb-2">
            <span>Pro Plan</span>
            <span>$12</span>
          </div>
          <div className="flex justify-between text-neutral-300 mb-2">
            <span>Taxes</span>
            <span>$0</span>
          </div>
          <div className="flex justify-between font-bold text-white text-lg">
            <span>Total</span>
            <span>$12</span>
          </div>
        </div>

        {/* Payment Form */}
        <form className="space-y-4">
          <div>
            <label className="block text-neutral-300 text-sm mb-1">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 text-sm mb-1">
                Expiry
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 text-sm mb-1">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-500 transition"
          >
            Pay $12
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
