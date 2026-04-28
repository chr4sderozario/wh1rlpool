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
import { Button } from '@/src/components/ui/Button';

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
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
          isScrolled 
          ? 'bg-black/60 backdrop-blur-2xl border-b border-white/5 py-4 shadow-2xl' 
          : 'bg-transparent border-transparent py-8'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group relative">
            <motion.div 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-black italic text-xl group-hover:bg-brand-red group-hover:text-white transition-all duration-500">AC</div>
              <span className="text-xl font-display font-black tracking-tighter uppercase italic leading-none hidden sm:block gothic-glow">WH1RLPOOL</span>
            </motion.div>
            <span className="absolute -bottom-3 left-0 w-0 h-[1px] bg-brand-red group-hover:w-full transition-all duration-700" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-12">
            {[
              { name: 'Artifacts', path: '/shop' },
              { name: 'Registry', path: '/shop' },
              { name: 'About', path: '/about' }
            ].map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[10px] uppercase tracking-[0.4em] font-black transition-all hover:text-white relative group ${
                  location.pathname === link.path ? 'text-white' : 'text-white/40'
                }`}
              >
                {link.name}
                <motion.span 
                  className="absolute -bottom-2 left-0 w-0 h-[1px] bg-brand-red"
                  animate={{ w: location.pathname === link.path ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-500 delay-100" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-6">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(true)}
                className="text-white/40 hover:text-white transition-colors p-2"
              >
                <Search className="w-5 h-5" />
              </motion.button>
              
              <Link to="/cart" className="text-white/40 hover:text-white transition-colors relative group p-2">
                <CartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <AnimatePresence>
                   <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </AnimatePresence>
              </Link>

              {isAdmin && (
                <Link to="/admin" className="hidden xl:flex items-center gap-3 bg-brand-red/10 border border-brand-red/20 rounded-full px-5 py-2 group hover:bg-brand-red transition-all">
                  <ShieldAlert className="w-3.5 h-3.5 text-brand-red group-hover:text-white" />
                  <span className="text-[9px] font-black uppercase tracking-widest leading-none text-brand-red group-hover:text-white">Admin Void</span>
                </Link>
              )}

              <div className="h-4 w-[1px] bg-white/10 hidden md:block mx-2" />

              {user ? (
                <Link to="/profile" className="flex items-center gap-4 group">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{profile?.displayName || 'Archive'}</p>
                    <p className="text-[9px] font-bold text-brand-red tracking-wider">₹ {profile?.balance || 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-red transition-all overflow-hidden relative p-1">
                     <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                      className="w-full h-full rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      alt="profile"
                     />
                     <div className="absolute inset-0 bg-brand-red/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex rounded-2xl h-10 px-8 text-[9px] font-black uppercase tracking-widest bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-500"
                >
                  Identification
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5 text-white" />
            </motion.button>
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
