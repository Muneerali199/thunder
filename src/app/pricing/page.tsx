import React from "react";

const Pricing: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-5xl font-bold text-center mb-12">Pricing</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Free</h2>
            <p className="text-4xl font-bold mb-6">$0</p>
            <ul className="space-y-3 text-neutral-300 flex-1">
              <li>✔ Basic features</li>
              <li>✔ Limited AI credits</li>
              <li>✔ Community support</li>
            </ul>
            <button className="mt-6 bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-neutral-200 transition">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Pro</h2>
            <p className="text-4xl font-bold mb-6">$12</p>
            <ul className="space-y-3 text-neutral-300 flex-1">
              <li>✔ All Free features</li>
              <li>✔ Unlimited AI credits</li>
              <li>✔ Priority support</li>
            </ul>
            <button className="mt-6 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-500 transition">
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
