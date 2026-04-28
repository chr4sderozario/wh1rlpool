import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  User, 
  Heart, 
  Search, 
  Menu, 
  X, 
  ChevronDown,
  ShoppingBag as CartIcon,
  Package,
  ShieldAlert
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Men', path: '/men' },
    { name: 'Women', path: '/women' },
    { name: 'Sale', path: '/sale' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          isScrolled 
          ? 'bg-black/90 backdrop-blur-xl border-white/10 py-4' 
          : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group relative">
            <motion.h1 
              className="text-2xl md:text-3xl font-display font-black tracking-tighter gothic-glow"
              whileHover={{ scale: 1.05 }}
            >
              WH1RLPOOL
            </motion.h1>
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-red group-hover:w-full transition-all duration-500" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-all hover:text-brand-red relative group ${
                  location.pathname === link.path ? 'text-brand-red' : 'text-white/60'
                }`}
              >
                {link.name}
                <motion.span 
                  className="absolute -bottom-2 left-0 w-0 h-[1px] bg-brand-red"
                  animate={{ w: location.pathname === link.path ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <Link to="/wishlist" className="text-white/60 hover:text-white transition-colors relative group">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link to="/cart" className="text-white/60 hover:text-white transition-colors relative group">
              <CartIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {isAdmin && (
              <Link to="/admin" className="hidden lg:flex items-center gap-2 text-brand-red hover:text-white transition-colors group">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Admin Void</span>
              </Link>
            )}

            <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

            {user ? (
              <Link 
                to="/profile" 
                className="flex items-center gap-3 group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
                    {profile?.displayName || user.displayName || 'Subject'}
                  </p>
                  <p className="text-[8px] text-brand-red font-black uppercase tracking-[0.2em]">
                    ${profile?.balance?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 group-hover:border-brand-red transition-all duration-500 overflow-hidden">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    alt="profile"
                  />
                </div>
              </Link>
            ) : (
              <Link 
                to="/login"
                className="text-[10px] uppercase tracking-[0.2em] font-black px-6 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-500"
              >
                Enter Void
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden text-white/60 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl lg:hidden flex flex-col p-12"
          >
            <button 
              className="self-end text-white/40 hover:text-white mb-12"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>

            <div className="flex flex-col gap-8">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-4xl font-display font-bold italic uppercase tracking-tighter hover:text-brand-red transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pt-12 border-t border-white/10 space-y-6">
              {user && (
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-white/60 uppercase text-xs tracking-widest">
                  <User className="w-5 h-5" /> Identity Archive
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-brand-red uppercase text-xs tracking-widest">
                  <Package className="w-5 h-5" /> Admin Panel
                </Link>
              )}
              <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-white/60 uppercase text-xs tracking-widest">
                <Package className="w-5 h-5" /> My Transmissions
              </Link>
              <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-white/60 uppercase text-xs tracking-widest">
                <User className="w-5 h-5" /> Support Terminal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-2xl p-12 flex flex-col items-center"
          >
            <button 
              className="absolute top-12 right-12 text-white/40 hover:text-white"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>

            <div className="w-full max-w-4xl mt-32 space-y-12">
              <div className="relative group">
                <input 
                  type="text"
                  autoFocus
                  placeholder="SEARCH THE VOID..."
                  className="w-full bg-transparent border-b-2 border-white/10 py-6 text-4xl md:text-6xl font-display font-medium uppercase tracking-tighter focus:outline-none focus:border-brand-red transition-all duration-500"
                />
                <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 text-white/10 group-focus-within:text-brand-red transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-6">Trending Extractions</h3>
                  <div className="flex flex-wrap gap-4">
                    {['Retro', 'National', 'Player Edition', 'Gothic Custom'].map(tag => (
                      <button key={tag} className="px-6 py-2 border border-white/10 rounded-full text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-6">Quick Links</h3>
                  <div className="space-y-4">
                    <Link to="/sale" className="block text-2xl font-display font-bold uppercase hover:text-brand-red transition-colors italic">Flash Sale %</Link>
                    <Link to="/shop" className="block text-2xl font-display font-bold uppercase hover:text-brand-red transition-colors italic">New Arrivals</Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
