import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  CreditCard, 
  Package, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const { cartItems, total } = location.state || { cartItems: [], total: 0 };

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleOrder = async () => {
    if (!address || !phoneNumber) {
      alert("Please enter all details");
      return;
    }
    setIsProcessing(true);

    try {
      // Logic to save order to Firestore
      await addDoc(collection(db, 'orders'), {
        userId: user?.uid || 'anonymous',
        customerName: profile?.displayName || 'Guest',
        items: cartItems,
        total,
        address,
        phoneNumber,
        paymentMethod,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setOrderComplete(true);
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic mb-4">Transmission Successful</h1>
        <p className="text-white/40 mb-12 max-w-md">Your artifact has been queued for extraction. You will receive a notification once the courier is dispatched.</p>
        <Button onClick={() => navigate('/')} className="rounded-full px-12 h-16">Return to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-32 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex items-center justify-between mb-16">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-all uppercase text-[10px] font-black tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel Extraction
          </button>
          <div className="flex gap-4">
             <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-brand-red' : 'bg-white/10'}`} />
             <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-brand-red' : 'bg-white/10'}`} />
             <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-brand-red' : 'bg-white/10'}`} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Order Details */}
          <div className="space-y-12">
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none">Extraction Parameters</h2>
            
            <div className="space-y-4">
               {cartItems.map((item: any, i: number) => (
                 <div key={i} className="flex gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <img src={item.imageUrl} className="w-20 h-24 object-cover rounded-xl" alt={item.name} />
                    <div className="flex-1">
                       <h4 className="font-bold uppercase text-sm mb-1">{item.name}</h4>
                       <p className="text-[10px] text-white/20 uppercase font-black">Size: {item.size} | Qty: {item.quantity}</p>
                       <p className="text-brand-red font-bold mt-2">₹ {item.price}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-8 bg-brand-red/5 border border-brand-red/10 rounded-[3rem] space-y-4">
               <div className="flex justify-between text-white/40 text-xs uppercase font-black">
                  <span>Subtotal</span>
                  <span>₹ {total}</span>
               </div>
               <div className="flex justify-between text-white/40 text-xs uppercase font-black">
                  <span>Shipping</span>
                  <span>FREE</span>
               </div>
               <div className="h-[1px] bg-white/10 my-4" />
               <div className="flex justify-between text-2xl font-black italic">
                  <span>TOTAL</span>
                  <span className="text-brand-red">₹ {total}</span>
               </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/[0.03] border border-white/5 rounded-[4rem] p-10 md:p-16 space-y-12">
             <div className="space-y-8">
                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-white/40">
                      <MapPin className="w-4 h-4" /> Destination Address
                   </label>
                   <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full shipping coordinate..."
                    className="w-full h-32 bg-black border border-white/10 rounded-2xl p-6 text-sm focus:outline-none focus:border-brand-red transition-all"
                   />
                </div>

                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-white/40">
                      <Phone className="w-4 h-4" /> Contact Frequency
                   </label>
                   <input 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="w-full bg-black border border-white/10 rounded-2xl p-6 text-sm focus:outline-none focus:border-brand-red transition-all"
                   />
                </div>

                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-white/40">
                      <CreditCard className="w-4 h-4" /> Payment Protocol
                   </label>
                   <div className="grid grid-cols-2 gap-4">
                      {['upi', 'cod'].map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-6 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                            paymentMethod === method ? 'bg-white text-black border-white' : 'bg-black text-white/20 border-white/10 hover:border-white/30'
                          }`}
                        >
                          {method === 'upi' ? 'Online UPI' : 'Cash on Extraction'}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <Button 
              onClick={handleOrder}
              disabled={isProcessing}
              className="w-full h-24 text-xl rounded-[2.5rem] bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-black group"
             >
                <div className="flex items-center justify-center gap-4">
                  {isProcessing ? 'PROCESSING...' : 'INITIALIZE EXTRACTION'} 
                  <Package className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
             </Button>
             
             <p className="text-center text-[9px] uppercase font-bold tracking-[0.3em] text-white/10">
                Safe Transaction Protocol v8.4.2 Encrypted
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
