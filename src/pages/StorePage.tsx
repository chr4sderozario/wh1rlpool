import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Search, 
  X, 
  Filter, 
  ChevronDown, 
  LayoutGrid, 
  List,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect, useMemo, memo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firebaseUtils';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  gender?: string;
  club?: string;
  country?: string;
  isTrending?: boolean;
  isNew?: boolean;
}

const CATEGORIES = [
  'All Artifacts',
  'Official Jerseys',
  'Retro Jerseys',
  'Embroidery Jerseys',
  'High Quality Jerseys',
  'Sale Jerseys',
  'Limited Edition Jerseys',
  'Player Edition Jerseys',
  'Club Jerseys',
  'National Team Jerseys',
  'Custom Name Jerseys',
  'Training Kits',
  'Shorts',
  'Socks'
];

interface StorePageProps {
  gender?: 'men' | 'women';
  onSale?: boolean;
}

export const StorePage = ({ gender, onSale }: StorePageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Artifacts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  // Advanced Filters state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedClub, setSelectedClub] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // Seed data if needed
      if (data.length === 0) {
        data.push({
           id: 'argentina-home-jersey',
           name: 'Argentina 2024 Home Jersey',
           price: 449,
           stock: 50,
           category: 'National Team Jerseys',
           imageUrl: 'https://images.footballfanatics.com/argentina-national-team/argentina-adidas-training-jersey-navy_ss5_p-200786938+pv-1+v-142f36d37651474e8929e0689b0b4b2a.jpg',
           isTrending: true,
           isNew: true
        });
      }
      setProducts(data);
      setLoading(false);
    });

    // Parse URL params for category
    const searchParams = new URLSearchParams(location.search);
    const catParam = searchParams.get('category');
    if (catParam && CATEGORIES.includes(catParam)) {
      setSelectedCategory(catParam);
    }

    return unsubscribe;
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Artifacts' || p.category === selectedCategory;
      const matchesGender = !gender || p.gender === gender || p.gender === 'unisex';
      const matchesSale = !onSale || p.category === 'Sale Jerseys';
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesClub = selectedClub === 'All' || p.club === selectedClub;
      const matchesCountry = selectedCountry === 'All' || p.country === selectedCountry;
      const matchesStock = !inStockOnly || p.stock > 0;

      return matchesSearch && matchesCategory && matchesGender && matchesSale && matchesPrice && matchesClub && matchesCountry && matchesStock;
    });

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'popular') result.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));

    return result;
  }, [products, searchQuery, selectedCategory, gender, onSale, priceRange, selectedClub, selectedCountry, inStockOnly, sortBy]);

  const clubs = useMemo(() => ['All', ...new Set(products.map(p => p.club).filter(Boolean) as string[])], [products]);
  const countries = useMemo(() => ['All', ...new Set(products.map(p => p.country).filter(Boolean) as string[])], [products]);

  if (loading) {
     return (
        <div className="min-h-screen bg-black flex items-center justify-center">
           <div className="w-20 h-20 border-t-2 border-brand-red rounded-full animate-spin" />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-red">
      {/* Search Header - Sticky */}
      <div className="fixed top-24 left-0 right-0 z-[60] bg-black/60 backdrop-blur-3xl border-b border-white/5 py-4 px-6 md:px-12">
        <div className="max-w-[2000px] mx-auto flex items-center gap-8">
           <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-red transition-all" />
              <input 
                type="text" 
                placeholder="PROMPT THE ARCHIVE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-[10px] uppercase font-black tracking-widest focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 transition-all"
              />
           </div>
           <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-5 rounded-2xl border transition-all ${isSidebarOpen ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/40'}`}
              >
                 <SlidersHorizontal className="w-5 h-5" />
              </button>
              <div className="relative group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-2xl px-10 py-5 pr-16 text-[9px] uppercase font-black tracking-widest focus:outline-none focus:border-brand-red cursor-pointer"
                >
                  <option value="newest">NEWEST TRANSMISSIONS</option>
                  <option value="price-low">PRICE: ASCENDING</option>
                  <option value="price-high">PRICE: DESCENDING</option>
                  <option value="popular">TRENDING PULSE</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
              </div>
           </div>
        </div>
      </div>

      <div className="pt-48 pb-32 flex">
        {/* Full Height Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -350, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -350, opacity: 0 }}
              className="w-[350px] shrink-0 border-r border-white/5 h-[calc(100vh-200px)] sticky top-[192px] px-8 py-12 space-y-16 overflow-y-auto hidden lg:block scrollbar-hide"
            >
               {/* Categories Section */}
               <div className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">ARCHIVE SECTORS</h3>
                  <div className="flex flex-col gap-4">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left text-xs font-black uppercase tracking-widest transition-all relative ${selectedCategory === cat ? 'text-brand-red pl-4' : 'text-white/30 hover:text-white hover:pl-2'}`}
                      >
                         {selectedCategory === cat && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-red rounded-full" />}
                         {cat}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Price Range Protocol */}
               <div className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">VALUATION SCAN</h3>
                  <div className="space-y-6">
                     <div className="flex justify-between text-[10px] font-black tracking-widest uppercase">
                        <span>₹{priceRange[0]}</span>
                        <span className="text-brand-red">₹{priceRange[1]}</span>
                     </div>
                     <input 
                       type="range" 
                       min="0" 
                       max="10000" 
                       step="100"
                       value={priceRange[1]}
                       onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                       className="w-full accent-brand-red opacity-30 hover:opacity-100 transition-opacity"
                     />
                  </div>
               </div>

               {/* Origin Filtering */}
               <div className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">ORIGIN FILTER</h3>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-white/20">CLUB SYNC</label>
                        <select 
                          value={selectedClub}
                          onChange={(e) => setSelectedClub(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-red"
                        >
                           {clubs.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-white/20">TERRITORY SCAN</label>
                        <select 
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-red"
                        >
                           {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                  </div>
               </div>

               {/* Status Toggles */}
               <div className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">AVAILABILITY</h3>
                  <label className="flex items-center gap-4 cursor-pointer group">
                     <input 
                       type="checkbox" 
                       checked={inStockOnly}
                       onChange={(e) => setInStockOnly(e.target.checked)}
                       className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-brand-red focus:ring-brand-red focus:ring-offset-black"
                     />
                     <span className="text-xs font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-all">IN-STOCK UNITS ONLY</span>
                  </label>
               </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid Area */}
        <main className="flex-1 px-8 md:px-12 py-12">
           <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                 <nav className="flex items-center gap-4 text-white/20 text-[9px] uppercase tracking-[0.4em] font-black mb-8">
                    <Link to="/" className="hover:text-brand-red transition-all">HOME</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white/60">ARCHIVE</span>
                 </nav>
                 <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-[0.8]">
                    {selectedCategory !== 'All Artifacts' ? selectedCategory : 'THE ARCHIVE'}
                 </h2>
                 <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 mt-6 italic underline decoration-brand-red decoration-2 underline-offset-8">
                   {filteredProducts.length} ARTIFACTS IN SECTOR
                 </p>
              </div>
           </div>

           {/* Active Filters Bar */}
           <div className="flex flex-wrap gap-3 mb-12">
              <ActiveFilter label="REDUCE ALL" onRemove={() => {setSelectedCategory('All Artifacts'); setSelectedClub('All'); setSelectedCountry('All'); setSearchQuery(''); setPriceRange([0, 10000]); }} isClear />
              {selectedCategory !== 'All Artifacts' && <ActiveFilter label={selectedCategory} onRemove={() => setSelectedCategory('All Artifacts')} />}
              {selectedClub !== 'All' && <ActiveFilter label={selectedClub} onRemove={() => setSelectedClub('All')} />}
              {selectedCountry !== 'All' && <ActiveFilter label={selectedCountry} onRemove={() => setSelectedCountry('All')} />}
              {searchQuery && <ActiveFilter label={`"${searchQuery}"`} onRemove={() => setSearchQuery('')} />}
           </div>

           <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-x-6 gap-y-16">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                   <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
           </div>

           {filteredProducts.length === 0 && (
              <div className="py-60 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[4rem] text-center">
                 <div className="w-32 h-32 text-white/5 mb-12 animate-pulse">
                    <Search className="w-full h-full" />
                 </div>
                 <h3 className="text-5xl font-display font-black uppercase italic tracking-tighter text-white/20 mb-4">SECTOR EMPTY</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 max-w-sm">NO ARTIFACTS SYNCED WITH THE CURRENT PROTOCOL. RECALIBRATE YOUR TRANSMISSION.</p>
                 <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All Artifacts'); }} className="mt-12 scale-110">REBOOT SCANNER</Button>
              </div>
           )}
        </main>
      </div>
    </div>
  );
};

const ProductCard = memo(({ product }: { product: Product }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 bg-white/[0.02] border border-white/5 transition-all duration-700 group-hover:border-brand-red/30 shadow-2xl">
        {/* Glow Effect */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-brand-red/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/5">
            <ShoppingBag className="w-10 h-10" />
          </div>
        )}

        {/* Labels - Simplified */}
        {(product.isNew || product.isTrending) && (
          <div className="absolute bottom-4 left-4 z-20">
             <span className="text-[7px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest bg-black/60 backdrop-blur-xl border border-white/5 text-white/60">
                {product.isNew ? 'Extraction Live' : 'High Frequency'}
             </span>
          </div>
        )}

        {/* Liquid Glass Overlay - Enhanced */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.01] via-transparent to-transparent opacity-50 group-hover:opacity-100" />
      </div>

      <div className="space-y-4 px-2">
        <div className="flex justify-between items-start gap-4">
           <h3 className="flex-1 text-xs font-display font-black tracking-tight uppercase italic line-clamp-2 group-hover:text-brand-red transition-colors duration-500">
              {product.name}
           </h3>
           <p className="text-sm font-display font-black italic text-white/40 tabular-nums shrink-0 group-hover:text-white transition-colors">
              ₹{product.price}
           </p>
        </div>
        <div className="flex items-center justify-between">
           <span className="text-[8px] text-white/10 uppercase tracking-[0.4em] font-black italic group-hover:text-white/20 transition-colors">
              {product.category}
           </span>
           {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[7px] text-brand-red uppercase font-black tracking-tighter opacity-70">
                 LOW UNITS
              </span>
           )}
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

const ActiveFilter = ({ label, onRemove, isClear }: { label: string; onRemove: () => void; isClear?: boolean }) => (
  <button 
    onClick={onRemove}
    className={`flex items-center gap-3 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all group ${
       isClear 
       ? 'bg-brand-red/10 border border-brand-red/30 text-brand-red hover:bg-brand-red hover:text-white' 
       : 'bg-white/5 border border-white/10 text-white/40 hover:border-white/40 hover:text-white'
    }`}
  >
    {label}
    <X className={`w-3 h-3 ${isClear ? 'text-brand-red group-hover:text-white' : 'text-white/20 group-hover:text-white'} transition-all`} />
  </button>
);

const Link = ({ to, children, className }: any) => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)} className={className}>{children}</button>;
};
