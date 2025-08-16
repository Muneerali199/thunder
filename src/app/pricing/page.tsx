'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PricingTier {
  name: string
  price: string
  tokens: string
  description: string
  features: string[]
  bg: string
  button: string
  perMember?: boolean
}

const individualMonthlyTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '0',
    tokens: '240K tokens',
    description: 'Start with a free account to speed up your workflow on public projects',
    features: [
      'Basic usage for exploratory use',
      'Public projects only',
      'Community support'
    ],
    bg: 'from-gray-800 to-gray-900',
    button: 'Current Plan'
  },
  {
    name: 'Pro',
    price: '20',
    tokens: '10M tokens',
    description: 'Ideal for hobbyists and casual users for light, exploratory use',
    features: [
      '10 million tokens per month',
      'Private projects',
      'Standard support'
    ],
    bg: 'from-purple-600 to-pink-600',
    button: 'Upgrade to Pro'
  },
  {
    name: 'Pro 50',
    price: '50',
    tokens: '26M tokens',
    description: 'Designed for professionals who need to use Bolt a few times per week',
    features: [
      '26 million tokens per month',
      '25M additional tokens',
      'Priority support'
    ],
    bg: 'from-blue-600 to-cyan-500',
    button: 'Upgrade to Pro 50'
  },
  {
    name: 'Pro 100',
    price: '100',
    tokens: '55M tokens',
    description: 'Perfect for heavy users looking to enhance daily workflows',
    features: [
      '55 million tokens per month',
      '50M additional tokens',
      'Priority support'
    ],
    bg: 'from-green-600 to-emerald-500',
    button: 'Upgrade to Pro 100'
  }
]

export default function Pricing() {
  const router = useRouter()
  const [showTeams, setShowTeams] = useState(false)
  const [billingCycle, setBillingCycle] = useState('annual')

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          className="text-5xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Pricing Plans
        </motion.h1>

        <motion.p 
          className="text-xl text-center text-gray-300 mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Start with a free account to speed up your workflow on public projects or boost your entire team with instantly-opening production environments.
        </motion.p>

        <div className="grid gap-6 mb-20 md:grid-cols-2 lg:grid-cols-4">
          {individualMonthlyTiers.map((tier, index) => (
            <motion.div
              key={`${tier.name}-${index}`}
              className={`bg-gradient-to-br ${tier.bg} p-0.5 rounded-2xl shadow-xl`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-gray-900/90 backdrop-blur-lg p-6 rounded-2xl h-full flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-2">{tier.name}</h2>
                <p className="text-gray-300 text-sm mb-4">{tier.description}</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white">
                    ${tier.price}<span className="text-lg">/month</span>
                  </div>
                  <div className="text-gray-300">{tier.tokens}</div>
                </div>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-100">
                      <svg className="w-5 h-5 mr-2 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (tier.name !== 'Free') {
                      router.push(`/checkout?plan=${tier.name}`)
                    }
                  }}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    tier.name === 'Free' 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {tier.button}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}