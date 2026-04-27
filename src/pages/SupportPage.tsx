import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Instagram, Mail, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export const SupportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-12 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <button 
          onClick={() => navigate('/store')}
          className="text-white/40 hover:text-white flex items-center gap-2 transition-colors uppercase text-[10px] tracking-widest self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Support
        </button>

        <header className="text-center space-y-4">
          <h1 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase italic py-2 gothic-glow">Terminal Support</h1>
          <p className="text-white/40 text-sm max-w-xl mx-auto italic font-serif">Reach out through the digital channels. We respond from the void.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Direct channels */}
          <div className="space-y-6">
            <div className="glass p-8 rounded-[2.5rem] space-y-8">
              <h2 className="text-[10px] uppercase tracking-[0.5em] text-brand-red font-bold">Encrypted Channels</h2>
              
              <a href="https://instagram.com/wh1rlpool.in" target="_blank" rel="noreferrer" className="flex items-center gap-6 p-6 bg-white/5 hover:bg-brand-red/10 border border-white/5 rounded-3xl transition-all group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">Instagram Direct</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">@wh1rlpool.in</p>
                </div>
              </a>

              <a href="mailto:support@wh1rlpool.in" className="flex items-center gap-6 p-6 bg-white/5 hover:bg-brand-red/10 border border-white/5 rounded-3xl transition-all group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">Email Support</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">support@wh1rlpool.in</p>
                </div>
              </a>
            </div>

            <div className="bg-brand-red/5 p-8 rounded-[2.5rem] border border-brand-red/10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 liquid-shape bg-brand-red/10 -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-[2s]" />
              <h3 className="text-lg font-display font-bold uppercase mb-2">Live Status</h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] uppercase tracking-widest text-green-500 font-bold">Terminal Operational</span>
              </div>
              <p className="text-white/40 text-xs mt-4">Current expected response time: Under 2 hours</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass p-8 md:p-12 rounded-[3rem] space-y-8">
             <h2 className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold text-center">Transmission Form</h2>
             <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Transmission Received'); }}>
                <div className="space-y-4">
                   <input type="text" placeholder="IDENTITY (NAME)" className="support-input" required />
                   <input type="email" placeholder="CONTACT (EMAIL)" className="support-input" required />
                   <select className="support-input">
                      <option value="order">ORDER STATUS</option>
                      <option value="product">PRODUCT INQUIRY</option>
                      <option value="custom">CUSTOM REQUEST</option>
                      <option value="other">OTHER</option>
                   </select>
                   <textarea placeholder="THE MESSAGE" className="support-input min-h-[150px] py-4" required />
                </div>
                <Button className="w-full h-16 rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-700 font-bold flex items-center justify-center gap-2">
                   Send Transmission <Send className="w-4 h-4" />
                </Button>
             </form>
          </div>
        </div>
      </div>

      <style>{`
        .support-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1rem 1.5rem;
          border-radius: 1.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s;
        }
        .support-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(139, 0, 0, 0.5);
          box-shadow: 0 0 20px rgba(139, 0, 0, 0.1);
        }
      `}</style>

      {/* Background blobs */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-brand-red/5 blur-[150px] liquid-shape -z-10" />
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-white/5 blur-[150px] liquid-shape -z-10" />
    </div>
  );
};
