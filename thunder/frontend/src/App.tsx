import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { Pricing } from './components/Pricing';
import { Checkout } from './components/checkout';
import { ClerkProvider } from '@clerk/clerk-react';


function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/github-callback" element={<Builder />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;