
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { Home as HomeIcon, File, Settings, LayoutDashboard, Plus, History, DollarSign, Eye } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
import { Lightning } from '../components/lightning';

// SVG Logo Component with Lightning Colors
const ThunderLogoSVG = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14h9l-1 8l10-12h-9l1-8z" fill="url(#grad)" />
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#C026D3', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);

type UserMetadata = {
  tier: 'free' | 'pro' | 'enterprise';
  remainingTokens: number;
};

type Project = {
  id: string;
  prompt: string;
  createdAt: string;
};

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [usage, setUsage] = useState<UserMetadata>({ 
    tier: 'free', 
    remainingTokens: 3 
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const isMobile = useMediaQuery({ maxWidth: 640 });

  const loadProjects = () => {
    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        console.log('Loaded projects from localStorage:', parsedProjects);
        setProjects(parsedProjects);
      } else {
        console.log('No projects found in localStorage');
      }
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
    }
  };

  useEffect(() => {
    const loadUsage = async () => {
      if (isSignedIn && user) {
        const metadata = user.unsafeMetadata as UserMetadata;
        setUsage({
          tier: metadata.tier || 'free',
          remainingTokens: metadata.remainingTokens || 3
        });
      } else {
        const localUsage = localStorage.getItem('usage');
        if (localUsage) {
          setUsage(JSON.parse(localUsage));
        }
      }
    };

    loadUsage();
    loadProjects();

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'projects') {
        loadProjects();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isSignedIn, user]);

  const recommendations = [
    'Design a futuristic portfolio for my digital art',
    'Create an online store for sustainable fashion',
    'Build a tech blog with interactive demos',
    'Make a vibrant landing page for my app'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      alert('Please sign in to submit prompts');
      return;
    }

    if (usage.remainingTokens <= 0 && usage.tier === 'free') {
      alert('You\'ve reached your free limit. Please upgrade to continue.');
      navigate('/pricing');
      return;
    }

    if (prompt.trim()) {
      const newUsage = {
        ...usage,
        remainingTokens: usage.remainingTokens - 1
      };

      const newProject: Project = {
        id: crypto.randomUUID(),
        prompt,
        createdAt: new Date().toISOString()
      };

      const updatedProjects = [newProject, ...projects];
      try {
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        console.log('Saved project to localStorage:', newProject);
        setProjects(updatedProjects);
      } catch (error) {
        console.error('Error saving project to localStorage:', error);
        alert('Failed to save project history. Please try again.');
        return;
      }

      setUsage(newUsage);
      
      if (user) {
        try {
          await user.update({ unsafeMetadata: newUsage });
        } catch (error) {
          console.error('Error updating user metadata:', error);
        }
      } else {
        localStorage.setItem('usage', JSON.stringify(newUsage));
      }

      navigate('/builder', { state: { prompt } });
      setPrompt('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log('Uploaded file:', file);
  };

  const viewProject = (projectPrompt: string) => {
    navigate('/builder', { state: { prompt: projectPrompt } });
  };

  return (
    <div className={`min-h-screen bg-[#0F172A] flex flex-col items-center justify-start p-4 sm:p-10 relative overflow-hidden font-sans transition-all duration-300 ${
      isSignedIn ? 'sm:ml-16' : ''
    }`}>
      {/* Lightning Background (Disabled on Mobile) */}
      {!isMobile && <Lightning hue={230} intensity={1.2} speed={0.8} size={1.5} />}

      {/* Sidebar (Desktop) */}
      <SignedIn>
        <motion.div
          className={`hidden sm:flex fixed left-0 top-0 h-screen bg-gray-900/80 backdrop-blur-2xl border-r border-blue-500/40 z-50 ${
            isSidebarExpanded ? 'w-64' : 'w-16'
          } transition-all duration-300`}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          <div className="flex flex-col p-4 space-y-2 h-full">
            {/* Logo */}
            <div className="flex items-center mb-6 p-2">
              <ThunderLogoSVG />
              {isSidebarExpanded && (
                <span className="text-blue-400 text-lg font-bold ml-2">Thunder</span>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-2">
              <motion.button 
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <HomeIcon className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Home</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Dashboard</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/projects')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <File className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Projects</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/history')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <History className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">History</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/pricing')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <DollarSign className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Pricing</span>}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full mt-4 bg-blue-500/30 hover:bg-blue-500/40 text-blue-400 p-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                onClick={() => navigate('/')}
              >
                <Plus className="h-5 w-5" />
                {isSidebarExpanded && <span className="text-sm">New Project</span>}
              </motion.button>

              {/* Last Project */}
              {projects.length > 0 && (
                <motion.button
                  onClick={() => viewProject(projects[0].prompt)}
                  whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                  className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
                >
                  <Eye className="h-5 w-5 flex-shrink-0" />
                  {isSidebarExpanded && (
                    <span className="text-sm truncate">
                      Last: {projects[0].prompt.substring(0, 20)}{projects[0].prompt.length > 20 ? '...' : ''}
                    </span>
                  )}
                </motion.button>
              )}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-2">
              <motion.div
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-5 h-5",
                      userButtonPopoverCard: "bg-gray-900/80 border border-blue-500/40 backdrop-blur-2xl",
                      userPreviewMainIdentifier: "text-blue-400",
                      userButtonPopoverActionButtonText: "text-blue-200 hover:text-blue-400"
                    }
                  }}
                />
                {isSidebarExpanded && <span className="text-sm">Profile</span>}
              </motion.div>

              <motion.button
                onClick={() => navigate('/settings')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Settings</span>}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Mobile Bottom Navigation */}
        <motion.div
          className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-2xl border-t border-blue-500/40 z-50 flex justify-around items-center py-2"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </motion.button>
          <motion.button
            onClick={() => navigate('/projects')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
          >
            <File className="h-6 w-6" />
            <span className="text-xs">Projects</span>
          </motion.button>
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs">New</span>
          </motion.button>
          <motion.button
            onClick={() => navigate('/settings')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs">Settings</span>
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
          >
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-6 h-6",
                  userButtonPopoverCard: "bg-gray-900/80 border border-blue-500/40 backdrop-blur-2xl",
                  userPreviewMainIdentifier: "text-blue-400",
                  userButtonPopoverActionButtonText: "text-blue-200 hover:text-blue-400"
                }
              }}
            />
            <span className="text-xs">Profile</span>
          </motion.div>
        </motion.div>
      </SignedIn>

      {/* Usage Indicator */}
      <SignedIn>
        <div className="absolute top-4 right-4 z-50">
          <motion.div 
            className="bg-gray-900/80 backdrop-blur-2xl px-4 py-2 rounded-full text-sm border border-blue-500/40"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {usage.tier === 'free' ? (
              <span className="text-blue-400">
                Free Tokens: {usage.remainingTokens}/3
              </span>
            ) : (
              <span className="text-purple-400">
                ⚡ Premium Access (Unlimited)
              </span>
            )}
          </motion.div>
        </div>
      </SignedIn>

      {/* Navbar (Signed Out) */}
      <SignedOut>
        <nav className="w-full max-w-4xl mb-6 sm:mb-10 relative z-20">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <ThunderLogoSVG />
              <span className="text-blue-400 text-lg font-bold ml-2">Thunder</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <motion.button 
                onClick={() => navigate('/pricing')}
                className="text-blue-200 hover:text-blue-400 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Pricing
              </motion.button>
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-blue-200 hover:text-blue-400 font-medium px-4 py-2 transition-colors duration-200"
                >
                  Sign In
                </motion.button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-full transition-all duration-200 shadow-lg shadow-blue-500/40 hover:shadow-purple-600/50"
                >
                  Sign Up
                </motion.button>
              </SignUpButton>
            </div>
          </div>
        </nav>
      </SignedOut>

      {/* Content Section */}
      <div className="max-w-4xl w-full space-y-14 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center space-y-7"
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight tracking-tighter"
            animate={{ backgroundPosition: '200%' }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            style={{ backgroundSize: '200%' }}
          >
            What do you want to build?
          </motion.h1>
          <motion.p
            className="text-blue-200 text-base sm:text-lg md:text-xl font-light max-w-xl mx-auto tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Prompt, run, edit, and deploy full-stack web and mobile apps with Thunder.
          </motion.p>
        </motion.div>

        {/* Input Section */}
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <div className="relative">
              <div className="bg-gray-900/60 backdrop-blur-2xl border border-blue-500/40 rounded-3xl p-4 shadow-2xl shadow-blue-500/30">
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 25px rgba(96, 165, 250, 0.8)' }}
                  whileTap={{ scale: 0.85 }}
                  className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-3 sm:p-4 shadow-lg shadow-blue-500/60 hover:shadow-purple-600/80 transition-all duration-500"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
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
                  rows={4}
                  className="w-full p-4 sm:p-6 sm:px-16 bg-transparent text-blue-100 rounded-xl border-none placeholder-blue-200/60 focus:outline-none focus:ring-4 focus:ring-blue-500/70 transition-all duration-500 text-base sm:text-lg resize-none"
                  whileFocus={{ scale: 1.03, boxShadow: '0 0 20px rgba(96, 165, 250, 0.5)' }}
                />

                {prompt.trim() && (
                  <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(96, 165, 250, 0.8)' }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-4 sm:bottom-8 right-4 sm:right-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg px-6 sm:px-8 py-2 sm:py-3 text-sm font-semibold shadow-lg shadow-purple-600/60 hover:shadow-purple-600/80 transition-all duration-500 animate-pulse-glow"
                  >
                    Generate →
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </SignedIn>

        <SignedOut>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="bg-gray-900/60 backdrop-blur-2xl border border-blue-500/40 rounded-3xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Join Thunder to Unleash Creativity
            </h2>
            <p className="text-blue-200 mb-6">Sign up to start generating amazing website designs</p>
            <div className="flex justify-center gap-4">
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-blue-500/40 hover:shadow-purple-600/50 transition-all"
                >
                  Get Started Free
                </motion.button>
              </SignUpButton>
            </div>
          </motion.div>
        </SignedOut>

        {/* Recommendations Section */}
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-5 justify-center"
          >
            {recommendations.map((rec, index) => (
              <motion.button
                key={index}
                onClick={() => setPrompt(rec)}
                whileHover={{ scale: 1.15, y: -5, boxShadow: '0 0 20px rgba(192, 38, 211, 0.6)' }}
                whileTap={{ scale: 0.9 }}
                className="bg-gray-900/60 backdrop-blur-2xl hover:bg-gray-800/70 border border-blue-500/40 text-blue-100 hover:text-blue-400 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-purple-600/50"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * index + 0.7, duration: 0.6 }}
              >
                {rec}
              </motion.button>
            ))}
          </motion.div>
        </SignedIn>

        {/* Project History Section */}
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="bg-gray-900/60 backdrop-blur-2xl border border-blue-500/40 rounded-3xl p-8 shadow-2xl shadow-blue-500/30"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Your Project History
            </h2>
            {projects.length === 0 ? (
              <p className="text-blue-200 text-center">No projects yet. Start creating!</p>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project, index) => (
                  <motion.div
                    key={project.id}
                    className="flex sm:flex-row flex-col justify-between items-center bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-blue-500/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="mb-2 sm:mb-0">
                      <p className="text-blue-100 font-medium">{project.prompt}</p>
                      <p className="text-blue-400 text-sm">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => viewProject(project.prompt)}
                      whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(96, 165, 250, 0.6)' }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-2 rounded-full shadow-lg hover:shadow-purple-600/50 transition-all"
                    >
                      <Eye className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                ))}
                {projects.length > 5 && (
                  <motion.button
                    onClick={() => navigate('/history')}
                    whileHover={{ scale: 1.05 }}
                    className="w-full text-blue-400 hover:text-blue-300 mt-4"
                  >
                    View All Projects
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </SignedIn>

        {/* Upgrade Banner */}
        {usage.tier === 'free' && usage.remainingTokens <= 1 && (
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl mt-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-white font-bold text-lg mb-2">
              ⚡ Upgrade for Unlimited Access
            </h3>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
              Upgrade Now
            </button>
          </motion.div>
        )}
      </div>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 10px rgba(96, 165, 250, 0.5); }
            50% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.8); }
            100% { box-shadow: 0 0 10px rgba(96, 165, 250, 0.5); }
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
