import { motion, useScroll, useTransform } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { 
  ArrowRight, 
  ShoppingBag, 
  Zap, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  Globe,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 500]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(8)
    );
    const unsub = onSnapshot(q, (snap) => {
      setFeaturedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    return unsub;
  }, []);

  return (
    <div ref={containerRef} className="relative bg-black min-h-screen overflow-x-hidden">
      {/* Immersive Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          {/* Animated Background Artifacts */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] opacity-30">
            <div className="absolute inset-0 liquid-shape bg-brand-red blur-[120px] animate-pulse" />
            <div className="absolute inset-0 liquid-shape bg-white/5 blur-[80px] scale-75 animate-spin-slow" />
          </div>

          {/* Floating Jerseys - Visual Representation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, rotate: -20, scale: 0.5 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1], 
                  rotate: [ -20, 20, -20],
                  y: [0, -50, 0],
                  scale: 0.8
                }}
                transition={{ 
                  duration: 8 + i * 2, 
                  repeat: Infinity, 
                  ease: "easeInOut"
                }}
                className="absolute w-[400px] h-[500px] bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-3xl overflow-hidden"
                style={{ 
                  left: `${20 + i * 30}%`, 
                  top: `${15 + i * 10}%`,
                  zIndex: i
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.span 
                initial={{ letterSpacing: '1em', opacity: 0 }}
                animate={{ letterSpacing: '0.4em', opacity: 1 }}
                className="text-[10px] md:text-xs font-black uppercase text-brand-red gothic-glow"
              >
                Just Go For It
              </motion.span>
              <h1 className="text-[15vw] md:text-[14rem] font-display font-black leading-[0.75] tracking-tighter uppercase gothic-glow select-none italic">
                WH1RL<br />POOL
              </h1>
            </div>

            <p className="max-w-2xl mx-auto text-sm md:text-xl font-serif italic text-white/40 leading-relaxed">
              Curating the darkest artifacts of football culture. <br className="hidden md:block" />
              Performance redefined through a gothic lens.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Button 
                onClick={() => navigate('/shop')}
                className="w-full sm:w-80 h-20 text-lg rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-black group px-12"
              >
                <span className="flex items-center gap-4">
                  ENTER VOID <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40 hover:text-white transition-all underline underline-offset-8"
                >
                  ENTER AS ADMIN
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-[8px] uppercase tracking-[0.3em] font-bold text-white/20 hover:text-white transition-all"
                >
                  Terminal Access
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Particles / Smoke Effect Placeholder */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse" />
        </div>
      </section>

      {/* Featured Collections Feed */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto space-y-32">
        
        {/* Banner Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative h-[600px] rounded-[4rem] overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/5 group-hover:bg-brand-red/10 transition-colors duration-1000" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-8">
            <span className="text-[10px] uppercase tracking-[0.6em] text-brand-red font-black">Limited Extraction</span>
            <h2 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase italic gothic-glow">RETRO GOTHIC</h2>
            <Button 
              onClick={() => navigate('/shop')}
              className="rounded-full px-12 py-6 bg-white text-black hover:bg-brand-red hover:text-white transition-all font-bold"
            >
              EXPLORE COLLECTION
            </Button>
          </div>
          {/* Animated lines */}
          <div className="absolute inset-0 border border-white/5 rounded-[4rem] pointer-events-none" />
        </motion.div>

        {/* Product Sections */}
        <div className="space-y-32">
          <SectionHeader title="Featured Artifacts" subtitle="The absolute peak of jersey design." icon={<Star className="w-5 h-5 text-brand-red" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {featuredProducts.slice(0, 4).map((product, idx) => (
              <ProductCard key={product.id} product={product} delay={idx * 0.1} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PromoCard 
              label="Flash Sale" 
              title="EXTRACTION 50%" 
              desc="Limited time discount on selected artifacts." 
              image="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=1000"
              onClick={() => navigate('/sale')}
            />
            <PromoCard 
              label="New Arrivals" 
              title="DROP 02/26" 
              desc="The latest transmissions from the vault." 
              image="https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80&w=1000"
              onClick={() => navigate('/shop')}
            />
          </div>

          <SectionHeader title="Trending Now" subtitle="Most extracted items this week." icon={<TrendingUp className="w-5 h-5 text-brand-red" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {featuredProducts.slice(4, 8).map((product, idx) => (
              <ProductCard key={product.id} product={product} delay={idx * 0.1} />
            ))}
          </div>
        </div>

        {/* Trust Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-24 border-y border-white/5">
           <TrustItem icon={<ShieldCheck />} title="SECURE PROTOCOL" desc="Encrypted transactions only." />
           <TrustItem icon={<Globe />} title="GLOBAL DEPLOYMENT" desc="Artifacts shipped worldwide." />
           <TrustItem icon={<Zap />} title="INSTANT SYNC" desc="Real-time order tracking." />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
            <div className="space-y-8">
              <h1 className="text-4xl font-display font-black tracking-tighter gothic-glow">WH1RLPOOL</h1>
              <p className="text-white/40 font-serif italic max-w-md leading-relaxed">
                A sanctuary for football aesthetics and gothic expression. We don't just sell jerseys, we curate artifacts of the beautiful game.
              </p>
              <div className="flex gap-8">
                 <a href="#" className="text-white/20 hover:text-brand-red transition-colors uppercase text-[10px] font-bold tracking-widest">Instagram</a>
                 <a href="#" className="text-white/20 hover:text-brand-red transition-colors uppercase text-[10px] font-bold tracking-widest">Twitter</a>
                 <a href="#" className="text-white/20 hover:text-brand-red transition-colors uppercase text-[10px] font-bold tracking-widest">Discord</a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
               <div>
                  <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-6">Archive</h4>
                  <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-white/20">
                     <li><button onClick={() => navigate('/shop')} className="hover:text-white transition-colors">All Jerseys</button></li>
                     <li><button onClick={() => navigate('/men')} className="hover:text-white transition-colors">Men's Edit</button></li>
                     <li><button onClick={() => navigate('/women')} className="hover:text-white transition-colors">Women's Edit</button></li>
                  </ul>
               </div>
               <div>
                  <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-6">Terminal</h4>
                  <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-white/20">
                     <li><button onClick={() => navigate('/profile')} className="hover:text-white transition-colors">My Profile</button></li>
                     <li><button onClick={() => navigate('/orders')} className="hover:text-white transition-colors">Orders</button></li>
                     <li><button onClick={() => navigate('/support')} className="hover:text-white transition-colors">Support</button></li>
                  </ul>
               </div>
               <div className="col-span-2 md:col-span-1">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-6">Manifesto</h4>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-white/10 leading-loose">
                    WH1RLPOOL IS A DIGITAL EXPERIMENT IN SPORTING LUXURY. VOID OPERATED SINCE 2026.
                  </p>
               </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 opacity-20 transition-opacity hover:opacity-100">
             <span className="text-[8px] uppercase tracking-[0.5em] font-black">© 2026 WH1RLPOOL STUDIO / ALL RIGHTS RESERVED</span>
             <div className="flex gap-8 mt-6 md:mt-0">
                <span className="text-[8px] uppercase tracking-[0.5em]">T&C</span>
                <span className="text-[8px] uppercase tracking-[0.5em]">PRIVACY</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, icon }: { title: string; subtitle: string; icon: any }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
    <div className="space-y-2">
       <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic">{title}</h2>
       </div>
       <p className="text-white/40 text-sm font-serif italic">{subtitle}</p>
    </div>
  </div>
);

const ProductCard = ({ product, delay }: { product: Product, delay: number, key?: any }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden mb-6 cursor-pointer">
        <div className="absolute inset-0 bg-white/5 group-hover:bg-brand-red/10 transition-colors duration-700" />
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-white/5" />
          </div>
        )}
        
        {/* Hover Action */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-8 text-center space-y-4">
           <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-red italic">Inspect Artifact</span>
           <div className="w-12 h-[1px] bg-white/20" />
           <p className="text-xl font-display font-bold uppercase tracking-tight line-clamp-2">{product.name}</p>
        </div>

        {/* Quick Labels */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
           {product.isFeatured && <span className="bg-white text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">Rare</span>}
           {parseFloat(product.price.toString()) > 0 && <span className="bg-brand-red text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">${product.price}</span>}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-tight group-hover:text-brand-red transition-colors truncate">{product.name}</h3>
        <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">{product.category}</p>
      </div>
    </motion.div>
  );
};

const PromoCard = ({ label, title, desc, image, onClick }: { label: string; title: string, desc: string, image: string, onClick: () => void }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    onClick={onClick}
    className="relative h-[400px] rounded-[3rem] overflow-hidden group cursor-pointer"
  >
    <img src={image} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
    <div className="absolute inset-0 p-12 flex flex-col justify-end items-start space-y-4">
      <span className="text-[10px] uppercase tracking-[0.4em] text-brand-red font-black">{label}</span>
      <h3 className="text-5xl font-display font-black tracking-tighter uppercase italic">{title}</h3>
      <p className="text-white/40 text-xs italic font-serif max-w-[200px]">{desc}</p>
    </div>
  </motion.div>
);

const TrustItem = ({ icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex flex-col items-center text-center space-y-6 group cursor-default">
    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-red group-hover:bg-brand-red/10 transition-all duration-500">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="text-[10px] uppercase tracking-[0.3em] font-black">{title}</h4>
      <p className="text-[10px] text-white/20 uppercase tracking-widest">{desc}</p>
    </div>
  </div>
);
