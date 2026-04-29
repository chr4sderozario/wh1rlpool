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
import { Navbar } from '@/src/components/layout/Navbar';
import { CartPage } from '@/src/pages/CartPage';
import { ProductDetailPage } from '@/src/pages/ProductDetailPage';
import { WishlistPage } from '@/src/pages/WishlistPage';
import { OrdersPage } from '@/src/pages/OrdersPage';
import { CheckoutPage } from '@/src/pages/CheckoutPage';
import { GiftCardPage } from '@/src/pages/GiftCardPage';
import { AuthProvider } from '@/src/context/AuthContext';
import { ChatWidget } from '@/src/components/ChatWidget';

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
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/shop" element={<StorePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/giftcard" element={<GiftCardPage />} />
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
              <ChatWidget />
            </div>
          )}
        </AnimatePresence>
      </AuthProvider>
    </Router>
  );
}
