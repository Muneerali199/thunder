import { useParams, useNavigate, useLocation } from "react-router-dom";

const planDetails: Record<string, any> = {
  "pro": { name: "Pro", price: { monthly: 20, annual: 18 }, tokens: "10M tokens" },
  "pro-50": { name: "Pro 50", price: { monthly: 50, annual: 45 }, tokens: "26M tokens" },
  "pro-100": { name: "Pro 100", price: { monthly: 100, annual: 90 }, tokens: "55M tokens" },
  "pro-200": { name: "Pro 200", price: { monthly: 200, annual: 180 }, tokens: "120M tokens" },
  "teams-60": { name: "Teams 60", price: { monthly: 60, annual: 54 }, tokens: "26M tokens / member" },
  "teams-110": { name: "Teams 110", price: { monthly: 110, annual: 99 }, tokens: "55M tokens / member" },
  "teams-210": { name: "Teams 210", price: { monthly: 210, annual: 189 }, tokens: "120M tokens / member" },
};

export default function Checkout() {
  const { billing, planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const plan = planDetails[planId || ""];

  if (!plan || (billing !== "monthly" && billing !== "annual")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Invalid plan selected.</h1>
          <button
            onClick={() => navigate("/pricing")}
            className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  const price = plan.price[billing];

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6">
          Checkout – {plan.name} ({billing})
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-300 text-lg mb-1">
            Price: <span className="font-bold">${price}/month</span>
          </p>
          <p className="text-gray-300">Tokens: {plan.tokens}</p>
        </div>

        {/* Mock Checkout Form */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Card Details</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition"
          >
            Pay ${price}
          </button>
        </form>

        {/* Back button remembers where you left */}
        <button
          onClick={() =>
            navigate("/pricing", { state: location.state })
          }
          className="w-full mt-4 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition"
        >
          Back to Pricing
        </button>
      </div>
    </div>
  );
}
