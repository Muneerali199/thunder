import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';

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
  const [billingCycle, setBillingCycle] = useState("annual");
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCurrentTiers = (): PricingTier[] => {
    if (showTeams) {
      return billingCycle === "annual" ? teamAnnualTiers : teamMonthlyTiers;
    }
    return billingCycle === "annual"
      ? individualAnnualTiers
      : individualMonthlyTiers;
  };

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 🔹 Your ORIGINAL pricing page UI goes here */}
        <h1 className="text-4xl font-bold text-white text-center">
          Pricing Plans
        </h1>

        {/* Example toggle + pricing cards rendering */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded ${
              billingCycle === "monthly"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded ${
              billingCycle === "annual"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Annual Billing
          </button>
        </div>

        {/* 🔹 Render pricing tiers */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getCurrentTiers().map((tier, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl bg-gradient-to-r ${tier.bg} text-white shadow-lg`}
            >
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <p className="text-3xl font-semibold mt-2">
                ${tier.price}
                <span className="text-base font-normal">/month</span>
              </p>
              <p className="text-sm text-gray-200">{tier.tokens}</p>
              <p className="mt-2">{tier.description}</p>
              <ul className="mt-4 space-y-1 text-sm">
                {tier.features.map((f, i) => (
                  <li key={i}>✅ {f}</li>
                ))}
              </ul>
              <button className="mt-6 w-full py-2 bg-white text-black rounded-lg font-semibold">
                {tier.button}
              </button>
            </div>
          ))}
        </div>

        {/* 🔹 FAQs Section */}
        <div className="mt-16 text-white">
          <h2 className="text-2xl font-bold text-center">FAQs</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-sm text-gray-300 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🔹 Back to Top Button */}
        {showButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 px-4 py-2 bg-blue-600 text-white rounded shadow-lg text-3xl"
          >
            ↑ 
          </button>
        )}
      </div>
    </div>
  );
}
