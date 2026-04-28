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
import { useState, useEffect, useMemo } from 'react';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  // Filters state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedClub, setSelectedClub] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return unsubscribe;
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Artifacts' || p.category === selectedCategory;
      const matchesGender = !gender || p.gender === gender || p.gender === 'unisex';
      const matchesSale = !onSale || p.category === 'Sale Jerseys';
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesClub = selectedClub === 'All' || p.club === selectedClub;
      const matchesCountry = selectedCountry === 'All' || p.country === selectedCountry;

      return matchesSearch && matchesCategory && matchesGender && matchesSale && matchesPrice && matchesClub && matchesCountry;
    });

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'popular') result.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));

    return result;
  }, [products, searchQuery, selectedCategory, gender, onSale, priceRange, selectedClub, selectedCountry, sortBy]);

  const clubs = useMemo(() => ['All', ...new Set(products.map(p => p.club).filter(Boolean) as string[])], [products]);
  const countries = useMemo(() => ['All', ...new Set(products.map(p => p.country).filter(Boolean) as string[])], [products]);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-32 px-6 md:px-12">
      {/* Dynamic Header */}
      <header className="max-w-[1600px] mx-auto mb-16 space-y-8">
        <div className="flex items-center gap-4 text-white/20 text-[10px] uppercase tracking-[0.4em] font-black">
          <Link to="/" className="hover:text-brand-red transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/60">{gender ? gender : onSale ? 'Sale' : 'Shop'}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase italic gothic-glow">
              {gender ? `${gender}'s archive` : onSale ? 'The Clearance' : 'The archive'}
            </h1>
            <p className="text-white/40 font-serif italic text-lg">
              Filtering through the artifacts of the void. {filteredProducts.length} Results detected.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-3 px-8 py-4 rounded-full border transition-all uppercase text-[10px] font-black tracking-widest ${
                isFilterOpen ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 hover:border-white/30 text-white/60'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> 
              {isFilterOpen ? 'Close Filters' : 'Fine Tune'}
            </button>
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white/5 border border-white/10 rounded-full px-8 py-4 pr-12 text-[10px] uppercase font-black tracking-widest focus:outline-none focus:border-brand-red transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low - High</option>
                <option value="price-high">Price: High - Low</option>
                <option value="popular">Most Trending</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-12">
        {/* Sticky Filters Sidebar */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '320px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:block space-y-12 shrink-0 border-r border-white/5 pr-12 h-fit sticky top-32"
            >
              {/* Category Filter */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Categories</h3>
                <div className="flex flex-col gap-3">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left text-sm uppercase tracking-widest font-black transition-all hover:pl-2 ${
                        selectedCategory === cat ? 'text-brand-red' : 'text-white/20 hover:text-white/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Club Filter */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Filter By Club</h3>
                <select 
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs uppercase font-bold tracking-widest focus:outline-none focus:border-brand-red"
                >
                  {clubs.map(club => <option key={club} value={club}>{club}</option>)}
                </select>
              </div>

              {/* Country Filter */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Filter By Country</h3>
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs uppercase font-bold tracking-widest focus:outline-none focus:border-brand-red"
                >
                  {countries.map(country => <option key={country} value={country}>{country}</option>)}
                </select>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Product Grid */}
        <div className="flex-1 space-y-12">
          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-4">
             {selectedCategory !== 'All Artifacts' && <ActiveFilter label={selectedCategory} onRemove={() => setSelectedCategory('All Artifacts')} />}
             {selectedClub !== 'All' && <ActiveFilter label={selectedClub} onRemove={() => setSelectedClub('All')} />}
             {selectedCountry !== 'All' && <ActiveFilter label={selectedCountry} onRemove={() => setSelectedCountry('All')} />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
             <div className="flex flex-col items-center justify-center py-40 border border-dashed border-white/5 rounded-[4rem]">
                <div className="w-24 h-24 mb-8 text-white/5 animate-pulse">
                   <Search className="w-full h-full" />
                </div>
                <h3 className="text-4xl font-display font-black tracking-tighter uppercase italic text-white/20">Artifact Not Found</h3>
                <p className="text-white/10 text-[10px] uppercase tracking-[0.5em] mt-4">Adjust your transmission parameters.</p>
                <button 
                  onClick={() => { setSelectedCategory('All Artifacts'); setSelectedClub('All'); setSelectedCountry('All'); }}
                  className="mt-12 text-brand-red text-[10px] uppercase font-black tracking-widest hover:underline"
                >
                  RESET FILTERS
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, key }: { product: Product, key?: any }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-6 bg-white/5 border border-white/5 transition-all duration-700 group-hover:border-brand-red/30">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/5">
            <ShoppingBag className="w-16 h-16" />
          </div>
        )}

        {/* Labels */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
           {product.isNew && <span className="bg-brand-red text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-2xl">New Transmission</span>}
           {product.isTrending && <span className="bg-white text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-2xl">Trending</span>}
        </div>

        {/* Pricing tag */}
        <div className="absolute bottom-8 right-8 z-20">
           <div className="px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full">
              <span className="text-sm font-black tracking-tighter">₹ {product.price}</span>
           </div>
        </div>
      </div>

      <div className="space-y-1.5 px-2">
        <h3 className="text-sm font-bold uppercase tracking-tight line-clamp-1 group-hover:text-brand-red transition-colors">{product.name}</h3>
        <div className="flex items-center justify-between">
           <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">{product.category}</span>
           {product.stock <= 5 && product.stock > 0 && (
             <span className="text-[8px] text-brand-red uppercase font-black animate-pulse">Low Stock</span>
           )}
        </div>
      </div>
    </motion.div>
  );
};

const ActiveFilter = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <button 
    onClick={onRemove}
    className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-black tracking-widest hover:border-brand-red hover:text-brand-red transition-all group"
  >
    {label}
    <X className="w-3 h-3 text-white/20 group-hover:text-brand-red" />
  </button>
);

const Link = ({ to, children, className }: any) => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)} className={className}>{children}</button>;
};
