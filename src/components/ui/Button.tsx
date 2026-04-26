import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  glow?: boolean;
};

export const Button = ({ children, className, variant = 'primary', glow = true, ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-white text-black hover:bg-white/90',
    outline: 'border border-white/20 text-white hover:bg-white/10',
    ghost: 'text-white/60 hover:text-white',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative px-8 py-3 font-display text-sm font-bold tracking-widest uppercase transition-all duration-300',
        variants[variant],
        glow && 'hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {glow && variant === 'primary' && (
        <motion.div
          layoutId="glow"
          className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )}
    </motion.button>
  );
};
