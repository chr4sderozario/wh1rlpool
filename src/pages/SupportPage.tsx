import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Instagram, Send, MessageCircle, Mail, MapPin, ExternalLink, ArrowRight } from 'lucide-react';

export const SupportPage = () => {
  const socialLinks = [
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, handle: '@wh1rlpool.in', link: 'https://instagram.com/wh1rlpool.in' },
    { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, handle: 'Active Support Protocol', link: '#' }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-32 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32">
        
        {/* Left: Contact Info */}
        <div className="space-y-16">
          <header className="space-y-8">
            <h1 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase italic py-2 leading-tight">CONTACT THE VOID</h1>
            <p className="text-white/40 text-xl font-serif italic max-w-xl">Our support entities are stationed to assist with your artifact transmissions and synchronization errors.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {socialLinks.map((social) => (
              <a 
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-6 p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-brand-red/50 transition-all duration-700"
              >
                 <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                    {social.icon}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/40">{social.name}</p>
                    <p className="text-lg font-display font-bold tracking-tight group-hover:text-brand-red transition-colors">{social.handle}</p>
                 </div>
                 <ExternalLink className="ml-auto w-4 h-4 text-white/10 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>

          <div className="space-y-8 pt-8 border-t border-white/5">
             <div className="flex items-center gap-6 opacity-40">
                <Mail className="w-5 h-5" />
                <span className="text-xs uppercase font-black tracking-[0.3em]">support@wh1rlpool.in</span>
             </div>
             <div className="flex items-center gap-6 opacity-40">
                <MapPin className="w-5 h-5" />
                <span className="text-xs uppercase font-black tracking-[0.3em]">Digital Headquarters, The Grid</span>
             </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="relative">
           <div className="p-12 md:p-16 rounded-[4rem] bg-[#0A0A0A] border border-white/5 space-y-12 relative overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 blur-[100px] -z-10 group-hover:bg-brand-red/10 transition-colors" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 blur-[120px] -z-10 group-hover:bg-white/10 transition-colors" />

              <div className="space-y-4">
                 <h3 className="text-3xl font-display font-black tracking-tighter uppercase italic">DIRECT TRANSMISSION</h3>
                 <p className="text-[10px] tracking-[0.4em] uppercase font-black text-white/20">Authorized query protocol</p>
              </div>

              <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); alert("Transmission Sent."); }}>
                 <div className="space-y-12">
                    <div className="relative group/input">
                       <label className="absolute -top-3 left-4 px-2 bg-[#0A0A0A] text-[8px] uppercase tracking-widest font-black text-white/20 group-focus-within/input:text-brand-red">Your Alias</label>
                       <input 
                        type="text" 
                        required
                        className="w-full bg-transparent border border-white/5 rounded-2xl py-6 px-8 text-sm focus:outline-none focus:border-brand-red transition-all" 
                        placeholder="SUBJECT IDENTITY"
                       />
                    </div>
                    
                    <div className="relative group/input text-brand-red">
                       <label className="absolute -top-3 left-4 px-2 bg-[#0A0A0A] text-[8px] uppercase tracking-widest font-black text-white/20 group-focus-within/input:text-brand-red">Query Frequency (Email)</label>
                       <input 
                        type="email" 
                        required
                        className="w-full bg-transparent border border-white/5 rounded-2xl py-6 px-8 text-sm focus:outline-none focus:border-brand-red transition-all" 
                        placeholder="COORDINATES@VOX.COM"
                       />
                    </div>

                    <div className="relative group/input">
                       <label className="absolute -top-3 left-4 px-2 bg-[#0A0A0A] text-[8px] uppercase tracking-widest font-black text-white/20 group-focus-within/input:text-brand-red">The Signal (Message)</label>
                       <textarea 
                        required
                        className="w-full bg-transparent border border-white/5 rounded-2xl py-6 px-8 text-sm min-h-[160px] focus:outline-none focus:border-brand-red transition-all resize-none" 
                        placeholder="ENCODE YOUR SIGNAL HERE..."
                       />
                    </div>
                 </div>

                 <Button className="w-full h-20 rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-extrabold group">
                    <span className="flex items-center justify-center gap-4">
                       INITIALIZE UPLOAD <Send className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                    </span>
                 </Button>
              </form>
           </div>
        </div>
      </div>

      {/* Background blurs */}
      <div className="fixed top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/5 blur-[160px] pointer-events-none" />
    </div>
  );
};
