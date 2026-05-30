import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, RefreshCw, Play, Pause, ChevronDown, CheckCircle2, Volume2 } from 'lucide-react';
import { api } from '../services/api';
import { getUserId } from '../services/auth';
import { playChant, stopChant } from '../lib/sound';

export default function Jaap() {
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(108);
  const [mantra, setMantra] = useState('Om Namah Shivaya');
  const [customMantra, setCustomMantra] = useState('');
  const [speed, setSpeed] = useState(500);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const mantras = [
    'Om Namah Shivaya',
    'Om Bhur Bhuva Swaha (Gayatri)',
    'Hare Krishna Hare Rama',
    'Om Gan Ganapataye Namo Namah',
    'Om Namo Bhagavate Vasudevaya',
    'Custom',
  ];

  const mantraSpeech: Record<string, string> = {
    'Om Namah Shivaya': 'ॐ नमः शिवाय',
    'Om Bhur Bhuva Swaha (Gayatri)': 'ॐ भूर्भुवः स्वः । तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि । धियो यो नः प्रचोदयात् ॥',
    'Hare Krishna Hare Rama': 'हरे कृष्ण हरे राम',
    'Om Gan Ganapataye Namo Namah': 'ॐ गं गणपतये नमो नमः',
    'Om Namo Bhagavate Vasudevaya': 'ॐ नमो भगवते वासुदेवाय',
  };

  const speedOptions = [
    { label: 'Slow', value: 800 },
    { label: 'Medium', value: 500 },
    { label: 'Fast', value: 300 },
  ];

  const displayFromSpeech: Record<string, string> = {};
  for (const [en, hi] of Object.entries(mantraSpeech)) {
    displayFromSpeech[hi] = en;
  }

  const goals = [108, 216, 540, 1080];

  const selectedMantra = mantra === 'Custom' && customMantra ? customMantra : mantra;

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    api.get<{ mantra: string; count: number; goal: number }>('/jaap')
      .then((saved) => {
        setMantra(displayFromSpeech[saved.mantra] || saved.mantra || 'Om Namah Shivaya');
        setCount(Number(saved.count || 0));
        setGoal(Number(saved.goal || 108));
      })
      .finally(() => setHasLoaded(true));
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    const userId = getUserId();
    if (!userId) return;

    const saveMantra = mantra === 'Custom' ? customMantra : mantra;

    const timeout = window.setTimeout(() => {
      api.put('/jaap', { mantra: saveMantra, count, goal }).catch(() => undefined);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [count, goal, mantra, customMantra, hasLoaded]);

  const handleTap = () => {
    if (count < goal) {
      setCount(prev => prev + 1);
      // Optional: Add haptic feedback if supported
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
  };

  useEffect(() => {
    if (count === goal && count > 0) {
      setShowCelebration(true);
      setIsPlaying(false);
      const userId = getUserId();
      if (userId) {
        api.put('/jaap', { mantra: selectedMantra, count, goal, completed: true }).catch(() => undefined);
      }
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [count, goal, selectedMantra]);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCount(prev => {
          if (prev < goal) {
            if (window.navigator && window.navigator.vibrate) {
              window.navigator.vibrate(50);
            }
            return prev + 1;
          }
          return prev;
        });
      }, speed);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isPlaying, goal, speed]);

  const handleResetRequest = () => {
    // Only ask for confirmation if there's progress to lose
    if (count > 0) {
      setShowConfirmReset(true);
    }
  };

  const confirmReset = () => {
    setCount(0);
    setIsPlaying(false);
    setShowConfirmReset(false);
  };

  // Calculate progress percentage
  const progress = (count / goal) * 100;
  
  // Calculate beads (108 total, active based on progress)
  const totalBeads = 108;
  const activeBeads = Math.floor((count / goal) * totalBeads);

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-amber-500/20">
        <div>
          <h1 className="text-xl font-serif text-amber-50">Digital Mala</h1>
          <p className="text-xs text-amber-100/70">Focus your mind</p>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="p-2 bg-amber-100/10 rounded-full text-amber-100 hover:text-amber-300 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#fff8ea]/95 backdrop-blur-md border-b border-amber-200/70 overflow-hidden relative z-10 shadow-md"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest text-stone-400 uppercase mb-2">Select Mantra</label>
                <div className="relative">
                  <select 
                    value={mantra}
                    onChange={(e) => setMantra(e.target.value)}
                    className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {mantras.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
                {mantra === 'Custom' && (
                  <input
                    type="text"
                    value={customMantra}
                    onChange={(e) => setCustomMantra(e.target.value)}
                    placeholder="Type your mantra..."
                    className="w-full mt-2 bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold tracking-widest text-stone-400 uppercase mb-2">Speed</label>
                <div className="flex gap-2">
                  {speedOptions.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSpeed(s.value)}
                      className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                        speed === s.value
                          ? 'bg-orange-50 border-orange-200 text-orange-700 font-medium'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold tracking-widest text-stone-400 uppercase mb-2">Set Goal</label>
                <div className="flex gap-2">
                  {goals.map(g => (
                    <button
                      key={g}
                      onClick={() => { setGoal(g); setCount(0); setIsSettingsOpen(false); }}
                      className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                        goal === g 
                          ? 'bg-orange-50 border-orange-200 text-orange-700 font-medium' 
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Counter Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-200 rounded-full blur-3xl opacity-25 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-lg font-medium text-stone-800 mb-1">{selectedMantra}</h2>
          <p className="text-sm text-stone-500">Goal: {goal}</p>
        </div>

        {/* Tap Area / Mala Visualization */}
        <button 
          onClick={handleTap}
          className="relative w-72 h-72 flex items-center justify-center rounded-full focus:outline-none group"
        >
          {/* SVG Mala */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="#f3d9a4" 
              strokeWidth="2" 
            />
            
            {/* Progress Track */}
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="#be123c" 
              strokeWidth="3" 
              strokeDasharray={`${progress * 2.83} 283`} // 2 * pi * r = ~283
              className="transition-all duration-300 ease-out"
            />

            {/* Render Beads */}
            {Array.from({ length: totalBeads }).map((_, i) => {
              const angle = (i / totalBeads) * Math.PI * 2;
              const x = 50 + 45 * Math.cos(angle);
              const y = 50 + 45 * Math.sin(angle);
              const isActive = i < activeBeads;
              
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isActive ? "2" : "1.5"}
                  fill={isActive ? "#be123c" : "#f3d9a4"}
                  className="transition-all duration-300"
                />
              );
            })}
            
            {/* Guru Bead (Top) */}
            <circle cx="50" cy="5" r="4" fill="#92400e" />
            <path d="M 48 5 L 52 5 L 50 1 M 50 9 L 50 15" stroke="#92400e" strokeWidth="1" fill="none" />
          </svg>

          {/* Center Counter */}
          <div className="relative z-10 w-48 h-48 bg-[#fff8ea]/95 backdrop-blur-md rounded-full shadow-[0_10px_40px_rgba(45,29,18,0.16)] flex flex-col items-center justify-center border-4 border-amber-100 group-active:scale-95 transition-transform duration-100">
            <span className="text-6xl font-serif text-stone-800 tracking-tighter">{count}</span>
            <span className="text-xs font-bold tracking-widest text-rose-700 uppercase mt-2">Tap to Count</span>
          </div>
        </button>

        {/* Controls */}
        <div className="mt-12 flex items-center gap-6 relative z-10">
          <button 
            onClick={handleResetRequest}
            className="w-12 h-12 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(true)}
            disabled={count >= goal || isPlaying}
            className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-colors ${isPlaying || count >= goal ? 'bg-orange-400 text-orange-100 cursor-not-allowed shadow-orange-400/30' : 'bg-orange-600 text-white shadow-orange-600/30 hover:bg-orange-700'}`}
          >
            <Play className="w-6 h-6 ml-1" />
          </button>
          <button
            onClick={() => { setCount(prev => prev < goal ? prev + 1 : prev); playChant(mantraSpeech[selectedMantra] || selectedMantra, 'hi'); }}
            className="w-12 h-12 rounded-full bg-amber-100 shadow-sm border border-amber-200 flex items-center justify-center text-rose-700 hover:bg-amber-200 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => { setIsPlaying(false); stopChant(); }}
            disabled={!isPlaying}
            className={`w-12 h-12 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center transition-colors ${!isPlaying ? 'text-stone-300' : 'text-stone-500 hover:text-orange-600 hover:bg-stone-50'}`}
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Reset Confirmation Overlay */}
      <AnimatePresence>
        {showConfirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-3xl shadow-xl max-w-xs mx-4 text-center"
            >
              <h3 className="text-xl font-serif text-stone-900 mb-2">Reset Count?</h3>
              <p className="text-stone-500 text-sm mb-6">Are you sure you want to reset your Jaap count back to zero?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmReset}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-xs mx-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 mb-2">Goal Reached!</h3>
              <p className="text-stone-500 mb-6">You have successfully completed {goal} jaaps of {selectedMantra}.</p>
              <button 
                onClick={() => { setShowCelebration(false); setCount(0); }}
                className="w-full py-3 bg-orange-600 text-white rounded-xl font-medium"
              >
                Start New Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
