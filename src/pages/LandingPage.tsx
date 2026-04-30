import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { ArrowRight, ShoppingBag, Zap, Shield, Globe, Cpu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useScanner } from '@/src/context/ScannerContext';
import { X, Camera, Search, MessageSquare, AlertCircle, Star, Ghost } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { openScanner } = useScanner();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [artifactOfTheDay, setArtifactOfTheDay] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, reviewsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/store_reviews')
        ]);
        const products = await productsRes.json();
        const storeReviews = await reviewsRes.json();

        setReviews(storeReviews.slice(0, 10));
        
        const featured = products.filter((p: any) => p.isFeatured).slice(0, 2);
        setFeaturedProducts(featured);

        const sorted = [...products].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setNewArrivals(sorted.slice(0, 4));

        if (products.length > 0) {
          const randomIndex = Math.floor(Math.random() * products.length);
          setArtifactOfTheDay(products[randomIndex]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/products?name_like=${searchQuery}`);
          const data = await res.json();
          setSearchResults(data.slice(0, 5));
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Auto-seed if empty (only for basic layout items)
  useEffect(() => {
    if (!loading && featuredProducts.length === 0 && newArrivals.length === 0) {
      // Small trigger to help user identify they should Seed in Admin
      console.log("Archive empty. Use System Seed in Admin to populate.");
    }
  }, [loading, featuredProducts, newArrivals]);

   const displayFlashDeals = featuredProducts;
   const displayNewArrivals = newArrivals;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Cinematic Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-red/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 pt-24 md:pt-32 pb-24">
        {/* Cinematic Hero */}
        <section className="mb-20 md:mb-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[3/4] md:aspect-[21/9] w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-white/[0.02]"
            >
               <img 
                 src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600"
                 className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
                 alt="Gothic Void"
               />
               <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent flex flex-col justify-end md:justify-center p-8 md:p-20">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                     <span className="text-brand-red font-black tracking-[0.4em] md:tracking-[0.8em] text-[8px] md:text-[10px] uppercase mb-4 md:mb-6 block drop-shadow-glow">THE GOTHIC REGISTRY // V3.0</span>
                     <h1 className="text-5xl md:text-9xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-4 md:mb-8">WH1RL<br/>POOL</h1>
                     <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center">
                        <div className="relative w-full md:w-96 group">
                           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-red transition-colors" />
                           <input 
                             type="text" 
                             placeholder="SEARCH ARTIFACTS..."
                             className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-16 pr-6 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-brand-red focus:bg-white/10 transition-all"
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                           />
                           {searchQuery && (
                              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                                 <X className="w-4 h-4" />
                              </button>
                           )}
                           
                           <AnimatePresence>
                              {searchQuery.length > 2 && (
                                 <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 right-0 top-full mt-4 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-4 z-[100] shadow-2xl backdrop-blur-3xl overflow-hidden"
                                 >
                                    {isSearching ? (
                                       <p className="p-8 text-[8px] font-black uppercase text-center text-white/20 animate-pulse">Scanning Archive...</p>
                                    ) : searchResults.length > 0 ? (
                                       <div className="space-y-4">
                                          {searchResults.map(p => (
                                             <button 
                                                key={p.id} 
                                                onClick={() => navigate(`/product/${p.id}`)}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left"
                                             >
                                                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                                   <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                   <p className="text-[10px] font-black uppercase tracking-widest">{p.name}</p>
                                                   <p className="text-[8px] font-bold text-brand-red">₹ {p.price}</p>
                                                </div>
                                             </button>
                                          ))}
                                       </div>
                                    ) : (
                                       <p className="p-8 text-[8px] font-black uppercase text-center text-white/20">No matching signals.</p>
                                    )}
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                        <Button 
                          onClick={() => navigate('/shop')}
                          className="h-14 w-full md:w-auto px-10 rounded-xl bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-display font-black italic uppercase tracking-[0.2em] text-xs"
                        >
                          ENTER THE VOID
                        </Button>
                        <div className="hidden md:block">
                           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 mb-1 italic">SYSTEM STATUS</p>
                           <p className="text-xs md:text-sm font-display font-black tracking-widest italic text-brand-red animate-pulse">OPERATIONAL</p>
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
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-red mb-2 italic">TEMPORAL EXTRACTIONS</p>
                 <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic">SHADOW DEALS</h2>
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

        {/* Artifact of the Day (Spotlight) */}
        {artifactOfTheDay && (
           <section className="mb-32">
              <div className="p-8 md:p-20 rounded-[3rem] md:rounded-[5rem] bg-[#0A0A0A] border border-brand-red/10 overflow-hidden relative group">
                 <div className="absolute top-0 right-0 w-[50%] h-full bg-brand-red/10 blur-[150px] -z-10 group-hover:bg-brand-red/20 transition-all duration-1000" />
                 <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-24">
                    <div className="lg:w-1/2 space-y-8 md:space-y-12">
                       <div className="inline-block px-6 py-2 bg-brand-red text-white text-[10px] font-black uppercase tracking-[0.5em] rounded-full animate-pulse italic shadow-lg shadow-brand-red/30">ARTIFACT OF THE DAY</div>
                       <h2 className="text-6xl md:text-[10rem] font-display font-black tracking-tighter uppercase italic leading-[0.85] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
                          {artifactOfTheDay.name?.split(' ')[0] || 'VOID'}<br />{artifactOfTheDay.name?.split(' ')[1] || 'UNIT'}
                       </h2>
                       <p className="text-lg md:text-2xl font-serif italic text-white/40 leading-relaxed uppercase tracking-widest max-w-xl">{artifactOfTheDay.description}</p>
                       <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pt-8">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">EXTRACTION UNIT</p>
                             <div className="text-5xl font-display font-black tracking-tighter italic">₹ {artifactOfTheDay.price}</div>
                          </div>
                          <Button 
                             onClick={() => navigate(`/product/${artifactOfTheDay.id}`)}
                             className="px-16 h-20 rounded-[2rem] bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-display font-black uppercase italic tracking-[0.2em] shadow-2xl"
                          >
                             ACQUIRE NOW
                          </Button>
                       </div>
                    </div>
                    <div className="lg:w-1/2 relative group-hover:scale-110 transition-transform duration-1000">
                       <div className="absolute inset-0 bg-brand-red/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                       <img src={artifactOfTheDay.imageUrl} className="w-full aspect-square object-contain drop-shadow-[0_0_100px_rgba(255,20,20,0.2)]" alt={artifactOfTheDay.name} />
                    </div>
                 </div>
              </div>
           </section>
        )}
        <section className="mb-24 md:mb-32">
           <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter uppercase italic mb-8 md:mb-12 text-center md:text-left">THE VOID SECTORS</h2>
           <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 h-auto md:h-[800px] gap-4 md:gap-6">
              <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer aspect-square md:aspect-auto" onClick={() => navigate('/shop?category=National Team Artifacts')}>
                 <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200" className="absolute inset-0 w-full h-full object-cover grayscale opacity-5 group-hover:opacity-10 transition-all duration-1000" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
                    <span className="text-[8px] font-black text-brand-red tracking-[0.6em] uppercase mb-4 italic">SECTOR 01</span>
                    <h3 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-0 group-hover:translate-x-4 transition-transform duration-1000">NATIONAL<br />UNITS</h3>
                 </div>
              </div>
              <div className="md:col-span-2 relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer aspect-[16/9] md:aspect-auto" onClick={() => navigate('/shop?category=Elite Club Artifacts')}>
                 <img src="https://images.unsplash.com/photo-1501691223387-dd0500403074?q=80&w=1200" className="absolute inset-0 w-full h-full object-cover grayscale opacity-5 group-hover:opacity-10 transition-all duration-1000" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
                    <span className="text-[8px] font-black text-white/20 tracking-[0.6em] uppercase mb-2 md:mb-4 italic">SECTOR 05</span>
                    <h3 className="text-3xl md:text-4xl font-display font-black tracking-tighter uppercase italic leading-none group-hover:text-brand-red transition-colors duration-500">CLUB LEGENDS</h3>
                 </div>
              </div>
              <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer aspect-video md:aspect-auto" onClick={() => navigate('/shop?category=Limited Edition Artifacts')}>
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent p-8 md:p-10 flex flex-col justify-end transition-all duration-700 group-hover:bg-brand-red/10">
                    <h3 className="text-xl md:text-2xl font-display font-black tracking-tighter uppercase italic group-hover:text-brand-red transition-all">SPECIAL<br/>ELITE</h3>
                 </div>
              </div>
              <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer aspect-video md:aspect-auto" onClick={() => navigate('/shop?category=Training Units')}>
                 <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent p-8 md:p-10 flex flex-col justify-end group-hover:bg-white/10 transition-all duration-700">
                    <h3 className="text-xl md:text-2xl font-display font-black tracking-tighter uppercase italic group-hover:text-white/60 transition-all">TRAINING<br/>ARTIFACTS</h3>
                 </div>
              </div>
           </div>
        </section>

        {/* VOID SCANNER ARTIFACT DISCOVERY */}
        <section className="mb-24 md:mb-40">
           <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-brand-red/10 to-transparent border border-white/5 p-8 md:p-20">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-50" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div className="text-center md:text-left">
                    <span className="text-brand-red font-black tracking-[0.6em] text-[10px] uppercase mb-4 md:mb-6 block">SYSTEM PROTOCOL // 0x44</span>
                    <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic leading-[0.9] mb-6 md:mb-8 text-white">FOUND A PIECE?<br/><span className="text-white/20">SCAN THE VOID</span></h2>
                    <p className="text-sm text-white/40 font-medium leading-relaxed mb-8 md:mb-10 max-w-md mx-auto md:mx-0">
                       Spotted a relic in the physical world? Use the Wh1rlpool Spectral Scanner to identify the artifact and extract it from our digital registry instantly.
                    </p>
                    <Button 
                      onClick={openScanner}
                      className="h-14 w-full md:w-auto px-10 rounded-xl bg-brand-red text-white hover:bg-white hover:text-black transition-all duration-500 font-display font-black italic uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4"
                    >
                       <Camera className="w-4 h-4" />
                       INITIATE SCANNER
                    </Button>
                 </div>
                 <div className="relative aspect-video md:aspect-video rounded-2xl md:rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,20,20,0.1),transparent)]" />
                    <Cpu className="w-12 h-12 md:w-20 md:h-20 text-brand-red animate-pulse opacity-20" />
                    <motion.div 
                       animate={{ top: ['0%', '100%', '0%'] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                       className="absolute left-0 w-full h-[1px] bg-brand-red/50 z-10"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* Floating Mobile Scanner */}
        <div className="fixed bottom-8 right-8 z-[90] md:hidden">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openScanner}
            className="w-16 h-16 rounded-full bg-brand-red text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.5)] border border-white/20"
          >
            <Camera className="w-6 h-6" />
          </motion.button>
        </div>

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
                 <h4 className="font-display font-black uppercase italic tracking-wider">SPECTRAL AUTHENTICATION</h4>
                 <p className="text-xs text-white/40 font-medium leading-relaxed">Each transmission is authenticated through dual-layer protocol verification.</p>
              </div>
              <div className="space-y-4">
                 <Globe className="w-8 h-8 text-brand-red" />
                 <h4 className="font-display font-black uppercase italic tracking-wider">VOID LOGISTICS</h4>
                 <p className="text-xs text-white/40 font-medium leading-relaxed">Syncing with logistics sectors in over 190 restricted zones worldwide.</p>
              </div>
              <div className="space-y-4">
                 <Zap className="w-8 h-8 text-brand-red" />
                 <h4 className="font-display font-black uppercase italic tracking-wider">RAPID MATERIALIZATION</h4>
                 <p className="text-xs text-white/40 font-medium leading-relaxed">Priority extraction and deployment within 24 standard cycle hours.</p>
              </div>
              <div className="space-y-4">
                 <Shield className="w-8 h-8 text-brand-red" />
                 <h4 className="font-display font-black uppercase italic tracking-wider">ORACLE CURATION</h4>
                 <p className="text-xs text-white/40 font-medium leading-relaxed">Automated quality indexing ensures only elite artifacts enter the grid.</p>
              </div>
           </div>
        </section>

        {/* Curated Reviews Section */}
        <section className="mt-40 border-t border-white/5 pt-20">
           <div className="flex justify-between items-center mb-16">
              <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter">Subject Testimonials</h2>
              <div className="flex gap-4">
                 {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-brand-red fill-brand-red" />)}
                 <span className="text-[10px] font-black tracking-widest text-white/40 uppercase italic">MATRIX VERIFIED</span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.length > 0 ? reviews.map((review, i) => (
                <div key={review.id} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6 group hover:bg-white/[0.04] transition-all">
                   <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center">
                         <Ghost className="w-6 h-6 text-brand-red" />
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black uppercase tracking-widest text-brand-red">{review.tag || 'ELITE UNIT'}</p>
                         <p className="text-xs font-black uppercase text-white/40">{review.author || 'ANONYMOUS'}</p>
                      </div>
                   </div>
                   <p className="text-sm font-serif italic text-white/60 leading-relaxed">"{review.text}"</p>
                </div>
              )) : (
                <div className="col-span-1 md:col-span-3 text-center py-20 bg-white/[0.01] rounded-[3rem] border border-white/5 border-dashed">
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">WAITING FOR TESTIMONIAL EXTRACTION...</p>
                </div>
              )}
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
