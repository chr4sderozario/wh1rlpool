import React, { useState, useEffect } from 'react';
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
  const [address, setAddress] = useState(profile?.address || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState(profile?.preferredPayment || 'online');
  const [transactionId, setTransactionId] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const deliveryFee = paymentMethod === 'cod' ? 50 : 0;
  const finalTotal = total + deliveryFee;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofImage(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleOrder = async () => {
    if (!address || !phoneNumber) {
      alert("Please enter all details");
      return;
    }

    if (paymentMethod === 'online' && (!transactionId || !proofImage)) {
      alert("Please provide Transaction ID and Screenshot for verification.");
      return;
    }

    if (paymentMethod === 'balance' && (profile?.balance || 0) < total) {
      alert("Insufficient Void Balance.");
      return;
    }

    setIsProcessing(true);

    try {
      let imageUrl = '';
      if (proofImage) {
        // In a real app, upload to storage. 
        // Here we simulate and use the preview or a placeholder.
        imageUrl = proofPreview; 
      }

      const status = paymentMethod === 'online' ? 'verifying' : 'pending';

      await addDoc(collection(db, 'orders'), {
        userId: user?.uid || 'anonymous',
        customerName: profile?.displayName || 'Guest',
        items: cartItems,
        total: finalTotal,
        deliveryFee,
        address,
        phoneNumber,
        paymentMethod,
        paymentDetails: paymentMethod === 'online' ? { transactionId, proofUrl: imageUrl } : null,
        status,
        estimatedDelivery: 'APPROX 13 DAYS',
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
          className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic mb-4">
          {paymentMethod === 'online' ? 'Verification Initiated' : 'Transmission Successful'}
        </h1>
        <p className="text-white/40 mb-12 max-w-md">
          {paymentMethod === 'online' 
            ? 'Our oracles are currently verifying your transfer. Please allow 1-6 hours for identity confirmation.' 
            : 'Your artifact has been queued for extraction. You will receive a notification once the courier is dispatched.'}
        </p>
        <div className="flex flex-col gap-4">
          <Button onClick={() => navigate('/orders')} className="rounded-full px-12 h-16 bg-white text-black">Track Order</Button>
          <Button onClick={() => navigate('/')} variant="ghost" className="text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-white">Return to Void</Button>
        </div>
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
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Order Details */}
          <div className="space-y-12">
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none">Extraction Parameters</h2>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
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

            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-4">
               <div className="flex justify-between text-white/40 text-[10px] uppercase font-black tracking-widest leading-loose">
                  <span>Subtotal</span>
                  <span>₹ {total}</span>
               </div>
               <div className="flex justify-between text-white/40 text-[10px] uppercase font-black tracking-widest leading-loose">
                  <span>Shipping</span>
                  <span className="text-green-500">FREE</span>
               </div>
               {deliveryFee > 0 && (
                 <div className="flex justify-between text-brand-red text-[10px] uppercase font-black tracking-widest leading-loose">
                    <span>COD Extraction Fee</span>
                    <span>₹ {deliveryFee}</span>
                 </div>
               )}
               <div className="h-[1px] bg-white/10 my-4" />
               <div className="flex justify-between text-4xl font-display font-black tracking-tighter italic">
                  <span>TOTAL</span>
                  <span className="text-brand-red">₹ {finalTotal}</span>
               </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/[0.03] border border-white/5 rounded-[4rem] p-10 md:p-16 space-y-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 blur-[100px] pointer-events-none" />
             
             <div className="space-y-10">
                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-white/40">
                      <MapPin className="w-4 h-4 text-brand-red" /> Destination Coordinates
                   </label>
                   <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full shipping address, state, and pincode..."
                    className="w-full h-32 bg-black border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:border-brand-red transition-all"
                   />
                </div>

                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-white/40">
                      <Phone className="w-4 h-4 text-brand-red" /> Critical Contact Number
                   </label>
                   <input 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="w-full bg-black border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:border-brand-red transition-all"
                   />
                </div>

                <div className="space-y-6">
                   <label className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-white/40">
                      <CreditCard className="w-4 h-4 text-brand-red" /> Payment Encryption Protocol
                   </label>
                   
                   {paymentMethod === 'cod' && (
                     <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-orange-500 animate-pulse">
                        ⚠️ WARNING: Cash on Delivery incurs a ₹50 extraction surcharge. Switch to Online UPI for free shipping.
                     </div>
                   )}

                   <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: 'online', label: 'Online UPI (Recommended)', sub: 'Fast verification' },
                        { id: 'balance', label: 'Void Balance', sub: `Available: ₹${profile?.balance || 0}` },
                        { id: 'cod', label: 'Cash On Delivery', sub: '+₹50 Fee' }
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-6 rounded-3xl border flex items-center justify-between text-left transition-all ${
                            paymentMethod === method.id ? 'bg-white text-black border-white' : 'bg-black text-white/40 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest">{method.label}</p>
                            <p className="text-[9px] uppercase font-black opacity-50">{method.sub}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === method.id ? 'border-black bg-black' : 'border-white/10'}`} />
                        </button>
                      ))}
                   </div>
                </div>

                {paymentMethod === 'online' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6"
                  >
                    <div className="text-center space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">SCAN & PAY THE TOTAL (₹{finalTotal})</p>
                      <div className="bg-white p-4 rounded-3xl w-48 h-48 mx-auto">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WH1RLPOOL_PAYMENT" className="w-full h-full grayscale" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <input 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="ENTER TRANSACTION ID"
                        className="w-full bg-black border border-white/10 rounded-2xl p-5 text-[10px] font-black tracking-widest text-center uppercase focus:border-brand-red focus:outline-none"
                      />
                      <label className="block w-full cursor-pointer">
                        <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl p-5 text-center transition-all hover:bg-white/10">
                          <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                            {proofImage ? 'PROOF UPLOADED ✓' : 'UPLOAD SCREENSHOT'}
                          </p>
                        </div>
                        <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                      </label>
                    </div>
                  </motion.div>
                )}
             </div>

             <Button 
              onClick={handleOrder}
              disabled={isProcessing}
              className="w-full h-24 text-xl rounded-[2.5rem] bg-brand-red text-white hover:bg-white hover:text-black transition-all duration-700 font-black group"
             >
                <div className="flex items-center justify-center gap-4">
                  <span className="italic">{isProcessing ? 'PROCESSING...' : 'INITIALIZE EXTRACTION'}</span>
                  <Package className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform" />
                </div>
             </Button>
             
             <p className="text-center text-[9px] uppercase font-black tracking-[0.4em] text-white/10 italic">
                Extraction window: {paymentMethod === 'online' ? 'Verifies in 1-6h' : 'Est. 13 Days'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
