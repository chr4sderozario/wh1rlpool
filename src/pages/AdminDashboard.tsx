import { motion } from 'motion/react';
import { Package, Plus, Trash2, Edit3, Settings, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firebaseUtils';
import { useAuth } from '@/src/context/AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/login');
      return;
    }

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return unsubscribe;
  }, [isAdmin, authLoading, navigate]);

  const handleAddProduct = async () => {
    const name = prompt("Product Name:");
    const price = Number(prompt("Price:"));
    const stock = Number(prompt("Stock:"));
    
    if (name && !isNaN(price) && !isNaN(stock)) {
      try {
        await addDoc(collection(db, 'products'), {
          name,
          price,
          stock: Math.floor(stock),
          category: 'Default',
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'products');
      }
    }
  };

  const handleDelete = async (id: string) => {
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
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col p-6 space-y-8 bg-black">
        <div className="mb-8">
          <h1 className="text-xl font-display font-black tracking-tighter">WH1RLPOOL</h1>
          <span className="text-[8px] uppercase tracking-widest text-brand-red font-bold">Admin Portal</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<Package className="w-4 h-4" />} label="Inventory" active />
          <NavItem icon={<Edit3 className="w-4 h-4" />} label="Edit Site" />
          <NavItem icon={<Settings className="w-4 h-4" />} label="System Settings" />
        </nav>

        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" /> Exit
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-black/50">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold tracking-tighter uppercase">Inventory Management</h2>
            <p className="text-white/40 text-sm italic font-serif">Curate the latest collections.</p>
          </div>
          <button 
            onClick={handleAddProduct}
            className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-brand-silver transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard label="Total Stock" value={products.reduce((acc, p) => acc + p.stock, 0).toLocaleString()} />
          <StatCard label="Open Orders" value="0" />
          <StatCard label="Active Items" value={products.length.toString()} />
        </div>

        {/* Products Table */}
        <div className="border border-white/10 bg-white/5 p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">
                <th className="pb-4 font-normal">Product</th>
                <th className="pb-4 font-normal">Category</th>
                <th className="pb-4 font-normal">Stock</th>
                <th className="pb-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-white/10 flex items-center justify-center">
                        {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-white/10" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tight">{product.name}</p>
                        <p className="text-[10px] text-white/40 uppercase">${product.price}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 text-sm text-white/60 uppercase text-[10px] tracking-widest">{product.category}</td>
                  <td className="py-6 text-sm">{product.stock}</td>
                  <td className="py-6 text-right">
                    <div className="flex justify-end gap-4">
                      <button className="text-white/20 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product.id)} className="text-white/20 hover:text-brand-red transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-white/20 text-xs uppercase tracking-[0.2em]">The void is empty</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any; label: string; active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-all ${active ? 'bg-white text-black font-bold' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
    {icon}
    {label}
  </button>
);

const StatCard = ({ label, value, delta }: { label: string; value: string; delta?: string }) => (
  <div className="border border-white/10 bg-white/5 p-6 space-y-2">
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</p>
    <div className="flex items-baseline gap-4">
      <span className="text-3xl font-display font-medium tracking-tighter">{value}</span>
      {delta && <span className="text-[10px] text-brand-red font-bold">{delta}</span>}
    </div>
  </div>
);
