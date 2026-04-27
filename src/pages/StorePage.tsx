import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { ShoppingBag, User, ArrowLeft, Loader2, Package, Search, X, Filter } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firebaseUtils';
import { useAuth } from '@/src/context/AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'Jersey' | 'Pants' | 'Embroidery' | 'OnSale' | 'Accessories';
  imageUrl?: string;
}

const CATEGORIES = ['All', 'Jersey', 'Pants', 'Embroidery', 'OnSale', 'Accessories'];

export const StorePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return unsubscribe;
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-t-2 border-brand-red rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-12 relative">
      {/* Header / Nav */}
      <nav className="flex justify-between items-center mb-16 relative z-50">
        <button 
          onClick={() => navigate('/')}
          className="text-white/40 hover:text-white flex items-center gap-2 transition-colors uppercase text-xs tracking-widest z-10"
        >
          <ArrowLeft className="w-4 h-4" /> Return
        </button>

        <h1 className="text-3xl font-display font-black tracking-tighter absolute left-1/2 -translate-x-1/2 whitespace-nowrap gothic-glow">WH1RLPOOL</h1>

        <div className="flex gap-4 md:gap-6 z-10 items-center">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-white/40 hover:text-white transition-all transform hover:scale-110"
          >
            {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          <button className="text-white/40 hover:text-white transition-all transform hover:scale-110"><ShoppingBag className="w-5 h-5" /></button>
          <button className="text-white/40 hover:text-white transition-all transform hover:scale-110" onClick={() => navigate('/login')} title={user?.email || 'Login'}>
            <User className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Liquid Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-w-xl mx-auto mb-12 overflow-hidden"
          >
            <div className="relative group">
              <input 
                type="text" 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Searching the void..."
                className="w-full bg-white/5 border-none py-6 px-8 rounded-full focus:ring-2 focus:ring-brand-red/30 transition-all text-xl font-display tracking-tight placeholder:text-white/10"
              />
              <div className="absolute inset-0 bg-brand-red/5 blur-xl -z-10 group-focus-within:opacity-100 opacity-0 transition-opacity rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all duration-500 border ${
                selectedCategory === cat 
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <header className="text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.5em] text-brand-red font-bold animate-pulse">Catalog 2026</span>
          <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase italic py-2">
            {selectedCategory === 'All' ? 'The Void' : selectedCategory}
          </h2>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, i) => (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] bg-white/5 border border-white/10 relative overflow-hidden mb-6 liquid-shadow group-hover:border-brand-red/30 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110" />
                    ) : (
                      <div className="w-24 h-24 text-white/5 relative">
                        <Package className="w-full h-full" />
                        <div className="absolute inset-0 bg-brand-red/10 blur-2xl animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 z-20 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button className="w-full bg-brand-red text-white hover:bg-brand-red/80 border-none shadow-lg shadow-brand-red/20">Add to Terminal</Button>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight mb-1 group-hover:text-brand-red transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{product.category} / {product.stock > 0 ? `${product.stock} Units Left` : "Exhausted"}</p>
                  </div>
                  <span className="text-sm font-mono text-white/60 tracking-tighter">${product.price.toFixed(2)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-32 text-center space-y-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-32 h-32 mb-8 relative">
                   <div className="absolute inset-0 liquid-shape bg-white/5 animate-spin-slow" />
                   <Package className="absolute inset-0 m-auto w-12 h-12 text-white/10" />
                </div>
                <h3 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic text-white/20">It's Empty..</h3>
                <p className="text-white/10 text-xs uppercase tracking-[0.4em] mt-4">The void awaits its next drop.</p>
              </motion.div>
            </div>
          )}
        </div>
        
        <footer className="text-center py-24 border-t border-white/5 space-y-8">
          <div className="flex justify-center flex-col items-center gap-6">
             <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">Establishing connection</span>
             <h3 className="text-3xl font-display font-bold uppercase tracking-tighter">Support Terminal</h3>
             <div className="flex gap-6">
                <Button variant="outline" className="rounded-full" onClick={() => navigate('/support')}>Contact Support</Button>
                <Button variant="outline" className="rounded-full" onClick={() => window.open('https://instagram.com/wh1rlpool.in', '_blank')}>Instagram</Button>
             </div>
          </div>
        </footer>
      </div>

      {/* Floating decorative elements */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 liquid-shape bg-brand-red/5 blur-3xl pointer-events-none -z-10" />
      <div className="fixed -top-24 -right-24 w-96 h-96 liquid-shape bg-white/5 blur-3xl pointer-events-none -z-10" />
    </div>
  );
};
