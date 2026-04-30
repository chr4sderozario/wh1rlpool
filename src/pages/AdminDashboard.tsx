import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Plus, Trash2, Edit3, Settings, LogOut, Loader2, 
  Users, ShoppingBag, BarChart3, ChevronRight, User as UserIcon,
  CreditCard, TrendingUp, DollarSign, Activity, Database, X, Upload, Image as ImageIcon,
  CheckCircle, ShieldAlert, Wallet, AlertTriangle, Phone, MapPin, MessageSquare, Music2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';

interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  isFeatured?: boolean;
}

interface Order {
  id: string;
  userId: string;
  userName?: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentDetails?: {
    transactionId?: string;
    proofImageUrl?: string;
  };
  deliveryFee?: number;
  estimatedDelivery?: string;
  createdAt: any;
}

interface UserProfile {
  id: string;
  displayName?: string;
  email?: string;
  role: string;
  balance: number;
  phone?: string;
  address?: string;
  createdAt?: any;
}

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  status: 'active' | 'redeemed';
  recipientEmail?: string;
  createdAt: any;
}

interface BalanceRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  transactionId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

interface Review {
  id: string;
  author: string;
  tag: string;
  text: string;
  createdAt: any;
}

type Tab = 'inventory' | 'orders' | 'users' | 'requests' | 'analytics' | 'support' | 'giftcards' | 'settings' | 'reviews';

export const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<BalanceRequest[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [giftCardRequests, setGiftCardRequests] = useState<any[]>([]);
  const [storeReviews, setStoreReviews] = useState<Review[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [customGiftAmount, setCustomGiftAmount] = useState('500');
  const [loading, setLoading] = useState(true);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [systemSettings, setSystemSettings] = useState({
    customerCareNumber: '918073809618',
    customerCareEmail: 'support@wh1rlpool.com',
    isCareOnline: true,
    paymentMethods: {
      upi: 'whirlpool@upi',
      bankTransfer: 'A/C: 123456789, IFSC: SBIN0001',
      cod: true
    }
  });
  const [siteConfig, setSiteConfig] = useState({
    musicUrl: '',
    songTitle: ''
  });

  useEffect(() => {
    fetch('/api/site_config').then(res => res.json()).then(setSiteConfig).catch(console.error);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [secondaryUploading, setSecondaryUploading] = useState(false);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    costPrice: '',
    stock: '',
    category: 'Elite Artifacts',
    description: '',
    gender: 'unisex',
    club: '',
    country: '',
    image: null as File | null,
    imagePreview: '',
    imageUrl: '', // Manual URL input
    images: [] as string[], // Additional images (secondary)
    isFeatured: false
  });

  useEffect(() => {
    if (authLoading) return;
    
    const isFallbackAdmin = localStorage.getItem('admin_session') === 'true';
    if (!user && !isFallbackAdmin) {
      navigate('/login');
      return;
    }

    if (!isAdmin && !isFallbackAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const collections = ['products', 'orders', 'balance_requests', 'gift_cards', 'gift_card_requests', 'store_reviews', 'support_sessions', 'users'];
        const results = await Promise.all(collections.map(c => fetch(`/api/${c}`).then(res => res.json())));
        
        setProducts(results[0].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
        setOrders(results[1].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
        setRequests(results[2].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
        setGiftCards(results[3].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
        setGiftCardRequests(results[4].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
        setStoreReviews(results[5].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
        setChats(results[6].sort((a: any, b: any) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()));
        
        // Settings handling
        const settingsRes = await fetch('/api/settings/system');
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setSystemSettings(settings);
        }

        // Users and profiles handling
        const usersData = results[7];
        const profiles = await Promise.all(usersData.map(async (u: any) => {
          const pRes = await fetch(`/api/user_profiles?userId=${u.id}`);
          const pData = await pRes.json();
          return pData.length > 0 ? { ...pData[0], id: u.id } : null;
        }));
        setUsers(profiles.filter(p => p !== null));

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s as a poor man's skip for onSnapshot
    return () => clearInterval(interval);
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!activeChatId) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/support_chats?userId=${activeChatId}&_sort=timestamp&_order=asc`);
        const data = await res.json();
        setChatMessages(data);
        
        await fetch(`/api/support_sessions/${activeChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unreadCount: 0 })
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeChatId]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const totalProfit = orders.reduce((acc, o) => {
      const orderProfit = o.items.reduce((itemAcc, item) => {
        const prod = products.find(p => p.id === item.productId);
        const margin = prod ? (prod.price - Number(prod.costPrice || 0)) : (item.price * 0.3);
        return itemAcc + (margin * (item.quantity || 1));
      }, 0);
      return acc + orderProfit;
    }, 0);

    const chartData = orders.slice(0, 10).reverse().map(o => ({
      name: o.id.slice(0, 4),
      revenue: o.total,
      profit: o.total * 0.4
    }));

    return { totalRevenue, totalProfit, chartData };
  }, [orders, products]);

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassInput === 'adminwhirlpool1002919402') {
      setIsAdminUnlocked(true);
    } else {
      alert("UNAUTHORIZED ACCESS DETECTED.");
    }
  };

  const handleApproveBalanceRequest = async (req: any) => {
    try {
      await fetch(`/api/balance_requests/${req.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      
      const userRes = await fetch(`/api/user_profiles?userId=${req.userId}`);
      const userData = await userRes.json();
      if (userData.length > 0) {
        const u = userData[0];
        await fetch(`/api/user_profiles/${u.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: (u.balance || 0) + req.amount })
        });
      }
      alert("CREDITS INJECTED.");
    } catch (err) { 
      console.error(err);
    }
  };

  const handleApproveGiftCardRequest = async (req: any) => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await fetch('/api/gift_cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          amount: req.amount,
          status: 'active',
          createdAt: new Date().toISOString(),
          requestId: req.id
        })
      });
      await fetch(`/api/gift_card_requests/${req.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', materializedCode: code })
      });
      alert(`GIFT CARD MATERIALIZED: ${code}`);
    } catch (err) { 
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) { 
      console.error(err);
    }
  };

  const handleUpdateDeliveryTime = async (orderId: string) => {
    const time = prompt("Enter Estimated Delivery (e.g. 13 Days):");
    if (!time) return;
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimatedDelivery: time })
      });
    } catch (err) { console.error(err); }
  };

  const handleGenerateGiftCard = async () => {
    const amount = parseFloat(customGiftAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount.");
      return;
    }
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await fetch('/api/gift_cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          amount,
          status: 'active',
          createdAt: new Date().toISOString()
        })
      });
      alert(`Gift Card Materialized: ${code}`);
      setCustomGiftAmount('500');
    } catch (err) { 
      console.error(err);
    }
  };

  const handleSendChatReply = async (userId: string) => {
    if (!replyText.trim()) return;
    try {
      await fetch('/api/support_chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          senderId: 'admin',
          text: replyText,
          isAdmin: true,
          timestamp: new Date().toISOString()
        })
      });
      
      await fetch(`/api/support_sessions/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastMessage: replyText,
          lastMessageAt: new Date().toISOString()
        })
      });

      setReplyText('');
    } catch (err) { 
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Please fill required fields (Name, Price, Category).");
      return;
    }

    setUploading(true);
    let finalImageUrl = newProduct.imageUrl;
    
    try {
      if (newProduct.image) {
        // Mock upload: just use a local path or placeholder
        finalImageUrl = `https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800`;
        alert("SIMULATED UPLOAD: Using placeholder URL.");
      } else if (!finalImageUrl && newProduct.imagePreview) {
        if (newProduct.imagePreview.startsWith('blob:')) {
           alert("IMAGE UPLOAD ERROR: Please select the file again or use URL.");
           setUploading(false);
           return;
        }
        finalImageUrl = newProduct.imagePreview;
      }

      if (!finalImageUrl) {
        alert("Primary image is required.");
        setUploading(false);
        return;
      }

      const productData = {
        name: newProduct.name,
        price: Number(newProduct.price),
        costPrice: Number(newProduct.costPrice || 0),
        stock: Math.floor(Number(newProduct.stock || 0)),
        category: newProduct.category,
        description: newProduct.description,
        gender: newProduct.gender,
        club: newProduct.club,
        country: newProduct.country,
        isFeatured: newProduct.isFeatured,
        imageUrl: finalImageUrl,
        images: newProduct.images || [],
        updatedAt: new Date().toISOString()
      };

      if (isEditMode && editingId) {
        await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        alert("Unit Updated Successfully.");
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...productData,
            createdAt: new Date().toISOString(),
          })
        });
        alert("Unit Materialized Successfully.");
      }
      setIsModalOpen(false);
      resetProductForm();
    } catch (err) { 
      console.error(err);
    } finally { setUploading(false); }
  };

  const handleSecondaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    alert("Secondary upload simulated.");
  };

  const nukeAllProducts = async () => {
    if (!confirm("CRITICAL: Wipe all artifacts from the void? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      await Promise.all(data.map((p: any) => fetch(`/api/products/${p.id}`, { method: 'DELETE' })));
      alert("VOID PURIFIED. All artifacts destroyed.");
      setProducts([]);
    } catch (err) {
      console.error(err);
      alert("PURIFICATION FAILED.");
    } finally {
      setLoading(false);
    }
  };

  const seedSystemProducts = async () => {
    if (!confirm("Populate vault with elite football artifacts?")) return;
    setLoading(true);
    try {
      const eliteArtifacts = [
        {
          name: "ARGENTINA 24/25 HOME UNIT",
          price: 449,
          costPrice: 180,
          stock: 50,
          category: "National Team Artifacts",
          description: "The golden standard. Materials refined from the champions' vault. Pure celestial stripes.",
          imageUrl: "https://images.pexels.com/photos/36217787/pexels-photo-36217787.jpeg",
          isFeatured: true
        },
        {
          name: "BRAZIL 24/25 HOME UNIT",
          price: 449,
          costPrice: 180,
          stock: 45,
          category: "National Team Artifacts",
          description: "The canary rhythm. Engineered for supreme performance and heritage elegance.",
          imageUrl: "https://images.pexels.com/photos/31207970/pexels-photo-31207970.jpeg",
          isFeatured: true
        },
        {
          name: "REAL MADRID 24/25 HOME UNIT",
          price: 449,
          costPrice: 190,
          stock: 60,
          category: "Elite Club Artifacts",
          description: "The pure white aesthetic. A symbol of royalty and unmatched dominance in the football void.",
          imageUrl: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=800",
          isFeatured: true
        },
        {
          name: "BARCELONA 24/25 HOME UNIT",
          price: 449,
          costPrice: 190,
          stock: 48,
          category: "Elite Club Artifacts",
          description: "Blaugrana identity. More than an artifact. A deep structural connection to football history.",
          imageUrl: "https://images.unsplash.com/photo-1518000411333-e99c43a406b2?q=80&w=800",
          isFeatured: true
        }
      ];

      for (const artifact of eliteArtifacts) {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...artifact,
            createdAt: new Date().toISOString(),
            images: [artifact.imageUrl]
          })
        });
      }
      alert("VAULT POPULATED SUCCESSFULLY.");
    } catch (err) {
      console.error(err);
      alert("Infection Failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateAllPrices = async () => {
    if (!confirm("Synchronize ALL artifacts to ₹449 extraction rate?")) return;
    setLoading(true);
    try {
      await Promise.all(products.map(p => fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 449 })
      })));
      alert("GLOBAL PRICE RE-SYNC COMPLETE.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      price: '',
      costPrice: '',
      stock: '',
      category: 'Elite Artifacts',
      description: '',
      gender: 'unisex',
      club: '',
      country: '',
      image: null,
      imagePreview: '',
      imageUrl: '',
      images: [],
      isFeatured: false
    });
    setEditingId(null);
    setIsEditMode(false);
  };

  const openEditModal = (p: any) => {
    setNewProduct({
      name: p.name,
      price: p.price.toString(),
      costPrice: p.costPrice?.toString() || '0',
      stock: p.stock.toString(),
      category: p.category,
      description: p.description || '',
      gender: p.gender || 'unisex',
      club: p.club || '',
      country: p.country || '',
      image: null,
      imagePreview: p.imageUrl || '',
      imageUrl: p.imageUrl || '',
      images: p.images || [],
      isFeatured: p.isFeatured || false
    });
    setEditingId(p.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 gap-6">
        <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
        <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Synchronizing Void Connection...</p>
      </div>
    );
  }

  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-12 rounded-[3.5rem] bg-[#0A0A0A] border border-white/10 space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 blur-3xl -z-10" />
          <div className="text-center space-y-4">
             <div className="w-16 h-16 rounded-full bg-brand-red/10 flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="text-brand-red w-8 h-8" />
             </div>
             <h3 className="text-3xl font-display font-black tracking-tighter uppercase italic">ADMIN AUTH</h3>
             <p className="text-[10px] uppercase tracking-widest text-white/20">Authorization key required for {user?.email}</p>
          </div>

          <form onSubmit={handleAdminUnlock} className="space-y-6">
             <input 
              type="password" 
              value={adminPassInput}
              onChange={e => setAdminPassInput(e.target.value)}
              placeholder="ENTER ACCESS KEY"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-center text-sm font-black tracking-[0.5em] focus:outline-none focus:border-brand-red transition-all"
             />
             <Button type="submit" className="w-full h-16 rounded-2xl bg-brand-red text-white hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest">VALIDATE IDENTITY</Button>
          </form>
          <button onClick={() => navigate('/')} className="w-full text-[8px] uppercase tracking-widest text-white/10 hover:text-white transition-colors">Abort Access</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex selection:bg-brand-red selection:text-white">
      {/* Liquid Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="w-80 border-r border-white/5 bg-black flex flex-col p-10 sticky top-0 h-screen z-50 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-red/10 blur-[80px] rounded-full pointer-events-none" />
        
        <header className="mb-16 relative">
          <Link to="/" className="flex items-center gap-4 mb-4 group">
             <div className="w-10 h-10 rounded-2xl bg-brand-red flex items-center justify-center text-white font-black italic shadow-lg shadow-brand-red/20 group-hover:scale-110 transition-transform">A</div>
             <div>
                <h1 className="text-xl font-display font-black tracking-tighter uppercase italic leading-none gothic-glow">Void Control</h1>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">Terminal Status: Online</p>
             </div>
          </Link>
        </header>

        <nav className="space-y-4 flex-1">
          {[
            { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
            { id: 'inventory', label: 'VAULT INVENTORY', icon: Database },
            { id: 'orders', label: 'TRANSMISSIONS', icon: ShoppingBag },
            {id: 'requests', label: 'BALANCE INJECTS', icon: Wallet, count: (requests.filter(r => r.status === 'pending').length + giftCardRequests.filter(r => r.status === 'pending').length) },
            { id: 'support', label: 'SUPPORT CHAT', icon: Phone },
            { id: 'giftcards', label: 'GIFT VOUCHERS', icon: CreditCard },
            { id: 'reviews', label: 'CURATED REVIEWS', icon: MessageSquare },
            { id: 'users', label: 'SUBJECTS', icon: Users },
            { id: 'settings', label: 'VOID SETTINGS', icon: Settings },
          ].map(item => (
            <motion.button
              key={item.id}
              whileHover={{ x: 8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-white text-black shadow-2xl shadow-white/10' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-6 relative z-10">
                <item.icon className={`w-5 h-5 transition-transform duration-500 ${activeTab === item.id ? 'text-black' : 'text-white/40 group-hover:scale-110 group-hover:text-white'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
              
              {item.count ? (
                <span className="bg-brand-red text-white text-[8px] font-black px-2 py-1 rounded-full relative z-10">{item.count}</span>
              ) : activeTab === item.id && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 w-1.5 h-8 bg-brand-red rounded-full" />
              )}
            </motion.button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5 space-y-6">
           <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                 <span className="text-white/20">VOID INTEGRITY</span>
                 <span className="text-brand-red animate-pulse">99.8%</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ width: ['99%', '99.8%', '99.5%'] }}
                   transition={{ duration: 5, repeat: Infinity }}
                   className="h-full bg-brand-red shadow-[0_0_10px_#E20613]" 
                 />
              </div>
           </div>
           
           <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">SYSTEM LOAD</p>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ width: ['20%', '60%', '45%'] }}
                   transition={{ duration: 10, repeat: Infinity }}
                   className="h-full bg-brand-red" 
                 />
              </div>
           </div>
           
           <button 
             onClick={() => {
               localStorage.removeItem('admin_session');
               navigate('/');
             }} 
             className="w-full flex items-center gap-4 p-6 rounded-[2rem] text-white/20 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black tracking-widest group"
           >
              <LogOut className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> 
              <span>EXIT TERMINAL</span>
           </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto relative p-12 md:p-20">
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-red/5 blur-[180px] -z-10 animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-600/5 blur-[180px] -z-10 pointer-events-none" />

        <div className="max-w-[1500px] mx-auto">
          
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <motion.section 
                key="analytics" 
                initial={{ opacity: 0, scale: 0.98, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 1.02, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="space-y-16"
              >
                <header>
                   <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="inline-block px-4 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[9px] font-black tracking-[0.4em] text-brand-red mb-6 uppercase">LIVE ANALYTICS</motion.div>
                   <h2 className="text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">Terminal<br />Yield</h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   <StatCard label="GROSS REVENUE" value={`₹${stats.totalRevenue.toLocaleString()}`} trend="+12.5%" icon={<DollarSign />} />
                   <StatCard label="NET PROFIT" value={`₹${stats.totalProfit.toLocaleString()}`} trend="+8.2%" color="text-brand-red" icon={<TrendingUp />} />
                   <StatCard label="SUBJECT REGISTRY" value={users.length.toString()} trend="+3" icon={<Users />} />
                   <StatCard label="SYNC ORDERS" value={orders.filter(o => o.status === 'pending').length.toString()} icon={<Activity className="text-orange-500" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <ChartBox title="FLUX TRANSMISSION">
                      <ResponsiveContainer width="100%" height={300}>
                         <AreaChart data={stats.chartData}>
                            <defs>
                               <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#E20613" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#E20613" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#E20613" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </ChartBox>
                   <ChartBox title="GROWTH CORRELATION">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.chartData} margin={{ top: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                           <XAxis dataKey="name" stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                           <YAxis stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                           <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff05', borderRadius: '16px' }} />
                           <Bar dataKey="profit" fill="#ffffff" radius={[12, 12, 0, 0]} barSize={24} />
                        </BarChart>
                     </ResponsiveContainer>
                   </ChartBox>
                </div>
              </motion.section>
            )}

            {activeTab === 'inventory' && (
              <motion.section 
                key="inventory" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-16"
              >
                 <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                    <div>
                        <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black tracking-[0.4em] text-white/40 mb-6 uppercase">VAULT MANAGEMENT</motion.div>
                        <h2 className="text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.9]">The<br />Vault</h2>
                        <div className="flex gap-4 mt-8">
                           <button onClick={seedSystemProducts} className="px-6 py-2 bg-brand-red/10 border border-brand-red/20 rounded-xl text-[8px] font-black uppercase tracking-widest text-brand-red hover:bg-brand-red hover:text-white transition-all">SYSTEM SEED</button>
                            <button onClick={nukeAllProducts} className="px-8 py-3 bg-brand-red text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(255,0,0,0.3)]">PERMANENTLY WIPE STORE</button>
                           <button onClick={updateAllPrices} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all">FIX PRICES (₹449)</button>
                         </div>
                    </div>
                    <Button 
                      onClick={() => { resetProductForm(); setIsModalOpen(true); }} 
                      className="rounded-[2.5rem] bg-white text-black hover:bg-brand-red hover:text-white px-12 h-24 font-black text-xs space-x-6 group transition-all relative overflow-hidden"
                    >
                       <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
                       <span className="tracking-[0.4em] uppercase">MATERIALIZE ARTIFACT</span>
                    </Button>
                 </header>

                 <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                    <table className="w-full text-left">
                       <thead className="border-b border-white/5">
                          <tr className="text-[9px] uppercase font-black tracking-[0.5em] text-white/20">
                             <th className="p-10">Artifact Identity</th>
                             <th className="p-10 text-center">Category Flux</th>
                             <th className="p-10 text-center">Extraction unit</th>
                             <th className="p-10 text-center">Vault Load</th>
                             <th className="p-10 text-right pr-16">Operations</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {products.map((p, i) => (
                             <motion.tr 
                               key={p.id}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: i * 0.05 }}
                               className="group hover:bg-white/[0.03] transition-colors"
                             >
                                <td className="p-10">
                                   <div className="flex items-center gap-8">
                                      <div className="w-20 h-24 rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative group-hover:scale-105 transition-transform duration-700">
                                         {p.imageUrl ? (
                                           <img src={p.imageUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt={p.name} />
                                         ) : (
                                           <div className="w-full h-full flex items-center justify-center opacity-10">
                                             <Package className="w-8 h-8" />
                                           </div>
                                         )}
                                      </div>
                                      <div>
                                         <p className="text-2xl font-display font-black tracking-tighter uppercase italic leading-none mb-3">{p.name}</p>
                                         <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">Ref ID: {p.id.slice(0, 8)}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-10 text-center">
                                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{p.category}</span>
                                </td>
                                <td className="p-10 text-center font-display font-black tracking-tighter italic text-2xl">₹ {p.price.toLocaleString()}</td>
                                <td className="p-10 text-center">
                                   <div className="flex flex-col items-center gap-2">
                                      <span className={`text-[9px] font-black px-5 py-2 rounded-full border transition-colors ${
                                        p.stock <= 5 
                                          ? 'bg-brand-red/10 border-brand-red/20 text-brand-red animate-pulse' 
                                          : 'bg-white/5 border-white/10 text-white/60'
                                      }`}>
                                         {p.stock} ARCHIVED
                                      </span>
                                   </div>
                                </td>
                                <td className="p-10 text-right pr-16">
                                   <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                      <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => openEditModal(p)} 
                                        className="p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all"
                                      >
                                        <Edit3 className="w-5 h-5 text-white/40 hover:text-white" />
                                      </motion.button>
                                      <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                         onClick={async () => { 
                                           if(confirm("Destroy artifact permanent?")) {
                                             await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
                                             setProducts(products.filter(x => x.id !== p.id));
                                           }
                                         }} 
                                        className="p-5 bg-white/5 hover:bg-brand-red/20 hover:text-brand-red rounded-3xl transition-all"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </motion.button>
                                   </div>
                                </td>
                             </motion.tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.section>
            )}

            {activeTab === 'requests' && (
               <motion.section key="req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                  <header>
                    <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic">Inject Requests</h2>
                    <p className="text-white/40 font-serif italic text-lg">Verification required for credit materialization.</p>
                  </header>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Balance Requests */}
                     {requests.map(req => (
                        <div key={req.id} className={`p-10 rounded-[3rem] border transition-all ${req.status === 'pending' ? 'bg-[#0A0A0A] border-white/10' : 'bg-black/40 border-white/5 opacity-40'}`}>
                           <div className="flex justify-between items-start mb-8">
                              <div className="space-y-2">
                                 <span className="text-[8px] font-black tracking-widest text-brand-red bg-brand-red/10 px-2 py-1 rounded">CREDIT TOP-UP</span>
                                 <h4 className="text-2xl font-display font-black tracking-tighter uppercase mt-2">{req.userName}</h4>
                                 <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">TXID: {req.transactionId || 'NOT PROVIDED'}</p>
                              </div>
                              <div className="text-right space-y-1">
                                 <p className="text-3xl font-display font-black tracking-tighter italic">₹ {req.amount}</p>
                                 <p className={`text-[10px] uppercase font-black tracking-widest ${req.status === 'pending' ? 'text-brand-red' : 'text-green-500'}`}>{req.status}</p>
                              </div>
                           </div>
                           
                           {req.status === 'pending' && (
                              <div className="flex gap-4">
                                 <Button onClick={() => handleApproveBalanceRequest(req)} className="flex-1 bg-white text-black hover:bg-green-500 hover:text-white rounded-2xl h-14 font-black text-xs">APPROVE INJECTION</Button>
                                 <Button variant="outline" onClick={async () => await fetch(`/api/balance_requests/${req.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) })} className="px-8 border-white/10 text-white/40 hover:text-white rounded-2xl h-14 font-black text-xs">REJECT</Button>
                              </div>
                           )}
                        </div>
                     ))}

                     {/* Gift Card Requests */}
                     {giftCardRequests.map(req => (
                        <div key={req.id} className={`p-10 rounded-[3rem] border transition-all ${req.status === 'pending' ? 'bg-[#0A0A0A] border-white/10' : 'bg-black/40 border-white/5 opacity-40'}`}>
                           <div className="flex justify-between items-start mb-8">
                              <div className="space-y-2">
                                 <span className="text-[8px] font-black tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded">GIFT VOUCHER PURCHASE</span>
                                 <h4 className="text-2xl font-display font-black tracking-tighter uppercase mt-2">{req.userName}</h4>
                                 <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">TXID: {req.transactionId || 'NOT PROVIDED'}</p>
                              </div>
                              <div className="text-right space-y-1">
                                 <p className="text-3xl font-display font-black tracking-tighter italic">₹ {req.amount}</p>
                                 <p className={`text-[10px] uppercase font-black tracking-widest ${req.status === 'pending' ? 'text-brand-red' : 'text-green-500'}`}>{req.status}</p>
                              </div>
                           </div>
                           
                           {req.status === 'pending' ? (
                              <div className="flex gap-4">
                                 <Button onClick={() => handleApproveGiftCardRequest(req)} className="flex-1 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl h-14 font-black text-xs">MATERIALIZE CODE</Button>
                                 <Button variant="outline" onClick={async () => await fetch(`/api/gift_card_requests/${req.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) })} className="px-8 border-white/10 text-white/40 hover:text-white rounded-2xl h-14 font-black text-xs">REJECT</Button>
                              </div>
                           ) : req.status === 'approved' && (
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                 <p className="text-[8px] font-black uppercase text-white/20 mb-2">MATERIALIZED CODE</p>
                                 <p className="text-xl font-mono font-black text-brand-red tracking-widest">{req.materializedCode}</p>
                              </div>
                           )}
                        </div>
                     ))}
                     
                     {(requests.length === 0 && giftCardRequests.length === 0) && <p className="text-white/10 italic p-20 text-center border-2 border-dashed border-white/5 rounded-[4rem] col-span-full">No payment signals detected.</p>}
                  </div>
               </motion.section>
            )}

            {activeTab === 'support' && (
               <motion.section key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                  <header>
                    <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic">Support</h2>
                    <p className="text-white/40 font-serif italic text-lg">Active signals from the surface.</p>
                  </header>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 h-[600px]">
                     <div className="lg:col-span-1 rounded-[3rem] bg-white/5 border border-white/10 overflow-hidden flex flex-col">
                        <div className="p-6 bg-white/5 border-b border-white/10 uppercase font-black text-[10px] tracking-widest">Active Channels</div>
                        <div className="flex-1 overflow-y-auto">
                           {chats.map(chat => (
                              <button 
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.userId)}
                                className={`w-full p-6 text-left border-b border-white/5 hover:bg-white/5 transition-all ${activeChatId === chat.userId ? 'bg-white/10 border-r-4 border-r-brand-red' : ''}`}
                              >
                                 <p className="font-display font-black uppercase italic leading-none truncate mb-2">{chat.userName || 'Subject'}</p>
                                 <p className="text-[8px] uppercase font-black text-white/20 tracking-widest truncate">{chat.lastMessage}</p>
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="lg:col-span-2 rounded-[4rem] bg-[#0A0A0A] border border-white/10 p-10 flex flex-col">
                        {activeChatId ? (
                           <>
                              <div className="flex-1 overflow-y-auto space-y-6 pb-6">
                                 {chatMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                       <div className={`max-w-[70%] p-6 rounded-3xl text-xs font-medium ${msg.isAdmin ? 'bg-brand-red text-white' : 'bg-white/10 text-white'}`}>
                                          {msg.text}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                              <div className="flex gap-4 pt-6 border-t border-white/10">
                                 <input 
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-brand-red transition-all"
                                    placeholder="Enter Response Signal..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendChatReply(activeChatId)}
                                 />
                                 <Button onClick={() => handleSendChatReply(activeChatId)} className="rounded-2xl bg-white text-black px-8 font-black hover:bg-brand-red hover:text-white transition-all">SEND</Button>
                              </div>
                           </>
                        ) : (
                           <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                              <Phone className="w-16 h-16 mb-4" />
                              <p className="text-[10px] font-black uppercase tracking-widest">Select a channel to begin transmission</p>
                           </div>
                        )}
                     </div>
                  </div>
               </motion.section>
            )}

            {activeTab === 'giftcards' && (
               <motion.section key="gift" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                  <header className="flex justify-between items-end">
                    <div>
                       <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic">Gift Vouchers</h2>
                       <p className="text-white/40 font-serif italic text-lg">Value vessels for external entities.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                       <input 
                         type="number" 
                         placeholder="AMOUNT ₹" 
                         className="h-16 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-red outline-none text-xs font-black"
                         value={customGiftAmount}
                         onChange={(e) => setCustomGiftAmount(e.target.value)}
                       />
                       <Button onClick={handleGenerateGiftCard} className="h-16 rounded-2xl bg-white text-black hover:bg-brand-red hover:text-white px-10 font-black">GENERATE CODE</Button>
                    </div>
                  </header>

                  <div className="bg-black/40 border border-white/5 rounded-[3rem] overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-white/5">
                           <tr className="text-[10px] uppercase font-black tracking-widest text-white/40">
                              <th className="p-8">Code Sequence</th>
                              <th className="p-8">Stored Value</th>
                              <th className="p-8">Sync Status</th>
                              <th className="p-8">Materialized At</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {giftCards.map(gc => (
                              <tr key={gc.id} className="text-sm font-bold">
                                 <td className="p-8 font-mono text-brand-red tracking-[0.2em]">{gc.code}</td>
                                 <td className="p-8 italic font-display text-lg">₹ {gc.amount}</td>
                                 <td className="p-8 uppercase text-[10px] font-black">{gc.status}</td>
                                 <td className="p-8 text-[10px] opacity-40 uppercase">{gc.createdAt?.toDate().toLocaleDateString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </motion.section>
            )}

            {activeTab === 'orders' && (
              <motion.section key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                 <header>
                    <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic">Transmissions</h2>
                    <p className="text-white/40 font-serif italic text-lg">Active deployment streams.</p>
                  </header>

                  <div className="bg-black border border-white/5 rounded-[3rem] overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-white/5">
                           <tr className="text-[10px] uppercase font-black tracking-widest text-white/40">
                              <th className="p-8">Sync ID</th>
                              <th className="p-8">Entity</th>
                              <th className="p-8">Payload</th>
                              <th className="p-8">Sync Method</th>
                              <th className="p-8">Terminal Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {orders.map(o => (
                              <tr key={o.id} className="group hover:bg-white/[0.02]">
                                 <td className="p-8 font-mono text-[10px] text-white/20 uppercase">#{o.id.slice(0, 12)}</td>
                                 <td className="p-8 text-sm font-bold uppercase truncate max-w-[150px]">{o.userName || o.userId}</td>
                                 <td className="p-8">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] px-2 py-1 bg-white/5 rounded font-black">{o.items.length} Artifacts</span>
                                       <span className="text-sm font-black tracking-tighter">₹ {o.total}</span>
                                    </div>
                                 </td>
                                 <td className="p-8 text-[10px] uppercase font-black opacity-40">{o.paymentMethod}</td>
                                 <td className="p-8">
                                    <div className="flex flex-col gap-2">
                                       <select 
                                          value={o.status}
                                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                          className={`bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer ${
                                             o.status === 'pending' ? 'text-orange-500' :
                                             o.status === 'verifying' ? 'text-brand-red' :
                                             o.status === 'processing' ? 'text-blue-200' :
                                             o.status === 'shipped' ? 'text-blue-500' :
                                             o.status === 'delivered' ? 'text-green-500' : 'text-red-500'
                                          }`}
                                       >
                                          <option value="pending">PENDING</option>
                                          <option value="verifying">VERIFYING</option>
                                          <option value="processing">PROCESSING</option>
                                          <option value="shipped">SHIPPED</option>
                                          <option value="delivered">DELIVERED</option>
                                          <option value="cancelled">CANCELLED</option>
                                       </select>
                                       <button 
                                         onClick={() => handleUpdateDeliveryTime(o.id)}
                                         className="text-[8px] uppercase tracking-widest text-white/20 hover:text-white"
                                       >
                                          {o.estimatedDelivery || 'SET DELIVERY TIME'}
                                       </button>
                                       {o.paymentDetails?.proofImageUrl && (
                                          <a href={o.paymentDetails.proofImageUrl} target="_blank" rel="noreferrer" className="text-[8px] uppercase tracking-widest text-brand-red underline">VIEW PROOF</a>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
              </motion.section>
            )}

            {activeTab === 'reviews' && (
                <motion.section key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                   <header className="flex justify-between items-end">
                      <div>
                         <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic">Curated Reviews</h2>
                         <p className="text-white/40 font-serif italic text-lg">Testimonials materialized from the surface subjects.</p>
                      </div>
                      <Button 
                         onClick={async () => {
                           const author = prompt("Author Name?");
                           const tag = prompt("Tag (e.g. ELITE UNIT)?");
                           const text = prompt("Review Content?");
                           if (author && text) {
                              await fetch('/api/store_reviews', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  author, tag: tag || 'ELITE UNIT', text, createdAt: new Date().toISOString()
                                })
                              });
                              alert("Review Capture Successful.");
                           }
                         }}
                         className="h-16 rounded-2xl bg-white text-black hover:bg-brand-red hover:text-white px-10 font-black"
                      >
                         NEW TESTIMONIAL
                      </Button>
                   </header>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {storeReviews.map(rev => (
                        <div key={rev.id} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-6 relative group">
                           <div className="flex justify-between items-start">
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-red">{rev.tag}</p>
                                 <h4 className="text-xl font-display font-black italic">{rev.author}</h4>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={async () => { if(confirm("Destroy testimonial?")) await fetch(`/api/store_reviews/${rev.id}`, { method: 'DELETE' }); setStoreReviews(storeReviews.filter(r => r.id !== rev.id)); }} className="p-4 bg-white/5 hover:bg-brand-red/20 text-white/20 hover:text-brand-red rounded-2xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              </div>
                           </div>
                           <p className="text-sm font-serif italic text-white/60 leading-relaxed">"{rev.text}"</p>
                        </div>
                      ))}
                      {storeReviews.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                           <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No testimonials captured.</p>
                        </div>
                      )}
                   </div>
                </motion.section>
             )}

            {activeTab === 'users' && (
               <motion.section key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                  <header>
                    <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic">Accounts</h2>
                    <p className="text-white/40 font-serif italic text-lg">Registry of active entities in the void.</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                     {users.map(u => (
                        <div key={u.id} className="p-10 rounded-[3rem] bg-white/5 border border-white/5 group hover:border-white/20 transition-all space-y-8">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xs font-black">
                                    {u.displayName?.[0] || 'U'}
                                 </div>
                                 <div className="max-w-[150px]">
                                    <p className="text-xl font-display font-black tracking-tighter uppercase italic leading-tight truncate">{u.displayName}</p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mt-2 truncate">{u.email}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] text-brand-red uppercase font-black tracking-widest mb-1">Balance</p>
                                 <p className="text-2xl font-display font-black tracking-tighter italic">₹ {u.balance?.toFixed(0)}</p>
                              </div>
                           </div>

                           <div className="space-y-4 pt-4 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-3">
                                 <Phone className="w-3 h-3 text-white/20" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">{u.phone || 'NO TERMINAL ID'}</span>
                              </div>
                              <div className="flex items-start gap-3">
                                 <MapPin className="w-3 h-3 text-white/20 mt-1" />
                                 <span className="text-[10px] font-medium leading-relaxed opacity-60 line-clamp-2">{u.address || 'COORDINATES MISSING'}</span>
                              </div>
                           </div>
                           
                           <div className="flex gap-4">
                              <Button 
                               onClick={async () => {
                                 const amt = prompt("Credit Amount?");
                                 if(amt) {
                                    const userRes = await fetch(`/api/user_profiles?userId=${u.id}`);
                                    const userData = await userRes.json();
                                    if (userData.length > 0) {
                                      const profile = userData[0];
                                      await fetch(`/api/user_profiles/${profile.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ balance: (profile.balance || 0) + parseFloat(amt) })
                                      });
                                      alert("Credits Inject Successful.");
                                    }
                                  }
                               }}
                               className="flex-1 h-12 rounded-xl bg-white text-black hover:bg-brand-red hover:text-white transition-all text-[10px] font-black"
                              >
                                 QUICK CREDIT
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={async () => {
                                  const bal = prompt("Set Absolute Balance?");
                                  if(bal) {
                                      const userRes = await fetch(`/api/user_profiles?userId=${u.id}`);
                                      const userData = await userRes.json();
                                      if (userData.length > 0) {
                                        const profile = userData[0];
                                        await fetch(`/api/user_profiles/${profile.id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ balance: parseFloat(bal) })
                                        });
                                        alert("Balance Overwrite Successful.");
                                      }
                                   }
                                }}
                                className="px-6 h-12 rounded-xl border-white/5 text-white/20 hover:text-white transition-all"
                              >
                                 <Wallet className="w-4 h-4" />
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.section>
            )}
             {activeTab === 'settings' && (
                <motion.section key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                   <header>
                     <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic">Void Settings</h2>
                     <p className="text-white/40 font-serif italic text-lg">Reconfigure the matrix parameters.</p>
                   </header>
 
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="p-12 rounded-[3.5rem] bg-white/5 border border-white/5 space-y-10">
                         <div className="flex items-center gap-4 text-brand-red">
                            <Phone className="w-6 h-6" />
                            <h3 className="text-2xl font-display font-black uppercase tracking-tight italic">Customer Care</h3>
                         </div>
                         <div className="space-y-6">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Contact Number</label>
                               <input 
                                  value={systemSettings.customerCareNumber}
                                  onChange={e => setSystemSettings({...systemSettings, customerCareNumber: e.target.value})}
                                  className="admin-input"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Contact Email</label>
                               <input 
                                  value={systemSettings.customerCareEmail}
                                  onChange={e => setSystemSettings({...systemSettings, customerCareEmail: e.target.value})}
                                  className="admin-input"
                               />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                               <span className="text-xs font-black uppercase tracking-widest text-white/60">Operational Status</span>
                               <button 
                                 type="button"
                                 onClick={() => setSystemSettings({...systemSettings, isCareOnline: !systemSettings.isCareOnline})}
                                 className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${systemSettings.isCareOnline ? 'bg-green-500 text-white' : 'bg-brand-red text-white'}`}
                               >
                                  {systemSettings.isCareOnline ? 'ONLINE' : 'OFFLINE'}
                               </button>
                            </div>
                         </div>
                      </div>
 
                      <div className="p-12 rounded-[3.5rem] bg-white/5 border border-white/5 space-y-10">
                         <div className="flex items-center gap-4 text-brand-red">
                            <CreditCard className="w-6 h-6" />
                            <h3 className="text-2xl font-display font-black uppercase tracking-tight italic">Payment Protocols</h3>
                         </div>
                         <div className="space-y-6">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-widest text-white/20">UPI Destination</label>
                               <input 
                                  value={systemSettings.paymentMethods.upi}
                                  onChange={e => setSystemSettings({
                                    ...systemSettings, 
                                    paymentMethods: {...systemSettings.paymentMethods, upi: e.target.value}
                                  })}
                                  className="admin-input"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Bank Coordinates</label>
                               <textarea 
                                  value={systemSettings.paymentMethods.bankTransfer}
                                  onChange={e => setSystemSettings({
                                    ...systemSettings, 
                                    paymentMethods: {...systemSettings.paymentMethods, bankTransfer: e.target.value}
                                  })}
                                  className="admin-input min-h-[100px]"
                               />
                            </div>
                         </div>
                      </div>
                   </div>
 
                   <div className="flex justify-end">
                      <Button 
                        onClick={async () => {
                          try {
                            await fetch('/api/settings/system', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(systemSettings) });
                             // 

                            //

                            await fetch('/api/site_config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteConfig) });
                            alert("MATRIX PARAMETERS UPDATED.");
                          } catch (err) {
                            console.error(err);
                            alert("SYNC FAILED.");
                          }
                        }}
                        className="h-20 px-20 rounded-3xl bg-brand-red text-white hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest"
                      >
                         SAVE SYSTEM CONFIGURATION
                      </Button>
                   </div>
                </motion.section>
             )}
          </AnimatePresence>

        </div>
      </main>

      {/* Artifact Materialization Modal */}
      <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 p-12 rounded-[4rem] space-y-12 h-[80vh] overflow-y-auto">
                  <header className="flex justify-between items-center">
                     <h3 className="text-4xl font-display font-black tracking-tighter uppercase italic">{isEditMode ? 'REALIGN ARTIFACT' : 'MATERIALIZE ARTIFACT'}</h3>
                     <button onClick={() => { setIsModalOpen(false); resetProductForm(); }} className="text-white/20 hover:text-white"><X className="w-8 h-8" /></button>
                  </header>

                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-[4/5] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-brand-red group overflow-hidden relative transition-all"
                        >
                           {newProduct.imagePreview || newProduct.imageUrl ? <img src={newProduct.imagePreview || newProduct.imageUrl} className="w-full h-full object-cover" /> : (
                              <div className="text-center space-y-4">
                                 <Plus className="w-12 h-12 text-white/10 group-hover:text-brand-red transition-colors mx-auto" />
                                 <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">Upload Visual Artifact</p>
                              </div>
                           )}
                           <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                              const f = e.target.files?.[0];
                              if(f) setNewProduct({...newProduct, image: f, imagePreview: URL.createObjectURL(f)});
                           }} />
                        </div>
                        <input 
                          value={newProduct.imageUrl} 
                          onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} 
                          className="admin-input !text-[10px]" 
                          placeholder="OR PASTE IMAGE URL" 
                        />
                        
                        <div className="space-y-4 pt-4">
                           <div className="flex justify-between items-center">
                              <label className="text-[8px] font-black uppercase tracking-widest text-white/20">SECONDARY ARTIFACTS</label>
                              {secondaryUploading && <Loader2 className="w-3 h-3 text-brand-red animate-spin" />}
                           </div>
                           <div className="grid grid-cols-4 gap-2">
                              {newProduct.images.map((img, idx) => (
                                 <div key={idx} className="aspect-square rounded-xl bg-white/5 border border-white/10 relative group overflow-hidden">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button 
                                       type="button"
                                       onClick={() => {
                                          const next = [...newProduct.images];
                                          next.splice(idx, 1);
                                          setNewProduct({...newProduct, images: next});
                                       }}
                                       className="absolute inset-0 bg-brand-red/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                       <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                 </div>
                              ))}
                              <button 
                                 type="button"
                                 onClick={() => secondaryFileInputRef.current?.click()}
                                 className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center hover:border-white/20 transition-all text-white/20 hover:text-white"
                              >
                                 <Upload className="w-4 h-4" />
                              </button>
                              <button 
                                 type="button"
                                 onClick={() => {
                                    const url = prompt("Enter secondary image URL:");
                                    if(url) setNewProduct({...newProduct, images: [...newProduct.images, url]});
                                 }}
                                 className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center hover:border-white/20 transition-all text-white/20 hover:text-white"
                              >
                                 <Plus className="w-4 h-4" />
                              </button>
                           </div>
                           <input 
                              type="file" 
                              multiple 
                              ref={secondaryFileInputRef} 
                              className="hidden" 
                              onChange={handleSecondaryImageUpload}
                              accept="image/*"
                           />
                        </div>
                     </div>

                     <div className="space-y-6">
                        <input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="admin-input" placeholder="PRODUCT NAME" />
                        <div className="grid grid-cols-2 gap-4">
                           <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="admin-input" placeholder="PRICE ₹" />
                           <input type="number" value={newProduct.costPrice} onChange={e => setNewProduct({...newProduct, costPrice: e.target.value})} className="admin-input" placeholder="COST ₹" />
                        </div>
                        <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="admin-input" placeholder="INITIAL STOCK" />
                        <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="admin-input uppercase font-black text-[10px]">
                           {[
                              'Official Jerseys', 
                              'Retro Jerseys', 
                              'Embroidery Jerseys', 
                              'High Quality Jerseys', 
                              'Sale Jerseys', 
                              'Limited Edition Jerseys', 
                              'Player Edition Jerseys', 
                              'Club Jerseys', 
                              'National Team Jerseys', 
                              'Custom Name Jerseys', 
                              'Training Kits', 
                              'Shorts', 
                              'Socks'
                           ].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="admin-input min-h-[100px]" placeholder="DESCRIPTION" />
                        
                        <div className="grid grid-cols-1 gap-4">
                           <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase tracking-widest text-white/20">TARGET SECTOR</label>
                              <select value={newProduct.gender} onChange={e => setNewProduct({...newProduct, gender: e.target.value})} className="admin-input uppercase font-black text-[10px]">
                                 <option value="unisex">UNISEX / NEUTRAL</option>
                                 <option value="men">SECTOR M (MEN)</option>
                                 <option value="women">SECTOR W (WOMEN)</option>
                              </select>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <input value={newProduct.club} onChange={e => setNewProduct({...newProduct, club: e.target.value})} className="admin-input" placeholder="CLUB CODE" />
                              <input value={newProduct.country} onChange={e => setNewProduct({...newProduct, country: e.target.value})} className="admin-input" placeholder="COUNTRY CODE" />
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <input 
                            type="checkbox" 
                            id="isFeatured" 
                            checked={newProduct.isFeatured} 
                            onChange={e => setNewProduct({...newProduct, isFeatured: e.target.checked})}
                            className="accent-brand-red w-4 h-4"
                          />
                          <label htmlFor="isFeatured" className="text-[10px] uppercase font-black tracking-widest text-white/40">Featured Artifact</label>
                        </div>

                        <Button type="submit" disabled={uploading} className="w-full h-16 rounded-2xl bg-white text-black hover:bg-brand-red hover:text-white font-black text-xs uppercase tracking-widest">
                           {uploading ? 'TRANSMITTING...' : isEditMode ? 'UPDATE RECORD' : 'COMMIT TO VAULT'}
                        </Button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <style>{`
         .admin-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1.25rem 1.5rem;
            border-radius: 1.25rem;
            font-size: 0.875rem;
            color: white;
            transition: all 0.3s;
         }
         .admin-input:focus {
            outline: none;
            border-color: #8b0000;
            background: rgba(255,255,255,0.08);
         }
         select.admin-input option {
           background: #111;
           color: white;
         }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, count }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-500 overflow-hidden relative group ${
      active ? 'bg-white text-black shadow-2xl' : 'text-white/40 hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-4">
       <span className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:translate-x-2'}`}>{icon}</span>
       <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
    </div>
    {count && count > 0 && (
      <span className="bg-brand-red text-white text-[8px] font-black px-2 py-1 rounded-full">{count}</span>
    )}
  </button>
);

const StatCard = ({ label, value, trend, icon, color }: any) => (
  <div className="p-8 rounded-[3rem] bg-white/5 border border-white/5 space-y-4 hover:border-brand-red/30 transition-all group">
     <div className="flex justify-between items-center text-white/20 group-hover:text-brand-red transition-colors">
        <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
        {icon || <Activity className="w-4 h-4" />}
     </div>
     <div className={`text-4xl font-display font-black tracking-tighter italic ${color || ''}`}>{value}</div>
     {trend && (
        <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest font-black text-green-500">
           <TrendingUp className="w-3 h-3" /> {trend} SYNC
        </div>
     )}
  </div>
);

const ChartBox = ({ title, children }: any) => (
  <div className="p-10 rounded-[4rem] bg-[#0A0A0A] border border-white/5 space-y-10 group">
     <h4 className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20 text-center">{title}</h4>
     <div className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-60 group-hover:opacity-100">
        {children}
     </div>
  </div>
);
