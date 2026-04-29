import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Sparkles, Ghost, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';

const SYSTEM_INSTRUCTION = `You are "WH1RL AI", the specialized oracle of the WH1RLPOOL football jersey archive. 
Your primary directive is to assist users with questions EXCLUSIVELY related to:
1. Football Jerseys (Retro, Official, Player Edition, Club, National Team).
2. Football products (Kits, Shorts, Socks).
3. Sizing advice for jerseys.
4. History of specific football kits or designs.
5. Suggestions based on their favorite team or style.

STRICT CONSTRAINT: If a user asks a question UNRELATED to football jerseys or products, politely decline and steer them back to the archive. Never provide general information outside this niche. 

Maintain a "Cyber-Gothic" and "Technical" tone. Use terms like "Void", "Archive", "Extraction", "Matrix", and "Subject".
Keep responses concise, professional, and helpful.`;

export const Wh1rlAI = () => {
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
        { role: 'bot', text: 'VOID PROTOCOL ACTIVE. I AM WH1RL AI. STATE YOUR JERSEY EXTRACTION REQUIREMENTS.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: userMsg,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                },
            });

            const botMsg = response.text || "SIGNAL LOST. TRY AGAIN.";
            setMessages(prev => [...prev, { role: 'bot', text: botMsg }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'bot', text: "ENCRYPTION ERROR. RETRY EXTRACTION." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pt-24 flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col p-6 md:p-12">
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="p-4 bg-white/5 rounded-full border border-white/5 hover:bg-brand-red transition-all group">
                            <ArrowLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
                        </button>
                        <div>
                           <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">WH1RL <span className="text-brand-red">AI</span></h1>
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">JERSEY ORACLE PROTOCOL</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-brand-red/5 border border-brand-red/20 rounded-full">
                       <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                       <span className="text-[8px] font-black tracking-widest text-brand-red">CONNECTED</span>
                    </div>
                </header>

                <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative mb-12">
                   <div 
                     ref={scrollRef}
                     className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 scroll-smooth"
                   >
                       {messages.map((msg, i) => (
                           <motion.div 
                             key={i}
                             initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             className={`flex items-start gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                           >
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                                 msg.role === 'bot' 
                                 ? 'bg-brand-red border-brand-red/20 text-white shadow-[0_0_20px_rgba(255,10,10,0.3)]' 
                                 : 'bg-white/5 border-white/10 text-white/40'
                               }`}>
                                  {msg.role === 'bot' ? <Ghost className="w-5 h-5" /> : <User className="w-5 h-5" />}
                               </div>
                               <div className={`p-6 rounded-3xl max-w-[80%] text-sm ${
                                 msg.role === 'bot' 
                                 ? 'bg-white/5 text-white/80 font-serif italic border border-white/5' 
                                 : 'bg-brand-red text-white font-black uppercase tracking-tight'
                               }`}>
                                  {msg.text}
                               </div>
                           </motion.div>
                       ))}
                       {isLoading && (
                           <div className="flex items-center gap-4 text-brand-red">
                               <Sparkles className="w-4 h-4 animate-spin-slow" />
                               <span className="text-[10px] font-black uppercase tracking-widest">EXTRACTING FROM VOID...</span>
                           </div>
                       )}
                   </div>

                   <div className="p-8 border-t border-white/10 bg-black/40 backdrop-blur-xl">
                       <div className="relative">
                           <input 
                              value={input}
                              onChange={e => setInput(e.target.value)}
                              onKeyDown={e => e.key === 'ENTER' || e.key === 'Enter' ? handleSend() : null}
                              placeholder="INQUIRE ABOUT JERSEYS..."
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 pr-20 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-brand-red transition-all"
                           />
                           <button 
                             onClick={handleSend}
                             disabled={isLoading || !input.trim()}
                             className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-brand-red text-white flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:grayscale"
                           >
                              <Send className="w-5 h-5" />
                           </button>
                       </div>
                       <p className="mt-4 text-[8px] text-center font-black text-white/10 tracking-[0.5em] uppercase italic">REPLIES ARE GENAI GENERATED AND LIMITED TO JERSEYS</p>
                   </div>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </div>
    );
};
