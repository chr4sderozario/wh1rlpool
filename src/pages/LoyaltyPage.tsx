import { motion } from 'motion/react';
import { Shield, Star, Trophy, Crown, Gem, Zap, Gift, Percent, Headset, Truck } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { useNavigate } from 'react-router-dom';

const RANKS = [
  {
    name: 'BRONZE',
    minSpend: 1000,
    color: 'text-orange-700',
    borderColor: 'border-orange-700/20',
    bgColor: 'bg-orange-700/5',
    icon: <Shield className="w-12 h-12" />,
    amenities: ['Basic Support Access', 'Order History Logging']
  },
  {
    name: 'SILVER',
    minSpend: 5000,
    color: 'text-blue-400',
    borderColor: 'border-blue-400/20',
    bgColor: 'bg-blue-400/5',
    icon: <Zap className="w-12 h-12" />,
    amenities: ['1.2x WH1RL Point Multiplier', 'Early Sale Access', 'Priority Support']
  },
  {
    name: 'GOLD',
    minSpend: 10000,
    color: 'text-yellow-500',
    borderColor: 'border-yellow-500/20',
    bgColor: 'bg-yellow-500/5',
    icon: <Star className="w-12 h-12" />,
    amenities: ['1.5x WH1RL Point Multiplier', 'Free Stealth Shipping', 'Birthday Voucher']
  },
  {
    name: 'PLATINUM',
    minSpend: 20000,
    color: 'text-white',
    borderColor: 'border-white/20',
    bgColor: 'bg-white/5',
    icon: <Trophy className="w-12 h-12" />,
    amenities: ['2x WH1RL Point Multiplier', 'Dedicated VIP Manager', 'Beta Product Access']
  },
  {
    name: 'DIAMOND',
    minSpend: 50000,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/20',
    bgColor: 'bg-cyan-400/5',
    icon: <Gem className="w-12 h-12" />,
    amenities: ['Instant Dispatch Protocol', 'Unlimited Gift Returns', 'Private Concierge Line', 'Exclusive Customizations']
  },
  {
    name: 'OBSIDIAN',
    minSpend: 100000,
    color: 'text-brand-red',
    borderColor: 'border-brand-red/20',
    bgColor: 'bg-brand-red/5',
    icon: <Crown className="w-12 h-12" />,
    amenities: ['Life-time Warranty', 'Shadow-Tier Pricing (Hidden Discounts)', 'Personal Stylist Assistant']
  }
];

export const LoyaltyPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const totalSpending = profile?.totalSpending || 0;

  const currentRank = [...RANKS].reverse().find(r => totalSpending >= r.minSpend) || { name: 'UNANKED', color: 'text-white/20' };

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto space-y-24">
        <header className="max-w-4xl space-y-8">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex items-center gap-4 text-brand-red"
           >
              <div className="h-[1px] w-12 bg-brand-red" />
              <span className="text-xs font-black uppercase tracking-[0.6em]">REWARDS PROTOCOL</span>
           </motion.div>
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-7xl md:text-9xl font-display font-black tracking-tighter uppercase italic leading-[0.8]"
           >
             Loyalty <br /> <span className="text-brand-red">Nexus</span>
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-white/40 font-serif italic text-xl max-w-2xl"
           >
             Every Rupee extracted from your consciousness increases your standing in the void. Ascend through the ranks to unlock reality-bending perks.
           </motion.p>
        </header>

        {/* User Status Card */}
        <section className="bg-white/[0.02] border border-white/10 rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-red/5 to-transparent pointer-events-none" />
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 italic">CURRENT STANDING</p>
                    <h2 className={`text-6xl md:text-8xl font-display font-black uppercase tracking-tight italic ${currentRank.color}`}>
                       {currentRank.name}
                    </h2>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <p className="text-xs font-black uppercase tracking-widest text-white/40">EVOLUTION PROGRESS</p>
                       <p className="text-xl font-display font-black italic">₹ {totalSpending}</p>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min(100, (totalSpending / 100000) * 100)}%` }}
                         className="h-full bg-brand-red shadow-[0_0_20px_rgba(255,10,10,0.5)]"
                       />
                    </div>
                    <p className="text-[10px] font-black uppercase text-center text-white/20 tracking-[0.3em]">REACH ₹ 100,000 FOR OBSIDIAN ASCENSION</p>
                 </div>
              </div>
              <div className="flex justify-center">
                 <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-white/5 flex items-center justify-center relative">
                    <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow" />
                    <div className="absolute inset-4 border border-brand-red/10 rounded-full animate-reverse-spin" />
                    <div className={`p-8 bg-black border border-white/10 rounded-3xl shadow-2xl transform rotate-12 ${currentRank.color}`}>
                       {RANKS.find(r => r.name === currentRank.name)?.icon || <Shield className="w-16 h-16" />}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Tier Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {RANKS.map((rank, idx) => (
             <motion.div 
               key={rank.name}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className={`group p-10 rounded-[3rem] border ${rank.borderColor} ${rank.bgColor} transition-all duration-700 hover:scale-[1.02] space-y-10 relative overflow-hidden`}
             >
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all" />
                
                <header className="flex justify-between items-start">
                   <div className={`${rank.color} p-4 bg-black/40 rounded-2xl`}>
                      {rank.icon}
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">MIN SPEND</p>
                      <p className="text-xl font-display font-black italic">₹ {rank.minSpend}</p>
                   </div>
                </header>

                <div>
                   <h3 className={`text-4xl font-display font-black uppercase tracking-tight italic ${rank.color}`}>
                      {rank.name}
                   </h3>
                   <div className="mt-8 space-y-4">
                      {rank.amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{amenity}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <Button 
                   variant="outline" 
                   className="w-full border-white/5 py-6 rounded-2xl text-[10px] font-black tracking-widest text-white/40 group-hover:bg-white group-hover:text-black transition-all"
                   disabled={totalSpending < rank.minSpend}
                >
                   {totalSpending >= rank.minSpend ? 'SYNCHRONIZED' : `LOCKED [NEED ₹${rank.minSpend - totalSpending}]`}
                </Button>
             </motion.div>
           ))}
        </section>

        <footer className="text-center pt-24 space-y-8">
           <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter">Ready to ascend?</h2>
           <Button onClick={() => navigate('/store')} className="h-20 px-20 border-white/10 rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all font-black text-xs uppercase tracking-widest">
              SHOP COLLECTION →
           </Button>
        </footer>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-reverse-spin {
          animation: reverse-spin 15s linear infinite;
        }
      `}</style>
    </div>
  );
};
