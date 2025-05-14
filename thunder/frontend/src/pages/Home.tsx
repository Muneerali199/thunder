import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { Home as HomeIcon, Settings, Plus, DollarSign, Eye, X, Trash2, Users, Database, Network, Download, CreditCard, Globe, PenTool, Code, Gift, LogOut, HelpCircle } from 'lucide-react';
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

interface Project {
  id: string;
  prompt: string;
  createdAt: string;
}

interface Chat {
  id: string;
  message: string;
  createdAt: string;
}

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn, signOut, userId } = useAuth();
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
  const [selectedCategory, setSelectedCategory] = useState<string>('General');
  const isMobile = useMediaQuery({ maxWidth: 640 });

  // Generate referral link
  const referralLink = userId ? `https://thunder-muneer.vercel.app/?ref=${userId}` : '';

  const loadProjects = () => {
    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadChats = () => {
    try {
      const storedChats = localStorage.getItem('chats');
      if (storedChats) {
        setChats(JSON.parse(storedChats));
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
      const newUsage = { ...usage, remainingTokens: usage.remainingTokens - 1, dailyTokens: usage.dailyTokens + 1 };
      const newProject: Project = {
        id: crypto.randomUUID(),
        prompt,
        createdAt: new Date().toISOString(),
      };
      const updatedProjects = [newProject, ...projects];
      try {
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
        const newChat: Chat = {
          id: crypto.randomUUID(),
          message: `Generated project: ${prompt}`,
          createdAt: new Date().toISOString(),
        };
        const updatedChats = [newChat, ...chats];
        localStorage.setItem('chats', JSON.stringify(updatedChats));
        setChats(updatedChats);
        setUsage(newUsage);
        if (user) {
          await user.update({ unsafeMetadata: newUsage });
        } else {
          localStorage.setItem('usage', JSON.stringify(newUsage));
        }
        navigate('/builder', { state: { prompt } });
        setPrompt('');
      } catch (error) {
        console.error('Error saving data:', error);
        alert('Failed to save project or chat.');
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

  const handleDeleteAllChats = () => {
    try {
      localStorage.removeItem('chats');
      setChats([]);
      alert('All chats have been deleted.');
    } catch (error) {
      console.error('Error deleting chats:', error);
      alert('Failed to delete chats.');
    }
  };

  const handleDeleteAll = () => {
    try {
      localStorage.removeItem('chats');
      localStorage.removeItem('projects');
      setChats([]);
      setProjects([]);
      alert('All chats and projects have been deleted.');
    } catch (error) {
      console.error('Error deleting all data:', error);
      alert('Failed to delete data.');
    }
  };

  const handleToggleTokenUsage = async () => {
    const newUsage = { ...usage, showTokenUsage: !usage.showTokenUsage };
    setUsage(newUsage);
    if (user) {
      try {
        await user.update({ unsafeMetadata: newUsage });
      } catch (error) {
        console.error('Error updating token usage:', error);
        alert('Failed to update token usage setting.');
      }
    } else {
      localStorage.setItem('usage', JSON.stringify(newUsage));
    }
  };

  const handleToggleLineWrapping = async () => {
    const newUsage = { ...usage, lineWrapping: !usage.lineWrapping };
    setUsage(newUsage);
    if (user) {
      try {
        await user.update({ unsafeMetadata: newUsage });
      } catch (error) {
        console.error('Error updating line wrapping:', error);
        alert('Failed to update line wrapping setting.');
      }
    } else {
      localStorage.setItem('usage', JSON.stringify(newUsage));
    }
  };

  const handleThemeChange = async (theme: 'dark' | 'light' | 'system') => {
    const newUsage = { ...usage, theme };
    setUsage(newUsage);
    if (user) {
      try {
        await user.update({ unsafeMetadata: newUsage });
      } catch (error) {
        console.error('Error updating theme:', error);
        alert('Failed to update theme setting.');
      }
    } else {
      localStorage.setItem('usage', JSON.stringify(newUsage));
    }
  };

  const handleToggleNotifications = async () => {
    const newUsage = { ...usage, notifications: !usage.notifications };
    setUsage(newUsage);
    if (user) {
      try {
        await user.update({ unsafeMetadata: newUsage });
      } catch (error) {
        console.error('Error updating notifications:', error);
        alert('Failed to update notification setting.');
      }
    } else {
      localStorage.setItem('usage', JSON.stringify(newUsage));
    }
  };

  const handleExportData = () => {
    try {
      const data = { projects, chats, usage };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thunder-data-backup.json';
      a.click();
      URL.revokeObjectURL(url);
      alert('Data exported successfully.');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data.');
    }
  };

  const handleNetlifyConnect = () => {
    alert('Connecting to Netlify... (Placeholder for actual integration)');
    // TODO: Implement Netlify OAuth or API integration
  };

  const handleSupabaseDisconnect = () => {
    alert('Disconnecting Supabase... (Placeholder for actual integration)');
    // TODO: Implement Supabase disconnect logic
  };

  const handleFigmaConnect = () => {
    alert('Connecting to Figma... (Placeholder for actual integration)');
    // TODO: Implement Figma OAuth or API integration
  };

  const handleStackBlitzVisit = () => {
    window.open('https://stackblitz.com', '_blank');
    // TODO: Implement StackBlitz login/GitHub integration
  };

  const handleHelpCenterVisit = () => {
    window.open('https://thunder-docs.vercel.app/', '_blank');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out.');
    }
  };

  const handleCopyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      alert('Referral link copied!');
    }
  };

  const settingsCategories = [
    'General',
    'Appearance',
    'Editor',
    'Team',
    'Tokens',
    'Applications',
    'Feature Previews',
    'Knowledge',
    'Network',
    'Backups',
  ];

  const renderSubOptions = (category: string) => {
    switch (category) {
      case 'General':
        return (
          <div className="flex flex-col items-end space-y-2">
            <motion.button
              onClick={handleDeleteAllChats}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Delete all chats</span>
              <Trash2 className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={handleDeleteAll}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Delete all data</span>
              <Trash2 className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={handleToggleNotifications}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Enable notifications</span>
              <input
                type="checkbox"
                checked={usage.notifications}
                onChange={handleToggleNotifications}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500"
              />
            </motion.button>
          </div>
        );
      case 'Appearance':
        return (
          <div className="flex flex-col items-end space-y-2">
            <div className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 text-xs">
              <span className="mr-2">Theme</span>
              <select
                value={usage.theme}
                onChange={(e) => handleThemeChange(e.target.value as 'dark' | 'light' | 'system')}
                className="bg-gray-800 text-blue-200 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        );
      case 'Editor':
        return (
          <div className="flex flex-col items-end space-y-2">
            <motion.button
              onClick={handleToggleLineWrapping}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Line Wrapping</span>
              <input
                type="checkbox"
                checked={usage.lineWrapping}
                onChange={handleToggleLineWrapping}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500"
              />
            </motion.button>
          </div>
        );
      case 'Team':
        return (
          <div className="flex flex-col items-end space-y-2">
            <motion.button
              onClick={() => navigate('/team')}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Manage Team</span>
              <Users className="h-4 w-4" />
            </motion.button>
          </div>
        );
      case 'Tokens':
        return (
          <div className="flex flex-col items-end space-y-3">
            <div className="w-full text-right">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Your Consumption</h4>
              <p className="text-blue-200 text-xs">Free plan: {user?.primaryEmailAddress?.emailAddress || 'N/A'}</p>
              <p className="text-blue-200 text-xs">Daily limit consumption: {usage.dailyTokens}/150K tokens</p>
              <p className="text-blue-200 text-xs">Extra tokens left: {usage.extraTokens.toLocaleString()}</p>
              <p className="text-blue-200 text-xs">Monthly tokens left: {usage.monthlyTokens.toLocaleString()}/{usage.totalMonthlyTokens.toLocaleString()}</p>
              <p className="text-blue-200 text-xs">Invoicing: Free</p>
              <p className="text-blue-200 text-xs">Next Token Refill: {usage.nextRefill.toLocaleString()}</p>
            </div>
            <motion.button
              onClick={() => navigate('/pricing')}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Upgrade Plan</span>
              <CreditCard className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={handleToggleTokenUsage}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Show token usage</span>
              <input
                type="checkbox"
                checked={usage.showTokenUsage}
                onChange={handleToggleTokenUsage}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500"
              />
            </motion.button>
            <motion.button
              onClick={() => navigate('/pricing')}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">View Pricing</span>
              <DollarSign className="h-4 w-4" />
            </motion.button>
          </div>
        );
      case 'Applications':
        return (
          <div className="flex flex-col items-end space-y-3">
            <div className="w-full text-right">
              <div className="mb-3">
                <div className="flex justify-end items-center">
                  <p className="text-blue-400 text-xs font-semibold mr-2">Netlify</p>
                  <Globe className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-blue-200 text-xs mb-1">Deploy your app seamlessly with your own Netlify account.</p>
                <motion.button
                  onClick={handleNetlifyConnect}
                  whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-blue-200 hover:text-blue-400 text-xs underline"
                >
                  Connect
                </motion.button>
              </div>
              <div className="mb-3">
                <div className="flex justify-end items-center">
                  <p className="text-blue-400 text-xs font-semibold mr-2">Supabase</p>
                  <Database className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-blue-200 text-xs mb-1">Integrate Supabase for authentication or database sync.</p>
                <motion.button
                  onClick={handleSupabaseDisconnect}
                  whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-blue-200 hover:text-blue-400 text-xs underline"
                >
                  Disconnect
                </motion.button>
              </div>
              <div className="mb-3">
                <div className="flex justify-end items-center">
                  <p className="text-blue-400 text-xs font-semibold mr-2">Figma</p>
                  <PenTool className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-blue-200 text-xs mb-1">Import your Figma designs as code for Thunder analysis.</p>
                <motion.button
                  onClick={handleFigmaConnect}
                  whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-blue-200 hover:text-blue-400 text-xs underline"
                >
                  Connect
                </motion.button>
              </div>
              <div>
                <div className="flex justify-end items-center">
                  <p className="text-blue-400 text-xs font-semibold mr-2">StackBlitz</p>
                  <Code className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-blue-200 text-xs mb-1">Manage login and GitHub integration on StackBlitz.</p>
                <motion.button
                  onClick={handleStackBlitzVisit}
                  whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-blue-200 hover:text-blue-400 text-xs underline"
                >
                  Visit StackBlitz
                </motion.button>
              </div>
            </div>
          </div>
        );
      case 'Feature Previews':
        return (
          <div className="flex flex-col items-end space-y-2">
            <motion.button
              onClick={() => alert('Feature previews coming soon!')}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Enable Beta Features</span>
              <input
                type="checkbox"
                disabled
                className="h-4 w-4 text-blue-500 focus:ring-blue-500"
              />
            </motion.button>
          </div>
        );
      case 'Knowledge':
        return (
          <div className="flex flex-col items-end space-y-2">
            <motion.button
              onClick={() => navigate('/knowledge-base')}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">View Knowledge Base</span>
              <Database className="h-4 w-4" />
            </motion.button>
          </div>
        );
      case 'Network':
        return (
          <div className="flex flex-col items-end space-y-2">
            <motion.button
              onClick={() => alert('Network settings coming soon!')}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Configure Proxy</span>
              <Network className="h-4 w-4" />
            </motion.button>
          </div>
        );
      case 'Backups':
        return (
          <div className="flex flex-col items-end space-y-2">
            <motion.button
              onClick={handleExportData}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Export Data</span>
              <Download className="h-4 w-4" />
            </motion.button>
          </div>
        );
      default:
        return <p className="text-blue-200 text-xs text-right">No options available.</p>;
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
                onClick={handleHelpCenterVisit}
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
                <Settings className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Settings</span>}
              </motion.button>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Log Out</span>}
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
            onClick={handleHelpCenterVisit}
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
            <Settings className="h-6 w-6" />
            <span className="text-xs">Settings</span>
          </motion.button>
          <motion.button
            onClick={handleSignOut}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-blue-200 hover:text-blue-400 p-2"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs">Log Out</span>
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
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-gray-900/80 backdrop-blur-2xl border border-blue-500/40 rounded-3xl p-8 w-full max-w-lg shadow-2xl shadow-blue-500/30"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Settings
                  </h2>
                  <motion.button
                    onClick={() => setIsSettingsOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-blue-200 hover:text-blue-400"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="flex max-h-[70vh]">
                  <div className="w-1/3 border-r border-blue-500/40 pr-2 overflow-y-auto">
                    <div className="flex flex-col space-y-1">
                      {settingsCategories.map((category) => (
                        <motion.button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                          whileTap={{ scale: 0.95 }}
                          className={`text-left p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs ${selectedCategory === category ? 'bg-blue-900/60 text-blue-400' : ''}`}
                        >
                          {category}
                        </motion.button>
                      ))}
                      <motion.button
                        onClick={handleSignOut}
                        whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                        whileTap={{ scale: 0.95 }}
                        className="text-left p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex-1 pl-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3 text-right">
                      {selectedCategory}
                    </h3>
                    {renderSubOptions(selectedCategory)}
                  </div>
                </div>
              </motion.div>
            </motion.div>
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