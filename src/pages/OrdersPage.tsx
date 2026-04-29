import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { ShoppingBag, Truck, Package, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: any;
}

export const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-12 pb-32">
        <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter uppercase italic">Authorization Required</h1>
        <Button onClick={() => navigate('/login')} className="h-16 px-12 rounded-full font-black">LOGIN TERMINAL</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-40 pb-32 px-4 md:px-12">
      <div className="max-w-[1200px] mx-auto space-y-12 md:space-y-24">
        
        <header className="space-y-4 md:space-y-6">
           <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase italic">DEPLOYS</h1>
           <p className="text-white/20 uppercase tracking-[0.4em] text-[8px] md:text-[10px] font-black">{orders.length} TRANSMISSIONS</p>
        </header>

        {orders.length === 0 ? (
          <div className="text-center space-y-12 py-20">
             <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center mx-auto opacity-20">
                <Package className="w-8 h-8" />
             </div>
             <p className="text-white/40 italic font-serif text-xl">No active streams detected. Begin your first deployment.</p>
             <Button onClick={() => navigate('/shop')} className="h-16 px-12 rounded-full font-black">BROWSE ARCHIVE</Button>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] bg-[#0A0A0A] border border-white/5 space-y-8 md:space-y-12 relative group hover:border-brand-red/30 transition-all duration-700"
              >
                 <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8 border-b border-white/5 pb-8 md:pb-12">
                    <div className="space-y-2 md:space-y-4">
                       <p className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white/40">Transmission ID</p>
                       <p className="text-lg md:text-2xl font-mono text-white/60">#{order.id.slice(0, 12).toUpperCase()}...</p>
                    </div>
                    <div className="flex gap-8 md:gap-12">
                       <div className="space-y-1">
                          <p className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white/40">Sync Date</p>
                          <p className="text-xs md:text-sm font-bold">{order.createdAt?.toDate().toLocaleDateString()}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white/40">Total</p>
                          <p className="text-lg md:text-xl font-black italic">₹ {order.total}</p>
                       </div>
                    </div>
                    <div className="w-fit">
                       <StatusBadge status={order.status} />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 md:gap-6 items-center">
                         <div className="w-16 h-20 md:w-20 md:h-24 rounded-xl md:rounded-2xl bg-white/5 overflow-hidden flex-shrink-0 grayscale transition-all duration-700 border border-white/5">
                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[11px] md:text-xs font-black uppercase tracking-tight truncate w-32">{item.name}</p>
                            <p className="text-[8px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">Qty: {item.quantity} | {item.size}</p>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 border-t border-white/5">
                    <p className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.4em] text-white/10 italic text-center md:text-left">Secured via WH1RLPOOL protocols</p>
                    <div className="flex gap-4">
                       <Button variant="outline" className="rounded-full px-8 h-12 text-[8px] md:text-[10px] font-black border-white/10 hover:bg-white hover:text-black">INSPECT</Button>
                    </div>
                 </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const configs: any = {
    pending: { label: 'SYNCHRONIZING', icon: <Clock className="w-4 h-4" />, color: 'text-orange-500 bg-orange-500/5 border-orange-500/20' },
    shipped: { label: 'EN ROUTE', icon: <Truck className="w-4 h-4" />, color: 'text-blue-400 bg-blue-500/5 border-blue-400/20' },
    delivered: { label: 'STATIONED', icon: <CheckCircle className="w-4 h-4" />, color: 'text-brand-red bg-red-500/5 border-brand-red/20' },
    cancelled: { label: 'ABORTED', icon: <XCircle className="w-4 h-4" />, color: 'text-white/20 bg-white/5 border-white/10' }
  };
  const config = configs[status] || configs.pending;
  return (
    <div className={`flex items-center gap-3 px-6 py-3 rounded-full border text-[10px] font-black tracking-[0.2em] ${config.color}`}>
      {config.icon}
      {config.label}
    </div>
  );
};
