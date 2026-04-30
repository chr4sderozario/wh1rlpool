import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      // Direct lookup by ID
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      if (!res.ok) {
        // Fallback search by a field if ID lookup fails
        const searchRes = await fetch(`/api/orders?id=${orderId.trim()}`);
        const searchData = await searchRes.json();
        if (searchData.length > 0) {
          setOrderData(searchData[0]);
        } else {
          setError('TRANSMISSION VOID: SEQUENCE NOT FOUND');
        }
      } else {
        const data = await res.json();
        setOrderData(data);
      }
    } catch (err) {
      setError('FIELD INTERFERENCE DETECTED');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verifying': return <Clock className="w-6 h-6 text-orange-500" />;
      case 'pending': return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'processing': return <Package className="w-6 h-6 text-brand-red" />;
      case 'shipped': return <Truck className="w-6 h-6 text-blue-500" />;
      case 'delivered': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      default: return <AlertCircle className="w-6 h-6 text-white/20" />;
    }
  };

  const getStatusProgress = (status: string) => {
    const steps = ['verifying', 'pending', 'processing', 'shipped', 'delivered'];
    const currentIdx = steps.indexOf(status?.toLowerCase() || 'pending');
    return ((currentIdx + 1) / steps.length) * 100;
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 blur-[150px] -z-10" />

      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 mb-6"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-red">Quantum Surveillance</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-none mb-6">
            Track <span className="text-white/20">Artifact</span>
          </h1>
          <p className="text-white/40 uppercase text-[10px] font-black tracking-widest max-w-sm mx-auto leading-loose">
            Enter your transmission ID to synchronize with the delivery oracles.
          </p>
        </header>

        {/* Search Input */}
        <form onSubmit={handleTrack} className="mb-16">
          <div className="relative group max-w-xl mx-auto">
            <div className="absolute inset-0 bg-brand-red/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-700" />
            <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-full p-2 group-focus-within:border-brand-red/30 transition-all">
              <div className="pl-6 text-white/20">
                <Search className="w-5 h-5" />
              </div>
              <input 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="TXN_SEQ_XXXXXXXX"
                className="flex-1 bg-transparent border-none px-6 py-4 text-sm font-black uppercase tracking-widest focus:outline-none placeholder:text-white/10"
              />
              <Button 
                onClick={() => handleTrack()}
                disabled={loading || !orderId}
                className="rounded-full h-14 px-8 bg-white text-black hover:bg-brand-red hover:text-white transition-all font-black text-[10px] tracking-widest"
              >
                {loading ? 'SYNCING...' : 'SYNC'}
              </Button>
            </div>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 rounded-[2rem] bg-brand-red/5 border border-brand-red/20 text-center space-y-4"
            >
              <AlertCircle className="w-12 h-12 text-brand-red mx-auto mb-2" />
              <p className="text-sm font-display font-black italic uppercase text-brand-red">{error}</p>
              <Button variant="ghost" onClick={() => setError('')} className="text-[10px] font-black tracking-widest uppercase text-white/40">Retry Sequence</Button>
            </motion.div>
          )}

          {orderData && (
            <motion.div 
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-8"
            >
              {/* Order Status Card */}
              <div className="p-8 md:p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                   {getStatusIcon(orderData.status)}
                </div>
                
                <div className="space-y-12">
                   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-2">
                         <p className="text-[8px] font-black uppercase tracking-widest text-brand-red">SEQUENCE IDENTIFIED</p>
                         <h3 className="text-3xl font-display font-black tracking-tighter uppercase italic">#{orderData.id.slice(0, 8)}...</h3>
                         <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                           {new Date(orderData.createdAt).toLocaleDateString()} AT {new Date(orderData.createdAt).toLocaleTimeString()}
                         </p>
                      </div>
                      <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">
                         {orderData.status || 'PENDING'}
                      </div>
                   </div>

                   {/* Progress Visualizer */}
                   <div className="space-y-6">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${getStatusProgress(orderData.status)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-brand-red"
                         />
                      </div>
                      <div className="grid grid-cols-5 text-center px-2">
                         {['VERIFY', 'PENDING', 'PROCESS', 'SHIP', 'VOID'].map((s, i) => {
                            const steps = ['verifying', 'pending', 'processing', 'shipped', 'delivered'];
                            const currentIdx = steps.indexOf(orderData.status?.toLowerCase() || 'pending');
                            return (
                              <div key={s} className="space-y-1">
                                 <p className={`text-[6px] md:text-[8px] font-black uppercase tracking-widest transition-colors ${i <= currentIdx ? 'text-brand-red' : 'text-white/10'}`}>{s}</p>
                              </div>
                            );
                         })}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-brand-red" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Destination Node</p>
                         </div>
                         <p className="text-xs uppercase font-medium leading-relaxed pl-7">{orderData.address}</p>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-brand-red" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Estimated Extraction</p>
                         </div>
                         <p className="text-xs uppercase font-medium leading-relaxed pl-7">{orderData.estimatedDelivery || 'SYNCING...'}</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Items List */}
              <div className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Manifest Content</h4>
                 <div className="space-y-4">
                    {orderData.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-white/5 rounded-lg overflow-hidden border border-white/10">
                               <img src={item.imageUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest">{item.name}</p>
                               <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">SIZE {item.size} • QTY {item.quantity}</p>
                            </div>
                         </div>
                         <p className="text-[10px] font-black text-brand-red">₹{item.price}</p>
                      </div>
                    ))}
                 </div>
                 <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Total Energy Required</p>
                       <p className="text-xl font-display font-black italic uppercase">₹{orderData.total}</p>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-green-500 italic">TRANSACTION SECURE</p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!orderData && !loading && !error && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { icon: <ShieldCheck className="w-5 h-5" />, title: 'Encrypted', text: 'End-to-end extraction' },
               { icon: <Clock className="w-5 h-5" />, title: 'Real-time', text: 'Live oracle updates' },
               { icon: <Package className="w-5 h-5" />, title: 'Curated', text: 'Artisanal handling' }
             ].map((feature, i) => (
               <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                  <div className="text-brand-red mx-auto flex justify-center">{feature.icon}</div>
                  <h4 className="text-[8px] font-black uppercase tracking-widest leading-none">{feature.title}</h4>
                  <p className="text-[7px] text-white/20 uppercase font-black tracking-widest">{feature.text}</p>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
