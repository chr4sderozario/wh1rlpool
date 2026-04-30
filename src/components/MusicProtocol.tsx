import { useState, useRef, useEffect } from 'react';
import { Music2, Volume2, VolumeX, SkipForward, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MusicProtocol = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentSong, setCurrentSong] = useState({ title: 'Espresso - Sabrina Carpenter', url: 'https://p.scdn.co/mp3-preview/a91f53d1000bb5d2bf61033b9347898516d0391d?cid=null' });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/site_config')
      .then(res => res.json())
      .then(data => {
        if (data && data.musicUrl) {
          setCurrentSong({
            title: data.songTitle || 'VOID FREQUENCY',
            url: data.musicUrl
          });
        }
      });
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("User interaction required for play"));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-32 left-8 z-[100] flex items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {showPlayer && (
          <motion.div 
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl shadow-brand-red/10"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center animate-pulse">
               <Music2 className="text-white w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mb-1">CURRENT FREQUENCY</p>
               <p className="text-sm font-display font-black italic uppercase text-white">{currentSong.title}</p>
            </div>
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
               <button onClick={togglePlay} className="text-white hover:text-brand-red transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
               </button>
               <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setShowPlayer(!showPlayer)}
        className="pointer-events-auto w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all backdrop-blur-md"
      >
        <Music2 className={`w-5 h-5 ${isPlaying ? 'animate-spin-slow text-brand-red' : ''}`} />
      </button>

      {/* Since we can't host the file, we use a hidden video or public URL if available */}
      {/* For this demo, we'll try a common public URL or just show the UI for the user to understand */}
      <audio 
        key={currentSong.url}
        ref={audioRef}
        loop
        src={currentSong.url} 
      />
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};
