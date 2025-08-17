import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface PricingTier {
  name: string;
  price: string;
  tokens: string;
  description: string;
  features: string[];
  bg: string;
  button: string;
  perMember?: boolean;
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
];

const individualAnnualTiers: PricingTier[] = [
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
    price: '18',
    tokens: '10M tokens',
    description: 'Ideal for hobbyists and casual users for light, exploratory use',
    features: [
      '10 million tokens per month',
      'Private projects',
      'Standard support',
      'Save 10% with annual billing'
    ],
    bg: 'from-purple-600 to-pink-600',
    button: 'Upgrade to Pro'
  },
  {
    name: 'Pro 50',
    price: '45',
    tokens: '26M tokens',
    description: 'Designed for professionals who need to use Bolt a few times per week',
    features: [
      '26 million tokens per month',
      '25M additional tokens',
      'Priority support',
      'Save 10% with annual billing'
    ],
    bg: 'from-blue-600 to-cyan-500',
    button: 'Upgrade to Pro 50'
  },
  {
    name: 'Pro 100',
    price: '90',
    tokens: '55M tokens',
    description: 'Perfect for heavy users looking to enhance daily workflows',
    features: [
      '55 million tokens per month',
      '50M additional tokens',
      'Priority support',
      'Save 10% with annual billing'
    ],
    bg: 'from-green-600 to-emerald-500',
    button: 'Upgrade to Pro 100'
  },
  {
    name: 'Pro 200',
    price: '180',
    tokens: '120M tokens',
    description: 'Best for power users relying on Bolt as a core tool for continuous use',
    features: [
      '120 million tokens per month',
      '100M additional tokens',
      'Premium support',
      'Save 10% with annual billing'
    ],
    bg: 'from-orange-600 to-red-500',
    button: 'Upgrade to Pro 200'
  }
];

const teamMonthlyTiers: PricingTier[] = [
  {
    name: 'Teams 60',
    price: '60',
    tokens: '26M tokens',
    perMember: true,
    description: 'Designed for teams needing to use Bolt a few times per week',
    features: [
      '26 million tokens per member',
      '25M additional tokens',
      'Team management dashboard',
      'Priority support'
    ],
    bg: 'from-blue-600 to-indigo-600',
    button: 'Upgrade to Teams 60'
  },
  {
    name: 'Teams 110',
    price: '110',
    tokens: '55M tokens',
    perMember: true,
    description: 'Perfect for teams seeking to enhance daily workflows',
    features: [
      '55 million tokens per member',
      '50M additional tokens',
      'Team management dashboard',
      'Priority support'
    ],
    bg: 'from-purple-600 to-pink-600',
    button: 'Upgrade to Teams 110'
  },
  {
    name: 'Teams 210',
    price: '210',
    tokens: '120M tokens',
    perMember: true,
    description: 'Best for teams relying on Bolt as a core tool for continuous use',
    features: [
      '120 million tokens per member',
      '100M additional tokens',
      'Advanced team controls',
      'Premium support'
    ],
    bg: 'from-cyan-600 to-blue-600',
    button: 'Upgrade to Teams 210'
  }
];

const teamAnnualTiers: PricingTier[] = [
  {
    name: 'Teams 60',
    price: '54',
    tokens: '26M tokens',
    perMember: true,
    description: 'Designed for teams needing to use Bolt a few times per week',
    features: [
      '26 million tokens per member',
      '25M additional tokens',
      'Team management dashboard',
      'Priority support',
      'Save 10% with annual billing'
    ],
    bg: 'from-blue-600 to-indigo-600',
    button: 'Upgrade to Teams 60'
  },
  {
    name: 'Teams 110',
    price: '99',
    tokens: '55M tokens',
    perMember: true,
    description: 'Perfect for teams seeking to enhance daily workflows',
    features: [
      '55 million tokens per member',
      '50M additional tokens',
      'Team management dashboard',
      'Priority support',
      'Save 10% with annual billing'
    ],
    bg: 'from-purple-600 to-pink-600',
    button: 'Upgrade to Teams 110'
  },
  {
    name: 'Teams 210',
    price: '189',
    tokens: '120M tokens',
    perMember: true,
    description: 'Best for teams relying on Bolt as a core tool for continuous use',
    features: [
      '120 million tokens per member',
      '100M additional tokens',
      'Advanced team controls',
      'Premium support',
      'Save 10% with annual billing'
    ],
    bg: 'from-cyan-600 to-blue-600',
    button: 'Upgrade to Teams 210'
  }
];

const faqs = [
  {
    question: 'What are tokens?',
    answer: 'Tokens are the unit of measurement for usage in our platform.'
  },
  {
    question: 'How do Teams plans work?',
    answer: 'Team plans allow multiple users to share a pool of tokens with centralized billing and management.'
  },
  {
    question: 'Do tokens rollover from month to month?',
    answer: 'Unused tokens expire at the end of each billing cycle.'
  },
  {
    question: 'How do token reloads work?',
    answer: 'You can purchase additional tokens if you run out.'
  },
  {
    question: 'Can I change my plan later?',
    answer: 'Yes, you can upgrade or downgrade at any time.'
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel anytime with no penalty.'
  },
  {
    question: 'What are the token limits associated with a free plan?',
    answer: 'Free plan includes 240K tokens per month for individual use only.'
  }
];

export function Pricing() {
  const navigate = useNavigate();
  const [showTeams, setShowTeams] = useState(false);
  const [billingCycle, setBillingCycle] = useState('annual');

  const getCurrentTiers = (): PricingTier[] => {
    if (showTeams) {
      return billingCycle === 'annual' ? teamAnnualTiers : teamMonthlyTiers;
    }
    return billingCycle === 'annual' ? individualAnnualTiers : individualMonthlyTiers;
  };

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

        {!showTeams ? (
          <div className="mb-8 text-center">
            <div className="inline-block bg-gray-800/50 px-6 py-3 rounded-full">
              <p className="text-gray-300">
                <span className="font-bold text-cyan-400">240K tokens</span> left in your free plan. 
                <span className="ml-2">Need more tokens?</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8 text-center">
            <div className="inline-block bg-gray-800/50 px-6 py-3 rounded-full">
              <p className="text-gray-300">
                <span className="font-bold text-amber-400">No tokens available.</span>
                <span className="ml-2">Using Bolt with a team requires a subscription.</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setShowTeams(false)}
              className={`px-6 py-2 rounded-l-full font-medium ${!showTeams ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              Pro
            </button>
            <button
              onClick={() => setShowTeams(true)}
              className={`px-6 py-2 rounded-r-full font-medium ${showTeams ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              Teams
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-full p-1">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full ${billingCycle === 'monthly' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            >
              Monthly billing
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-full ${billingCycle === 'annual' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            >
              Annual billing
            </button>
          </div>
        </div>

        {showTeams && (
          <div className="max-w-md mx-auto bg-gray-900 rounded-xl p-4 mb-8">
            <label htmlFor="team-select" className="block text-sm font-medium text-gray-300 mb-2">Current team:</label>
            <select 
              id="team-select"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option>New team (select plan)</option>
            </select>
          </div>
        )}

        <div className={`grid gap-6 mb-20 ${showTeams ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          {getCurrentTiers().map((tier, index) => (
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
                    ${tier.price}{tier.perMember && <span className="text-lg"> / member</span>}<span className="text-lg">/month</span>
                  </div>
                  <div className="text-gray-300">{tier.tokens}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {billingCycle === 'annual' ? 'Billed yearly' : 'Billed monthly'}
                  </div>
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
      const planId = tier.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/checkout/${billingCycle}/${planId}`, {
        state: { showTeams, billingCycle }, // store state for going back
      });
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

        <div className="text-center mb-20">
          <h3 className="text-2xl font-bold text-white mb-6">Looking for Enterprise plans?</h3>
          <button className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800/50 transition">
            Contact us for a quote
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Frequently asked questions</h3>
          <p className="text-gray-400 text-center mb-12">Everything you need to know about the product and billing.</p>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="border-b border-gray-800 pb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="text-lg font-medium text-white mb-2">{faq.question}</h4>
                <p className="text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12 text-gray-400">
            <p>For additional information, please visit our <a href="https://thunder-docs.vercel.app/" className="text-cyan-400 hover:underline">Help Center</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}