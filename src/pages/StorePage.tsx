import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, memo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  isTrending?: boolean;
  isNew?: boolean;
}

const CATEGORIES = [
  'All Artifacts',
  'Official Jerseys',
  'Retro Jerseys',
  'National Team Jerseys',
];

export const StorePage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Artifacts');

  // 🔥 TEST MODE: all prices forced to 500
  useEffect(() => {
    setProducts([
      {
        id: 'argentina',
        name: 'Argentina Home Jersey',
        price: 500,
        stock: 50,
        category: 'National Team Jerseys',
        imageUrl: 'https://i.imgur.com/8Km9tLL.jpg',
        isTrending: true
      },
      {
        id: 'madrid',
        name: 'Real Madrid Home Jersey',
        price: 500,
        stock: 40,
        category: 'Official Jerseys',
        imageUrl: 'https://i.imgur.com/ZANVnHE.jpg',
        isNew: true
      },
      {
        id: 'barcelona',
        name: 'Barcelona Home Jersey',
        price: 500,
        stock: 35,
        category: 'Official Jerseys',
        imageUrl: 'https://i.imgur.com/QCNbOAo.jpg',
        isTrending: true
      },
      {
        id: 'brazil',
        name: 'Brazil Retro Jersey',
        price: 500,
        stock: 20,
        category: 'Retro Jerseys',
        imageUrl: 'https://i.imgur.com/2nCt3Sbl.jpg',
        isNew: true
      }
    ]);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === 'All Artifacts' || p.category === selectedCategory)
    );
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="p-4 flex gap-3 items-center border-b border-white/10">
        <Search className="w-4 h-4" />
        <input
          placeholder="Search jerseys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/10 p-2 rounded w-full outline-none"
        />

        <button>
          <SlidersHorizontal />
        </button>
      </div>

      {/* CATEGORY */}
      <div className="flex gap-3 p-3 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded ${
              selectedCategory === cat ? 'bg-red-600' : 'bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/product/${product.id}`)}
            className="bg-white/5 rounded-xl overflow-hidden cursor-pointer"
          >
            <img
              src={product.imageUrl}
              className="w-full h-52 object-cover"
            />

            <div className="p-3">
              <h2 className="font-bold">{product.name}</h2>

              {/* 🔥 TEST PRICE */}
              <p className="text-red-400">₹{product.price}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-white/40 mt-20">
          No jerseys found
        </div>
      )}
    </div>
  );
};
