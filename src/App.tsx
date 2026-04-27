import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { GothicBackground } from '@/src/components/layout/GothicBackground';
import { LoadingScreen } from '@/src/components/layout/LoadingScreen';
import { LandingPage } from '@/src/pages/LandingPage';
import { LoginPage } from '@/src/pages/LoginPage';
import { AdminDashboard } from '@/src/pages/AdminDashboard';
import { StorePage } from '@/src/pages/StorePage';
import { ProfilePage } from '@/src/pages/ProfilePage';
import { SupportPage } from '@/src/pages/SupportPage';
import { AuthProvider } from '@/src/context/AuthContext';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingScreen key="loader" />
          ) : (
            <div key="content" className="relative text-white selection:bg-brand-red selection:text-white">
              <GothicBackground />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/support" element={<SupportPage />} />
              </Routes>
            </div>
          )}
        </AnimatePresence>
      </AuthProvider>
    </Router>
  );
}
