import argentina from "../assets/argentina.jpg";
import brazil from "../assets/brazil.jpg";
import madrid from "../assets/madrid.jpg";
import barcelona from "../assets/barcelona.jpg";

import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Search, X, ChevronDown, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo, memo } from 'react';

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
  'National Team Jerseys'
];

export const StorePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Artifacts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedClub, setSelectedClub] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);

  // 🔥 NO FIREBASE — CLEAN STATIC STORE (FIXED FOR YOUR DEADLINE)
  useEffect(() => {
    setProducts([
      {
        id: 'argentina',
        name: 'Argentina 2024 Home Jersey',
        price: 459,
        stock: 50,
        category: 'National Team Jerseys',
        imageUrl: argentina,
        isTrending: true,
        isNew: true
      },
      {
        id: 'madrid',
        name: 'Real Madrid 24/25 Home',
        price: 549,
        stock: 50,
        category: 'Official Jerseys',
        imageUrl: madrid,
        isNew: true
      },
      {
        id: 'barcelona',
        name: 'Barcelona 24/25 Home',
        price: 499,
        stock: 40,
        category: 'Official Jerseys',
        imageUrl: barcelona,
        isTrending: true
      },
      {
        id: 'brazil',
        name: 'Brazil Retro Jersey',
        price: 599,
        stock: 30,
        category: 'Retro Jerseys',
        imageUrl: brazil,
        isNew: false
      }
    ]);

    setLoading(false);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      return (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === 'All Artifacts' || p.category === selectedCategory) &&
        p.price >= priceRange[0] &&
        p.price <= priceRange[1] &&
        (!inStockOnly || p.stock > 0)
      );
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'popular') result.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));

    return result;
  }, [products, searchQuery, selectedCategory, priceRange, inStockOnly, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-20 h-20 border-t-2 border-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="fixed top-0 w-full bg-black/60 backdrop-blur-xl p-4 z-50 flex gap-4">
        <input
          placeholder="Search Jerseys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-3 bg-white/10 rounded-xl outline-none"
        />

        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <SlidersHorizontal />
        </button>
      </div>

      {/* GRID */}
      <div className="pt-24 grid grid-cols-2 md:grid-cols-4 gap-6 p-6">

        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/product/${product.id}`)}
            className="bg-white/5 rounded-2xl overflow-hidden cursor-pointer"
          >
            <img src={product.imageUrl} className="w-full h-60 object-cover" />
            <div className="p-3">
              <h2 className="font-bold">{product.name}</h2>
              <p className="text-red-400">₹{product.price}</p>
            </div>
          </motion.div>
        ))}

      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center mt-20 text-white/40">
          No Jerseys Found
        </div>
      )}

    </div>
  );
};
