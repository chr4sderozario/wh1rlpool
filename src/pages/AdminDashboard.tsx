import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Plus, Trash2, Edit3, Settings, LogOut, Loader2, 
  Users, ShoppingBag, BarChart3, ChevronRight, User as UserIcon,
  CreditCard, TrendingUp, DollarSign, Activity, Database, X, Upload, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  deleteDoc, doc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firebaseUtils';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';

interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  status: string;
  createdAt: any;
}

interface UserProfile {
  id: string;
  displayName?: string;
  email?: string;
  role: string;
  phone?: string;
  city?: string;
  country?: string;
  createdAt?: any;
}

type Tab = 'inventory' | 'orders' | 'users' | 'profits' | 'system';

export const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    costPrice: '',
    stock: '',
    category: 'Jersey',
    description: '',
    image: null as File | null,
    imagePreview: ''
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdmin) return;

    // Fetch Products
    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    // Fetch Orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });

    // Fetch Users
    const unsubUsers = onSnapshot(collection(db, 'users'), async (snapshot) => {
       const userList: UserProfile[] = [];
       for (const userDoc of snapshot.docs) {
          try {
             const profileSnap = await getDocs(collection(db, 'users', userDoc.id, 'public'));
             const profile = profileSnap.docs.find(d => d.id === 'profile')?.data();
             if (profile) {
                userList.push({ id: userDoc.id, ...profile } as UserProfile);
             }
          } catch(e) {}
       }
       setUsers(userList);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
    };
  }, [isAdmin, authLoading, navigate]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const totalProfit = orders.reduce((acc, o) => {
      const orderProfit = o.items.reduce((itemAcc, item) => {
        const prod = products.find(p => p.id === item.id);
        const margin = prod ? (prod.price - Number(prod.costPrice || 0)) : (item.price * 0.3);
        return itemAcc + (margin * (item.quantity || 1));
      }, 0);
      return acc + orderProfit;
    }, 0);

    return { totalRevenue, totalProfit };
  }, [orders, products]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProduct(prev => ({ 
        ...prev, 
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    
    setUploading(true);
    let imageUrl = '';

    try {
      // 1. Upload Image if exists
      if (newProduct.image) {
        const storageRef = ref(storage, `products/${Date.now()}_${newProduct.image.name}`);
        const snapshot = await uploadBytes(storageRef, newProduct.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Add to Firestore
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        price: Number(newProduct.price),
        costPrice: Number(newProduct.costPrice),
        stock: Math.floor(Number(newProduct.stock)),
        category: newProduct.category,
        description: newProduct.description,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      // 3. Reset and Close
      setIsModalOpen(false);
      setNewProduct({
        name: '',
        price: '',
        costPrice: '',
        stock: '',
        category: 'Jersey',
        description: '',
        image: null,
        imagePreview: ''
      });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product artifact.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-t-2 border-brand-red rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-8 space-y-12 bg-[#050505]">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tighter gothic-glow">WH1RLPOOL</h1>
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-red font-bold">Admin Terminal</span>
        </div>

        <nav className="flex-1 space-y-4">
          <NavItem icon={<BarChart3 />} label="Dashboard" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
          <NavItem icon={<Package />} label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <NavItem icon={<ShoppingBag />} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <NavItem icon={<Users />} label="Accounts" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <NavItem icon={<TrendingUp />} label="Profits" active={activeTab === 'profits'} onClick={() => setActiveTab('profits')} />
        </nav>

        <div className="pt-8 border-t border-white/5">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 text-white/20 hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Exit Terminal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-black relative">
        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          
          <AnimatePresence mode="wait">
            {activeTab === 'inventory' && (
              <motion.section key="inv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <header className="flex justify-between items-end mb-12">
                  <div>
                    <h2 className="text-5xl font-display font-bold tracking-tighter uppercase italic">Inventory</h2>
                    <p className="text-white/40 text-sm italic font-serif">Curate the artifact collection.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-brand-red hover:text-white transition-all duration-500 rounded-full"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <StatCard label="Active SKU" value={products.length.toString()} icon={<Database className="w-4 h-4" />} />
                  <StatCard label="Items in Void" value={products.reduce((acc, p) => acc + p.stock, 0).toString()} icon={<Activity className="w-4 h-4" />} />
                </div>

                <div className="glass overflow-hidden rounded-[2rem]">
                  <table className="w-full text-left">
                    <thead className="bg-white/5">
                      <tr className="text-[10px] uppercase tracking-widest text-white/40">
                        <th className="p-6 font-bold">Item</th>
                        <th className="p-6 font-bold">Category</th>
                        <th className="p-6 font-bold">Price</th>
                        <th className="p-6 font-bold">Stock</th>
                        <th className="p-6 font-bold text-right">Ops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((p) => (
                        <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="p-6 flex items-center gap-4">
                            <div className="w-10 h-12 bg-white/5 border border-white/5 rounded overflow-hidden flex items-center justify-center">
                               {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><Package /></div>}
                            </div>
                            <span className="text-sm font-bold uppercase tracking-tight">{p.name}</span>
                          </td>
                          <td className="p-6 text-[10px] uppercase tracking-widest text-white/40">{p.category}</td>
                          <td className="p-6 text-sm font-mono text-white/60">${p.price}</td>
                          <td className="p-6">
                             <div className={`text-[10px] font-bold px-2 py-1 rounded inline-block ${p.stock < 5 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                               {p.stock} Units
                             </div>
                          </td>
                          <td className="p-6 text-right">
                             <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            )}

            {activeTab === 'users' && (
              <motion.section key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <header className="mb-12">
                  <h2 className="text-5xl font-display font-bold tracking-tighter uppercase italic">Identities</h2>
                  <p className="text-white/40 text-sm italic font-serif">Monitoring members of the collective.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                   <StatCard label="Total Souls" value={users.length.toString()} />
                </div>
                <div className="glass rounded-[2rem] overflow-hidden">
                   <table className="w-full text-left">
                     <thead className="bg-white/5">
                        <tr className="text-[10px] uppercase tracking-widest text-white/40">
                           <th className="p-6">Entity</th>
                           <th className="p-6">Contact</th>
                           <th className="p-6">Location</th>
                           <th className="p-6">Joined</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-white/[0.02]">
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red font-black text-xs">
                                     {u.displayName?.[0] || 'U'}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold uppercase">{u.displayName || 'Unknown'}</p>
                                     <p className="text-[10px] text-white/20 uppercase tracking-widest">{u.role}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-6 text-sm text-white/60">
                               <p>{u.email}</p>
                               <p className="text-[10px] text-white/20">{u.phone || u.whatsapp}</p>
                            </td>
                            <td className="p-6 text-[10px] uppercase tracking-widest text-white/40">
                               {u.city}, {u.country}
                            </td>
                            <td className="p-6 text-[10px] text-white/20">
                               {u.createdAt ? u.createdAt.toDate().toLocaleDateString() : 'Historical'}
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              </motion.section>
            )}

            {activeTab === 'orders' && (
              <motion.section key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <header className="mb-12">
                   <h2 className="text-5xl font-display font-bold tracking-tighter uppercase italic">Transmissions</h2>
                   <p className="text-white/40 text-sm italic font-serif">Deployment queue of artifacts.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                   <StatCard label="Successful Drops" value={orders.length.toString()} />
                   <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
                </div>
                <div className="glass rounded-[2rem] overflow-hidden">
                   <table className="w-full text-left">
                     <thead className="bg-white/5">
                        <tr className="text-[10px] uppercase tracking-widest text-white/40">
                           <th className="p-6">Order ID</th>
                           <th className="p-6">Customer</th>
                           <th className="p-6">Artifacts</th>
                           <th className="p-6">Total</th>
                           <th className="p-6">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-white/[0.02]">
                            <td className="p-6 text-[10px] font-mono text-white/40 uppercase">#{o.id.slice(0,8)}</td>
                            <td className="p-6 text-sm">
                               {users.find(u => u.id === o.userId)?.displayName || 'Unknown Subject'}
                            </td>
                            <td className="p-6">
                               <div className="flex -space-x-2">
                                  {o.items.map((it, idx) => (
                                    <div key={idx} className="w-6 h-6 rounded-full bg-white/10 border border-black flex items-center justify-center text-[8px] font-bold">
                                       {it.quantity}x
                                    </div>
                                  ))}
                                </div>
                            </td>
                            <td className="p-6 text-sm font-mono">${o.total.toFixed(2)}</td>
                            <td className="p-6">
                               <span className={`text-[8px] uppercase font-black px-2 py-1 rounded-full ${o.status === 'pending' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                  {o.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              </motion.section>
            )}

            {activeTab === 'profits' && (
              <motion.section key="profit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <header className="mb-12">
                   <h2 className="text-5xl font-display font-bold tracking-tighter uppercase italic">Extraction</h2>
                   <p className="text-white/40 text-sm italic font-serif">Financial yield from the void.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="glass p-12 rounded-[3rem] space-y-8 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 rounded-full bg-brand-red/10 flex items-center justify-center mb-4">
                         <DollarSign className="w-12 h-12 text-brand-red" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Net Extraction</span>
                        <h3 className="text-7xl font-display font-black tracking-tighter gothic-glow">${stats.totalProfit.toFixed(2)}</h3>
                      </div>
                      <p className="text-white/20 text-xs italic font-serif">Calculated after artifact cost subtraction.</p>
                   </div>

                   <div className="space-y-6">
                      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">Gross Volume</span>
                            <span className="text-lg font-mono">${stats.totalRevenue.toFixed(2)}</span>
                         </div>
                         <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-red" style={{ width: '70%' }} />
                         </div>
                      </div>

                      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">Margin Strength</span>
                            <span className="text-lg font-mono">{((stats.totalProfit / (stats.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                         </div>
                         <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500/50" style={{ width: '45%' }} />
                         </div>
                      </div>
                   </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'system' && (
              <motion.section key="sys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <header className="mb-12">
                   <h2 className="text-5xl font-display font-bold tracking-tighter uppercase italic">System Overview</h2>
                   <p className="text-white/40 text-sm italic font-serif">Digital vitals of WH1RLPOOL.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <SystemModule icon={<Settings />} label="Terminal Config" status="Operational" />
                   <SystemModule icon={<Database />} label="Vault Integrity" status="Encrypted" />
                   <SystemModule icon={<Activity />} label="Flow Stream" status="Live" />
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 onClick={() => !uploading && setIsModalOpen(false)}
                 className="absolute inset-0 bg-black/90 backdrop-blur-md" 
               />
               
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-2xl glass p-8 md:p-12 rounded-[3rem] overflow-hidden"
               >
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <h3 className="text-3xl font-display font-black tracking-tighter uppercase italic mb-8">Add New Artifact</h3>

                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-white/40">Image Upload</label>
                           <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-[3/4] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-brand-red/50 transition-all group overflow-hidden relative"
                           >
                              {newProduct.imagePreview ? (
                                 <img src={newProduct.imagePreview} className="w-full h-full object-cover" />
                              ) : (
                                 <>
                                    <Upload className="w-8 h-8 text-white/10 group-hover:text-brand-red transition-colors" />
                                    <span className="text-[8px] uppercase tracking-widest text-white/20">Drop File Here</span>
                                 </>
                              )}
                              <input 
                                 ref={fileInputRef}
                                 type="file" 
                                 className="hidden" 
                                 accept="image/*"
                                 onChange={handleImageChange}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-4">
                           <input 
                              type="text" 
                              placeholder="ITEM NAME"
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-brand-red outline-none transition-colors uppercase font-bold"
                              required
                           />
                           <div className="grid grid-cols-2 gap-4">
                              <input 
                                 type="number" 
                                 placeholder="PRICE ($)"
                                 value={newProduct.price}
                                 onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                 className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-red transition-colors"
                                 required
                              />
                              <input 
                                 type="number" 
                                 placeholder="COST ($)"
                                 value={newProduct.costPrice}
                                 onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})}
                                 className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-red transition-colors"
                                 required
                              />
                           </div>
                           <input 
                              type="number" 
                              placeholder="STOCK COUNT"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-red transition-colors"
                              required
                           />
                           <select 
                              value={newProduct.category}
                              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                              className="w-full bg-white/10 border border-white/5 rounded-xl px-4 py-3 text-[10px] uppercase tracking-widest outline-none focus:border-brand-red transition-colors"
                           >
                              <option value="Jersey">Jersey</option>
                              <option value="Pants">Pants</option>
                              <option value="Embroidery">Embroidery</option>
                              <option value="OnSale">On Sale</option>
                              <option value="Accessories">Accessories</option>
                           </select>
                           <textarea 
                              placeholder="DESCRIPTION (OPTIONAL)..."
                              value={newProduct.description}
                              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs min-h-[100px] outline-none focus:border-brand-red transition-colors resize-none"
                           />
                        </div>

                        <button 
                           disabled={uploading}
                           className="w-full bg-brand-red text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                           {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                           {uploading ? 'Materializing...' : 'Commit to Vault'}
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Background blurs */}
        <div className="fixed -bottom-48 -right-48 w-[800px] h-[800px] liquid-shape bg-brand-red/[0.03] blur-[160px] pointer-events-none" />
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] uppercase tracking-[0.2em] transition-all duration-500 rounded-2xl group ${
      active 
      ? 'bg-white text-black font-black shadow-[0_10px_30px_rgba(255,255,255,0.1)]' 
      : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}
  >
    <span className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    {label}
  </button>
);

const StatCard = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="glass p-8 rounded-[2rem] space-y-4 group hover:border-brand-red/30 transition-all">
    <div className="flex justify-between items-center">
       <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">{label}</p>
       <div className="text-white/10 group-hover:text-brand-red transition-colors">
          {icon}
       </div>
    </div>
    <div className="text-4xl font-display font-bold tracking-tighter gothic-glow transition-all group-hover:scale-105 origin-left">{value}</div>
  </div>
);

const SystemModule = ({ icon, label, status }: { icon: any; label: string; status: string }) => (
  <div className="glass p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-6 group cursor-crosshair">
     <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-red/10 transition-colors">
        {icon}
     </div>
     <div>
        <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">{label}</h3>
        <p className="text-xl font-display font-black tracking-tighter uppercase italic">{status}</p>
     </div>
  </div>
);
