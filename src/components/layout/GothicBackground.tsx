import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export const GothicBackground = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 10,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black">
      {/* Liquid Glass Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(40,40,40,0.15)_0%,transparent_70%)]"
        />
      </div>

      {/* Smoke Effects */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          animate={{
            x: [0, 100, -100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"
        />
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, 30, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.4)_0%,transparent_70%)] blur-[100px]"
        />
      </div>

      {/* Red Accents & Liquid Glow */}
      <div className="absolute inset-0 overflow-hidden will-change-transform">
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] -left-[10%] w-[60%] h-[60%] bg-brand-red/10 blur-[180px] rounded-full translate-z-0" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] bg-brand-red/5 blur-[200px] rounded-full translate-z-0" 
        />
      </div>

      {/* Floating Particles - Reduced for performance */}
      {particles.slice(0, 15).map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}%`, y: `${p.y}%`, opacity: 0 }}
          animate={{
            y: [`${p.y}%`, `${p.y - 30}%`],
            opacity: [0, 0.4, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: p.size,
            height: p.size,
          }}
          className="absolute bg-white/10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]"
        />
      ))}

      {/* Scanning Bar Effect */}
      <motion.div
        animate={{
          top: ['-10%', '110%'],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-red/20 to-transparent opacity-30 z-10"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
    </div>
  );
};
