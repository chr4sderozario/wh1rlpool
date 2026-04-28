import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { ArrowRight, ShoppingBag, Zap, Shield, Globe, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Featured Products for Flash Deals
    const qFeatured = query(collection(db, 'products'), where('isFeatured', '==', true), limit(2));
    const unsubFeatured = onSnapshot(qFeatured, (snap) => {
      setFeaturedProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch New Arrivals
    const qNew = query(collection(db, 'products'), limit(4));
    const unsubNew = onSnapshot(qNew, (snap) => {
      setNewArrivals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubFeatured();
      unsubNew();
    };
  }, []);

  // Auto-seed if empty (only for basic layout items)
  useEffect(() => {
    if (!loading && featuredProducts.length === 0 && newArrivals.length === 0) {
      // Small trigger to help user identify they should Seed in Admin
      console.log("Archive empty. Use System Seed in Admin to populate.");
    }
  }, [loading, featuredProducts, newArrivals]);

  const displayFlashDeals = featuredProducts.length > 0 ? featuredProducts : [
    {
      id: 'argentina-retro',
      name: 'Argentina 1994 Retro',
      price: 449,
      discount: 25,
      imageUrl: 'https://images.footballfanatics.com/argentina-national-team/argentina-adidas-og-1994-away-jersey-blue_ss5_p-200938531+pv-1+v-69c3a3c2672740939f0464c8d50c196f.jpg'
    },
    {
      id: 'real-madrid-2425',
      name: 'Real Madrid Elite 24/25',
      price: 449,
      discount: 15,
      imageUrl: 'https://shop.realmadrid.com/cdn/shop/files/RMCFMS0120-01_1.jpg'
    }
  ];

  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : [
    {
       id: 'italy-ren',
       name: 'Italy Renaissance',
       price: 449,
       imageUrl: 'https://images.footballfanatics.com/italy-national-team/italy-adidas-home-authentic-shirt-2024_ss5_p-200388939+u-43e86f874c72473887013898869c9b6b+v-dd692e76f62a420993070cd86b29d10e.jpg'
    },
    {
       id: 'japan-ops',
       name: 'Japan Special Ops',
       price: 449,
       imageUrl: 'https://images.footballfanatics.com/japan-national-team/japan-adidas-home-shirt-2024_ss5_p-200786938+pv-1+v-142f36d37651474e8929e0689b0b4b2a.jpg'
    },
    {
       id: 'brazil-noir',
       name: 'Brazil Samba Noir',
       price: 449,
       imageUrl: 'https://images.footballfanatics.com/brazil-national-team/brazil-nike-home-stadium-shirt-2024_ss5_p-200705663+u-83605c31751a4f009e5306509a25032a+v-7431e780860447be88d3f4415842880c.jpg'
    },
    {
       id: 'bayern-stealth',
       name: 'Bayern Munich Stealth',
       price: 449,
       imageUrl: 'https://images.footballfanatics.com/fc-bayern-munich/fc-bayern-munich-adidas-home-shirt-2024-25_ss5_p-14447477+u-vbtm0086386x80x073f+v-f472f7ed50064560946777329486c0e8.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Cinematic Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-red/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 pt-32 pb-24">
        {/* Cinematic Hero */}
        <section className="mb-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[21/9] w-full overflow-hidden rounded-[3rem] border border-white/5 bg-white/[0.02]"
            >
               <img 
                 src="https://images.footballfanatics.com/argentina/argentina-adidas-training-jersey-navy_ss5_p-200786938+pv-1+v-142f36d37651474e8929e0689b0b4b2a.jpg?_hv=2&w=1200"
                 className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 hover:scale-105 transition-all duration-[3s]"
                 alt="Hero"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent flex flex-col justify-center p-20">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                     <span className="text-brand-red font-black tracking-[0.8em] text-[10px] uppercase mb-6 block drop-shadow-glow">SYSTEM//ARCHIVE v2.0</span>
                     <h1 className="text-8xl md:text-9xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-8">WH1RL<br/>POOL</h1>
                     <div className="flex flex-wrap gap-8 items-center">
                        <Button 
                          onClick={() => navigate('/shop')}
                          className="h-14 px-10 rounded-xl bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-display font-black italic uppercase tracking-[0.2em] text-xs"
                        >
                          EXTRACT ARCHIVE
                        </Button>
                        <div className="hidden md:block">
                           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mb-1 italic">SYSTEM STATUS</p>
                           <p className="text-sm font-display font-black tracking-widest italic text-brand-red animate-pulse">OPERATIONAL</p>
                        </div>
                     </div>
                  </motion.div>
               </div>
            </motion.div>
        </section>

        {/* Dynamic Flash Extraction */}
        <section className="mb-32">
           <div className="flex justify-between items-end mb-12">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-red mb-2 italic">LIMITED TIME EXTRACTION</p>
                 <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic">FLASH DEALS</h2>
              </div>
              <div className="flex gap-4">
                 <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-red"
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {displayFlashDeals.map((deal, i) => (
                <motion.div 
                  key={deal.id}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/product/${deal.id}`)}
                >
                  <div className="absolute top-8 right-8 z-20">
                     <span className="bg-brand-red text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-2xl">-{deal.discount}% OFF</span>
                  </div>
                  <div className="aspect-square mb-8 overflow-hidden rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 relative group-hover:border-brand-red/30 transition-colors duration-700">
                    <img 
                      src={deal.imageUrl} 
                      className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000" 
                      alt=""
                    />
                 </div>
                  <h3 className="text-2xl font-display font-black tracking-tight uppercase italic mb-2 group-hover:text-brand-red transition-colors">{deal.name}</h3>
                  <div className="flex items-center gap-4">
                     <span className="text-3xl font-display font-black italic text-white">₹{deal.price}</span>
                     <span className="text-sm line-through text-white/30 font-black italic">₹{(deal.price / (1 - deal.discount/100)).toFixed(2)}</span>
                  </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Categorical Bento Grid (The Registry) */}
        <section className="mb-32">
           <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase italic mb-12">THE REGISTRY</h2>
           <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 h-[800px] gap-6">
              <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer" onClick={() => navigate('/shop?category=National Team Jerseys')}>
                 <img src="https://images.footballfanatics.com/argentina/argentina-adidas-training-jersey-navy_ss5_p-200786938+pv-3+v-142f36d37651474e8929e0689b0b4b2a.jpg?_hv=2&w=1200" className="absolute inset-0 w-full h-full object-cover grayscale opacity-10 group-hover:scale-105 group-hover:opacity-30 transition-all duration-1000" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-16">
                    <span className="text-[8px] font-black text-brand-red tracking-[0.6em] uppercase mb-4 italic">SECTOR 01</span>
                    <h3 className="text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-0 group-hover:translate-x-4 transition-transform duration-1000">NATIONAL<br />ELITE</h3>
                 </div>
              </div>
              <div className="md:col-span-2 relative group overflow-hidden rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer" onClick={() => navigate('/shop?category=Retro Jerseys')}>
                 <img src="https://images.footballfanatics.com/argentina/argentina-adidas-training-jersey-navy_ss5_p-200786938+pv-2+v-142f36d37651474e8929e0689b0b4b2a.jpg?_hv=2&w=1200" className="absolute inset-0 w-full h-full object-cover grayscale opacity-5 group-hover:scale-105 group-hover:opacity-20 transition-all duration-1000" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-12">
                    <span className="text-[8px] font-black text-white/20 tracking-[0.6em] uppercase mb-4 italic">SECTOR 05</span>
                    <h3 className="text-4xl font-display font-black tracking-tighter uppercase italic leading-none group-hover:text-brand-red transition-colors duration-500">RETRO GOTHIC</h3>
                 </div>
              </div>
              <div className="relative group overflow-hidden rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer" onClick={() => navigate('/shop?category=Limited Edition Jerseys')}>
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent p-10 flex flex-col justify-end transition-all duration-700 group-hover:bg-brand-red/10">
                    <h3 className="text-2xl font-display font-black tracking-tighter uppercase italic group-hover:text-brand-red transition-all">LIMITED<br/>UNITS</h3>
                 </div>
              </div>
              <div className="relative group overflow-hidden rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer" onClick={() => navigate('/shop?category=Training Kits')}>
                 <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent p-10 flex flex-col justify-end group-hover:bg-white/10 transition-all duration-700">
                    <h3 className="text-2xl font-display font-black tracking-tighter uppercase italic group-hover:text-white/60 transition-all">PROTOCOL<br/>KITS</h3>
                 </div>
              </div>
           </div>
        </section>

        {/* New Arrivals Product Grid (Amazon Dense Layout) */}
        <section>
          <div className="flex justify-between items-end mb-12">
             <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase italic">NEW TRANSMISSIONS</h2>
             <Link to="/shop" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-brand-red transition-all">VIEW FULL REGISTRY →</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
             {displayNewArrivals.map((product, i) => (
               <motion.div
                 key={product.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="group cursor-pointer"
                 onClick={() => navigate(`/product/${product.id}`)}
               >
                 <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-[#0A0A0A] border border-white/5 mb-4 relative">
                    <img 
                      src={product.imageUrl} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 opacity-60 group-hover:opacity-100" 
                      alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">ARCHIVE UNIT</p>
                       <h4 className="font-display font-black italic uppercase text-lg group-hover:text-brand-red transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{product.name}</h4>
                    </div>
                    <span className="font-display font-black italic text-xl">₹{product.price}</span>
                 </div>
               </motion.div>
             ))}
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="mt-40 pt-40 border-t border-white/5">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="space-y-4">
                 <Shield className="w-8 h-8 text-brand-red" />
                 <h4 className="font-display font-black uppercase italic tracking-wider">VERIFIED ORIGIN</h4>
                 <p className="text-xs text-white/40 font-medium leading-relaxed">Each transmission is authenticated through dual-layer protocol verification.</p>
              </div>
              <div className="space-y-4">
                 <Globe className="w-8 h-8 text-brand-red" />
                 <h4 className="font-display font-black uppercase italic tracking-wider">GLOBAL UPLINK</h4>
                 <p className="text-xs text-white/40 font-medium leading-relaxed">Syncing with logistics sectors in over 190 restricted zones worldwide.</p>
              </div>
              <div className="space-y-4">
                 <Zap className="w-8 h-8 text-brand-red" />
                 <h4 className="font-display font-black uppercase italic tracking-wider">INSTANT DEPLOY</h4>
                 <p className="text-xs text-white/40 font-medium leading-relaxed">Priority extraction and deployment within 24 standard cycle hours.</p>
              </div>
              <div className="space-y-4">
                 <Cpu className="w-8 h-8 text-brand-red" />
                 <h4 className="font-display font-black uppercase italic tracking-wider">AI ENHANCED</h4>
                 <p className="text-xs text-white/40 font-medium leading-relaxed">Automated quality indexing ensures only elite artifacts enter the grid.</p>
              </div>
           </div>
        </section>

        {/* Footer Meta */}
        <footer className="mt-40 text-center">
           <div className="mb-8">
              <h1 className="text-[12rem] font-display font-black tracking-tighter uppercase italic leading-none opacity-[0.02] select-none">WH1RLPOOL</h1>
           </div>
           <p className="text-[8px] font-black uppercase tracking-[0.8em] text-white/10">ESTABLISHED 2024 // ALL RITES RESERVED</p>
        </footer>
      </div>
    </div>
  );
}
