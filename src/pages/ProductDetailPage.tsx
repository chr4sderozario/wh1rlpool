import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, limit, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
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
  ZoomIn
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/src/lib/firebaseUtils';

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
  const { user, profile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          
          // Load related
          const q = query(
            collection(db, 'products'), 
            where('category', '==', data.category),
            limit(4)
          );
          onSnapshot(q, (snap) => {
            setRelatedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)).filter(p => p.id !== id));
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
      // Animation or Toast would go here
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) return navigate('/login');
    setIsWishlisted(!isWishlisted);
    // Logic to save to wishlist collection...
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Artifact Lost</h1>
        <Button onClick={() => navigate('/shop')}>Return to Archive</Button>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-32 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-white/5 border border-white/5 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={allImages[selectedImage]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-105"
                />
              </AnimatePresence>
              <div className="absolute top-8 right-8 z-20">
                 <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white/40 hover:text-white transition-all">
                    <ZoomIn className="w-5 h-5" />
                 </button>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-24 h-32 rounded-2xl overflow-hidden bg-white/5 border shrink-0 transition-all duration-500 ${
                    selectedImage === idx ? 'border-brand-red scale-95 shadow-[0_0_15px_rgba(255,20,20,0.3)]' : 'border-white/5 grayscale hover:grayscale-0'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <span className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-red gothic-glow">{product.category}</span>
                 <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold">{product.ratings || '4.9'}</span>
                 </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-[0.9]">{product.name}</h1>
              <p className="text-4xl font-black tracking-tighter text-white/60">₹ {product.price.toString()}</p>
            </div>

            <p className="text-white/40 font-serif italic text-lg leading-relaxed border-l-2 border-white/5 pl-8 py-2">
              {product.description || "A masterfully crafted artifact from the WH1RLPOOL vault. Engineered for the pitch, designed for the streets. This limited edition transmission features custom gothic embroidery and performance grade textiles."}
            </p>

            {/* Selectors */}
            <div className="space-y-12 pt-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-white/40">Select Transmission Size</h4>
                  <button className="text-[8px] uppercase font-black tracking-widest text-brand-red underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold transition-all border ${
                        selectedSize === size ? 'bg-white text-black border-white shadow-xl scale-110' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[10px] uppercase font-black tracking-widest text-white/40">Artifact Quantity</h4>
                 <div className="flex items-center gap-8 bg-white/5 w-fit px-8 py-4 rounded-3xl border border-white/10">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-white/40 hover:text-white transition-colors">
                       <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-2xl font-black w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="text-white/40 hover:text-white transition-colors">
                       <Plus className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-6 pt-12">
               <Button 
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
                className="flex-1 h-20 text-lg rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-bold px-12 group"
               >
                 <span className="flex items-center gap-4">
                  {product.stock === 0 ? 'ARCHIVE EXHAUSTED' : isAddingToCart ? 'TRANSMITTING...' : 'ADD TO TERMINAL'} 
                  {!isAddingToCart && product.stock > 0 && <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                 </span>
               </Button>
               <button 
                onClick={toggleWishlist}
                className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all duration-500 ${
                  isWishlisted ? 'bg-brand-red border-brand-red text-white' : 'bg-transparent border-white/10 text-white/40 hover:border-white/40'
                }`}
               >
                 <Heart className={`w-8 h-8 ${isWishlisted ? 'fill-current' : ''}`} />
               </button>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12 border-t border-white/5">
               <Badge icon={<ShieldCheck className="w-5 h-5" />} label="Verified Artifact" />
               <Badge icon={<Truck className="w-5 h-5" />} label="Stealth Shipping" />
               <Badge icon={<RotateCcw className="w-5 h-5" />} label="30D Exchange" />
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="pt-40 space-y-16">
           <div className="flex items-end justify-between border-b border-white/10 pb-8">
              <div className="space-y-2">
                 <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic">SIMILAR FREQUENCIES</h2>
                 <p className="text-white/40 text-sm font-serif italic">Artifacts from the same archive collection.</p>
              </div>
              <Link to="/shop" className="text-[10px] uppercase font-black tracking-widest text-brand-red hover:underline">View All</Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {relatedProducts.map(p => (
               <div key={p.id} className="group cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-white/5 mb-4 border border-white/5 group-hover:border-brand-red/30 transition-all duration-500">
                    <img src={p.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-widest truncate">{p.name}</h4>
                  <p className="text-[10px] font-black text-white/20 mt-1 uppercase">₹ {p.price.toString()}</p>
               </div>
             ))}
             {relatedProducts.length === 0 && <p className="text-white/10 text-xs italic">No similar artifacts found in this sector.</p>}
           </div>
        </section>
      </div>
    </div>
  );
};

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
