import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
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
  Lock
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
  const [adminPassword, setAdminPassword] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');

  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: '',
    city: '',
    country: '',
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
        country: profile.country || '',
      });
      setLoading(false);
    } else if (!authLoading && user) {
      // If profile is not loaded but user exists, we might need to wait or handle the empty state
      // For now, let's allow loading to finish if we have basic user info
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

  const handleBalanceRequest = async () => {
    if (!user || !balanceAmount) return;
    try {
      await addDoc(collection(db, 'balance_requests'), {
        userId: user.uid,
        userName: profile?.displayName || user.email,
        amount: parseFloat(balanceAmount),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert("Pay using QR and wait for admin approval.");
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
    <div className="min-h-screen bg-black text-white pt-40 pb-32 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-24">
          
          {/* Left: Summary & Wallet */}
          <aside className="w-full lg:w-96 space-y-12">
            <div className="space-y-8">
              <div 
                className="relative w-40 h-40 mx-auto group cursor-pointer"
                onClick={() => setIsAdminModalOpen(true)}
              >
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 group-hover:border-brand-red group-hover:rotate-180 transition-all duration-1000" />
                <div className="absolute inset-2 rounded-full overflow-hidden border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} className="w-full h-full object-cover" />
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

            {/* Wallet Card */}
            <div className="p-8 rounded-[3rem] bg-[#0A0A0A] border border-white/5 space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 blur-3xl -z-10 group-hover:bg-brand-red/10 transition-colors" />
               <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">Void Balance</span>
                  <Wallet className="w-5 h-5 text-brand-red" />
               </div>
               <div>
                  <p className="text-5xl font-display font-black tracking-tighter italic">₹ {profile?.balance?.toFixed(2) || '0.00'}</p>
               </div>
               <Button 
                onClick={() => setIsBalanceModalOpen(true)}
                className="w-full rounded-2xl bg-white text-black hover:bg-brand-red hover:text-white transition-all font-black py-4"
               >
                 <Plus className="w-4 h-4 mr-2" /> ADD CREDITS
               </Button>
               <button className="w-full text-[8px] uppercase tracking-[0.3em] text-white/10 font-bold hover:text-white transition-colors flex items-center justify-center gap-2">
                 <History className="w-3 h-3" /> Transaction Logs
               </button>
            </div>
            
            <div className="space-y-4">
               <button onClick={() => navigate('/orders')} className="w-full p-6 text-left rounded-3xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-sm uppercase font-black tracking-widest flex justify-between items-center group">
                  Active Orders <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
               </button>
               <button onClick={() => navigate('/wishlist')} className="w-full p-6 text-left rounded-3xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-sm uppercase font-black tracking-widest flex justify-between items-center group">
                  Saved Artifacts <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
               </button>
            </div>
          </aside>

          {/* Right: Detailed Info */}
          <div className="flex-1 space-y-12">
            <header className="space-y-4 pb-12 border-b border-white/5">
              <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic">IDENTITY LOG</h1>
              <p className="text-white/40 font-serif italic text-lg">Update your transmission coordinates and digital presence.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <InputGroup label="Identity Name">
                  <input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="input-field" placeholder="Subject Name" />
                </InputGroup>
                <InputGroup label="Terminal Phone">
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" placeholder="+91 0000000000" />
                </InputGroup>
              </div>

              <InputGroup label="Physical Coordinates (Full Address)">
                <textarea 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                  className="input-field min-h-[120px] py-6" 
                  placeholder="Street, City, Sector, Grid Reference" 
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <InputGroup label="Sector / City">
                  <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="input-field" placeholder="City" />
                </InputGroup>
                <InputGroup label="Grid / Country">
                  <input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="input-field" placeholder="Country" />
                </InputGroup>
              </div>

              <div className="pt-12">
                <Button 
                  disabled={saving}
                  className="w-full h-20 rounded-full bg-brand-red text-white hover:bg-white hover:text-black transition-all duration-700 font-black px-12 group"
                >
                  <span className="flex items-center gap-4">
                    {saving ? 'SYNCHRONIZING...' : success ? 'IDENTITY UPDATED' : 'SAVE CHANGES'}
                    {success && <CheckCircle className="w-5 h-5" />}
                  </span>
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
                   <p className="text-[10px] uppercase tracking-widest text-white/40">Manual Deposit Protocol</p>
                </div>

                <div className="space-y-8">
                   <div className="aspect-square w-64 mx-auto bg-white p-4 rounded-3xl relative group">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WH1RLPOOL_PAYMENT" className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000" alt="QR" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                         <p className="text-[10px] font-black tracking-widest text-white">SCAN TO PAY</p>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <p className="text-[10px] text-center text-white/40 uppercase tracking-widest leading-loose">Pay using QR above and enter amount below. <br /> Wait for admin verification.</p>
                      <input 
                        type="number"
                        placeholder="AMOUNT (₹)"
                        value={balanceAmount}
                        onChange={e => setBalanceAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-center text-xl font-display font-black tracking-widest focus:outline-none focus:border-brand-red transition-all"
                      />
                      <Button onClick={handleBalanceRequest} className="w-full h-16 rounded-2xl bg-white text-black hover:bg-brand-red hover:text-white transition-all font-black">SUBMIT REQUEST</Button>
                   </div>
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
          padding: 1.5rem 2rem;
          border-radius: 1.5rem;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
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
