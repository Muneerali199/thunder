
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { X, Trash2, Users, Database, Network, Download, CreditCard, Globe, PenTool, Code, LogOut, DollarSign, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { UserResource } from '@clerk/types';

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

interface SettingsProps {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  usage: UserMetadata;
  setUsage: (usage: UserMetadata) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  user: UserResource | null | undefined;
}

export function Settings({
  isSettingsOpen,
  setIsSettingsOpen,
  usage,
  setUsage,
  projects,
  setProjects,
  chats,
  setChats,
  user,
}: SettingsProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('General');

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
              onClick={handleHelpCenterVisit}
              whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-end items-center p-2 rounded-lg text-blue-200 hover:text-blue-400 hover:bg-blue-900/60 transition-colors text-xs"
            >
              <span className="mr-2">Visit Help Center</span>
              <HelpCircle className="h-4 w-4" />
            </motion.button>
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

  return isSettingsOpen ? (
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
  ) : null;
}
