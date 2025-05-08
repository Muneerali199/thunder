import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const tiers = [
  {
    name: 'Free',
    price: '0',
    tokens: '3 tokens/month',
    features: [
      'Basic AI Generation',
      'Standard Templates',
      'Community Support'
    ],
    bg: 'from-gray-800 to-gray-900',
    button: 'Current Plan'
  },
  {
    name: 'Pro',
    price: '29',
    tokens: 'Unlimited tokens',
    features: [
      'Advanced AI Models',
      'Premium Templates',
      'Priority Support',
      'Commercial License'
    ],
    bg: 'from-purple-600 to-pink-600',
    button: 'Upgrade to Pro'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    tokens: 'Unlimited+',
    features: [
      'Custom AI Models',
      'Dedicated Support',
      'Team Management',
      'SLA & Security'
    ],
    bg: 'from-cyan-600 to-blue-600',
    button: 'Contact Sales'
  }
];

export function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Pricing Plans
        </motion.h1>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              className={`bg-gradient-to-br ${tier.bg} p-8 rounded-3xl shadow-xl`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-gray-900/30 backdrop-blur-lg p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-2">{tier.name}</h2>
                <div className="text-4xl font-bold text-cyan-400 mb-4">
                  ${tier.price}<span className="text-lg">/month</span>
                </div>
                <p className="text-gray-300 mb-6">{tier.tokens}</p>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map(feature => (
                    <li key={feature} className="flex items-center text-gray-100">
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (tier.name === 'Pro') {
                      navigate('/checkout');
                    } else if (tier.name === 'Enterprise') {
                      window.location.href = 'mailto:sales@yourcompany.com';
                    }
                  }}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    tier.name === 'Free' 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-cyan-400 text-black hover:bg-cyan-300'
                  }`}
                >
                  {tier.button}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16 text-gray-400">
          <p>14-day money back guarantee • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}