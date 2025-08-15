'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { StepsList } from '@/components/StepsList'
import { FileExplorer } from '@/components/FileExplorer'
import { TabView } from '@/components/TabView'
import { CodeEditor } from '@/components/CodeEditor'
import { PreviewFrame } from '@/components/PreviewFrame'
import { Terminal } from '@/components/terminal'
import { Step, FileItem, StepType } from '@/types'
import axios from 'axios'
import { parseXml } from '@/lib/steps'
import { useWebContainer } from '@/hooks/useWebContainer'
import { Loader } from '@/components/Loader'
import { Lightning } from '@/components/lightning'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Octokit } from '@octokit/core'
import CryptoJS from 'crypto-js'
import { useMediaQuery } from 'react-responsive'
import { useUser } from '@/components/AuthProvider'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

function BuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt')
  const { user } = useUser()
  
  const [userPrompt, setPrompt] = useState<string>("")
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [templateSet, setTemplateSet] = useState<boolean>(false)
  const { webcontainer, isLoading: isWebContainerLoading, error: webContainerError, retryCount, maxRetries } = useWebContainer()
  const [githubToken, setGithubToken] = useState<string | null>(null)
  const [githubUser, setGithubUser] = useState<string | null>(null)
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [activeSection, setActiveSection] = useState<'steps' | 'files' | 'editor' | 'terminal'>('steps')
  const [isDependenciesInstalled, setIsDependenciesInstalled] = useState<boolean>(false)
  const isMobile = useMediaQuery({ maxWidth: 640 })

  useEffect(() => {
    if (!prompt) {
      router.push('/')
      return
    }
    if (!user) {
      router.push('/')
      return
    }
  }, [prompt, user, router])

  // Rest of the component logic remains the same as the original Builder component
  // but with updated authentication checks using Supabase user instead of Clerk

  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const verifier = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return verifier
  }

  const generateCodeChallenge = (verifier: string): string => {
    const hashed = CryptoJS.SHA256(verifier)
    const base64 = CryptoJS.enc.Base64.stringify(hashed)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  const handleGithubLogin = () => {
    const verifier = generateCodeVerifier()
    const challenge = generateCodeChallenge(verifier)
    setCodeVerifier(verifier)

    const clientId = 'Ov23lihKpcUrawEIsn9B'
    const redirectUri = `${window.location.origin}/builder`
    const scope = 'repo'
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&code_challenge=${challenge}&code_challenge_method=S256`
    window.location.href = githubAuthUrl
  }

  // Continue with the rest of the component implementation...
  // This is a simplified version - you'll need to copy over all the other methods
  // from the original Builder component

  if (!prompt || !user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col relative overflow-hidden font-sans">
      {!isMobile && <Lightning hue={230} intensity={1.2} speed={0.8} size={1.5} />}
      
      {/* Header */}
      <motion.header
        className="bg-gray-900/80 backdrop-blur-2xl border-b border-blue-500/40 px-4 sm:px-6 py-4 relative z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="text-center sm:text-left">
            <motion.h1
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Thunder
            </motion.h1>
            <motion.p
              className="text-xs sm:text-sm text-blue-200 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Crafting: <span className="text-blue-400">{prompt}</span>
            </motion.p>
          </div>
        </div>
      </motion.header>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden relative z-10 p-6">
        <div className="text-center text-blue-200">
          <p>Builder interface will be implemented here...</p>
          <p>Working on: {prompt}</p>
        </div>
      </div>
    </div>
  )
}

export default function Builder() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <BuilderContent />
    </Suspense>
  )
}