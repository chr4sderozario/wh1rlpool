import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';

import { 
  collection, 
  doc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

interface UserProfile {
  displayName?: string;
  email?: string;
  balance: number;
  totalSpending?: number;
  loyaltyPoints?: number;
  wh1rlCoins?: number;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null,
  isAdmin: false, 
  loading: true 
});

const ADMIN_EMAILS = ['sohanbiswas@chr4s', 'johnrozario@chr4s', 'sohanbiswas@chr4s.com', 'johnrozario@chr4s.com'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Listen to profile
        const profileRef = doc(db, 'users', firebaseUser.uid, 'public', 'profile');
        unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // New user, initial local profile state
            setProfile({
              balance: 0,
              role: ADMIN_EMAILS.some(e => firebaseUser.email === e || firebaseUser.email?.startsWith(e + '@')) ? 'admin' : 'user',
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || ''
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile Error:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const isAdmin = user 
    ? ADMIN_EMAILS.some(email => user.email?.toLowerCase() === email.toLowerCase() || user.email?.toLowerCase().startsWith(email.toLowerCase() + '@')) 
    : (localStorage.getItem('admin_session') === 'true');

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
