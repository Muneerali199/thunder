'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useUser } from './AuthProvider'
import { useAuth } from '@/lib/auth'

export function UserButton() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-gray-300 text-sm hidden sm:block">
          {user.email?.split('@')[0]}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-48 bg-gray-900/90 backdrop-blur-2xl border border-gray-600 rounded-lg shadow-xl z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-3 border-b border-gray-700">
              <p className="text-sm text-gray-300">{user.email}</p>
            </div>
            <div className="p-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg px-3 py-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg px-3 py-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}