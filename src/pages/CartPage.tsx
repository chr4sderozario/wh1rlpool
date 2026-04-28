import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  CreditCard, 
  Wallet, 
  Truck,
  ArrowRight,
  ShieldCheck,
  Phone
} from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  imageUrl: string;
}

export const CartPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const cartRef = collection(db, 'users', user.uid, 'cart');
    const unsub = onSnapshot(cartRef, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as CartItem)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const itemRef = doc(db, 'users', user!.uid, 'cart', id);
      await updateDoc(itemRef, { quantity: newQty });
    } catch (err) { console.error(err); }
  };

  const removeItem = async (id: string) => {
    try {
      const itemRef = doc(db, 'users', user!.uid, 'cart', id);
      await deleteDoc(itemRef);
    } catch (err) { console.error(err); }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Shipping calculated in checkout

  const proceedToCheckout = () => {
     navigate('/checkout', { state: { cartItems: items, total } });
  };

  if (loading) return (
     <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-brand-red rounded-full animate-spin" />
     </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-12 pb-32">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-40 h-40 rounded-[3rem] border border-white/5 flex items-center justify-center bg-white/[0.02]"
        >
          <ShoppingBag className="w-16 h-16 text-white/10" />
        </motion.div>
        <div className="text-center space-y-6 max-w-sm">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic">ARCHIVE LOCKED</h1>
          <p className="text-white/30 uppercase tracking-[0.4em] text-[10px] font-black leading-relaxed">Authentication required to sync your artifacts across the void.</p>
          <Button onClick={() => navigate('/login')} className="w-full h-16 rounded-full font-black scale-110">INITIALIZE LOGIN</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black px-6 md:px-12 flex flex-col items-center justify-center text-center space-y-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.05, y: 0 }}
          className="text-8xl md:text-[15rem] font-display font-black tracking-tighter uppercase italic leading-none absolute pointer-events-none"
        >
           EMPTY<br/>VOID
        </motion.h1>
        <div className="relative z-10 space-y-8">
           <p className="text-xl md:text-3xl font-serif italic text-white/40">The archive is currently quiet.</p>
           <Button onClick={() => navigate('/shop')} className="h-20 px-12 rounded-full text-lg font-black group overflow-hidden relative">
             <span className="relative z-10 flex items-center gap-4">SCAN MARKETPLACE <ArrowRight className="group-hover:translate-x-2 transition-transform" /></span>
             <div className="absolute inset-0 bg-brand-red translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-32 px-6 md:px-24">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-32">
          
          {/* Main List */}
          <div className="flex-1 space-y-16">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
              <div>
                <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-6">THE ARCHIVE</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">ARTIFACT EXTRACTION QUEUE: {items.length} UNITS</p>
              </div>
              <button 
                onClick={() => navigate('/shop')}
                className="text-[10px] font-black uppercase tracking-widest text-brand-red hover:underline decoration-2 underline-offset-8"
              >
                CONTINUE ACQUISITION
              </button>
            </header>

            <div className="grid grid-cols-1 gap-12">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col md:flex-row gap-12 p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="w-full md:w-48 aspect-[3/4] rounded-[2rem] overflow-hidden bg-black shrink-0 shadow-2xl relative">
                       <img 
                         src={item.imageUrl} 
                         className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                         referrerPolicy="no-referrer"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-4">
                       <div className="space-y-4">
                          <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <h3 className="text-2xl md:text-4xl font-display font-black uppercase italic tracking-tight">{item.name}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                                   <span>Artifact ID: {item.productId.slice(-8)}</span>
                                   <span className="w-1 h-1 bg-white/10 rounded-full" />
                                   <span className="text-brand-red">Size: {item.size}</span>
                                </div>
                             </div>
                             <button 
                               onClick={() => removeItem(item.id)}
                               className="p-4 rounded-2xl bg-white/5 text-white/20 hover:bg-brand-red/10 hover:text-brand-red transition-all"
                             >
                                <Trash2 className="w-6 h-6" />
                             </button>
                          </div>
                       </div>

                       <div className="flex flex-wrap items-center justify-between gap-8 mt-12 bg-black/40 p-6 rounded-3xl border border-white/5">
                          <div className="flex items-center gap-8">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Quantity</p>
                             <div className="flex items-center gap-6">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                   <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-2xl font-display font-black italic tabular-nums w-8 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                   <Plus className="w-4 h-4" />
                                </button>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Sub-Total</p>
                             <p className="text-3xl font-display font-black italic tracking-tighter text-brand-red">₹ {item.price * item.quantity}</p>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Checkout Summary */}
          <aside className="w-full xl:w-[500px] shrink-0">
             <div className="sticky top-40 bg-[#080808] border border-white/5 rounded-[4rem] p-12 md:p-16 space-y-12">
                <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter">SUMMARY</h2>
                
                <div className="space-y-6">
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/40">
                      <span>Artifact Value</span>
                      <span className="text-white">₹ {subtotal}</span>
                   </div>
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/40">
                      <span>Logistics Tax</span>
                      <span className="text-green-500">OPTIMIZED</span>
                   </div>
                   <div className="h-[1px] bg-white/5 my-4" />
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-red mb-1">TOTAL ACQUISITION</p>
                         <p className="text-5xl font-display font-black italic tracking-tighter tabular-nums">₹ {total}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 pt-8">
                   <Button 
                     onClick={proceedToCheckout}
                     className="w-full h-24 text-xl rounded-[2.5rem] bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-black group relative overflow-hidden"
                   >
                      <div className="relative z-10 flex items-center justify-center gap-4">
                         PROCEED TO EXTRACTION
                         <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </div>
                      <div className="absolute inset-0 bg-brand-red translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                   </Button>
                   <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-white/10 px-8">
                      Secure payment request will be generated at the next step of the protocol.
                   </p>
                </div>

                {/* Tactical Features */}
                <div className="pt-12 grid grid-cols-2 gap-4">
                   <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                      <Truck className="w-5 h-5 text-brand-red" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Stealth Shipment</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                      <Wallet className="w-5 h-5 text-brand-red" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Multi-Chain Pay</p>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const PaymentMethod = ({ id, label, desc, icon, active, onClick }: { id: string, label: string, desc: string, icon: any, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-6 p-6 rounded-3xl border transition-all duration-500 text-left ${
      active ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white hover:border-white/30'
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-black text-white' : 'bg-white/5 text-white/40'}`}>
       {icon}
    </div>
    <div>
       <h4 className="text-xs font-black uppercase tracking-widest">{label}</h4>
       <p className={`text-[10px] uppercase tracking-tighter font-bold ${active ? 'text-black/60' : 'text-white/20'}`}>{desc}</p>
    </div>
    {active && (
      <div className="ml-auto w-4 h-4 rounded-full bg-brand-red animate-pulse" />
    )}
  </button>
);
