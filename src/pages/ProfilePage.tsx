import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection, query, where, getDocs, updateDoc, increment, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  CheckCircle, 
  Smartphone, 
  Mail, 
  Wallet,
  Plus,
  ShieldAlert,
  X,
  History,
  Lock,
  Gift,
  Truck,
  Ghost,
  Disc
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/src/lib/firebaseUtils';

export const ProfilePage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    gender: 'unisex',
    preferredSize: 'L',
    profileImage: '',
    preferredPayment: 'online',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipcode: profile.zipcode || '',
        country: profile.country || '',
        gender: profile.gender || 'unisex',
        preferredSize: profile.preferredSize || 'L',
        profileImage: profile.profileImage || '',
        preferredPayment: profile.preferredPayment || 'online',
      });
      setLoading(false);
    } else if (!authLoading && user) {
      setLoading(false);
    }
  }, [user, authLoading, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'public', 'profile'), {
        ...formData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/public/profile`);
    } finally {
      setSaving(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'adminwhirlpool1002919402') {
      navigate('/admin');
    } else {
      alert("UNAUTHORIZED ACCESS DETECTED.");
    }
  };

  const handleRedeemGiftCard = async () => {
    if (!giftCardCode.trim() || !user) return;
    setIsRedeeming(true);
    try {
      // Find the gift card
      const q = query(collection(db, 'gift_cards'), where('code', '==', giftCardCode.trim().toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        alert("INVALID CODE SEQUENCE. AUTHENTICATION FAILED.");
        setIsRedeeming(false);
        return;
      }

      const gcDoc = snap.docs[0];
      const gcData = gcDoc.data();

      if (gcData.status !== 'active') {
        alert("CODE ALREADY DEPLOYED OR SYSTEM LOCKED.");
        setIsRedeeming(false);
        return;
      }

      // Atomically update card and user balance
      // In a real app, use a transaction. Here we'll do sequential updates as it's a demo.
      await updateDoc(doc(db, 'gift_cards', gcDoc.id), {
        status: 'redeemed',
        redeemedBy: user.uid,
        redeemedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', user.uid, 'public', 'profile'), {
        balance: increment(gcData.amount)
      });

      alert(`SUCCESS: ₹${gcData.amount} INJECTED INTO VOID BALANCE.`);
      setGiftCardCode('');
    } catch (err) {
      console.error(err);
      alert("SYNC ERROR. TRY AGAIN LATER.");
    } finally {
      setIsRedeeming(false);
    }
  };
  const handleSpinTheWin = async () => {
    if (!user || (profile?.wh1rlCoins || 0) < 500) {
      alert("INSUFFICIENT WH1RL COINS. EXTRACT MORE ARTIFACTS.");
      return;
    }

    setIsSpinning(true);
    setSpinResult(null);

    // Simulate spin delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const roll = Math.random();
    let result = "TRY AGAIN";
    let rewardType = 'none';

    if (roll < 0.05) {
      result = "FREE JERSEY VOUCHER (CALL SUPPORT)";
      rewardType = 'jersey';
    } else if (roll < 0.20) {
      result = "25% DISCOUNT CODE (CALL SUPPORT)";
      rewardType = 'discount';
    } else if (roll < 0.50) {
      result = "100 BONUS CREDITS (₹100)";
      rewardType = 'credits';
    } else if (roll < 0.80) {
      result = "500 WH1RL COINS (REFUND)";
      rewardType = 'coins';
    }

    try {
      const profileRef = doc(db, 'users', user.uid, 'public', 'profile');
      
      const updates: any = {
        wh1rlCoins: increment(-500)
      };

      if (rewardType === 'credits') {
        updates.balance = increment(100);
      } else if (rewardType === 'coins') {
        updates.wh1rlCoins = increment(0); // Effectively a refund of the 500 spent + 500 earned
      }

      await updateDoc(profileRef, updates);
      setSpinResult(result);
    } catch (err) {
      console.error(err);
      alert("VOID CONNECTION INTERRUPTED.");
    } finally {
      setIsSpinning(false);
    }
  };

  const handleBalanceRequest = async () => {
    if (!user || !balanceAmount || !transactionId) {
      alert("Amount and Transaction ID required.");
      return;
    }
    try {
      await addDoc(collection(db, 'balance_requests'), {
        userId: user.uid,
        userName: profile?.displayName || user.email,
        amount: parseFloat(balanceAmount),
        transactionId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert("REQUEST SUBMITTED. SEND SCREENSHOT TO +91 82405 15833 IN WHATSAPP FOR INSTANT APPROVAL.");
      setIsBalanceModalOpen(false);
    } catch (err) { console.error(err); }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 gap-6">
        <div className="w-12 h-12 border-2 border-dashed border-brand-red rounded-full animate-spin" />
        <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Recalibrating Subject Identity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-40 pb-32 px-4 md:px-12 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 md:gap-24">
          
          {/* Left: Summary & Wallet */}
          <aside className="w-full lg:w-96 space-y-8 md:space-y-12">
            <div className="space-y-6 md:space-y-8">
              <div 
                className="relative w-32 h-32 md:w-40 md:h-40 mx-auto group cursor-pointer"
                onClick={() => setIsAdminModalOpen(true)}
              >
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 group-hover:border-brand-red group-hover:rotate-180 transition-all duration-1000" />
                <div className="absolute inset-2 rounded-full overflow-hidden border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img src={formData.profileImage || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 rounded-full bg-brand-red/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="text-center space-y-2">
                 <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic">{profile?.displayName || 'Subject Identity'}</h2>
                 <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">{user?.email}</p>
              </div>
            </div>

               {/* Void Balance Card */}
               <div className="p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] bg-[#0A0A0A] border border-white/5 space-y-6 md:space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 blur-3xl -z-10 group-hover:bg-brand-red/10 transition-colors" />
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-white/40">Void Credits</span>
                     <Wallet className="w-4 h-4 md:w-5 md:h-5 text-brand-red" />
                  </div>
                  <div>
                     <p className="text-4xl md:text-5xl font-display font-black tracking-tighter italic">₹ {profile?.balance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <Button 
                   onClick={() => setIsBalanceModalOpen(true)}
                   className="w-full rounded-xl md:rounded-2xl bg-white text-black hover:bg-brand-red hover:text-white transition-all font-black py-4 md:py-4 h-12 md:h-auto text-xs"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" /> RECHARGE
                  </Button>
               </div>

               {/* WH1RL Coins Card */}
               <div className="p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] bg-[#0A0A0A] border border-white/5 space-y-6 md:space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10 group-hover:bg-orange-500/10 transition-colors" />
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-white/40">W-COINS</span>
                     <Ghost className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  </div>
                  <div>
                     <p className="text-4xl md:text-5xl font-display font-black tracking-tighter italic text-orange-500">{profile?.wh1rlCoins || 0}</p>
                     <p className="text-[7px] md:text-[8px] uppercase tracking-widest text-white/20 font-black mt-2 italic">Extraction points</p>
                  </div>
                  <Button 
                   onClick={() => setIsSpinModalOpen(true)}
                   className="w-full rounded-xl md:rounded-2xl bg-orange-500 text-black hover:bg-white transition-all font-black py-4 md:py-4 h-12 md:h-auto text-xs uppercase italic tracking-widest"
                  >
                    SPIN (-500)
                  </Button>
               </div>
               
               {/* Loyalty Stats */}
               <div className="p-8 rounded-[3rem] bg-[#0A0A0A] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-white/40">
                    <span>Loyalty Points</span>
                    <span className="text-brand-red font-black tracking-widest">{profile?.loyaltyPoints || 0} PTS</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Loyalty Tier</span>
                    <div className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest border transition-all ${
                      (profile?.totalSpending || 0) >= 50000 ? 'text-white bg-white/5 border-white shadow-lg' :
                      (profile?.totalSpending || 0) >= 20000 ? 'text-white bg-white/5 border-white/40' :
                      (profile?.totalSpending || 0) >= 10000 ? 'text-yellow-500 border-yellow-500/20' :
                      (profile?.totalSpending || 0) >= 5000 ? 'text-blue-400 border-blue-400/20' : 'text-orange-900 border-orange-900/10'
                    }`}>
                      {(profile?.totalSpending || 0) >= 50000 ? 'OBSIDIAN' :
                       (profile?.totalSpending || 0) >= 20000 ? 'PLATINUM' :
                       (profile?.totalSpending || 0) >= 10000 ? 'GOLD' :
                       (profile?.totalSpending || 0) >= 5000 ? 'SILVER' : 'BRONZE'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-white/40">
                    <span>Void Level</span>
                    <span className="text-white">Stage {Math.floor((profile?.totalSpending || 0) / 5000) + 1}</span>
                  </div>

                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((profile?.totalSpending || 0) % 5000) / 50)}%` }}
                      className="h-full bg-gradient-to-r from-brand-red to-orange-500"
                    />
                  </div>
                  <p className="text-[7px] uppercase tracking-widest text-white/20 italic font-black text-center">Protocol efficiency: 1 Point per ₹100 extracted</p>
               </div>

            <div className="space-y-4">
               <button onClick={() => navigate('/orders')} className="w-full p-6 text-left rounded-3xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-sm uppercase font-black tracking-widest flex justify-between items-center group">
                  Active Orders <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
               </button>
               <button onClick={() => navigate('/giftcard')} className="w-full p-6 text-left rounded-3xl border border-brand-red/10 bg-brand-red/5 hover:border-brand-red/30 hover:bg-brand-red/10 transition-all text-sm uppercase font-black tracking-widest flex justify-between items-center group text-brand-red">
                  Buy Gift Voucher <Gift className="w-4 h-4" />
               </button>
               <button 
                onClick={() => {
                   const code = prompt("ENTER GIFT CARD CODE:");
                   if(code) {
                      setGiftCardCode(code);
                      // Since we handle redeem in a separate function, we might want to call it directly or show a button
                   }
                }}
                className="w-full p-6 text-left rounded-3xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-sm uppercase font-black tracking-widest flex justify-between items-center group"
               >
                  Redeem Gift Card <Globe className="w-4 h-4" />
               </button>
               {giftCardCode && (
                  <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl space-y-4">
                     <p className="text-[8px] font-black uppercase text-brand-red">Active Sequence: {giftCardCode}</p>
                     <Button 
                       onClick={handleRedeemGiftCard} 
                       disabled={isRedeeming}
                       className="w-full h-10 rounded-xl bg-brand-red text-white text-[8px] font-black"
                     >
                       {isRedeeming ? 'VALIDATING...' : 'EXECUTE REDEMPTION'}
                     </Button>
                  </div>
               )}
               
               <div className="pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <OrderStatusSnippet />
               </div>
            </div>
          </aside>

          {/* Right: Detailed Info */}
          <div className="flex-1 space-y-8 md:space-y-12">
            <header className="space-y-4 pb-8 md:pb-12 border-b border-white/5 text-center md:text-left">
              <h1 className="text-4xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-none">IDENTITY</h1>
              <p className="text-white/40 font-serif italic text-base md:text-lg">Update your transmission coordinates.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
               <InputGroup label="Identity Name">
                  <input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="input-field" placeholder="Subject Name" />
                </InputGroup>
                <InputGroup label="Avatar URL">
                  <input value={formData.profileImage} onChange={e => setFormData({...formData, profileImage: e.target.value})} className="input-field" placeholder="https://image-url.com" />
                </InputGroup>
                <InputGroup label="Terminal Phone">
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" placeholder="+91 00000 00000" />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <InputGroup label="Identification">
                   <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="input-field">
                      <option value="unisex">Unisex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                   </select>
                </InputGroup>
                <InputGroup label="Pattern (Size)">
                   <select value={formData.preferredSize} onChange={e => setFormData({...formData, preferredSize: e.target.value})} className="input-field">
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                   </select>
                </InputGroup>
              </div>

              <InputGroup label="Coordinates (Address)">
                <textarea 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                  className="input-field min-h-[100px] md:min-h-[120px] py-4 md:py-6" 
                  placeholder="Street, Locality, Landmark" 
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <InputGroup label="Sector / City">
                  <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="input-field" placeholder="City" />
                </InputGroup>
                <InputGroup label="State / Zone">
                  <input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="input-field" placeholder="State" />
                </InputGroup>
                <InputGroup label="Zip Code">
                  <input value={formData.zipcode} onChange={e => setFormData({...formData, zipcode: e.target.value})} className="input-field" placeholder="000000" />
                </InputGroup>
              </div>
              
              <InputGroup label="Region / Country">
                <input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="input-field" placeholder="Country" />
              </InputGroup>

              <div className="space-y-4">
                  <InputGroup label="Extraction Protocol">
                     <select value={formData.preferredPayment} onChange={e => setFormData({...formData, preferredPayment: e.target.value})} className="input-field uppercase text-[9px] md:text-[10px] font-black tracking-widest h-14 md:h-auto">
                        <option value="online">Online UPI</option>
                        <option value="cod">Cash on Delivery</option>
                        <option value="balance">Void balance</option>
                     </select>
                  </InputGroup>
              </div>

              <div className="pt-8 md:pt-12">
                <Button 
                  disabled={saving}
                  className="w-full h-20 md:h-24 rounded-2xl md:rounded-[2rem] bg-brand-red text-white hover:bg-white hover:text-black transition-all duration-700 font-black px-8 md:px-12 group text-base md:text-xl"
                >
                    {saving ? 'SYNCING...' : success ? 'UPDATED ✓' : 'SECURE IDENTITY'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Admin Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
             <div className="w-full max-w-md p-12 rounded-[3.5rem] bg-[#0A0A0A] border border-white/10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 blur-3xl -z-10" />
                <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X /></button>
                
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 rounded-full bg-brand-red/10 flex items-center justify-center mx-auto mb-6">
                      <ShieldAlert className="text-brand-red w-8 h-8" />
                   </div>
                   <h3 className="text-3xl font-display font-black tracking-tighter uppercase italic">RESTRICTED SPACE</h3>
                   <p className="text-[10px] uppercase tracking-widest text-white/20">Admin Authorization Required</p>
                </div>

                <div className="space-y-6">
                   <input 
                    type="password" 
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="ENTER ACCESS KEY"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-center text-sm font-black tracking-[0.5em] focus:outline-none focus:border-brand-red transition-all"
                   />
                   <Button onClick={handleAdminLogin} className="w-full h-16 rounded-2xl bg-brand-red text-white hover:bg-white hover:text-black transition-all font-black">LOGIN TERMINAL</Button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance Modal */}
      <AnimatePresence>
        {isBalanceModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
             <div className="w-full max-w-lg p-12 rounded-[3.5rem] bg-[#0A0A0A] border border-white/10 space-y-8 relative">
                <button onClick={() => setIsBalanceModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X /></button>
                
                <div className="text-center space-y-4">
                   <h3 className="text-3xl font-display font-black tracking-tighter uppercase italic">INJECT CREDITS</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-red animate-pulse">UPI: 8240515833@fam</p>
                </div>

                <div className="space-y-8">
                   <div className="aspect-square w-64 mx-auto bg-white p-4 rounded-3xl relative group">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=8240515833@fam%26pn=WH1RLPOOL%26cu=INR" className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000" alt="QR" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                         <p className="text-[10px] font-black tracking-widest text-white">SCAN TO PAY</p>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <p className="text-[9px] text-center text-white/40 uppercase tracking-widest leading-loose font-black italic">
                         Send screenshot to WhatsApp for verification: <br />
                         <span className="text-brand-red text-xs">+91 82405 15833</span>
                      </p>
                      <div className="space-y-2">
                         <input 
                           type="number"
                           placeholder="AMOUNT (₹)"
                           value={balanceAmount}
                           onChange={e => setBalanceAmount(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-8 text-center text-xl font-display font-black tracking-widest focus:outline-none focus:border-brand-red transition-all"
                         />
                         <input 
                           type="text"
                           placeholder="TRANSACTION ID"
                           value={transactionId}
                           onChange={e => setTransactionId(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-8 text-center text-xs font-black tracking-widest focus:outline-none focus:border-brand-red transition-all"
                         />
                      </div>
                      <Button onClick={handleBalanceRequest} className="w-full h-16 rounded-2xl bg-white text-black hover:bg-brand-red hover:text-white transition-all font-black">SUBMIT REQUEST</Button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin the Win Modal */}
      <AnimatePresence>
        {isSpinModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
             <div className="w-full max-w-xl p-12 rounded-[4rem] bg-[#050505] border border-orange-500/20 space-y-12 relative overflow-hidden text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 blur-[100px] -z-10" />
                <button onClick={() => setIsSpinModalOpen(false)} className="absolute top-10 right-10 text-white/20 hover:text-white transition-colors"><X /></button>

                <div className="space-y-4">
                  <h3 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic leading-none text-orange-500 drop-shadow-orange">SPIN THE WIN</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">VOID CURRENCY PROTOCOL // 500 W-COINS/SPIN</p>
                </div>

                <div className="relative aspect-square w-64 mx-auto flex items-center justify-center">
                   <motion.div 
                    animate={isSpinning ? { rotate: 360 * 5 } : { rotate: 0 }}
                    transition={isSpinning ? { duration: 3, ease: "easeInOut" } : { duration: 0.5 }}
                    className="absolute inset-0 rounded-full border-8 border-dashed border-orange-500/20"
                   />
                   <div className="z-10 bg-black p-8 rounded-full border border-orange-500/40 shadow-orange-glow">
                      <Disc className={`w-16 h-16 text-orange-500 ${isSpinning ? 'animate-spin' : ''}`} />
                   </div>
                   
                   {/* Result display */}
                   <AnimatePresence>
                     {spinResult && (
                       <motion.div 
                        initial={{ scale: 0, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full space-y-4"
                       >
                          <div className="p-6 bg-orange-500 text-black rounded-2xl font-display font-black uppercase italic tracking-tighter text-xl">
                            {spinResult}
                          </div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Outcome recorded in the ghost registry.</p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                <div className="pt-24">
                  <Button 
                    disabled={isSpinning || (profile?.wh1rlCoins || 0) < 500}
                    onClick={handleSpinTheWin}
                    className="w-full h-20 rounded-3xl bg-orange-500 text-black hover:bg-white transition-all duration-700 font-display font-black italic uppercase tracking-widest text-lg disabled:opacity-20"
                  >
                    {isSpinning ? 'SPINNING THE VOID...' : spinResult ? 'SPIN AGAIN (-500)' : 'EXECUTE EXTRACTION'}
                  </Button>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mt-6 italic underline cursor-help" onClick={() => navigate('/support')}>Call Support for Prize Claims</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .input-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (min-width: 768px) {
          .input-field {
            padding: 1.5rem 2rem;
            border-radius: 1.5rem;
            font-size: 1rem;
          }
        }
        .input-field:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 20, 20, 0.5);
          box-shadow: 0 0 30px rgba(255, 20, 20, 0.1);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

const InputGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <label className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black ml-4">{label}</label>
    {children}
  </div>
);

const OrderStatusSnippet = () => {
  const { user } = useAuth();
  const [lastOrder, setLastOrder] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setLastOrder({ id: snap.docs[0].id, ...snap.docs[0].data() });
    });
    return unsub;
  }, [user]);

  if (!lastOrder) return (
     <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 text-center space-y-2 opacity-50">
        <p className="text-[8px] font-black uppercase tracking-widest">No Active Sync</p>
        <p className="text-[10px] font-medium opacity-40">Artifact extraction queue is empty.</p>
     </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-[2.5rem] bg-brand-red/5 border border-brand-red/20 space-y-6 relative overflow-hidden group/track hover:bg-brand-red/10 transition-all cursor-pointer"
      onClick={() => navigate('/orders')}
    >
       <div className="flex justify-between items-start">
          <div className="space-y-1">
             <p className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-red">Live Status</p>
             <p className="text-xl font-display font-black tracking-tighter uppercase italic truncate">#{lastOrder.id.slice(0, 8)}</p>
          </div>
          <Truck className="w-5 h-5 text-brand-red" />
       </div>
       <div className="flex justify-between items-end">
          <div>
             <p className="text-[10px] font-black uppercase text-white/40 mb-1">Status</p>
             <p className={`text-[10px] font-black uppercase tracking-widest ${
                lastOrder.status === 'delivered' ? 'text-green-500' : 'text-brand-red'
             }`}>{lastOrder.status}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase text-white/40 mb-1">ETA</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-white">{lastOrder.estimatedDelivery || 'APPROX 13d'}</p>
          </div>
       </div>
    </motion.div>
  );
};
