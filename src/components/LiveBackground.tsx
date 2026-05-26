import { motion } from 'motion/react';

export default function LiveBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#3a2417]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.28),transparent_35%),linear-gradient(180deg,#3a2417_0%,#8a3f24_48%,#f8e6b5_100%)]" />
      <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] max-w-[800px] max-h-[800px] opacity-[0.10] pointer-events-none text-amber-100"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.2" />
          {Array.from({length: 24}).map((_, i) => (
            <line key={i} x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.1" transform={`rotate(${i * 15} 50 50)`} />
          ))}
          {Array.from({length: 12}).map((_, i) => (
            <circle key={`c-${i}`} cx="50" cy="15" r="5" fill="none" stroke="currentColor" strokeWidth="0.1" transform={`rotate(${i * 30} 50 50)`} />
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
