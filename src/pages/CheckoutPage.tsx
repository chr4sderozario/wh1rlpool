import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
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
  const [giftCardCode, setGiftCardCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const deliveryFee = paymentMethod === 'cod' ? 50 : 0;
  const finalTotal = Math.max(0, total + deliveryFee - discountAmount);

  const handleRedeemGiftCard = async () => {
    const code = giftCardCode.trim().toUpperCase();
    if (!code) return;
    setIsRedeeming(true);
    
    try {
      if (code === 'ADMINABUSE') {
        // Calculate 50 rupees discount per clothing item
        // In our store, specifically jerseys are clothing. 
        // We'll count all items as clothing for this implementation as they are jerseys.
        const totalItems = cartItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
        const discount = totalItems * 50;
        setDiscountAmount(discount);
        alert(`VOID OVERRIDE: ₹${discount} discount applied via ADMINABUSE protocol.`);
        setGiftCardCode('');
        return;
      }

      const res = await fetch(`/api/gift_cards?code=${code}&status=active&limit=1`);
      const data = await res.json();
      
      if (data.length === 0) {
        alert("Invalid or already redeemed sequence.");
      } else {
        const giftCard = data[0];
        const amount = giftCard.amount;
        
        // Mark as redeemed
        await fetch(`/api/gift_cards/${giftCard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'redeemed',
            redeemedBy: user?.uid || 'guest',
            redeemedAt: new Date().toISOString()
          })
        });
        
        // Add to user balance
        if (user) {
          const profileRes = await fetch(`/api/user_profiles?userId=${user.uid}`);
          const profileData = await profileRes.json();
          if (profileData.length > 0) {
            const p = profileData[0];
            await fetch(`/api/user_profiles/${p.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ balance: (p.balance || 0) + amount })
            });
          }
          alert(`Success! ₹${amount} injected into your account balance.`);
        } else {
          setDiscountAmount(prev => prev + amount);
          alert(`Success! ₹${amount} discount applied to this order.`);
        }
        setGiftCardCode('');
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed.");
    } finally {
      setIsRedeeming(false);
    }
  };

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

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'anonymous',
          customerName: profile?.displayName || 'Guest',
          items: cartItems,
          total: finalTotal,
          discount: discountAmount,
          deliveryFee,
          address,
          phoneNumber,
          paymentMethod,
          paymentDetails: paymentMethod === 'online' ? { transactionId, proofUrl: imageUrl } : null,
          status,
          estimatedDelivery: 'APPROX 13 DAYS',
          createdAt: new Date().toISOString()
        })
      });

      // Update User Profile for Loyalty Program
      if (user) {
        const profileRes = await fetch(`/api/user_profiles?userId=${user.uid}`);
        const profileData = await profileRes.json();
        if (profileData.length > 0) {
          const p = profileData[0];
          const pointsEarned = Math.floor(finalTotal / 100);
          
          await fetch(`/api/user_profiles/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              totalSpending: (p.totalSpending || 0) + finalTotal,
              loyaltyPoints: (p.loyaltyPoints || 0) + pointsEarned,
              wh1rlCoins: (p.wh1rlCoins || 0) + Math.floor(finalTotal),
              balance: paymentMethod === 'balance' ? (p.balance || 0) - finalTotal : (p.balance || 0)
            })
          });
        }
      }

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
        <p className="text-white/40 mb-12 max-w-sm mx-auto uppercase text-[10px] font-black tracking-widest leading-loose">
          {paymentMethod === 'online' 
            ? 'Oracles are verifying your signature. FOR FASTER VALIDATION, SEND TRANSACTION PROOF TO WHATSAPP: +91 82405 15833.' 
            : 'Your artifact has been queued. Delivery will commence shortly. Extraction sequence completed.'}
        </p>
        <div className="flex flex-col gap-4">
          <Button onClick={() => navigate('/orders')} className="rounded-full px-12 h-16 bg-white text-black">Track Order</Button>
          <Button onClick={() => navigate('/')} variant="ghost" className="text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-white">Return to Void</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-32 px-4 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex items-center justify-between mb-8 md:mb-16">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-all uppercase text-[8px] md:text-[10px] font-black tracking-widest"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> Cancel
          </button>
          <div className="flex gap-4">
             <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${step >= 1 ? 'bg-brand-red' : 'bg-white/10'}`} />
             <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${step >= 2 ? 'bg-brand-red' : 'bg-white/10'}`} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {/* Order Details */}
          <div className="space-y-8 md:space-y-12">
            <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter uppercase italic leading-none">Parameters</h2>
            
            <div className="space-y-4 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
               {cartItems.map((item: any, i: number) => (
                 <div key={i} className="flex gap-4 md:gap-6 p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl">
                    <img src={item.imageUrl} className="w-16 h-20 md:w-20 md:h-24 object-cover rounded-lg md:rounded-xl" alt={item.name} />
                    <div className="flex-1">
                       <h4 className="font-bold uppercase text-xs md:text-sm mb-1 line-clamp-1">{item.name}</h4>
                       <p className="text-[9px] md:text-[10px] text-white/20 uppercase font-black">Size: {item.size} | Qty: {item.quantity}</p>
                       <p className="text-brand-red font-bold mt-2 text-sm">₹ {item.price}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[3rem] space-y-4">
               <div className="flex justify-between text-white/40 text-[9px] md:text-[10px] uppercase font-black tracking-widest leading-loose">
                  <span>Subtotal</span>
                  <span>₹ {total}</span>
               </div>
               <div className="flex justify-between text-white/40 text-[9px] md:text-[10px] uppercase font-black tracking-widest leading-loose">
                  <span>Shipping</span>
                  <span className="text-green-500 font-bold">FREE</span>
               </div>
               {deliveryFee > 0 && (
                 <div className="flex justify-between text-brand-red text-[9px] md:text-[10px] uppercase font-black tracking-widest leading-loose">
                    <span>COD Fee</span>
                    <span>₹ {deliveryFee}</span>
                 </div>
               )}
               <div className="h-[1px] bg-white/10 my-2 md:my-4" />
               <div className="flex justify-between text-3xl md:text-4xl font-display font-black tracking-tighter italic">
                  <span>TOTAL</span>
                  <span className="text-brand-red">₹ {finalTotal}</span>
               </div>

               {/* Gift Card Redemption UI */}
               <div className="pt-6 mt-4 border-t border-white/5 space-y-4">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">VOUCHER INJECTION</p>
                  <div className="flex gap-3">
                     <input 
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black tracking-widest focus:outline-none focus:border-brand-red"
                     />
                     <Button 
                        onClick={handleRedeemGiftCard}
                        disabled={isRedeeming || !giftCardCode}
                        className="bg-white text-black hover:bg-brand-red hover:text-white px-6 rounded-xl text-[10px] h-auto py-3 font-black"
                     >
                        {isRedeeming ? '...' : 'REDEEM'}
                     </Button>
                  </div>
               </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 space-y-10 md:space-y-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 blur-[100px] pointer-events-none" />
             
             <div className="space-y-8 md:space-y-10">
                <div className="space-y-3 md:space-y-4">
                   <label className="flex items-center gap-3 text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white/40">
                      <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-red" /> Destination
                   </label>
                   <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shipping address, state, and pincode..."
                    className="w-full h-24 md:h-32 bg-black border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-xs md:text-sm focus:outline-none focus:border-brand-red transition-all"
                   />
                </div>

                <div className="space-y-3 md:space-y-4">
                   <label className="flex items-center gap-3 text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white/40">
                      <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-red" /> Contact Number
                   </label>
                   <input 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="w-full bg-black border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-xs md:text-sm focus:outline-none focus:border-brand-red transition-all"
                   />
                </div>

                <div className="space-y-6">
                   <label className="flex items-center gap-3 text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white/40">
                      <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-red" /> Payment Protocol
                   </label>
                   
                   {paymentMethod === 'cod' && (
                     <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-orange-500">
                        ⚠️ WARNING: COD Fee ₹50. Switch to Online for free acquisition.
                     </div>
                   )}

                   <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {[
                        { id: 'online', label: 'Online UPI', sub: 'Instant Sync' },
                        { id: 'balance', label: 'Void Balance', sub: `₹${profile?.balance || 0}` },
                        { id: 'cod', label: 'Cash On Delivery', sub: '+₹50 Surcharge' }
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border flex items-center justify-between text-left transition-all ${
                            paymentMethod === method.id ? 'bg-white text-black border-white' : 'bg-black text-white/40 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div>
                            <p className="text-[11px] md:text-xs font-black uppercase tracking-widest">{method.label}</p>
                            <p className="text-[8px] md:text-[9px] uppercase font-black opacity-50">{method.sub}</p>
                          </div>
                          <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 ${paymentMethod === method.id ? 'border-black bg-black' : 'border-white/10'}`} />
                        </button>
                      ))}
                   </div>
                </div>

                {paymentMethod === 'online' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] space-y-6"
                  >
                    <div className="text-center space-y-4">
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">UPI: <span className="text-brand-red">8240515833@fam</span></p>
                      <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl w-40 h-40 md:w-48 md:h-48 mx-auto">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=8240515833@fam%26pn=WH1RLPOOL%26cu=INR" className="w-full h-full grayscale" />
                      </div>
                      <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/30 max-w-[180px] mx-auto italic">
                        WhatsApp screenshot for instant sync: <br/>
                        <span className="text-white">+91 82405 15833</span>
                      </p>
                    </div>
                    
                    <div className="space-y-3 md:space-y-4">
                      <input 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="TRANSACTION ID"
                        className="w-full bg-black border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-[9px] md:text-[10px] font-black tracking-widest text-center uppercase focus:border-brand-red focus:outline-none"
                      />
                      <label className="block w-full cursor-pointer">
                        <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-xl md:rounded-2xl p-4 md:p-5 text-center transition-all hover:bg-white/10">
                          <p className="text-[9px] md:text-[10px] font-black tracking-widest text-white/40 uppercase">
                            {proofImage ? 'UPLOADED ✓' : 'UPLOAD SCREENSHOT'}
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
              className="w-full h-16 md:h-24 text-lg md:text-xl rounded-2xl md:rounded-[2.5rem] bg-brand-red text-white hover:bg-white hover:text-black transition-all duration-700 font-black group"
             >
                <div className="flex items-center justify-center gap-4">
                  <span className="italic">{isProcessing ? 'PROCESSING...' : 'INITIALIZE'}</span>
                  <Package className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-y-[-2px] transition-transform" />
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
