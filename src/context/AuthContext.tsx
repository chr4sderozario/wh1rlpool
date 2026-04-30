import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  id: string;
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

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null,
  isAdmin: false, 
  loading: true,
  login: async () => {},
  logout: () => {}
});

const ADMIN_EMAILS = ['sohanbiswas@chr4s', 'johnrozario@chr4s', 'sohanbiswas@chr4s.com', 'johnrozario@chr4s.com', 'johnchristianorozario@gmail.com'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('wh1rl_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      fetchProfile(userData.uid);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const res = await fetch(`/api/users?id=${uid}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setProfile(data[0]);
      } else {
        // Create default profile if not found
        const defaultProfile: UserProfile = {
          id: uid,
          balance: 0,
          role: ADMIN_EMAILS.some(e => user?.email === e) ? 'admin' : 'user',
          email: user?.email || '',
          displayName: user?.displayName || ''
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string) => {
    const uid = 'user_' + Math.random().toString(36).substring(2, 9);
    const userData = { uid, email, displayName: email.split('@')[0] };
    localStorage.setItem('wh1rl_user', JSON.stringify(userData));
    setUser(userData);
    await fetchProfile(uid);
  };

  const logout = () => {
    localStorage.removeItem('wh1rl_user');
    localStorage.removeItem('admin_session');
    setUser(null);
    setProfile(null);
  };

  const isAdmin = user 
    ? ADMIN_EMAILS.some(email => user.email?.toLowerCase() === email.toLowerCase()) 
    : (localStorage.getItem('admin_session') === 'true');

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
