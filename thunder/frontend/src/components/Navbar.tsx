import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import {
  Home as HomeIcon,
  DollarSign,
  Gift,
  HelpCircle,
  Plus,
  Settings as SettingsIcon,
} from "lucide-react";

const ThunderLogoSVG = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13 2L3 14h9l-1 8l10-12h-9l1-8z" fill="url(#grad)" />
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#60A5FA", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#C026D3", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* When user is signed out → top nav */}
      <SignedOut>
        <nav className="w-full max-w-6xl mx-auto p-4 flex items-center">
          {/* Left side (Logo + Thunder) */}
          <div className="flex items-center">
            <ThunderLogoSVG />
            <span className="text-blue-400 text-lg font-bold ml-2">
              Thunder
            </span>
          </div>

          {/* Right side (Buttons) */}
          <div className="ml-auto flex items-center gap-6">
            <motion.button
              onClick={() => navigate("/pricing")}
              className="text-blue-200 hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
            >
              Pricing
            </motion.button>

            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-blue-200 hover:text-blue-400"
              >
                Sign In
              </motion.button>
            </SignInButton>

            <SignUpButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full"
              >
                Sign Up
              </motion.button>
            </SignUpButton>
          </div>
        </nav>
      </SignedOut>

      {/* When user is signed in → sidebar */}
      <SignedIn>
        <div className="fixed left-0 top-0 h-screen w-16 bg-gray-900/80 border-r border-blue-500/40 p-2 flex flex-col justify-between">
          <div className="space-y-4">
            <motion.button
              onClick={() => navigate("/")}
              className="text-blue-200 hover:text-blue-400"
            >
              <HomeIcon />
            </motion.button>
            <motion.button
              onClick={() => navigate("/pricing")}
              className="text-blue-200 hover:text-blue-400"
            >
              <DollarSign />
            </motion.button>
            <motion.button
              onClick={() => alert("Get Tokens")}
              className="text-blue-200 hover:text-blue-400"
            >
              <Gift />
            </motion.button>
            <motion.button
              onClick={() =>
                window.open("https://thunder-docs.vercel.app/", "_blank")
              }
              className="text-blue-200 hover:text-blue-400"
            >
              <HelpCircle />
            </motion.button>
          </div>
          <div className="space-y-4">
            <motion.button
              onClick={() => alert("Settings")}
              className="text-blue-200 hover:text-blue-400"
            >
              <SettingsIcon />
            </motion.button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
