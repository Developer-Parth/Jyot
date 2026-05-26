import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Sparkles, Upload, ArrowLeft, Hexagon, Heart, Activity, Coins, AlertCircle, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { usePalmReading } from '../hooks/usePalmReading.js';

export default function PalmReading() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [demoScanPos, setDemoScanPos] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { reading, loading: isAnalyzing, error, getReading: fetchReading, clearReading } = usePalmReading();

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoScanPos((prev) => (prev > 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        // We'll pass the base64 string to fetchReading when the user clicks the button
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetReading = async () => {
    if (!imageSrc) return;
    await fetchReading(imageSrc);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden pb-24">
      {/* Header */}
      <header className="p-4 pt-6 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-serif text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" /> AI Palmistry
            </h1>
            <p className="text-xs text-stone-500 mt-1">Discover your Vedic destiny</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Hexagon className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50 text-center mb-6"
        >
          <div className="w-16 h-16 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-serif text-stone-900 mb-2">Unlock Your Future</h2>
          <p className="text-sm text-stone-500 mb-6">
            Upload a clear photo of your dominant palm. Our AI, combined with Vedic astrology, will analyze your life, heart, head, and fate lines.
          </p>

          {!imageSrc ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 rounded-2xl p-8 bg-purple-50/50 hover:bg-purple-50 cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-purple-900">Tap to upload palm image</p>
              <p className="text-xs text-purple-500 mt-1">Ensure good lighting</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-sm border border-stone-200">
                <img src={imageSrc} alt="Your Palm" className="w-full h-auto object-cover max-h-64" />
                <button 
                  onClick={() => { setImageSrc(null); clearReading(); }}
                  className="absolute top-2 right-2 p-2 bg-stone-900/50 backdrop-blur-sm text-white rounded-full hover:bg-stone-900/70"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {!reading && !isAnalyzing && (
                <button 
                  onClick={handleGetReading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg shadow-purple-500/30 hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" /> Analyze My Destiny
                </button>
              )}
            </div>
          )}

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
          />
        </motion.div>

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50 text-center mb-6 overflow-hidden"
            >
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium text-stone-700">Connecting with cosmic energies...</p>
              <p className="text-xs text-stone-500 mt-1">Mapping life and fate lines</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {reading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-purple-100 overflow-hidden text-left"
            >
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-purple-100">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-serif text-lg text-stone-900">Your Vedic Reading</h3>
              </div>
              
              <div className="prose prose-sm prose-stone max-w-none text-stone-700 leading-relaxed
                   prose-headings:font-serif prose-headings:text-purple-900
                   prose-strong:text-stone-900 prose-strong:font-semibold">
                <Markdown>{reading}</Markdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it Works / Demo Section */}
        {!imageSrc && !reading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4 px-2">
              <PlayCircle className="w-5 h-5 text-stone-400" />
              <h3 className="text-sm font-bold tracking-widest text-stone-400 uppercase">How It Works</h3>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Simulated Scan Animation */}
                <div className="relative w-32 h-40 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 overflow-hidden shrink-0">
                  {/* Decorative Hand Outline SVG */}
                  <svg viewBox="0 0 100 100" className="w-20 h-20 text-purple-200" fill="none" stroke="currentColor" strokeWidth="2">
                     <path d="M40 90 C40 90, 20 70, 20 50 C20 30, 30 20, 35 30 L45 50 M45 50 L35 15 C35 5, 45 5, 50 15 L50 45 M50 45 L50 10 C50 0, 60 0, 60 10 L60 45 M60 45 L65 15 C65 5, 75 5, 75 15 L70 50 M70 50 L80 30 C80 20, 90 20, 85 40 M85 40 C85 60, 60 90, 60 90 Z" />
                  </svg>
                  
                  {/* Scanning Line */}
                  <motion.div 
                    className="absolute top-0 left-0 right-0 h-1 bg-purple-500 shadow-[0_0_10px_2px_rgba(168,85,247,0.5)] z-10"
                    animate={{ top: `${demoScanPos}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.05 }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-500/10 pointer-events-none" />
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/80 p-3 rounded-xl border border-stone-100">
                      <Heart className="w-5 h-5 text-rose-500 mb-1" />
                      <p className="text-xs font-medium text-stone-800">Love & Relationships</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Analyzes the Heart Line for emotional depth and bonds.</p>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-stone-100">
                      <Coins className="w-5 h-5 text-amber-500 mb-1" />
                      <p className="text-xs font-medium text-stone-800">Wealth & Career</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Traces the Fate Line for financial stability and success.</p>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-stone-100">
                      <Activity className="w-5 h-5 text-emerald-500 mb-1" />
                      <p className="text-xs font-medium text-stone-800">Health & Vitality</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Examines the Life Line for energy levels and well-being.</p>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-stone-100">
                      <AlertCircle className="w-5 h-5 text-indigo-500 mb-1" />
                      <p className="text-xs font-medium text-stone-800">Doshas & Challenges</p>
                      <p className="text-[10px] text-stone-500 leading-tight">Identifies cosmic markings to overcome life's hurdles.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
