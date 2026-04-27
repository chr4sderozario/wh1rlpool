import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { ArrowLeft, User, Phone, MapPin, Globe, CheckCircle, Smartphone } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/src/lib/firebaseUtils';

export const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    country: '',
    gender: 'Unisex',
    size: 'M'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'users', user.uid, 'public', 'profile');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData(prev => ({ ...prev, ...docSnap.data() }));
          } else {
             // Set default display name if first time
             setFormData(prev => ({ ...prev, displayName: user.displayName || '' }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);

    try {
      await setDoc(doc(db, 'users', user.uid, 'public', 'profile'), {
        ...formData,
        updatedAt: serverTimestamp(),
        role: 'user' // Default role
      }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/public/profile`);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-12 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        <button 
          onClick={() => navigate('/store')}
          className="text-white/40 hover:text-white flex items-center gap-2 transition-colors uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </button>

        <section>
          <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic">User Identity</h1>
          <p className="text-white/40 text-sm italic font-serif mt-2">Establish your digital presence in the void.</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8 glass p-8 md:p-12 rounded-[2rem]">
          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="Full Name" icon={<User className="w-4 h-4" />}>
               <input 
                 type="text" 
                 value={formData.displayName}
                 onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                 className="input-field" 
                 placeholder="John Doe" 
                 required
               />
            </InputGroup>
            <InputGroup label="WhatsApp Number" icon={<Smartphone className="w-4 h-4" />}>
               <input 
                 type="tel" 
                 value={formData.whatsapp}
                 onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                 className="input-field" 
                 placeholder="+91 1234567890" 
               />
            </InputGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="Phone Number" icon={<Phone className="w-4 h-4" />}>
               <input 
                 type="tel" 
                 value={formData.phone}
                 onChange={(e) => setFormData({...formData, phone: e.target.value})}
                 className="input-field" 
                 placeholder="1234567890" 
               />
            </InputGroup>
            <InputGroup label="Gender" icon={<User className="w-4 h-4" />}>
               <select 
                 value={formData.gender}
                 onChange={(e) => setFormData({...formData, gender: e.target.value})}
                 className="input-field"
               >
                 <option value="Male">Male</option>
                 <option value="Female">Female</option>
                 <option value="Unisex">Unisex</option>
                 <option value="Other">Other</option>
               </select>
            </InputGroup>
          </div>

          {/* Delivery */}
          <div className="space-y-8 pt-8 border-t border-white/5">
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-brand-red font-bold">Delivery Coordinates</h3>
            <InputGroup label="Full Address" icon={<MapPin className="w-4 h-4" />}>
               <textarea 
                 value={formData.address}
                 onChange={(e) => setFormData({...formData, address: e.target.value})}
                 className="input-field min-h-[100px] py-4" 
                 placeholder="Street, Building, Flat No."
               />
            </InputGroup>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InputGroup label="City">
                 <input 
                   type="text" 
                   value={formData.city}
                   onChange={(e) => setFormData({...formData, city: e.target.value})}
                   className="input-field" 
                   placeholder="City" 
                 />
              </InputGroup>
              <InputGroup label="State">
                 <input 
                   type="text" 
                   value={formData.state}
                   onChange={(e) => setFormData({...formData, state: e.target.value})}
                   className="input-field" 
                   placeholder="State" 
                 />
              </InputGroup>
              <InputGroup label="Country" icon={<Globe className="w-4 h-4" />}>
                 <input 
                   type="text" 
                   value={formData.country}
                   onChange={(e) => setFormData({...formData, country: e.target.value})}
                   className="input-field" 
                   placeholder="Country" 
                 />
              </InputGroup>
            </div>
          </div>

          {/* Sizing */}
          <div className="space-y-8 pt-8 border-t border-white/5">
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-brand-red font-bold">Physical Data</h3>
            <div className="flex flex-wrap gap-4">
               {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                 <button
                   key={sz}
                   type="button"
                   onClick={() => setFormData({...formData, size: sz})}
                   className={`w-16 h-16 rounded-full font-display font-bold transition-all duration-500 border ${
                     formData.size === sz 
                     ? 'bg-white text-black border-white shadow-lg' 
                     : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                   }`}
                 >
                   {sz}
                 </button>
               ))}
            </div>
          </div>

          <div className="pt-8">
            <Button 
               disabled={saving}
               className="w-full h-16 rounded-full bg-brand-red text-white hover:bg-white hover:text-black transition-all duration-700 flex items-center justify-center gap-2 group"
            >
               {saving ? "Transmitting..." : success ? <>Saved <CheckCircle className="w-5 h-5" /></> : "Update Identity"}
            </Button>
          </div>
        </form>

        <footer className="text-center pb-12">
           <p className="text-[8px] uppercase tracking-[0.3em] text-white/20">Data encrypted via WH1RLPOOL protocols</p>
        </footer>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        .input-field:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(139, 0, 0, 0.5);
          box-shadow: 0 0 20px rgba(139, 0, 0, 0.1);
        }
        select.input-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1rem;
        }
      `}</style>

      {/* Decorative */}
      <div className="fixed top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] liquid-shape bg-brand-red/5 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
};

const InputGroup = ({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 group-focus-within:text-brand-red transition-colors">{label}</label>
    <div className="relative">
       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-red transition-colors">
          {icon}
       </div>
       {children}
    </div>
  </div>
);
