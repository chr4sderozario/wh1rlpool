import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Instagram, Twitter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CountdownItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-2xl md:text-4xl font-display font-medium tracking-tighter mb-1">{value}</div>
    <div className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/20">{label}</div>
  </div>
);

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Hero Content */}
      <div className="z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-xs font-display tracking-[0.4em] text-white/40 uppercase mb-4 block">
            The New Era of Sporting Luxury
          </span>
          <h1 className="text-7xl md:text-[12rem] font-display font-black leading-[0.8] tracking-tighter mb-8 gothic-glow">
            WH1RL<br />POOL
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-serif italic text-white/80">
              Coming Soon
            </h2>
            <p className="text-sm md:text-base font-sans text-white/40 tracking-wide max-w-md mx-auto">
              Premium Football Jerseys Redefined. A convergence of dark aesthetic and athletic performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button className="w-full sm:w-auto">
              Notify Me
            </Button>
            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2" onClick={() => navigate('/login')}>
              Enter Access Code <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-4 md:gap-8 pt-8 border-t border-white/5">
            <CountdownItem value="14" label="Days" />
            <CountdownItem value="22" label="Hours" />
            <CountdownItem value="45" label="Mins" />
            <CountdownItem value="08" label="Secs" />
          </div>
        </motion.div>
      </div>

      {/* Footer / Socials */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-6"
      >
        <div className="flex gap-8">
          <a href="#" className="text-white/40 hover:text-white transition-colors" title="Instagram">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-white/40 hover:text-white transition-colors" title="Twitter">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">
          © 2026 WH1RLPOOL STUDIO. ALL RIGHTS RESERVED.
        </p>
      </motion.div>

      {/* Decorative vertical lines */}
      <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-white/5 hidden lg:block" />
      <div className="absolute right-10 top-0 bottom-0 w-[1px] bg-white/5 hidden lg:block" />
    </div>
  );
};
