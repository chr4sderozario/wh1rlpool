import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, setDoc, doc, increment, getDoc } from 'firebase/firestore';

export const ChatWidgetCount = memo(() => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, 'support_chats'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    });

    return unsubscribe;
  }, [user, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const text = message;
    setMessage('');

    try {
      // Get display name for session
      const profileDoc = doc(db, 'users', user.uid, 'public', 'profile');
      const profileSnap = await getDoc(profileDoc).catch(() => null);
      const displayName = profileSnap?.exists() ? profileSnap.data()?.displayName : (user.displayName || user.email);

      await addDoc(collection(db, 'support_chats'), {
        userId: user.uid,
        senderId: user.uid,
        text,
        isAdmin: false,
        timestamp: serverTimestamp()
      });

      // Update session for admin visibility
      await setDoc(doc(db, 'support_sessions', user.uid), {
        userId: user.uid,
        userName: displayName,
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        unreadCount: increment(1)
      }, { merge: true });

    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[1000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-brand-red" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">ORACLE SUPPORT</h3>
                </div>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest italic">Direct Encryption Channel | Mail: admin.wh1rlpool@gmail.com</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                   <MessageCircle className="w-12 h-12 text-white/5" />
                   <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-loose">Initialize connection by sending a transmission</p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-xs ${
                    m.isAdmin 
                    ? 'bg-white/5 border border-white/10 text-white shadow-[10px_10px_30px_rgba(0,0,0,0.5)]' 
                    : 'bg-brand-red text-white font-medium shadow-[0_10px_20px_rgba(255,20,20,0.2)]'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-8 border-t border-white/5 bg-white/[0.01]">
              <div className="relative">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="ENCRYPT MESSAGE..."
                  className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-brand-red transition-all"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-brand-red transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(255,20,20,0.3)] border border-white/20 group"
      >
        {isOpen ? <X className="text-white" /> : <MessageCircle className="text-white group-hover:rotate-12 transition-transform" />}
      </motion.button>
    </div>
  );
});

export const ChatWidget = ChatWidgetCount;
