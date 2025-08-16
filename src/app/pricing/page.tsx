'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PricingTier {
  name: string
  monthlyPrice: number     
  annualPrice: number 
  tokens: string
  description: string
  features: string[]
  bg: string
  button: string
  perMember?: boolean
}

const individualTiers: PricingTier[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
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
    monthlyPrice: 20,
    annualPrice: 200,,
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
    monthlyPrice: 50,
    annualPrice: 500,
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
    monthlyPrice: 100,
    annualPrice: 1000,
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

const teamTiers: PricingTier[] = [
  {
    name: 'Team Starter',
    monthlyPrice: 150,
    annualPrice: 1500,
    tokens: '200M tokens',
    description: 'For small teams looking to collaborate',
    features: [
      'Up to 10 members',
      'Shared environments',
      'Team analytics',
      'Standard support'
    ],
    bg: 'from-yellow-600 to-orange-500',
    button: 'Upgrade Team',
    perMember: true
  },
  {
    name: 'Team Pro',
    monthlyPrice: 400,
    annualPrice: 4000,
    tokens: '1B tokens',
    description: 'For larger teams with advanced needs',
    features: [
      'Unlimited members',
      'Advanced analytics',
      'SSO Integration',
      'Priority support'
    ],
    bg: 'from-red-600 to-pink-600',
    button: 'Upgrade Team Pro',
    perMember: true
  }
]

export default function Pricing() {
  const router = useRouter()
  const [showTeams, setShowTeams] = useState(false)
  const isAuthenticated = false
  const currentPlan = 'Free'

  const tiers = showTeams ? teamTiers : individualTiers


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

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center items-center gap-4 mb-10">
          <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
          <motion.div 
            className="relative w-14 h-7 bg-gray-700 rounded-full cursor-pointer"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            initial={false}
            animate={{ backgroundColor: billingCycle === 'annual' ? '#4ade80' : '#374151' }}
          >
            <motion.div 
              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ x: billingCycle === 'annual' ? 28 : 2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          </motion.div>
          <span className={`text-lg ${billingCycle === 'annual' ? 'text-white' : 'text-gray-500'}`}>Annual</span>
        </div>

        {/* Toggle between Individual and Teams */}
        <div className="flex justify-center gap-6 mb-12">
          <button 
            className={`px-4 py-2 rounded-lg ${!showTeams ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setShowTeams(false)}
          >
            Individual
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${showTeams ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setShowTeams(true)}
          >
            Teams
          </button>
        </div>    
        
        <div className="grid gap-6 mb-20 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, index) => (
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
                    ${billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice}
                    <span className="text-lg">/{billingCycle}</span>
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
                    if (!isAuthenticated) {
                      router.push('/login')
                    }else if (currentPlan === 'Free' && tier.name !== 'Free') {
                      router.push('/checkout')
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
