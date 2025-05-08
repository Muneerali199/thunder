import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/clerk-react';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recommendations = [
    'Design a futuristic portfolio for my digital art',
    'Create an online store for sustainable fashion',
    'Build a tech blog with interactive demos',
    'Make a vibrant landing page for my app'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
      setPrompt('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-10 relative overflow-hidden font-sans">
      {/* Navbar */}
      <nav className="w-full max-w-4xl mb-10 relative z-20">
        <div className="flex justify-end items-center gap-6">
          <SignedOut>
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-medium px-4 py-2"
              >
                Sign In
              </motion.button>
            </SignInButton>
            <SignUpButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-medium px-4 py-2"
              >
                Sign Up
              </motion.button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <motion.div whileHover={{ scale: 1.05 }}>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9",
                    userButtonPopoverCard: "bg-gray-900 border border-gray-700/30",
                    userPreviewMainIdentifier: "text-cyan-400",
                    userButtonPopoverActionButtonText: "text-gray-100 hover:text-cyan-400"
                  }
                }}
              />
            </motion.div>
          </SignedIn>
        </div>
      </nav>

      {/* Aurora Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20 animate-aurora-bg opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-700/10 via-purple-700/10 to-pink-700/10 animate-aurora-bg-delayed opacity-50" />
      </div>

      {/* Particle System */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-particles absolute w-2 h-2 bg-cyan-400/60 rounded-full" style={{ top: '15%', left: '25%' }} />
        <div className="animate-particles-delayed absolute w-3 h-3 bg-purple-400/60 rounded-full" style={{ top: '65%', left: '75%' }} />
        <div className="animate-particles absolute w-1.5 h-1.5 bg-pink-400/60 rounded-full" style={{ top: '35%', left: '55%' }} />
        <div className="animate-particles-delayed absolute w-2.5 h-2.5 bg-cyan-400/60 rounded-full" style={{ top: '85%', left: '35%' }} />
        <div className="animate-particles absolute w-2 h-2 bg-purple-400/60 rounded-full" style={{ top: '25%', left: '85%' }} />
      </div>

      <div className="max-w-4xl w-full space-y-14 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center space-y-7"
        >
          <motion.h1
            className="text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tighter"
            animate={{ backgroundPosition: '200%' }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            style={{ backgroundSize: '200%' }}
          >
            Arcane Construct
          </motion.h1>
          <motion.p
            className="text-gray-100 text-xl font-light max-w-xl mx-auto tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Ignite your vision and craft stunning websites with a spark of brilliance.
          </motion.p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <div className="relative">
            <div className="bg-gray-900/15 backdrop-blur-2xl border border-gray-700/30 rounded-3xl p-4 shadow-2xl shadow-cyan-500/15">
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 25px rgba(34, 211, 238, 0.7)' }}
                whileTap={{ scale: 0.85 }}
                className="absolute bottom-5 left-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg shadow-cyan-500/60 hover:shadow-cyan-500/80 transition-all duration-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".jpg,.png,.pdf,.doc,.md"
                />
              </motion.button>

              <motion.textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A modern SaaS website with animations and 3D assets"
                rows={6}
                className="w-full p-6 px-16 bg-transparent text-white rounded-xl border-none placeholder-gray-200/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/70 transition-all duration-500 text-lg resize-none"
                whileFocus={{ scale: 1.03, boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
              />

              {prompt.trim() && (
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(34, 211, 238, 0.7)' }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-8 right-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg px-8 py-3 text-sm font-semibold shadow-lg shadow-purple-500/60 hover:shadow-purple-500/80 transition-all duration-500 animate-pulse-glow"
                >
                  Generate →
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="flex flex-wrap gap-5 justify-center"
        >
          {recommendations.map((rec, index) => (
            <motion.button
              key={index}
              onClick={() => setPrompt(rec)}
              whileHover={{ scale: 1.15, y: -5, boxShadow: '0 0 20px rgba(192, 38, 211, 0.5)' }}
              whileTap={{ scale: 0.9 }}
              className="bg-gray-900/20 backdrop-blur-lg hover:bg-gray-800/40 border border-gray-600/30 text-gray-50 hover:text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-purple-500/40"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * index + 0.7, duration: 0.6 }}
            >
              {rec}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes aurora {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-aurora-bg {
            background-size: 200% 200%;
            animation: aurora 10s ease infinite;
          }
          .animate-aurora-bg-delayed {
            background-size: 200% 200%;
            animation: aurora 14s ease infinite 2s;
          }

          @keyframes particles {
            0% { transform: translateY(0) scale(1); opacity: 0.7; }
            50% { transform: translateY(-30px) scale(1.3); opacity: 0.3; }
            100% { transform: translateY(0) scale(1); opacity: 0.7; }
          }
          .animate-particles {
            animation: particles 7s ease-in-out infinite;
          }
          .animate-particles-delayed {
            animation: particles 7s ease-in-out infinite 3s;
          }

          @keyframes pulse-glow {
            0% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
            50% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.7); }
            100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}