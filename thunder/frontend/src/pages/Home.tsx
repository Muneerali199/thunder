
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { Home as HomeIcon, Plus, DollarSign, Eye, Gift, HelpCircle, Settings as SettingsIcon, X } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
import { Lightning } from '../components/lightning';
import { Settings } from '../components/setting';
import { createOrGetProject, getUserProjects, getUserChats, migrateLocalStorageToServer } from '../api/projects';
import type { Project, Chat } from '../api/projects';

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

interface UserMetadata {
  tier: 'free' | 'pro' | 'enterprise';
  remainingTokens: number;
  showTokenUsage: boolean;
  lineWrapping: boolean;
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  dailyTokens: number;
  extraTokens: number;
  monthlyTokens: number;
  totalMonthlyTokens: number;
  nextRefill: number;
  referralId?: string;
  referralTokensEarned?: number;
  freeReferrals?: number;
  proReferrals?: number;
}

// For backwards compatibility - legacy Project and Chat interfaces
interface LegacyProject {
  id: string;
  prompt: string;
  createdAt: string;
}

interface LegacyChat {
  id: string;
  message: string;
  createdAt: string;
}

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [usage, setUsage] = useState<UserMetadata>({
    tier: 'free',
    remainingTokens: 3,
    showTokenUsage: false,
    lineWrapping: false,
    theme: 'dark',
    notifications: true,
    dailyTokens: 0,
    extraTokens: 922000,
    monthlyTokens: 240000,
    totalMonthlyTokens: 1000000,
    nextRefill: 1000000,
    referralId: '',
    referralTokensEarned: 0,
    freeReferrals: 0,
    proReferrals: 0,
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTokensPopupOpen, setIsTokensPopupOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 640 });

  // Generate referral link
  const referralLink = userId ? `https://thunder-muneer.vercel.app/?ref=${userId}` : '';

  const loadProjects = async () => {
    if (isSignedIn && userId) {
      try {
        const serverProjects = await getUserProjects(userId);
        setProjects(serverProjects);
        return;
      } catch (error) {
        console.error('Error loading projects from server:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const localProjects = JSON.parse(storedProjects);
        // Convert legacy format to new format for display
        const convertedProjects = localProjects.map((p: any) => ({
          ...p,
          user_id: userId || 'local',
          prompt_hash: '',
          created_at: p.createdAt || new Date().toISOString(),
          updated_at: p.createdAt || new Date().toISOString()
        }));
        setProjects(convertedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadChats = async () => {
    if (isSignedIn && userId) {
      try {
        const serverChats = await getUserChats(userId);
        setChats(serverChats);
        return;
      } catch (error) {
        console.error('Error loading chats from server:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const storedChats = localStorage.getItem('chats');
      if (storedChats) {
        const localChats = JSON.parse(storedChats);
        // Convert legacy format to new format for display
        const convertedChats = localChats.map((c: any) => ({
          ...c,
          user_id: userId || 'local',
          project_id: null,
          created_at: c.createdAt || new Date().toISOString()
        }));
        setChats(convertedChats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  useEffect(() => {
    const loadUsage = async () => {
      if (isSignedIn && user) {
        const metadata = user.unsafeMetadata as Partial<UserMetadata>;
        setUsage({
          tier: metadata.tier || 'free',
          remainingTokens: metadata.remainingTokens || 3,
          showTokenUsage: metadata.showTokenUsage ?? false,
          lineWrapping: metadata.lineWrapping ?? false,
          theme: metadata.theme || 'dark',
          notifications: metadata.notifications ?? true,
          dailyTokens: metadata.dailyTokens ?? 0,
          extraTokens: metadata.extraTokens ?? 922000,
          monthlyTokens: metadata.monthlyTokens ?? 240000,
          totalMonthlyTokens: metadata.totalMonthlyTokens ?? 1000000,
          nextRefill: metadata.nextRefill ?? 1000000,
          referralId: metadata.referralId || userId || '',
          referralTokensEarned: metadata.referralTokensEarned || 0,
          freeReferrals: metadata.freeReferrals || 0,
          proReferrals: metadata.proReferrals || 0,
        });
        
        // Migrate localStorage data if it's the user's first server login
        migrateLocalStorageToServer(userId!);
      } else {
        const localUsage = localStorage.getItem('usage');
        if (localUsage) {
          setUsage(JSON.parse(localUsage));
        }
      }
    };

    loadUsage();
    loadProjects();
    loadChats();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'projects') loadProjects();
      else if (e.key === 'chats') loadChats();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isSignedIn, user, userId]);

  const recommendations = [
    'Design a futuristic portfolio for my digital art',
    'Create an online store for sustainable fashion',
    'Build a tech blog with interactive demos',
    'Make a vibrant landing page for my app',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    
    if (!isSignedIn) {
      alert('Please sign in to submit prompts');
      return;
    }
    if (usage.remainingTokens <= 0 && usage.tier === 'free') {
      alert("You've reached your free limit. Please upgrade to continue.");
      navigate('/pricing');
      return;
    }
    if (prompt.trim()) {
      setIsSubmitting(true);
      
      try {
        const newUsage = { 
          ...usage, 
          remainingTokens: usage.remainingTokens - 1, 
          dailyTokens: usage.dailyTokens + 1 
        };

        // Use new API with server-side deduplication
        const result = await createOrGetProject(userId!, prompt);
        
        if (result.isDuplicate) {
          // Notify user about duplicate
          alert(result.message + '. Redirecting to existing project.');
        }

        // Update projects list
        await loadProjects();
        await loadChats();
        
        // Update usage
        setUsage(newUsage);
        if (user) {
          await user.update({ unsafeMetadata: newUsage });
        } else {
          localStorage.setItem('usage', JSON.stringify(newUsage));
        }
        
        // Navigate to builder
        navigate('/builder', { state: { prompt } });
        setPrompt('');
        
      } catch (error) {
        console.error('Error saving project:', error);
        alert('Failed to save project. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log('Uploaded file:', file);
  };

  const viewProject = (projectPrompt: string) => {
    navigate('/builder', { state: { prompt: projectPrompt } });
  };

  const handleCopyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      alert('Referral link copied!');
    }
  };

  return (
    <div className={`min-h-screen bg-[#0F172A] flex flex-col items-center justify-start p-4 sm:p-10 relative overflow-hidden font-sans transition-all duration-300 ${isSignedIn ? 'sm:ml-16' : ''}`}>
      {!isMobile && <Lightning hue={230} intensity={1.2} speed={0.8} size={1.5} />}

      <SignedIn>
        <motion.div
          className={`hidden sm:flex fixed left-0 top-0 h-screen bg-gray-900/80 backdrop-blur-2xl border-r border-blue-500/40 z-50 ${isSidebarExpanded ? 'w-64' : 'w-16'} transition-all duration-300`}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          <div className="flex flex-col p-4 space-y-2 h-full">
            <div className="flex items-center mb-6 p-2">
              <ThunderLogoSVG />
              {isSidebarExpanded && (
                <span className="text-blue-400 text-lg font-bold ml-2">Thunder</span>
              )}
            </div>
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
                onClick={() => setIsTokensPopupOpen(true)}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <Gift className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Get Tokens</span>}
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
                onClick={() => window.open('https://thunder-docs.vercel.app/', '_blank')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Help Center</span>}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full mt-4 bg-blue-500/30 hover:bg-blue-500/40 text-blue-400 p-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                onClick={() => navigate('/')}
              >
                <Plus className="h-5 w-5" />
                {isSidebarExpanded && <span className="text-sm">New Project</span>}
              </motion.button>
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
                      userButtonPopoverActionButtonText: "text-blue-200 hover:text-blue-400",
                    },
                  }}
                />
                {isSidebarExpanded && <span className="text-sm">Profile</span>}
              </motion.div>
              <motion.button
                onClick={() => setIsSettingsOpen(true)}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <SettingsIcon className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Settings</span>}
              </motion.button>
            </div>
          </div>
        </motion.div>

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
            onClick={() => setIsTokensPopupOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
          >
            <Gift className="h-6 w-6" />
            <span className="text-xs">Tokens</span>
          </motion.button>
          <motion.button
            onClick={() => window.open('https://thunder-docs.vercel.app/', '_blank')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
          >
            <HelpCircle className="h-6 w-6" />
            <span className="text-xs">Help</span>
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
          {projects.length > 0 && (
            <motion.button
              onClick={() => viewProject(projects[0].prompt)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
            >
              <Eye className="h-6 w-6" />
              <span className="text-xs">Last</span>
            </motion.button>
          )}
          <motion.button
            onClick={() => setIsSettingsOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
          >
            <SettingsIcon className="h-6 w-6" />
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
                  userButtonPopoverActionButtonText: "text-blue-200 hover:text-blue-400",
                },
              }}
            />
            <span className="text-xs">Profile</span>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {isSettingsOpen && (
            <Settings
              isSettingsOpen={isSettingsOpen}
              setIsSettingsOpen={setIsSettingsOpen}
              usage={usage}
              setUsage={setUsage}
              projects={projects.map(p => ({ id: p.id, prompt: p.prompt, createdAt: p.created_at }))}
              setProjects={(legacyProjects) => {
                // Convert legacy format back to new format
                const newFormatProjects = legacyProjects.map(p => ({
                  ...p,
                  user_id: userId || 'local',
                  prompt_hash: '',
                  created_at: p.createdAt,
                  updated_at: p.createdAt
                }));
                setProjects(newFormatProjects);
              }}
              chats={chats.map(c => ({ id: c.id, message: c.message, createdAt: c.created_at }))}
              setChats={(legacyChats) => {
                // Convert legacy format back to new format  
                const newFormatChats = legacyChats.map(c => ({
                  ...c,
                  user_id: userId || 'local',
                  project_id: null,
                  created_at: c.createdAt
                }));
                setChats(newFormatChats);
              }}
              user={user}
            />
          )}
          {isTokensPopupOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-gray-900/80 backdrop-blur-2xl border border-blue-500/40 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-blue-500/30"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Refer Users: Earn Tokens
                  </h2>
                  <motion.button
                    onClick={() => setIsTokensPopupOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-blue-200 hover:text-blue-400"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  <p className="text-blue-200 text-sm">
                    Earn 200K tokens for yourself & each new user you refer to Thunder.
                  </p>
                  <p className="text-blue-200 text-sm">
                    Pro users: earn an additional 5M tokens for yourself & your referral when they upgrade to a Pro account within 30 days!
                  </p>
                  <div>
                    <h3 className="text-blue-400 font-semibold mb-2">Referral tokens earned</h3>
                    <p className="text-blue-200 text-sm">{(usage.referralTokensEarned ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-blue-400 font-semibold mb-2">Free Referrals</h3>
                      <p className="text-blue-200 text-sm">{usage.freeReferrals ?? 0}</p>
                    </div>
                    <div>
                      <h3 className="text-blue-400 font-semibold mb-2">Pro Referrals</h3>
                      <p className="text-blue-200 text-sm">
                        {usage.tier === 'pro' ? (usage.proReferrals ?? 0) : 'Upgrade to Pro to unlock Pro referrals'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-2">
                      Use your personal referral link to invite users to join Thunder:
                    </p>
                    <div className="flex items-center bg-gray-800/50 p-2 rounded-lg">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="bg-transparent text-blue-200 text-sm flex-1 focus:outline-none"
                      />
                      <motion.button
                        onClick={handleCopyReferralLink}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-400 px-3 py-1 rounded-lg text-sm"
                      >
                        Copy
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SignedIn>

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

      <div className="max-w-4xl w-full space-y-14 relative z-10">
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
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.15, boxShadow: '0 0 25px rgba(96, 165, 250, 0.8)' } : {}}
                    whileTap={!isSubmitting ? { scale: 0.9 } : {}}
                    className={`absolute bottom-4 sm:bottom-8 right-4 sm:right-6 bg-gradient-to-r ${
                      isSubmitting 
                        ? 'from-gray-500 to-gray-600 cursor-not-allowed' 
                        : 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    } text-white rounded-lg px-6 sm:px-8 py-2 sm:py-3 text-sm font-semibold shadow-lg shadow-purple-600/60 hover:shadow-purple-600/80 transition-all duration-500 ${
                      isSubmitting ? '' : 'animate-pulse-glow'
                    }`}
                  >
                    {isSubmitting ? 'Creating...' : 'Generate →'}
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
