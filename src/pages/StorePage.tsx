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
  const [showSuggestions, setShowSuggestions] = useState(false);

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
        data.push(
          {
            id: 'argentina-home-jersey',
            name: 'Argentina 2024 Home Jersey',
            price: 449,
            stock: 50,
            category: 'National Team Jerseys',
            imageUrl: 'https://i.postimg.cc/zfVS1Rdp/rn-image-picker-lib-temp-9df97e78-f684-4469-b0cc-4e215d00423a.png',
            isTrending: true,
            isNew: true
          },
          {
            id: 'real-madrid-home',
            name: 'Real Madrid 24/25 Home',
            price: 449,
            stock: 50,
            category: 'Official Jerseys',
            imageUrl: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7a0dca?q=80&w=800',
            isNew: true
          },
          {
            id: 'man-city-home',
            name: 'Man City 24/25 Home',
            price: 449,
            stock: 45,
            category: 'Official Jerseys',
            imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800',
            isTrending: true
          },
          {
            id: 'brazil-retro-1970',
            name: 'Brazil 1970 Retro',
            price: 599,
            stock: 15,
            category: 'Retro Jerseys',
            imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=800',
            isNew: false
          }
        );
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

  const searchSuggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return products
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [searchQuery, products]);

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
      <div className="fixed top-16 md:top-24 left-0 right-0 z-[60] bg-black/60 backdrop-blur-3xl border-b border-white/5 py-3 md:py-4 px-4 md:px-12">
        <div className="max-w-[2000px] mx-auto flex items-center gap-4 md:gap-8">
           <div className="flex-1 relative group">
              <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-brand-red transition-all" />
              <input 
                type="text" 
                placeholder="PROMPT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 md:h-16 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-12 md:pl-16 pr-4 md:pr-6 text-[9px] md:text-[10px] uppercase font-black tracking-widest focus:outline-none focus:border-brand-red transition-all"
              />
           </div>
           <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-3.5 md:p-5 rounded-xl md:rounded-2xl border transition-all ${isSidebarOpen ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/40'}`}
              >
                 <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <div className="relative group hidden sm:block">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-6 md:px-10 py-3.5 md:py-5 pr-10 md:pr-16 text-[8px] md:text-[9px] uppercase font-black tracking-widest focus:outline-none focus:border-brand-red cursor-pointer"
                >
                  <option value="newest">NEWEST</option>
                  <option value="price-low">PRICE ↑</option>
                  <option value="price-high">PRICE ↓</option>
                  <option value="popular">TRENDING</option>
                </select>
                <ChevronDown className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-white/20 pointer-events-none" />
              </div>
           </div>
        </div>
      </div>

      <div className="pt-36 md:pt-48 pb-32 flex flex-col md:flex-row">
        {/* Mobile Filter Drawer Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
             <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] lg:hidden"
                />
                <motion.aside
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-full max-w-[320px] bg-black border-r border-white/5 z-[80] px-8 py-10 overflow-y-auto lg:hidden"
                >
                   <div className="flex justify-between items-center mb-12">
                      <h2 className="text-xl font-display font-black italic uppercase italic">FILTERS</h2>
                      <button onClick={() => setIsSidebarOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                         <X className="w-5 h-5" />
                      </button>
                   </div>
                   <FilterContent 
                     selectedCategory={selectedCategory} 
                     setSelectedCategory={setSelectedCategory}
                     priceRange={priceRange}
                     setPriceRange={setPriceRange}
                     selectedClub={selectedClub}
                     setSelectedClub={setSelectedClub}
                     selectedCountry={selectedCountry}
                     setSelectedCountry={setSelectedCountry}
                     clubs={clubs}
                     countries={countries}
                     inStockOnly={inStockOnly}
                     setInStockOnly={setInStockOnly}
                   />
                </motion.aside>
             </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{ 
            width: isSidebarOpen ? 350 : 0,
            opacity: isSidebarOpen ? 1 : 0,
            pointerEvents: isSidebarOpen ? 'auto' : 'none'
          }}
          className="hidden lg:block shrink-0 border-r border-white/5 h-[calc(100vh-200px)] sticky top-[192px] px-8 py-12 space-y-16 overflow-y-auto scrollbar-hide"
        >
           <FilterContent 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedClub={selectedClub}
              setSelectedClub={setSelectedClub}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              clubs={clubs}
              countries={countries}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
           />
        </motion.aside>

        {/* Product Grid Area */}
        <main className="flex-1 px-4 md:px-12 py-8 md:py-12">
           <div className="mb-8 md:mb-12 flex flex-col items-start justify-between gap-6">
              <div>
                 <nav className="flex items-center gap-2 md:gap-4 text-white/20 text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black mb-4 md:mb-8">
                    <Link to="/" className="hover:text-brand-red transition-all">HOME</Link>
                    <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span className="text-white/60">ARCHIVE</span>
                 </nav>
                 <h2 className="text-4xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-[0.8]">
                    {selectedCategory !== 'All Artifacts' ? selectedCategory : 'THE ARCHIVE'}
                 </h2>
                 <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-white/40 mt-4 md:mt-6 italic underline decoration-brand-red decoration-2 underline-offset-8">
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

const FilterContent = ({ 
  selectedCategory, 
  setSelectedCategory, 
  priceRange, 
  setPriceRange, 
  selectedClub, 
  setSelectedClub, 
  selectedCountry, 
  setSelectedCountry, 
  clubs, 
  countries, 
  inStockOnly, 
  setInStockOnly 
}: any) => {
  return (
    <div className="space-y-12">
      {/* Categories Section */}
      <div className="space-y-6">
         <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic">ARCHIVE SECTORS</h3>
         <div className="flex flex-col gap-3">
           {CATEGORIES.map(cat => (
             <button 
               key={cat} 
               onClick={() => setSelectedCategory(cat)}
               className={`text-left text-[11px] font-black uppercase tracking-widest transition-all relative ${selectedCategory === cat ? 'text-brand-red pl-4' : 'text-white/30 hover:text-white hover:pl-2'}`}
             >
                {selectedCategory === cat && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-red rounded-full" />}
                {cat}
             </button>
           ))}
         </div>
      </div>

      {/* Price Range Protocol */}
      <div className="space-y-6">
         <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic">VALUATION SCAN</h3>
         <div className="space-y-4">
            <div className="flex justify-between text-[9px] font-black tracking-widest uppercase">
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
              className="w-full accent-brand-red opacity-30 h-1.5 bg-white/5 rounded-full appearance-none "
            />
         </div>
      </div>

      {/* Origin Filtering */}
      <div className="space-y-6">
         <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic">ORIGIN FILTER</h3>
         <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-[7px] font-black uppercase tracking-widest text-white/20">CLUB SYNC</label>
               <select 
                 value={selectedClub}
                 onChange={(e) => setSelectedClub(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-red"
               >
                  {clubs.map((c: string) => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[7px] font-black uppercase tracking-widest text-white/20">TERRITORY SCAN</label>
               <select 
                 value={selectedCountry}
                 onChange={(e) => setSelectedCountry(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-red"
               >
                  {countries.map((c: string) => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
         </div>
      </div>

      {/* Status Toggles */}
      <div className="space-y-6">
         <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic">AVAILABILITY</h3>
         <label className="flex items-center gap-4 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-brand-red focus:ring-brand-red focus:ring-offset-black"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-all">IN-STOCK UNITS ONLY</span>
         </label>
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
