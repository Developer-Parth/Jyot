import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, MapPin, Bell, Heart, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

function getAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [preferences, setPreferences] = useState({
    city: '',
    deity: '',
    birthDate: '',
  });

  const age = getAge(preferences.birthDate);
  const isUnderage = age > 0 && age < 13;

  const steps = [
    {
      title: "Jyot",
      subtitle: "Your Daily Spiritual Guide",
      content: "Welcome to a journey of inner peace and devotion.",
      icon: (
        <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center mb-8 mx-auto shadow-inner">
          <span className="text-6xl">🕉️</span>
        </div>
      )
    },
    {
      title: "मन से, डर से नहीं",
      subtitle: "Philosophy",
      content: "Connect with the divine through love and devotion, not fear. We guide you to perform rituals with understanding and pure intent.",
      icon: (
        <div className="w-32 h-32 rounded-full bg-rose-100 flex items-center justify-center mb-8 mx-auto shadow-inner">
          <Heart className="w-16 h-16 text-rose-500" />
        </div>
      )
    },
    {
      title: "Core Features",
      subtitle: "Everything you need",
      content: (
        <ul className="text-left space-y-4 w-full max-w-xs mx-auto text-stone-600">
          <li className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">📅</span>
            Daily Panchang
          </li>
          <li className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">📿</span>
            Digital Jaap Mala
          </li>
          <li className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">✨</span>
            AI Palmistry
          </li>
          <li className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">📖</span>
            Puja Vidhi Library
          </li>
        </ul>
      )
    },
    {
      title: "Personalize",
      subtitle: "Tell us about yourself",
      content: (
        <div className="space-y-4 w-full max-w-xs mx-auto text-left">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">City (for Panchang)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input type="text" required placeholder="e.g. New Delhi" className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" value={preferences.city} onChange={(e) => setPreferences({ ...preferences, city: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Primary Deity</label>
            <select required className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white" value={preferences.deity} onChange={(e) => setPreferences({ ...preferences, deity: e.target.value })}>
              <option value="">Select Deity</option>
              <option value="Shiva">Lord Shiva</option>
              <option value="Vishnu">Lord Vishnu</option>
              <option value="Krishna">Lord Krishna</option>
              <option value="Rama">Lord Rama</option>
              <option value="Hanuman">Lord Hanuman</option>
              <option value="Durga">Goddess Durga</option>
              <option value="Ganesha">Lord Ganesha</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Birth Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input type="date" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" value={preferences.birthDate} onChange={(e) => { setPreferences({ ...preferences, birthDate: e.target.value }); setAgeConfirmed(false); }} />
            </div>
            {isUnderage && (
              <p className="mt-1 text-xs text-red-600">You must be at least 13 years old to use Jyot.</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Stay Connected",
      subtitle: "Permissions",
      content: (
        <div className="space-y-6 w-full max-w-xs mx-auto text-left">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100">
            <div className="mt-1"><Bell className="w-6 h-6 text-orange-500" /></div>
            <div>
              <h4 className="font-medium text-stone-900">Notifications</h4>
              <p className="text-sm text-stone-500 mt-1">Get daily reminders for your Jaap and family events.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100">
            <div className="mt-1"><MapPin className="w-6 h-6 text-orange-500" /></div>
            <div>
              <h4 className="font-medium text-stone-900">Location</h4>
              <p className="text-sm text-stone-500 mt-1">For accurate sunrise/sunset times in your Panchang.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-1 w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500" />
              <span className="text-sm text-stone-700">I confirm that I am at least 13 years old.</span>
            </label>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step === 3) {
      if (!preferences.city.trim() || !preferences.deity || !preferences.birthDate) {
        alert('Please fill all required fields');
        return;
      }
      if (isUnderage) {
        alert('You must be at least 13 years old to use Jyot.');
        return;
      }
    }

    if (step === 4) {
      if (!ageConfirmed) {
        alert('Please confirm you are at least 13 years old.');
        return;
      }
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('userPreferences', JSON.stringify({
        city: preferences.city,
        deity: preferences.deity,
      }));
      localStorage.setItem('userBirthDate', preferences.birthDate);
      onComplete();
    }
  };

  const isPersonalizationInvalid = step === 3 && (!preferences.city.trim() || !preferences.deity || !preferences.birthDate || isUnderage);

  return (
    <div className="min-h-screen bg-transparent flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fff8ea]/90 backdrop-blur-md m-4 my-auto rounded-3xl shadow-xl border border-amber-200/70">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full">
            {steps[step].icon}
            <h2 className="text-sm font-bold tracking-widest text-orange-500 uppercase mb-2">{steps[step].subtitle}</h2>
            <h1 className="text-3xl font-serif text-stone-900 mb-6">{steps[step].title}</h1>
            <div className="text-stone-600 leading-relaxed">{steps[step].content}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 pb-12">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-orange-500' : 'w-2 bg-stone-200'}`} />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={isPersonalizationInvalid}
          className={`w-full py-4 rounded-2xl text-white font-medium text-lg shadow-lg flex items-center justify-center gap-2 transition-colors ${isPersonalizationInvalid ? 'bg-stone-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'}`}
        >
          {step === steps.length - 1 ? (
            <><Check className="w-5 h-5" /> Get Started</>
          ) : (
            <><ArrowRight className="w-5 h-5" /> Continue</>
          )}
        </button>

        <p className="text-xs text-stone-400 text-center mt-4">
          By continuing, you agree to our{' '}
          <Link to="/privacy-policy" className="text-amber-700 underline hover:text-amber-900">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
