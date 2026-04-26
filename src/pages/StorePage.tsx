import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { ShoppingBag, User, ArrowLeft, Loader2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firebaseUtils';
import { useAuth } from '@/src/context/AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export const StorePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-8 py-12">
      <nav className="flex justify-between items-center mb-24 relative">
        <button 
          onClick={() => navigate('/')}
          className="text-white/40 hover:text-white flex items-center gap-2 transition-colors uppercase text-xs tracking-widest z-10"
        >
          <ArrowLeft className="w-4 h-4" /> Return
        </button>
        <h1 className="text-2xl font-display font-black tracking-tighter absolute left-1/2 -translate-x-1/2 whitespace-nowrap">WH1RLPOOL</h1>
        <div className="flex gap-6 z-10">
          <button className="text-white/40 hover:text-white"><ShoppingBag className="w-5 h-5" /></button>
          <button className="text-white/40 hover:text-white" onClick={() => navigate('/login')} title={user?.email || 'Login'}>
            <User className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto space-y-24">
        <header className="text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.5em] text-brand-red font-bold">Catalog 2026</span>
          <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic">The Void Collection</h2>
          <p className="text-white/40 font-serif max-w-xl mx-auto italic">
            Exploring the limits of monochromatic performance wear.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] bg-white/5 border border-white/10 relative overflow-hidden mb-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                   {product.imageUrl ? (
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                   ) : (
                     <Package className="w-12 h-12 text-white/5" />
                   )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                   <div className="text-[10px] uppercase tracking-widest bg-white text-black px-4 py-2 font-bold">Add to Cart</div>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-1">{product.name}</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{product.category} / {product.stock > 0 ? "In Stock" : "Sold Out"}</p>
                </div>
                <span className="text-sm font-mono text-white/60">${product.price.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <p className="text-white/20 text-xs uppercase tracking-[0.3em]">The drop is coming soon. Subscribe for updates.</p>
            </div>
          )}
        </div>
        
        <footer className="text-center py-24 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-4">Phase 1: Deployment</p>
          <div className="flex justify-center flex-col items-center gap-6">
             <h3 className="text-2xl font-display font-bold uppercase tracking-tighter">Join the Collective</h3>
             <Button variant="outline">Subscribe for Early Access</Button>
          </div>
        </footer>
      </div>
    </div>
  );
};
