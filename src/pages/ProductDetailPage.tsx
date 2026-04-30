import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/Button';
import { ArrowLeft, Minus, Plus, Star, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]);

  useEffect(() => {
    // 🔥 STATIC SAFE PRODUCTS (NO FIREBASE = NO ERRORS)
    const products: Record<string, Product> = {
      argentina: {
        id: 'argentina',
        name: 'Argentina Home Jersey',
        description: 'Legendary national kit. Pure heritage design.',
        price: 500,
        stock: 50,
        category: 'National Team',
        imageUrl: 'https://i.imgur.com/8Km9tLL.jpg'
      },
      madrid: {
        id: 'madrid',
        name: 'Real Madrid Home Jersey',
        description: 'Royal white legacy kit for champions.',
        price: 500,
        stock: 40,
        category: 'Club Jersey',
        imageUrl: 'https://i.imgur.com/ZANVnHE.jpg'
      },
      brazil: {
        id: 'brazil',
        name: 'Brazil Retro Jersey',
        description: 'Golden era football heritage.',
        price: 500,
        stock: 30,
        category: 'Retro Jersey',
        imageUrl: 'https://i.imgur.com/2nCt3Sbl.jpg'
      }
    };

    setProduct(products[id || 'argentina'] || products.argentina);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* BACK */}
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2">
        <ArrowLeft /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">

        {/* IMAGE */}
        <motion.img
          src={product.imageUrl}
          className="rounded-2xl w-full h-[500px] object-cover"
          style={{ rotateX, rotateY }}
        />

        {/* INFO */}
        <div className="space-y-6">

          <h1 className="text-4xl font-bold">{product.name}</h1>

          <p className="text-white/60">{product.description}</p>

          <p className="text-red-400 text-2xl font-bold">₹{product.price}</p>

          {/* SIZE */}
          <div className="flex gap-3">
            {['S','M','L','XL'].map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded ${
                  selectedSize === size ? 'bg-red-500' : 'bg-white/10'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* QUANTITY */}
          <div className="flex items-center gap-4">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
              <Minus />
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)}>
              <Plus />
            </button>
          </div>

          {/* BUY */}
          <Button className="w-full bg-red-600 text-white">
            Buy Now <ChevronRight />
          </Button>

        </div>
      </div>
    </div>
  );
};
