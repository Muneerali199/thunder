'use client'

import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

const plans = {
  Free: {
    name: 'Free',
    price: 0,
    features: ['Basic usage for exploratory use', 'Public projects only', 'Community support'],
  },
  Pro: {
    name: 'Pro',
    price: 20,
    features: ['10 million tokens per month', 'Private projects', 'Standard support'],
  },
  'Pro 50': {
    name: 'Pro 50',
    price: 50,
    features: ['26 million tokens per month', '25M additional tokens', 'Priority support'],
  },
  'Pro 100': {
    name: 'Pro 100',
    price: 100,
    features: ['55 million tokens per month', '50M additional tokens', 'Priority support'],
  },
}

export default function Checkout() {
  const searchParams = useSearchParams()
  const planName = searchParams.get('plan') || 'Pro'
  const plan = plans[planName as keyof typeof plans]

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div 
        className="bg-gray-900/50 backdrop-blur-lg p-8 rounded-3xl max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">
          Checkout – {plan.name}
        </h2>
        
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Plan Features</h3>
            <ul className="text-gray-300 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>
          </div>
          
          <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-500 transition-all">
            Subscribe Now – ${plan.price}/month
          </button>
          
          <p className="text-gray-400 text-sm mt-4">
            Secure payment processing powered by Stripe
          </p>
        </div>
      </motion.div>
    </div>
  )
}
