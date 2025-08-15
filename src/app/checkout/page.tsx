'use client'

import { motion } from 'framer-motion'

export default function Checkout() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div 
        className="bg-gray-900/50 backdrop-blur-lg p-8 rounded-3xl max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Upgrade to Pro</h2>
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Pro Plan Features</h3>
            <ul className="text-gray-300 space-y-2">
              <li>✓ Unlimited Generations</li>
              <li>✓ Premium Templates</li>
              <li>✓ Priority Support</li>
            </ul>
          </div>
          
          <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-500 transition-all">
            Subscribe Now - $29/month
          </button>
          
          <p className="text-gray-400 text-sm mt-4">
            Secure payment processing powered by Stripe
          </p>
        </div>
      </motion.div>
    </div>
  )
}