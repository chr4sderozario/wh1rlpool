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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | 'balance'>('online');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [address, setAddress] = useState(profile?.address || '');

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
  const shippingFee = paymentMethod === 'cod' ? 100 : 0;
  const total = subtotal + shippingFee;

  const handleCheckout = async () => {
    if (!user) return navigate('/login');
    if (!address) return alert("Please set a delivery coordinates.");
    if (paymentMethod === 'online' && !phoneNumber) return alert("Terminal ID (Phone) required.");
    if (paymentMethod === 'balance' && (profile?.balance || 0) < total) return alert("Insufficient Void Balance.");

    setIsProcessing(true);
    try {
      // Create Order
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userName: profile?.displayName || user.email,
        items: items.map(({ id, ...rest }) => rest),
        total,
        paymentMethod,
        status: 'pending',
        shippingAddress: { address },
        phoneNumber: paymentMethod === 'online' ? phoneNumber : '',
        createdAt: serverTimestamp()
      });

      // If balance, subtract from profile
      if (paymentMethod === 'balance') {
        const profileRef = doc(db, 'users', user.uid, 'public', 'profile');
        await updateDoc(profileRef, {
          balance: (profile?.balance || 0) - total
        });
      }

      // Clear Cart
      for (const item of items) {
        await deleteDoc(doc(db, 'users', user.uid, 'cart', item.id));
      }

      navigate(`/orders`);
      alert(paymentMethod === 'online' ? "Payment request will be sent soon." : "Order Synchronized.");
    } catch (err) {
      console.error(err);
      alert("Transmission Failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-12 pb-32">
        <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center animate-pulse">
          <ShoppingBag className="w-12 h-12 text-white/20" />
        </div>
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter uppercase italic">Access Denied</h1>
          <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Log in to sync your archive.</p>
          <Button onClick={() => navigate('/login')} className="bg-white text-black hover:bg-brand-red hover:text-white px-12 h-16 rounded-full font-black">LOGIN TERMINAL</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black px-6 md:px-12 pt-40 pb-32">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center text-center space-y-12">
          <h1 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase italic py-2 opacity-10">EMPTY VOID</h1>
          <p className="text-white/40 text-xl font-serif italic">Your archive contains no active transmissions.</p>
          <Button onClick={() => navigate('/shop')} className="h-20 px-12 rounded-full text-lg font-black group">
            <span className="flex items-center gap-4">EXPLORE THE ARCHIVE <ArrowRight className="group-hover:translate-x-2 transition-transform" /></span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-32 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-24">
          
          {/* Left: Cart Items */}
          <div className="flex-1 space-y-12">
            <header className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic">YOUR ARCHIVE</h1>
              <p className="text-white/20 uppercase tracking-[0.4em] text-[10px] font-black">{items.length} Artifacts Prepared</p>
            </header>

            <div className="space-y-8">
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  className="flex flex-col sm:flex-row gap-8 pb-8 border-b border-white/5 relative group"
                >
                  <div className="w-32 h-40 rounded-3xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-brand-red/30 transition-all duration-500">
                    <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  
                  <div className="flex-1 space-y-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-display font-bold uppercase tracking-tight">{item.name}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-1">Size: {item.size}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-white/20 hover:text-brand-red transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-6 bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-white/40 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="text-lg font-black w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-white/40 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                      <p className="text-xl font-black tracking-tighter">₹ {(item.price * item.quantity).toString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Checkout Sidebar */}
          <aside className="w-full lg:w-[450px] space-y-12">
            <div className="p-12 rounded-[3.5rem] bg-[#0A0A0A] border border-white/5 space-y-12 sticky top-32">
              <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic">TRANSMISSION SUMMARY</h2>

              {/* Delivery Address */}
              <div className="space-y-6">
                 <h4 className="text-[10px] uppercase font-black tracking-widest text-white/40">Coordinates</h4>
                 <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full shipping coordinates..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-serif italic text-white/60 focus:outline-none focus:border-brand-red transition-all min-h-[120px]"
                 />
              </div>

              {/* Payment Methods */}
              <div className="space-y-8">
                 <h4 className="text-[10px] uppercase font-black tracking-widest text-white/40">Encryption Method</h4>
                 <div className="grid grid-cols-1 gap-4">
                    <PaymentMethod 
                      id="online" 
                      label="Online Payment" 
                      desc="Card/UPI Protocol" 
                      icon={<CreditCard />} 
                      active={paymentMethod === 'online'} 
                      onClick={() => setPaymentMethod('online')} 
                    />
                    <PaymentMethod 
                      id="balance" 
                      label="Void Balance" 
                      desc={`Bal: ₹${profile?.balance?.toFixed(2) || '0.00'}`} 
                      icon={<Wallet />} 
                      active={paymentMethod === 'balance'} 
                      onClick={() => setPaymentMethod('balance')} 
                    />
                    <PaymentMethod 
                      id="cod" 
                      label="COD Artifacts" 
                      desc="+₹100 Courier Tax" 
                      icon={<Truck />} 
                      active={paymentMethod === 'cod'} 
                      onClick={() => setPaymentMethod('cod')} 
                    />
                 </div>

                 {paymentMethod === 'online' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                       <div className="relative">
                          <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input 
                            type="tel"
                            placeholder="Terminal Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs uppercase font-bold tracking-widest focus:outline-none focus:border-brand-red"
                          />
                       </div>
                       <p className="text-[8px] uppercase tracking-widest text-white/20 text-center">Payment request syncs after order.</p>
                    </motion.div>
                 )}
              </div>

              {/* Totals */}
              <div className="space-y-4 pt-8 border-t border-white/5">
                <div className="flex justify-between text-white/40 text-[10px] uppercase font-black tracking-widest">
                  <span>Sub-Archive Value</span>
                  <span>₹ {subtotal}</span>
                </div>
                <div className="flex justify-between text-white/40 text-[10px] uppercase font-black tracking-widest">
                  <span>Courier Tax</span>
                  <span>₹ {shippingFee}</span>
                </div>
                <div className="flex justify-between text-2xl font-black tracking-tighter pt-4">
                  <span className="uppercase italic font-display">TOTAL</span>
                  <span className="text-brand-red gothic-glow">₹ {total}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full h-20 text-lg rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-extrabold group"
              >
                <span className="flex items-center justify-center gap-4">
                  {isProcessing ? 'SYNCHRONIZING...' : 'INITIALIZE ORDER'} 
                  {!isProcessing && <ArrowRight className="group-hover:translate-x-2 transition-transform" />}
                </span>
              </Button>

              <div className="flex items-center justify-center gap-4 pt-6 text-[8px] uppercase tracking-[0.4em] text-white/10">
                 <ShieldCheck className="w-3 h-3" /> Encrypted Transmission Protocol v2.0
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
