import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, BarChart3, ChevronRight, Crown, Flame, LogOut, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getLanguage, languageLabels, setLanguage, type Language } from '../data/i18n';

type ProfileData = {
  user: {
    name: string;
    phone: string;
    city: string;
    deity: string;
    gotra: string;
    reminder_time: string;
  };
  subscription: { plan: string; status: string };
  analytics: {
    totalJaap: number;
    currentStreak: number;
    longestStreak: number;
    mostChanted: string;
  };
};

const planLabel = (plan?: string) => {
  if (!plan) return 'Seeker';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
};

export default function Profile({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [language, updateLanguage] = useState<Language>(getLanguage());

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    api.get<ProfileData>(`/users/${userId}`).then(setData).catch(() => setData(null));
  }, []);

  const user = data?.user;
  const analytics = data?.analytics;
  const changeLanguage = (value: Language) => {
    setLanguage(value);
    updateLanguage(value);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden pb-24">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-serif text-amber-50">Profile</h1>
          <button className="p-2 text-amber-100/70 hover:text-amber-100 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-stone-950 font-serif text-3xl border-4 border-amber-300 shadow-md">
            {user?.name?.slice(0, 1).toUpperCase() || <User className="w-8 h-8" />}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-serif text-amber-50 leading-tight">{user?.name || 'Loading...'}</h2>
            <p className="text-sm text-amber-100/70 mb-1">+91 {user?.phone || ''}</p>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="bg-amber-100/10 text-amber-100 px-2 py-1 rounded-md">{user?.city || 'City'}</span>
              {user?.gotra && <span className="bg-amber-100/10 text-amber-100 px-2 py-1 rounded-md">{user.gotra} Gotra</span>}
            </div>
          </div>
        </div>

        <Link to="/subscription" className="block bg-gradient-to-r from-amber-200 to-rose-200 rounded-2xl p-4 text-stone-950 shadow-lg flex items-center justify-between group transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/40 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <h4 className="font-medium mb-0.5">Current Plan: {planLabel(data?.subscription.plan)}</h4>
              <p className="text-xs text-stone-700">{data?.subscription.status === 'pending_payment' ? 'Payment pending' : 'Manage your plan'}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-700" />
        </Link>
      </header>

      <div className="p-4 space-y-6">
        <section>
          <h3 className="text-sm font-bold tracking-widest text-amber-900/70 uppercase mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Spiritual Progress
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} className="bg-[#fff8ea]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-amber-200/70 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-amber-700" />
              </div>
              <span className="text-2xl font-serif text-stone-950 mb-1">{(analytics?.totalJaap || 0).toLocaleString()}</span>
              <span className="text-xs text-stone-500 uppercase tracking-wider">Total Jaaps</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.1 }} className="bg-[#fff8ea]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-amber-200/70 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                <Flame className="w-5 h-5 text-rose-700" />
              </div>
              <span className="text-2xl font-serif text-stone-950 mb-1">{analytics?.currentStreak || 0} Days</span>
              <span className="text-xs text-stone-500 uppercase tracking-wider">Current Streak</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }} className="bg-[#fff8ea]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-amber-200/70">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-stone-800">Most Chanted</span>
              <span className="text-xs text-rose-700 font-medium">{analytics?.mostChanted || 'Begin your first jaap'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-stone-800">Longest Streak</span>
              <span className="text-xs text-stone-600 font-medium">{analytics?.longestStreak || 0} Days</span>
            </div>
          </motion.div>
        </section>

        <section>
          <h3 className="text-sm font-bold tracking-widest text-amber-900/70 uppercase mb-4">Preferences</h3>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} className="bg-[#fff8ea]/90 backdrop-blur-md rounded-2xl shadow-sm border border-amber-200/70 overflow-hidden">
            {[
              ['Primary Deity', user?.deity || 'Shiva'],
              ['Daily Reminder', user?.reminder_time || '06:00'],
              ['Language', languageLabels[language]]
            ].map(([label, value]) => (
              <div key={label} className="p-4 border-b border-amber-100 last:border-b-0 flex justify-between items-center">
                <div>
                  <p className="font-medium text-stone-950">{label}</p>
                  <p className="text-xs text-stone-500">{value}</p>
                </div>
                {label === 'Language' ? (
                  <select value={language} onChange={(event) => changeLanguage(event.target.value as Language)} className="bg-amber-100 text-stone-950 rounded-lg px-2 py-1 text-xs outline-none">
                    {Object.entries(languageLabels).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
                  </select>
                ) : (
                  <ChevronRight className="w-4 h-4 text-amber-700" />
                )}
              </div>
            ))}
          </motion.div>
        </section>

        <section className="pt-4">
          <button onClick={onLogout} className="w-full py-4 rounded-2xl bg-stone-950 text-amber-50 font-medium text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </section>
      </div>
    </div>
  );
}
