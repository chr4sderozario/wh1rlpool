import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Instagram, Twitter, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Decorative center piece */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-lg max-h-lg opacity-20 pointer-events-none">
        <div className="absolute inset-0 liquid-shape bg-brand-red blur-3xl animate-pulse" />
        <div className="absolute inset-0 liquid-shape bg-white/10 blur-2xl scale-75 animate-spin-slow" />
      </div>

      {/* Hero Content */}
      <div className="z-10 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <span className="text-[10px] font-display tracking-[0.6em] text-white/60 uppercase mb-8 block font-black">
            The Digital Abyss of Sporting Luxury
          </span>
          <h1 className="text-[12vw] md:text-[15rem] font-display font-black leading-[0.7] tracking-tighter mb-12 gothic-glow select-none">
            WH1RL<br />POOL
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex flex-col items-center gap-12"
        >
          <div className="space-y-4">
             <p className="text-sm md:text-lg font-serif italic text-white/60 tracking-wide max-w-xl mx-auto leading-relaxed">
              Curating the darkest artifacts of football culture. Performance redefined through a gothic lens.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Button 
              className="w-full sm:w-64 h-16 text-lg rounded-full group overflow-hidden bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 border-none"
              onClick={() => navigate('/store')}
            >
              <span className="flex items-center justify-center gap-2">
                Enter Void <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-64 h-16 text-lg rounded-full border-white/10 hover:border-brand-red/50 hover:bg-brand-red/5"
              onClick={() => navigate('/login')}
            >
              Terminal Access
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Categories preview / Quick links */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-32 hidden lg:flex gap-12 text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold"
      >
        {['Jersey', 'Pants', 'Embroidery', 'OnSale'].map(i => (
          <button key={i} onClick={() => navigate('/store')} className="hover:text-brand-red transition-colors">{i}</button>
        ))}
      </motion.div>

      {/* Footer / Socials */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 flex flex-col lg:flex-row items-center justify-between w-full px-12 gap-8"
      >
        <div className="flex gap-12 order-2 lg:order-1">
          <a href="https://instagram.com/wh1rlpool.in" target="_blank" rel="noreferrer" className="text-white/40 hover:text-brand-red transition-colors flex items-center gap-2 group">
            <Instagram className="w-4 h-4" /> <span className="text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">wh1rlpool.in</span>
          </a>
          <a href="#" className="text-white/40 hover:text-white transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
        </div>
        
        <p className="text-[8px] uppercase tracking-[0.5em] text-white/10 order-1 lg:order-2 font-black">
          Digital Architecture by WH1RLPOOL STUDIO / Version 2.0.26
        </p>

        <div className="flex gap-8 order-3 grayscale opacity-30">
           <div className="w-12 h-4 bg-white/20" />
           <div className="w-12 h-4 bg-white/20" />
        </div>
      </motion.div>

      {/* Decorative vertical lines */}
      <div className="absolute left-[5%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent hidden lg:block" />
      <div className="absolute right-[5%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent hidden lg:block" />
    </div>
  );
};
