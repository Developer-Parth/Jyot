import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, MapPin, Phone, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { APP_NAME } from '../lib/branding';

function getAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function Login({ onLogin }: { onLogin: (userId: number) => void }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    birthDate: localStorage.getItem('userBirthDate') || '',
    deity: localStorage.getItem('userPreferences')
      ? JSON.parse(localStorage.getItem('userPreferences')!).deity || 'Shiva'
      : 'Shiva',
    gotra: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const age = getAge(form.birthDate);
  const isUnderage = age > 0 && age < 13;

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || form.phone.length < 10 || !form.city) return;
    if (!form.birthDate) { setError('Please enter your birth date.'); return; }
    if (isUnderage) { setError('You must be at least 13 years old to use Jyot.'); return; }
    if (!ageConfirmed) { setError('Please confirm you are at least 13 years old.'); return; }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post<{ user: { id: number } }>('/auth/login', form);
      onLogin(response.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div className="flex-1 flex flex-col justify-center p-6 bg-[#fff8ea]/90 backdrop-blur-md m-4 my-auto rounded-[2rem] shadow-2xl border border-amber-200/70">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center mb-7 mx-auto shadow-inner border border-amber-200">
          <span className="text-4xl">ॐ</span>
        </div>

        <h1 className="text-4xl font-serif text-stone-950 text-center mb-2">{APP_NAME}</h1>
        <p className="text-stone-600 text-center mb-8">Begin with the details your practice should remember.</p>

        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Your Name</label>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700" />
              <input placeholder="For example, Aarya" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white/90 text-lg" value={form.name} onChange={(event) => updateField('name', event.target.value)} autoFocus />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Mobile Number</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-stone-500">
                <Phone className="w-5 h-5 text-amber-700" />
                <span className="text-stone-300">|</span>
                <span className="font-medium">+91</span>
              </div>
              <input type="tel" maxLength={10} placeholder="Enter 10 digit number" className="w-full pl-24 pr-4 py-4 rounded-2xl border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white/90 text-lg" value={form.phone} onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, ''))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700" />
                <input className="w-full pl-12 pr-3 py-4 rounded-2xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500" value={form.city} onChange={(event) => updateField('city', event.target.value)} placeholder="Varanasi" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Birth Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700" />
                <input type="date" className="w-full pl-11 pr-2 py-4 rounded-2xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500 text-sm" value={form.birthDate} onChange={(event) => { updateField('birthDate', event.target.value); setAgeConfirmed(false); }} />
              </div>
              {isUnderage && <p className="mt-1 text-xs text-red-600">You must be at least 13 years old to use Jyot.</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input className="w-full px-4 py-4 rounded-2xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500" value={form.deity} onChange={(event) => updateField('deity', event.target.value)} placeholder="Ishta Devata" />
            <input className="w-full px-4 py-4 rounded-2xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500" value={form.gotra} onChange={(event) => updateField('gotra', event.target.value)} placeholder="Gotra optional" />
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-stone-200 bg-white/50">
            <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-stone-300 text-stone-950 focus:ring-amber-500" />
            <span className="text-sm text-stone-700">I confirm that I am at least 13 years old.</span>
          </label>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button type="submit" disabled={!form.name || form.phone.length < 10 || !form.city || isLoading} className="w-full py-4 rounded-2xl bg-stone-950 text-amber-50 font-medium text-lg shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Preparing...' : 'Enter Sanctuary'} <ArrowRight className="w-5 h-5" />
          </button>
        </motion.form>

        <p className="text-xs text-stone-400 text-center mt-4">
          By continuing, you agree to our{' '}
          <Link to="/privacy-policy" className="text-amber-700 underline hover:text-amber-900">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
