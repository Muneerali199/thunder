import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { Pricing } from './components/Pricing';
import Checkout from './components/checkout';
import { ClerkProvider } from '@clerk/clerk-react';

// Declare gtag to avoid TS errors
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Hook to track page views on route change
function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-EQFZKPZ5MB', {
        page_path: location.pathname,
      });
    }
  }, [location]);
}

// Routes component with tracking
function AppRoutes() {
  usePageTracking();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/builder" element={<Builder />} />
      <Route path="/pricing" element={<Pricing />} />
      {/* ✅ Dynamic checkout route */}
      <Route path="/checkout/:billing/:planId" element={<Checkout />} />

      <Route path="/github-callback" element={<Builder />} />
    </Routes>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;
