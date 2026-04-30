import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Heart, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  name: string;
  price: number;
  imageUrl: string;
}

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`/api/wishlist?userId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
    const interval = setInterval(fetchWishlist, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const removeItem = async (id: string) => {
    if (!user) return;
    try {
      await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-12">
        <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter uppercase italic py-2">Restricted Archive</h1>
        <Button onClick={() => navigate('/login')} className="h-16 px-12 rounded-full font-black">LOGIN TERMINAL</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-32 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto space-y-20">
        
        <header className="space-y-4">
           <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic">SAVED UNITS</h1>
           <p className="text-white/20 uppercase tracking-[0.4em] text-[10px] font-black">{items.length} ARCHIVED ARTIFACTS</p>
        </header>

        {items.length === 0 ? (
          <div className="text-center space-y-12 py-20">
             <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center mx-auto opacity-20">
                <Heart className="w-8 h-8" />
             </div>
             <p className="text-white/40 italic font-serif text-xl">The archive is empty. Begin harvesting.</p>
             <Button onClick={() => navigate('/shop')} className="h-16 px-12 rounded-full font-black group">
                <span className="flex items-center gap-4">EXPLORE SHOP <ArrowRight className="group-hover:translate-x-2 transition-transform" /></span>
             </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="group relative"
                >
                   <Link to={`/product/${item.productId}`}>
                      <div className="aspect-[4/5] rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 overflow-hidden relative group-hover:border-brand-red/30 transition-all duration-700">
                         <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                         
                         <div className="absolute bottom-8 left-8 right-8 space-y-2 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                            <h3 className="text-xl font-display font-black tracking-tighter uppercase italic leading-none">{item.name}</h3>
                            <p className="text-brand-red font-black tracking-tighter">₹ {item.price}</p>
                         </div>
                      </div>
                   </Link>

                   <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-brand-red transition-all"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => navigate(`/product/${item.productId}`)}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-brand-red hover:text-white transition-all"
                      >
                         <ShoppingCart className="w-5 h-5" />
                      </button>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
