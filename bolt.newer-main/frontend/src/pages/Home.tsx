import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const recommendations = [
    'Design a futuristic portfolio for my digital art',
    'Create an online store for sustainable fashion',
    'Build a tech blog with interactive demos',
    'Make a vibrant landing page for my app'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
      setPrompt('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-5"
        >
          <h1 className="text-5xl font-medium bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent leading-tight">
            Arcane Construct
          </h1>
          <p className="text-gray-500 text-lg">Describe your website idea</p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div onSubmit={handleSubmit} className="relative">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-4 left-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-2.5 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
            </button>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A modern SaaS website with animations and 3D assets"
              rows={4}
              className="w-full p-6 px-16 bg-gray-900 text-white rounded-xl border border-gray-800 resize-none placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
            />

            {/* Submit Button */}
            {prompt.trim() && (
              <button
                onClick={handleSubmit}
                className="absolute bottom-4 right-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-5 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
              >
                Generate →
              </button>
            )}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {recommendations.map((rec, index) => (
            <button
              key={index}
              onClick={() => setPrompt(rec)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-all duration-200"
            >
              {rec}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}