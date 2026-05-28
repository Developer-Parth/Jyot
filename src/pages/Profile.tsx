import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, BarChart3, ChevronRight, Crown, Flame, LogOut, Save, Settings, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getLanguage, languageLabels, setLanguage, type Language } from '../data/i18n';

type ProfileData = {
  user: {
    id: number;
    name: string;
    phone: string;
    city: string;
    deity: string;
    gotra: string;
    reminder_time: string;
    birth_date?: string;
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

const deities = ['Shiva', 'Vishnu', 'Devi (Durga)', 'Ganesha', 'Hanuman', 'Krishna', 'Rama', 'Saraswati', 'Lakshmi'];

export default function Profile({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [language, updateLanguage] = useState<Language>(getLanguage());
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', city: '', deity: 'Shiva', gotra: '', reminderTime: '06:00',
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    api.get<ProfileData>(`/users/${userId}`).then((d) => {
      setData(d);
      setForm({
        name: d.user.name || '',
        phone: d.user.phone || '',
        city: d.user.city || '',
        deity: d.user.deity || 'Shiva',
        gotra: d.user.gotra || '',
        reminderTime: d.user.reminder_time || '06:00',
      });
    }).catch(() => setData(null));
  }, []);

  const user = data?.user;
  const analytics = data?.analytics;
  const changeLanguage = (value: Language) => {
    setLanguage(value);
    updateLanguage(value);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    setSaving(true);
    try {
      const result = await api.put<{ user: ProfileData['user'] }>(`/users/${userId}`, {
        name: form.name,
        phone: form.phone,
        city: form.city,
        deity: form.deity,
        gotra: form.gotra,
        reminderTime: form.reminderTime,
      });
      setData(prev => prev ? { ...prev, user: result.user } : null);
      setIsEditing(false);
    } catch {
      // keep editing on failure
    } finally {
      setSaving(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setForm({
        name: user?.name || '',
        phone: user?.phone || '',
        city: user?.city || '',
        deity: user?.deity || 'Shiva',
        gotra: user?.gotra || '',
        reminderTime: user?.reminder_time || '06:00',
      });
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden pb-24">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-serif text-amber-50">Profile</h1>
          <button onClick={toggleEdit} className="p-2 text-amber-100/70 hover:text-amber-100 transition-colors">
            {isEditing ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-stone-950 font-serif text-3xl border-4 border-amber-300 shadow-md shrink-0">
            {user?.name?.slice(0, 1).toUpperCase() || <User className="w-8 h-8" />}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="w-full bg-amber-100/20 text-amber-50 rounded-lg px-3 py-1.5 text-base outline-none border border-amber-400/30 focus:border-amber-300 placeholder-amber-200/50" />
                <div className="flex gap-2">
                  <span className="text-xs text-amber-100/60 self-center shrink-0">+91</span>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="flex-1 bg-amber-100/20 text-amber-50 rounded-lg px-3 py-1.5 text-xs outline-none border border-amber-400/30 focus:border-amber-300 placeholder-amber-200/50" />
                </div>
                <div className="flex gap-2">
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className="flex-1 bg-amber-100/20 text-amber-50 rounded-lg px-3 py-1.5 text-xs outline-none border border-amber-400/30 focus:border-amber-300 placeholder-amber-200/50" />
                  <input value={form.gotra} onChange={e => setForm(f => ({ ...f, gotra: e.target.value }))} placeholder="Gotra (optional)" className="flex-1 bg-amber-100/20 text-amber-50 rounded-lg px-3 py-1.5 text-xs outline-none border border-amber-400/30 focus:border-amber-300 placeholder-amber-200/50" />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-serif text-amber-50 leading-tight truncate">{user?.name || 'Loading...'}</h2>
                <p className="text-sm text-amber-100/70 mb-1">+91 {user?.phone || ''}</p>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="bg-amber-100/10 text-amber-100 px-2 py-1 rounded-md">{user?.city || 'City'}</span>
                  {user?.gotra && <span className="bg-amber-100/10 text-amber-100 px-2 py-1 rounded-md">{user.gotra} Gotra</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mb-4">
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-medium text-sm flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}

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
              { key: 'Deity', label: 'Primary Deity', value: user?.deity || 'Shiva' },
              { key: 'Reminder', label: 'Daily Reminder', value: user?.reminder_time || '06:00' },
              { key: 'Language', label: 'Language', value: languageLabels[language] },
            ].map(({ key, label, value }) => (
              <div key={key} className="p-4 border-b border-amber-100 last:border-b-0 flex justify-between items-center">
                <div>
                  <p className="font-medium text-stone-950">{label}</p>
                  {isEditing && key !== 'Language' ? (
                    key === 'Deity' ? (
                      <select value={form.deity} onChange={e => setForm(f => ({ ...f, deity: e.target.value }))} className="mt-1 bg-amber-100 text-stone-950 rounded-lg px-2 py-1 text-xs outline-none w-full">
                        {deities.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <input type="time" value={form.reminderTime} onChange={e => setForm(f => ({ ...f, reminderTime: e.target.value }))} className="mt-1 bg-amber-100 text-stone-950 rounded-lg px-2 py-1 text-xs outline-none" />
                    )
                  ) : (
                    <p className="text-xs text-stone-500">{value}</p>
                  )}
                </div>
                {key === 'Language' ? (
                  <select value={language} onChange={(event) => changeLanguage(event.target.value as Language)} className="bg-amber-100 text-stone-950 rounded-lg px-2 py-1 text-xs outline-none">
                    {Object.entries(languageLabels).map(([k, text]) => <option key={k} value={k}>{text}</option>)}
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
