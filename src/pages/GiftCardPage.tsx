import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Gift, 
  ChevronRight, 
  ShieldCheck, 
  Info,
  Copy,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';

export const GiftCardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasedCode, setPurchasedCode] = useState<string | null>(null);

  const handleCreateRequest = async () => {
    if (!amount || parseFloat(amount) < 100) {
      alert("MINIMUM GIFT VALUE: ₹100");
      return;
    }
    setStep(2);
  };

  const handleSubmitProof = async () => {
    if (!transactionId || transactionId.length < 8) {
      alert("VALID TRANSACTION ID REQUIRED.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In this specialized flow, we create a balance request specifically for a gift card
      // Or we can just create a 'gift_card_request'
      await fetch('/api/gift_card_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          userName: user?.displayName || user?.email,
          amount: parseFloat(amount),
          transactionId,
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      });
      
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("SUBMISSION FAILED. SYSTEM OFFLINE.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const amounts = ['500', '1000', '2000', '5000'];

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center space-y-4 mb-20">
           <motion.div 
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-24 h-24 rounded-[2rem] bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mx-auto mb-8"
           >
              <Gift className="w-12 h-12 text-brand-red" />
           </motion.div>
           <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-none">Gift Voucher</h1>
           <p className="text-white/40 font-serif italic text-lg">Generate stored value for other subjects in the void.</p>
           <div className="pt-8">
              <Button onClick={() => navigate('/checkout')} variant="outline" className="text-[10px] uppercase font-black tracking-widest border-white/20 h-12 rounded-full px-8 hover:bg-white hover:text-black transition-all">
                RAID CHECKOUT TO REDEEM →
              </Button>
           </div>
        </header>

        <div className="bg-[#080808] border border-white/5 rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
           <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                   <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 text-center">Select Voucher Value</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {amounts.map(a => (
                            <button 
                              key={a}
                              onClick={() => setAmount(a)}
                              className={`p-8 rounded-3xl border transition-all ${amount === a ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                            >
                               <span className="text-xl font-display font-black tracking-tighter italic">₹ {a}</span>
                            </button>
                         ))}
                      </div>
                      <div className="relative">
                         <input 
                           type="number"
                           placeholder="OTHER AMOUNT (₹)"
                           value={amount}
                           onChange={e => setAmount(e.target.value)}
                           className="w-full h-20 bg-white/5 border border-white/10 rounded-3xl px-10 text-center text-2xl font-display font-black tracking-widest focus:outline-none focus:border-brand-red transition-all"
                         />
                      </div>
                   </div>

                   <Button onClick={handleCreateRequest} className="w-full h-24 rounded-[2.5rem] bg-brand-red text-white font-black text-xl hover:bg-white hover:text-black transition-all">
                      CONTINUE TO PAYMENT <ChevronRight className="w-6 h-6 inline ml-2" />
                   </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                   <div className="flex flex-col items-center gap-8">
                      <div className="p-8 bg-white rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                         <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=8240515833@fam%26pn=WH1RLPOOL%26cu=INR" className="w-48 h-48 grayscale" />
                      </div>
                      <div className="text-center space-y-4">
                         <p className="text-2xl font-display font-black italic tracking-tighter">TOTAL: ₹{amount}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-brand-red">UPI: 8240515833@fam</p>
                         <p className="text-[9px] font-black uppercase tracking-widest text-white/30 italic max-w-xs mx-auto">
                            SEND SCREENSHOT TO WHATSAPP FOR QUARTER-SECOND SYNC: <br/>
                            <span className="text-white">+91 82405 15833</span>
                         </p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                         <div className="flex items-center gap-4 text-brand-red">
                            <ShieldCheck className="w-5 h-5" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Verification Protocol</p>
                         </div>
                         <input 
                           placeholder="ENTER TRANSACTION ID"
                           value={transactionId}
                           onChange={e => setTransactionId(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-center text-xs font-black tracking-[0.2em] focus:outline-none focus:border-brand-red"
                         />
                      </div>

                      <Button 
                        disabled={isSubmitting}
                        onClick={handleSubmitProof} 
                        className="w-full h-24 rounded-[2.5rem] bg-white text-black font-black text-xl hover:bg-brand-red hover:text-white transition-all"
                      >
                         {isSubmitting ? 'UPLOADING...' : 'SUBMIT FOR APPROVAL'}
                      </Button>
                   </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-12 py-12"
                >
                   <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-12 h-12 text-green-500 animate-pulse" />
                   </div>
                   <div className="space-y-6">
                      <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic">REQUEST SEALED</h2>
                      <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed uppercase font-black tracking-widest text-[10px]">Your generation request is being verified. FOR INSTANT SYNC, SEND SCREENSHOT TO +91 82405 15833 IN WHATSAPP. Once approved, the code will be sent to your terminal.</p>
                   </div>
                   <Button onClick={() => navigate('/profile')} className="w-full h-16 rounded-3xl bg-white/5 border border-white/10 font-black hover:bg-white hover:text-black transition-all">RETURN TO TERMINAL</Button>
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 flex items-start gap-6">
              <Info className="w-6 h-6 text-brand-red shrink-0" />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest mb-2">Non-Refundable</p>
                 <p className="text-[10px] text-white/30 uppercase tracking-widest leading-loose">Vouchers once materialized cannot be reverted back to credits.</p>
              </div>
           </div>
           <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 flex items-start gap-6">
              <ShieldCheck className="w-6 h-6 text-brand-red shrink-0" />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest mb-2">Universal Sink</p>
                 <p className="text-[10px] text-white/30 uppercase tracking-widest leading-loose">Can be redeemed by any subject possessing the sequence.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
