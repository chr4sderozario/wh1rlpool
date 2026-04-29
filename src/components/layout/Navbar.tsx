import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Menu, 
  X, 
  ShoppingBag as CartIcon,
  Package,
  ShieldAlert,
  Ghost
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
    { name: 'ARCHIVE', path: '/' },
    { name: 'REGISTRY', path: '/shop' },
    { name: 'SECTOR M', path: '/men' },
    { name: 'SECTOR W', path: '/women' },
    { name: 'FLASH', path: '/sale' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
          isScrolled 
          ? 'bg-black/60 backdrop-blur-2xl border-b border-white/5 py-4' 
          : 'bg-transparent border-transparent py-8'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group relative">
            <motion.div 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center">
                 <Ghost className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-black tracking-tighter uppercase italic leading-none gothic-glow">WH1RLPOOL</span>
                <span className="text-[7px] font-black tracking-[0.6em] text-brand-red uppercase">IDENTITY.VOID</span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[9px] uppercase tracking-[0.5em] font-black transition-all hover:text-brand-red relative group ${
                  location.pathname === link.path ? 'text-brand-red' : 'text-white/40'
                }`}
              >
                {link.name}
                <motion.span 
                  className="absolute -bottom-2 left-0 w-0 h-[1px] bg-brand-red"
                  animate={{ width: location.pathname === link.path ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
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
                className="text-white/20 hover:text-white transition-colors p-2"
              >
                <Search className="w-4 h-4" />
              </motion.button>
              
              <Link to="/cart" className="text-white/20 hover:text-white transition-colors relative group p-2">
                <CartIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <AnimatePresence>
                   <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
                </AnimatePresence>
              </Link>

              {isAdmin && (
                <Link to="/admin" className="hidden xl:flex items-center gap-3 bg-brand-red/5 border border-brand-red/20 rounded-lg px-4 py-1.5 group hover:bg-brand-red transition-all">
                  <ShieldAlert className="w-3 h-3 text-brand-red group-hover:text-white" />
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none text-brand-red group-hover:text-white">ACCESS VOID</span>
                </Link>
              )}

              <div className="h-4 w-[1px] bg-white/10 hidden md:block mx-1" />

              {user ? (
                <Link to="/profile" className="flex items-center gap-4 group">
                  <div className="text-right hidden md:block">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{profile?.displayName || 'SUBJECT'}</p>
                    <div className="flex items-center gap-3 justify-end">
                      <p className="text-[8px] font-black text-brand-red tracking-wider">CR: {profile?.balance || 0}</p>
                      <p className="text-[8px] font-black text-orange-500 tracking-wider">W-COINS: {profile?.wh1rlCoins || 0}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center group-hover:border-brand-red transition-all overflow-hidden relative p-0.5">
                     <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                      className="w-full h-full rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      alt="profile"
                     />
                  </div>
                </Link>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex rounded-lg h-9 px-6 text-[8px] font-black uppercase tracking-widest bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-display italic"
                >
                  IDENTIFY
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-4 h-4 text-white/60" />
            </motion.button>
          </div>
        </div>
      </motion.nav>


      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[110] bg-black/98 backdrop-blur-2xl lg:hidden flex flex-col p-12"
          >
            <button 
              className="self-end text-white/20 hover:text-white mb-16 p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col gap-10">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-5xl font-display font-black italic uppercase tracking-tighter hover:text-brand-red transition-all"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pt-12 border-t border-white/5 space-y-6">
              {user && (
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-white/40 uppercase text-[10px] font-black tracking-[0.3em] hover:text-brand-red transition-all">
                  <User className="w-4 h-4" /> IDENTITY ARCHIVE
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-brand-red uppercase text-[10px] font-black tracking-[0.3em]">
                  <ShieldAlert className="w-4 h-4" /> ACCESS VOID
                </Link>
              )}
              <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-white/40 uppercase text-[10px] font-black tracking-[0.3em]">
                <Package className="w-4 h-4" /> TRANSMISSIONS
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
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-3xl p-12 flex flex-col items-center"
          >
            <button 
              className="absolute top-12 right-12 text-white/20 hover:text-white p-2"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>

            <div className="w-full max-w-4xl mt-32 space-y-16">
              <div className="relative group">
                <input 
                  type="text"
                  autoFocus
                  placeholder="SCAN THE VOID..."
                  className="w-full bg-transparent border-b border-white/10 py-8 text-4xl md:text-7xl font-display font-black uppercase tracking-tighter focus:outline-none focus:border-brand-red transition-all duration-700 placeholder:text-white/5 italic"
                />
                <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 text-white/5 group-focus-within:text-brand-red transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div className="space-y-8">
                  <h3 className="text-[10px] uppercase tracking-[0.5em] text-brand-red font-black italic">ACTIVE SIGNALS</h3>
                  <div className="flex flex-wrap gap-3">
                    {['RETRO', 'ELITE', 'VOID CUSTOM', 'ARCHIVE'].map(tag => (
                      <button key={tag} className="px-6 py-2 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-brand-red hover:text-brand-red transition-all bg-white/[0.01]">
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <h3 className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black italic">QUICK UPLINKS</h3>
                  <div className="space-y-6">
                    <Link to="/sale" className="block text-3xl font-display font-black uppercase hover:text-brand-red transition-all italic tracking-tighter">FLASH EXTRACTION %</Link>
                    <Link to="/shop" className="block text-3xl font-display font-black uppercase hover:text-brand-red transition-all italic tracking-tighter">SYSTEM CATALOG</Link>
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
