import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, collection, query, where, limit, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  ArrowLeft, 
  Minus, 
  Plus, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  ZoomIn,
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/src/lib/firebaseUtils';
import { GoogleGenAI } from "@google/genai";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  category: string;
  stock: number;
  ratings?: number;
}

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // AI Insight Generation
  useEffect(() => {
    if (product && !aiInsight && !aiLoading) {
      const generateInsight = async () => {
        setAiLoading(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a style advisor for WH1RLPOOL, a premium dark gothic football jersey marketplace. Briefly describe why this jersey is a must-have for a collector in a poetic, dark, and futuristic style. PRODUCT: ${product.name}. DESC: ${product.description}. KEEP IT SHORT (MAX 30 WORDS).`,
          });
          setAiInsight(response.text || null);
        } catch (err) {
          console.error("AI Insight Error:", err);
        } finally {
          setAiLoading(false);
        }
      };
      generateInsight();
    }
  }, [product]);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          
          const q = query(
            collection(db, 'products'), 
            where('category', '==', data.category),
            limit(4)
          );
          onSnapshot(q, (snap) => {
            setRelatedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)).filter(p => p.id !== id));
          });
        } else if (id === 'argentina-retro' || id === '1') {
          setProduct({
            id: 'argentina-retro',
            name: 'Argentina 1994 Retro Away',
            description: 'The legendary masterpiece worn in USA 1994. Pure nostalgia in every diamond pattern.',
            price: 449,
            stock: 50,
            category: 'Retro Jerseys',
            imageUrl: 'https://images.footballfanatics.com/argentina-national-team/argentina-adidas-og-1994-away-jersey-blue_ss5_p-200938531+pv-1+v-69c3a3c2672740939f0464c8d50c196f.jpg',
            images: [
              'https://images.footballfanatics.com/argentina-national-team/argentina-adidas-og-1994-away-jersey-blue_ss5_p-200938531+pv-1+v-69c3a3c2672740939f0464c8d50c196f.jpg'
            ]
          });
        } else if (id === 'real-madrid-2425' || id === '2') {
          setProduct({
            id: 'real-madrid-2425',
            name: 'Real Madrid 24/25 Home',
            description: 'Pure elegance. The 2024/25 home kit for the Kings of Europe.',
            price: 449,
            stock: 100,
            category: 'Official Jerseys',
            imageUrl: 'https://shop.realmadrid.com/cdn/shop/files/RMCFMS0120-01_1.jpg',
            images: [
              'https://shop.realmadrid.com/cdn/shop/files/RMCFMS0120-01_1.jpg'
            ]
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `products/${id}`);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    if (!product) return;
    setIsAddingToCart(true);
    
    try {
      const cartRef = doc(db, 'users', user.uid, 'cart', product.id);
      await setDoc(cartRef, {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || '',
        quantity,
        size: selectedSize,
        addedAt: new Date()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) return navigate('/login');
    setIsWishlisted(!isWishlisted);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-brand-red rounded-full animate-ping" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Artifact Lost In Void</h1>
        <Button onClick={() => navigate('/shop')}>Return to Archive</Button>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-32 px-6 md:px-12 selection:bg-brand-red">
      <div className="max-w-[1700px] mx-auto">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-4 text-white/30 hover:text-white transition-all uppercase text-[9px] font-black tracking-[0.4em] mb-16 group"
        >
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white transition-all">
            <ArrowLeft className="w-3 h-3" />
          </div>
          REVERT TO ARCHIVE
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 xl:gap-32">
          {/* Enhanced Image Suite */}
          <div className="space-y-8">
            <motion.div 
              style={{
                perspective: 1000,
              }}
              className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-white/[0.03] border border-white/10 group cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                }}
                className="w-full h-full"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={allImages[selectedImage]}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                    alt={product.name}
                  />
                </AnimatePresence>
              </motion.div>

              {/* Floating Overlay Controls */}
              <div className="absolute top-10 right-10 z-20 flex flex-col gap-4">
                 <button className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:scale-110 transition-all shadow-2xl">
                    <Maximize2 className="w-5 h-5" />
                 </button>
                 <button className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:scale-110 transition-all shadow-2xl">
                    <ZoomIn className="w-5 h-5" />
                 </button>
              </div>

              {/* Liquid Gloss Effect */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent mix-blend-overlay opacity-50" />
              <div className="absolute -inset-[100%] pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse" />
            </motion.div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {allImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-28 h-36 rounded-[2rem] overflow-hidden bg-white/5 border shrink-0 transition-all duration-700 ${
                    selectedImage === idx 
                    ? 'border-brand-red scale-90 shadow-[0_0_30px_rgba(255,0,0,0.2)]' 
                    : 'border-white/5 grayscale hover:grayscale-0 hover:border-white/20'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                  {selectedImage === idx && (
                    <div className="absolute inset-0 bg-brand-red/10 backdrop-blur-[2px]" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Core Info Suite */}
          <div className="space-y-16">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-6">
                 <span className="px-5 py-2 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[9px] font-black tracking-[0.5em] uppercase rounded-full">
                    {product.category}
                 </span>
                 <div className="flex items-center gap-2 text-white/40 bg-white/5 px-5 py-2 rounded-full border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-brand-red text-brand-red" />
                    <span className="text-[10px] font-black">{product.ratings || '4.9'}</span>
                    <span className="h-3 w-[1px] bg-white/10 mx-1" />
                    <span className="text-[10px] font-black">1.2K COPIES EXTRACTED</span>
                 </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-[0.8] mb-4">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-4">
                   <p className="text-5xl font-black tracking-tighter text-white tabular-nums">₹{product.price}</p>
                   <p className="text-xl font-bold text-white/20 uppercase tracking-widest italic">Inventory unit {id?.slice(0, 4)}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-brand-red via-brand-red/20 to-transparent" />
              <p className="text-xl font-display font-black tracking-tight text-white/40 uppercase italic leading-relaxed max-w-xl">
                {product.description || "A masterfully crafted legacy artifact. This high-end collective piece features precision embroidery and performance-grade materials for ultimate durability and comfort."}
              </p>
            </div>

            {/* AI Insights Section */}
            <AnimatePresence>
              {(aiInsight || aiLoading) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[2rem] bg-brand-red/[0.03] border border-brand-red/10 space-y-4 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Star className="w-12 h-12 text-brand-red" />
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-brand-red tracking-[0.4em] uppercase">VOID INSIGHTS</span>
                     <div className="flex-1 h-[1px] bg-brand-red/10" />
                  </div>
                  {aiLoading ? (
                    <div className="flex items-center gap-4 text-white/20">
                       <div className="w-1 h-1 bg-brand-red rounded-full animate-pulse" />
                       <p className="text-[10px] font-bold uppercase tracking-widest italic animate-pulse">Extracting consciousness from original fabric...</p>
                    </div>
                  ) : (
                    <p className="text-sm font-serif italic text-white/60 leading-relaxed">"{aiInsight}"</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tactical Configuration */}
            <div className="space-y-16 pt-12">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-brand-red rounded-full" />
                    <h4 className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40">SELECT DIMENSION</h4>
                  </div>
                  <button 
                    onClick={() => setShowSizeGuide(true)}
                    className="flex items-center gap-2 text-[9px] uppercase font-black tracking-widest text-brand-red hover:text-white transition-colors"
                  >
                    <Info className="w-4 h-4" /> SIZE PROTOCOL
                  </button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[80px] h-[80px] rounded-[1.5rem] flex items-center justify-center font-display font-black text-xl transition-all duration-500 border ${
                        selectedSize === size 
                        ? 'bg-white text-black border-white shadow-[0_20px_40px_rgba(255,255,255,0.1)] scale-110' 
                        : 'bg-transparent text-white/20 border-white/5 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-brand-red rounded-full" />
                    <h4 className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40">QUANTITY MATRIX</h4>
                 </div>
                 <div className="flex items-center gap-12 bg-white/[0.03] w-fit px-10 py-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                    <motion.button 
                      whileTap={{ scale: 0.8 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="text-white/20 hover:text-brand-red transition-all"
                    >
                       <Minus className="w-6 h-6" />
                    </motion.button>
                    <span className="text-3xl font-display font-black w-10 text-center italic">{quantity}</span>
                    <motion.button 
                      whileTap={{ scale: 0.8 }}
                      onClick={() => setQuantity(quantity + 1)} 
                      className="text-white/20 hover:text-brand-red transition-all"
                    >
                       <Plus className="w-6 h-6" />
                    </motion.button>
                 </div>
              </div>
            </div>

            {/* Acquisition Protocol */}
            <div className="flex flex-col gap-6 pt-12 pb-12 border-b border-white/5">
                <Button 
                  onClick={() => {
                    navigate('/checkout', { 
                      state: { 
                        cartItems: [{ ...product, quantity, size: selectedSize }], 
                        total: product.price * quantity 
                      } 
                    });
                  }}
                  className="w-full h-24 text-xl rounded-full bg-brand-red text-white hover:bg-white hover:text-black transition-all duration-1000 font-display font-black italic uppercase tracking-widest px-12 group shadow-[0_20px_60px_rgba(255,0,0,0.2)]"
                >
                  <span className="flex items-center justify-between w-full">
                    INITIALIZE PURCHASE <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                  </span>
                </Button>
               
               <div className="flex flex-col sm:flex-row gap-4">
                 <Button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  className="flex-1 h-20 text-[10px] rounded-full bg-white/[0.05] border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-700 font-black uppercase tracking-[0.3em] px-10"
                 >
                   {product.stock === 0 ? 'OUT OF SYNC' : isAddingToCart ? 'TRANSMITTING...' : 'ADD TO TERMINAL'} 
                 </Button>
                 <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleWishlist}
                  className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all duration-700 ${
                    isWishlisted ? 'bg-brand-red border-brand-red text-white shadow-[0_0_30px_rgba(255,0,0,0.3)]' : 'bg-transparent border-white/10 text-white/20 hover:border-white/40'
                  }`}
                 >
                   <Heart className={`w-8 h-8 ${isWishlisted ? 'fill-current' : ''}`} />
                 </motion.button>
               </div>
            </div>

            {/* Security Suite */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
               <SecurityBadge icon={<ShieldCheck className="w-6 h-6" />} title="VERIFIED" desc="EXTRACTION" />
               <SecurityBadge icon={<Truck className="w-6 h-6" />} title="STEALTH" desc="SHIPMENT" />
               <SecurityBadge icon={<RotateCcw className="w-6 h-6" />} title="ENCRYPTED" desc="PAYMENTS" />
            </div>
          </div>
        </div>

        {/* Global Catalog Context */}
        <section className="pt-60 space-y-24">
           <div className="text-center space-y-6">
              <span className="text-[10px] font-black text-brand-red tracking-[0.5em] uppercase">VOID RECOGNITION</span>
              <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-none">SIMILAR FREQUENCIES</h2>
              <div className="w-40 h-[1px] bg-white/10 mx-auto" />
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
             {relatedProducts.map((p, i) => (
               <motion.div 
                 key={p.id} 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="group cursor-pointer" 
                 onClick={() => navigate(`/product/${p.id}`)}
               >
                  <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white/[0.03] mb-8 border border-white/5 group-hover:border-brand-red/40 transition-all duration-1000 shadow-2xl relative">
                    <img src={p.imageUrl} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                       <p className="text-[10px] font-black uppercase tracking-widest text-brand-red">INSPECT %</p>
                    </div>
                  </div>
                  <h4 className="text-sm font-display font-black uppercase tracking-tight italic truncate group-hover:text-brand-red transition-colors">{p.name}</h4>
                  <p className="text-lg font-black italic mt-1">₹{p.price}</p>
               </motion.div>
             ))}
           </div>
        </section>
      </div>

      {/* Size Guide Overlay */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="w-full max-w-4xl bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 md:p-20 relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-red" />
                <button 
                  onClick={() => setShowSizeGuide(false)}
                  className="absolute top-10 right-10 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>

                <h2 className="text-6xl font-display font-black uppercase italic tracking-tighter mb-16">SIZE PROTOCOL</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                   <div className="space-y-12">
                      <div className="space-y-4">
                         <h4 className="text-brand-red font-black uppercase tracking-widest text-[10px]">CHEST MEASUREMENT</h4>
                         <p className="text-white/40 text-[10px] font-black leading-relaxed uppercase tracking-widest">Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-brand-red font-black uppercase tracking-widest text-[10px]">WAIST MEASUREMENT</h4>
                         <p className="text-white/40 text-[10px] font-black leading-relaxed uppercase tracking-widest">Measure around the narrowest part (typically where your body bends side to side), keeping the tape horizontal.</p>
                      </div>
                   </div>
                   
                   <div className="bg-white/[0.03] rounded-[2rem] border border-white/5 p-8">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="border-b border-white/10">
                               <th className="py-4 text-[10px] font-black uppercase tracking-widest text-white/20">SIZE</th>
                               <th className="py-4 text-[10px] font-black uppercase tracking-widest text-white/20">CHEST (CM)</th>
                               <th className="py-4 text-[10px] font-black uppercase tracking-widest text-white/20">WAIST (CM)</th>
                            </tr>
                         </thead>
                         <tbody className="text-[11px] font-black uppercase tracking-widest">
                            <tr className="border-b border-white/5">
                               <td className="py-4 text-brand-red">S</td>
                               <td className="py-4">88 - 94</td>
                               <td className="py-4">76 - 82</td>
                            </tr>
                            <tr className="border-b border-white/5">
                               <td className="py-4 text-brand-red">M</td>
                               <td className="py-4">95 - 102</td>
                               <td className="py-4">83 - 90</td>
                            </tr>
                            <tr className="border-b border-white/5">
                               <td className="py-4 text-brand-red">L</td>
                               <td className="py-4">103 - 111</td>
                               <td className="py-4">91 - 99</td>
                            </tr>
                            <tr>
                               <td className="py-4 text-brand-red">XL</td>
                               <td className="py-4">112 - 121</td>
                               <td className="py-4">100 - 109</td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SecurityBadge = ({ icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex flex-col items-center sm:items-start gap-4 group">
    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-red group-hover:border-brand-red/30 transition-all duration-700">
       {icon}
    </div>
    <div className="text-center sm:text-left">
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">{title}</p>
       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">{desc}</p>
    </div>
  </div>
);


const Badge = ({ icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-red transition-all">
       {icon}
    </div>
    <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">{label}</span>
  </div>
);

const Link = ({ to, children, className }: any) => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)} className={className}>{children}</button>;
};
