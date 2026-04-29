import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import { GothicBackground } from '@/src/components/layout/GothicBackground';
import { LoadingScreen } from '@/src/components/layout/LoadingScreen';
import { Navbar } from '@/src/components/layout/Navbar';
import { AuthProvider } from '@/src/context/AuthContext';
import { ScannerProvider } from '@/src/context/ScannerContext';
import { ChatWidget } from '@/src/components/ChatWidget';
import { MusicProtocol } from '@/src/components/MusicProtocol';

// Lazy load pages for performance
const LandingPage = lazy(() => import('@/src/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/src/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const AdminDashboard = lazy(() => import('@/src/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const StorePage = lazy(() => import('@/src/pages/StorePage').then(m => ({ default: m.StorePage })));
const ProfilePage = lazy(() => import('@/src/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SupportPage = lazy(() => import('@/src/pages/SupportPage').then(m => ({ default: m.SupportPage })));
const CartPage = lazy(() => import('@/src/pages/CartPage').then(m => ({ default: m.CartPage })));
const ProductDetailPage = lazy(() => import('@/src/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const WishlistPage = lazy(() => import('@/src/pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const OrdersPage = lazy(() => import('@/src/pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const CheckoutPage = lazy(() => import('@/src/pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const GiftCardPage = lazy(() => import('@/src/pages/GiftCardPage').then(m => ({ default: m.GiftCardPage })));
const LoyaltyPage = lazy(() => import('@/src/pages/LoyaltyPage').then(m => ({ default: m.LoyaltyPage })));
const Wh1rlAI = lazy(() => import('@/src/pages/Wh1rlAI').then(m => ({ default: m.Wh1rlAI })));

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
        <ScannerProvider>
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingScreen key="loader" />
            ) : (
              <div key="content" className="relative text-white selection:bg-brand-red selection:text-white">
                <GothicBackground />
                <Navbar />
                <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div></div>}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/store" element={<StorePage />} />
                    <Route path="/loyalty" element={<LoyaltyPage />} />
                    <Route path="/ai" element={<Wh1rlAI />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/gift-cards" element={<GiftCardPage />} />
                    <Route path="/men" element={<StorePage gender="men" />} />
                    <Route path="/women" element={<StorePage gender="women" />} />
                    <Route path="/sale" element={<StorePage onSale={true} />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/support" element={<SupportPage />} />
                  </Routes>
                </Suspense>
                <ChatWidget />
                <MusicProtocol />
              </div>
            )}
          </AnimatePresence>
        </ScannerProvider>
      </AuthProvider>
    </Router>
  );
}
