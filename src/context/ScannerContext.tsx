import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Zap, AlertCircle, MessageSquare, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface ScannerContextType {
  isScannerOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export const ScannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'searching' | 'found' | 'error'>('idle');
  const [scannedResult, setScannedResult] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "global-void-scanner-region";
  const navigate = useNavigate();

  const customerCareNumber = "+91 82405 15833";

  const openScanner = () => setIsScannerOpen(true);
  const closeScanner = () => {
    setIsScannerOpen(false);
    setScanStatus('idle');
  };

  useEffect(() => {
    if (isScannerOpen) {
      const startScanner = async () => {
        try {
          // Delay to ensure DOM element is ready
          setTimeout(async () => {
             const html5QrCode = new Html5Qrcode(scannerId);
             scannerRef.current = html5QrCode;
             setScanStatus('scanning');
             
             await html5QrCode.start(
               { facingMode: "environment" },
               {
                 fps: 10,
                 qrbox: { width: 250, height: 250 }
               },
               async (decodedText) => {
                 await handleScanSuccess(decodedText);
               },
               () => {}
             );
          }, 100);
        } catch (err) {
          console.error("Scanner failed to start:", err);
          setScanStatus('error');
        }
      };
      
      startScanner();
    } else {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.log("Scanner stop error", e));
      }
    }

    return () => {
       if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(e => console.log("Cleanup stop error", e));
       }
    };
  }, [isScannerOpen]);

  const handleScanSuccess = async (text: string) => {
    setScannedResult(text);
    setScanStatus('searching');
    
    if (scannerRef.current) {
       await scannerRef.current.stop();
    }

    try {
      // First try by ID
      const docRef = doc(db, 'products', text);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        handleMatch(text);
      } else {
        // Search by name
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        const match = querySnapshot.docs.find(doc => {
           const data = doc.data();
           return data.name.toLowerCase().includes(text.toLowerCase());
        });

        if (match) {
          handleMatch(match.id);
        } else {
          setScanStatus('error');
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      setScanStatus('error');
    }
  };

  const handleMatch = (productId: string) => {
    setScanStatus('found');
    setTimeout(() => {
       navigate(`/product/${productId}`);
       closeScanner();
    }, 1500);
  };

  return (
    <ScannerContext.Provider value={{ isScannerOpen, openScanner, closeScanner }}>
      {children}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 flex flex-col p-4 md:p-6 backdrop-blur-xl"
          >
             <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-brand-red flex items-center justify-center rounded-lg">
                      <Search className="w-5 h-5 text-white" />
                   </div>
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-brand-red italic">SPECTRAL SCANNER</p>
                      <p className="text-lg font-display font-black italic uppercase">ARTIFACT IDENTIFICATION</p>
                   </div>
                </div>
                <button 
                 onClick={closeScanner}
                 className="w-12 h-12 bg-white/5 hover:bg-brand-red transition-colors rounded-full flex items-center justify-center"
                >
                   <X className="w-6 h-6 text-white" />
                </button>
             </div>

             <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col justify-center gap-8 overflow-y-auto no-scrollbar pb-12">
                <div className="aspect-[3/4] md:aspect-[4/3] rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden relative shadow-2xl shadow-brand-red/5">
                   <div id={scannerId} className="w-full h-full object-cover scale-[1.02]"></div>
                   
                   {scanStatus === 'scanning' && (
                      <div className="absolute inset-0 pointer-events-none border-[30px] md:border-[40px] border-black/40">
                         <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-red" />
                         <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-red" />
                         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-red" />
                         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-red" />
                         <motion.div 
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute left-0 w-full h-[2px] bg-brand-red shadow-[0_0_15px_rgba(255,0,0,0.8)]"
                         />
                      </div>
                   )}

                   {scanStatus === 'searching' && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-6 backdrop-blur-sm">
                         <Loader2 className="w-16 h-16 text-brand-red animate-spin" />
                         <p className="text-xs font-black uppercase tracking-[0.5em] text-brand-red animate-pulse">QUERYING THE VOID ARCHIVE...</p>
                      </div>
                   )}

                   {scanStatus === 'found' && (
                      <div className="absolute inset-0 bg-brand-red flex flex-col items-center justify-center gap-4">
                         <Zap className="w-16 h-16 text-white animate-bounce" />
                         <p className="text-xl font-display font-black italic uppercase leading-none">ARTIFACT LOCATED</p>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-60">MATERIALIZING UNITS...</p>
                      </div>
                   )}

                   {scanStatus === 'error' && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 md:p-12 text-center gap-6 md:gap-8 overflow-y-auto">
                         <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-brand-red" />
                         </div>
                         <div className="space-y-4">
                            <h3 className="text-xl md:text-2xl font-display font-black italic uppercase">ARTIFACT NOT RECOGNIZED</h3>
                            <p className="text-[11px] md:text-sm text-white/40 font-medium leading-relaxed max-w-sm mx-auto">
                               The unit <span className="text-brand-red font-black">"{scannedResult}"</span> is not indexed in our core registry. 
                               Transmit this code to our customer care sector to request manual acquisition.
                            </p>
                         </div>
                         <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl flex flex-col items-center gap-4 w-full">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">CONTACT SECTOR</span>
                            <p className="text-lg md:text-xl font-display font-black italic text-brand-red tracking-widest">{customerCareNumber}</p>
                            <Button 
                              onClick={() => window.location.href = `https://wa.me/${customerCareNumber.replace(/\D/g,'')}?text=I'm%20looking%20for%20jersey%20code:%20${scannedResult}`}
                              className="bg-white text-black hover:bg-brand-red hover:text-white w-full h-12 flex items-center justify-center gap-2 font-display font-black italic uppercase transition-all text-[10px]"
                            >
                               <MessageSquare className="w-4 h-4" />
                               MESSAGE CARE
                            </Button>
                         </div>
                         <button 
                            onClick={closeScanner}
                            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                         >
                            ← RETURN TO REGISTRY
                         </button>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-3 gap-3 md:gap-6">
                   <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl text-center">
                      <p className="text-[8px] md:text-[10px] font-black text-brand-red mb-1 uppercase tracking-widest">FPS</p>
                      <p className="text-lg md:text-xl font-display font-black italic">60.00</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl text-center">
                      <p className="text-[8px] md:text-[10px] font-black text-white/30 mb-1 uppercase tracking-widest">SIGNAL</p>
                      <p className="text-lg md:text-xl font-display font-black italic">12.4G</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl text-center">
                      <p className="text-[8px] md:text-[10px] font-black text-white/30 mb-1 uppercase tracking-widest">LATENCY</p>
                      <p className="text-lg md:text-xl font-display font-black italic">1MS</p>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScannerContext.Provider>
  );
};

export const useScanner = () => {
  const context = useContext(ScannerContext);
  if (context === undefined) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
};
