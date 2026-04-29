import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { ArrowRight, ShoppingBag, Zap, Shield, Globe, Cpu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, query, limit, onSnapshot, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Search, MessageSquare, AlertCircle } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'searching' | 'found' | 'error'>('idle');
  const [scannedResult, setScannedResult] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "void-scanner-region";

  const customerCareNumber = "+91 88888 77777"; 

  useEffect(() => {
    if (isScannerOpen) {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode(scannerId);
          scannerRef.current = html5QrCode;
          setScanStatus('scanning');
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            async (decodedText) => {
              await handleScanSuccess(decodedText);
            },
            () => {}
          );
        } catch (err) {
          console.error("Scanner failed to start:", err);
          setIsScannerOpen(false);
        }
      };
      
      startScanner();
    } else {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.log("Scanner stop error", e));
      }
    }

    return () => {
       if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(e => console.log("Cleanup stop error", e));
       }
    };
  }, [isScannerOpen]);

  const handleScanSuccess = async (text: string) => {
    setScannedResult(text);
    setScanStatus('searching');
    
    if (scannerRef.current) {
       await scannerRef.current.stop();
    }

    try {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      
      const match = querySnapshot.docs.find(doc => {
         const data = doc.data();
         return data.name.toLowerCase().includes(text.toLowerCase()) || doc.id === text;
      });

      if (match) {
        setScanStatus('found');
        setTimeout(() => {
           navigate(`/product/${match.id}`);
           setIsScannerOpen(false);
           setScanStatus('idle');
        }, 1500);
      } else {
        setScanStatus('error');
      }
    } catch (error) {
      console.error("Search failed:", error);
      setScanStatus('error');
    }
  };

  useEffect(() => {
    // Fetch Featured Products for Flash Deals
    const qFeatured = query(
      collection(db, 'products'), 
      where('isFeatured', '==', true), 
      orderBy('createdAt', 'desc'),
      limit(2)
    );
    const unsubFeatured = onSnapshot(qFeatured, (snap) => {
      setFeaturedProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch New Arrivals
    const qNew = query(
      collection(db, 'products'), 
      orderBy('createdAt', 'desc'),
      limit(4)
    );
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
      imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800'
    },
    {
      id: 'real-madrid-2425',
      name: 'Real Madrid Elite 24/25',
      price: 449,
      discount: 15,
      imageUrl: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7a0dca?q=80&w=800'
    }
  ];

  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : [
    {
       id: 'italy-ren',
       name: 'Italy Renaissance',
       price: 449,
       imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800'
    },
    {
       id: 'japan-ops',
       name: 'Japan Special Ops',
       price: 449,
       imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800'
    },
    {
       id: 'brazil-noir',
       name: 'Brazil Samba Noir',
       price: 449,
       imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=800'
    },
    {
       id: 'bayern-stealth',
       name: 'Bayern Munich Stealth',
       price: 449,
       imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800'
    }
  ];

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
                 src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600"
                 className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 hover:scale-105 transition-all duration-[3s]"
                 alt="Hero"
               />
               <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent flex flex-col justify-end md:justify-center p-8 md:p-20">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                     <span className="text-brand-red font-black tracking-[0.4em] md:tracking-[0.8em] text-[8px] md:text-[10px] uppercase mb-4 md:mb-6 block drop-shadow-glow">THE GOTHIC REGISTRY // V3.0</span>
                     <h1 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-6 md:mb-8">WH1RL<br/>POOL</h1>
                     <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                        <Button 
                          onClick={() => navigate('/shop')}
                          className="h-14 w-full md:w-auto px-10 rounded-xl bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-display font-black italic uppercase tracking-[0.2em] text-xs"
                        >
                          ENTER THE VOID
                        </Button>
                        <div className="md:block">
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

        {/* Categorical Bento Grid (The Registry) */}
        <section className="mb-24 md:mb-32">
           <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter uppercase italic mb-8 md:mb-12 text-center md:text-left">THE VOID SECTORS</h2>
           <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 h-auto md:h-[800px] gap-4 md:gap-6">
              <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer aspect-square md:aspect-auto" onClick={() => navigate('/shop?category=National Team Jerseys')}>
                 <img src="https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200" className="absolute inset-0 w-full h-full object-cover grayscale opacity-10 group-hover:scale-105 group-hover:opacity-30 transition-all duration-1000" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
                    <span className="text-[8px] font-black text-brand-red tracking-[0.6em] uppercase mb-4 italic">SECTOR 01</span>
                    <h3 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-0 group-hover:translate-x-4 transition-transform duration-1000">NATIONAL<br />ELITE</h3>
                 </div>
              </div>
              <div className="md:col-span-2 relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer aspect-[16/9] md:aspect-auto" onClick={() => navigate('/shop?category=Retro Jerseys')}>
                 <img src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1200" className="absolute inset-0 w-full h-full object-cover grayscale opacity-5 group-hover:scale-105 group-hover:opacity-20 transition-all duration-1000" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
                    <span className="text-[8px] font-black text-white/20 tracking-[0.6em] uppercase mb-2 md:mb-4 italic">SECTOR 05</span>
                    <h3 className="text-3xl md:text-4xl font-display font-black tracking-tighter uppercase italic leading-none group-hover:text-brand-red transition-colors duration-500">HERITAGE RELICS</h3>
                 </div>
              </div>
              <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer aspect-video md:aspect-auto" onClick={() => navigate('/shop?category=Limited Edition Jerseys')}>
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent p-8 md:p-10 flex flex-col justify-end transition-all duration-700 group-hover:bg-brand-red/10">
                    <h3 className="text-xl md:text-2xl font-display font-black tracking-tighter uppercase italic group-hover:text-brand-red transition-all">LIMITED<br/>UNITS</h3>
                 </div>
              </div>
              <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white/[0.01] border border-white/5 cursor-pointer aspect-video md:aspect-auto" onClick={() => navigate('/shop?category=Training Kits')}>
                 <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent p-8 md:p-10 flex flex-col justify-end group-hover:bg-white/10 transition-all duration-700">
                    <h3 className="text-xl md:text-2xl font-display font-black tracking-tighter uppercase italic group-hover:text-white/60 transition-all">PROTOCOL<br/>KITS</h3>
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
                       Spotted a jersey in the physical world? Use the Wh1rlpool Spectral Scanner to identify the artifact and extract it from our digital registry instantly.
                    </p>
                    <Button 
                      onClick={() => setIsScannerOpen(true)}
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

        {/* Scanner Overlay UI */}
        {isScannerOpen && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-6 backdrop-blur-xl"
           >
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-red flex items-center justify-center rounded-lg">
                       <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-brand-red italic">SPECTRAL SCANNER</p>
                       <p className="text-lg font-display font-black italic uppercase">ARTIFACT IDENTIFICATION</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setIsScannerOpen(false)}
                  className="w-12 h-12 bg-white/5 hover:bg-brand-red transition-colors rounded-full flex items-center justify-center"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col justify-center gap-4 md:gap-8 overflow-y-auto no-scrollbar">
                 <div className="aspect-[3/4] md:aspect-[4/3] rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden relative shadow-2xl shadow-brand-red/5">
                    <div id={scannerId} className="w-full h-full object-cover scale-[1.02]"></div>
                    
                    {scanStatus === 'scanning' && (
                       <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-red" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-red" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-red" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-red" />
                          <motion.div 
                             animate={{ top: ['0%', '100%', '0%'] }}
                             transition={{ duration: 2, repeat: Infinity }}
                             className="absolute left-0 w-full h-[2px] bg-brand-red shadow-[0_0_15px_rgba(255,0,0,0.8)]"
                          />
                       </div>
                    )}

                    {scanStatus === 'searching' && (
                       <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-6 backdrop-blur-sm">
                          <div className="w-16 h-16 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
                          <p className="text-xs font-black uppercase tracking-[0.5em] text-brand-red animate-pulse">QUERYING THE VOID ARCHIVE...</p>
                       </div>
                    )}

                    {scanStatus === 'found' && (
                       <div className="absolute inset-0 bg-brand-red flex flex-col items-center justify-center gap-4">
                          <Zap className="w-16 h-16 text-white" />
                          <p className="text-xl font-display font-black italic uppercase leading-none">ARTIFACT LOCATED</p>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">MATERIALIZING UNITS...</p>
                       </div>
                    )}

                    {scanStatus === 'error' && (
                       <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-12 text-center gap-8">
                          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
                             <AlertCircle className="w-10 h-10 text-brand-red" />
                          </div>
                          <div>
                             <h3 className="text-2xl font-display font-black italic uppercase mb-4">ARTIFACT NOT RECOGNIZED</h3>
                             <p className="text-sm text-white/40 font-medium leading-relaxed mb-6">
                                The unit <span className="text-brand-red font-black">"{scannedResult}"</span> is not indexed in our core registry. 
                                Transmit this code to our customer care sector to request manual acquisition.
                             </p>
                             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-4">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">CONTACT SECTOR</span>
                                <p className="text-xl font-display font-black italic text-brand-red tracking-widest">{customerCareNumber}</p>
                                <Button 
                                  onClick={() => window.location.href = `https://wa.me/${customerCareNumber.replace(/\D/g,'')}?text=I'm%20looking%20for%20jersey%20code:%20${scannedResult}`}
                                  className="bg-white text-black hover:bg-brand-red hover:text-white w-full h-12 flex items-center justify-center gap-2 font-display font-black italic uppercase transition-all"
                                >
                                   <MessageSquare className="w-4 h-4" />
                                   MESSAGE CARE
                                </Button>
                             </div>
                             <button 
                                onClick={() => {
                                   setIsScannerOpen(false);
                                   setScanStatus('idle');
                                }}
                                className="mt-8 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                             >
                                ← RETURN TO REGISTRY
                             </button>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
                       <p className="text-[10px] font-black text-brand-red mb-1 uppercase tracking-widest">FPS</p>
                       <p className="text-xl font-display font-black italic">60.00</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
                       <p className="text-[10px] font-black text-white/30 mb-1 uppercase tracking-widest">BITRATE</p>
                       <p className="text-xl font-display font-black italic">12.4G</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
                       <p className="text-[10px] font-black text-white/30 mb-1 uppercase tracking-widest">PING</p>
                       <p className="text-xl font-display font-black italic">1MS</p>
                    </div>
                 </div>
              </div>
           </motion.div>
        )}

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
