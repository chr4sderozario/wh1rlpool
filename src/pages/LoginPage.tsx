import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronLeft, Chrome } from 'lucide-react';
import { auth, signInWithGoogle } from '@/src/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In AI Studio, Email/Password might need to be enabled in Firebase Console.
      // But we follow user instructions for the UI and logic.
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const adminEmails = ['sohanbiswas@chr4s.com', 'johnrozario@chr4s.com'];
      if (adminEmails.includes(user.email || '')) {
        navigate('/admin');
      } else {
        navigate('/store');
      }
    } catch (err: any) {
      console.error(err);
      setError("Identification failed. Please ensure Email/Password auth is enabled in your Firebase console or use the placeholder login logic.");
      
      // Fallback for demo/placeholder if Firebase auth fails (to show the flow)
      const adminEmails = ['sohanbiswas@chr4s.com', 'johnrozario@chr4s.com'];
      const adminPassword = 'admin_password_here';
      if (adminEmails.includes(email) && password === adminPassword) {
        navigate('/admin');
      } else if (email && password) {
         navigate('/store');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      const adminEmails = ['sohanbiswas@chr4s.com', 'johnrozario@chr4s.com'];
      if (adminEmails.includes(user.email || '')) {
        navigate('/admin');
      } else {
        navigate('/store');
      }
    } catch (err) {
      setError("Google Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-white/40 hover:text-white flex items-center gap-2 transition-colors uppercase text-xs tracking-widest"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Void
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-red/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold tracking-tighter uppercase mb-2">Identify</h2>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em]">Authorized Personnel Only</p>
          </div>

          {error && (
            <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[10px] uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/60 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 focus:outline-none focus:border-brand-red/50 transition-colors text-sm"
                  placeholder="void@wh1rlpool.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/60 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 focus:outline-none focus:border-brand-red/50 transition-colors text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
              {isSubmitting ? "Verifying..." : "Access Terminal"}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-widest text-white/20">
              <span className="bg-black px-4">Or alternative access</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border-white/10 hover:bg-white/5"
          >
            <Chrome className="w-4 h-4" /> Sign In with Google
          </Button>

          <div className="pt-4 text-center">
            <button className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white transition-colors">
              Request New Credentials
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
