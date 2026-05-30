import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ArrowRight, BookOpen, Calendar, CalendarPlus, CircleDashed, Flame, MapPin, Moon, Sparkles, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getUserId } from '../services/auth';
import { APP_NAME } from '../lib/branding';

function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function downloadICS(event: { title: string; description: string; date: Date }) {
  const start = icsDate(event.date);
  const end = icsDate(new Date(event.date.getTime() + 3600000));
  const escaped = (s: string) => s.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DharmaPath//Calendar//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escaped(event.title)}`,
    `DESCRIPTION:${escaped(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

type HomeData = {
  user: { name: string; city: string };
  analytics: { currentStreak: number };
};

type Panchang = {
  city: string;
  source?: string;
  tithi: string;
  nakshatra: string;
  samvat: string;
  sunrise: string;
  sunset: string;
  brahmaMuhurta: string;
  abhijitMuhurta: string;
  rahuKaal: string;
  festivals: Array<{ name: string; date: string; daysLeft: number }>;
};

export default function Home() {
  const [greeting, setGreeting] = useState('');
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [panchang, setPanchang] = useState<Panchang | null>(null);
  const [panchangError, setPanchangError] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Suprabhat');
    else if (hour < 18) setGreeting('Shubh Dophar');
    else setGreeting('Shubh Sandhya');

    const userId = getUserId();
    if (!userId) return;

    api.get<HomeData>('/users/me')
      .then((data) => {
        setHomeData(data);
        return api.get<Panchang>(`/panchang?city=${encodeURIComponent(data.user.city || 'India')}`);
      })
      .then(setPanchang)
      .catch((error) => {
        setPanchang(null);
        setPanchangError(error instanceof Error ? error.message : 'Real panchang is unavailable.');
      });
  }, []);

  const today = new Date();
  const userName = homeData?.user.name || 'Seeker';
  const city = homeData?.user.city || 'India';

  return (
    <div className="min-h-screen bg-transparent p-4 pb-24">
      <header className="flex justify-between items-center mb-6 pt-4 pb-3 sticky top-0 z-20 bg-[#2b1d16]/85 backdrop-blur-md -mx-4 px-4 border-b border-amber-500/20">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300">{APP_NAME}</p>
          <h1 className="text-2xl font-serif text-amber-50">Namaste, {userName}</h1>
          <p className="text-amber-100/70 text-sm">{greeting} · {format(today, 'EEEE, d MMMM')}</p>
        </div>
        <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-stone-950 font-serif text-xl border-2 border-amber-300 shadow-md">
          {userName.slice(0, 1).toUpperCase()}
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        className="bg-[#fff7df]/90 backdrop-blur-md rounded-[1.75rem] p-5 shadow-[0_18px_50px_rgba(45,29,18,0.16)] border border-amber-200/70 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-x-6 top-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-rose-700 uppercase mb-1">Today's Panchang</h2>
              <p className="text-xs text-stone-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {panchang?.city || city}</p>
              {panchang?.source && <p className="text-[10px] text-stone-400 mt-1">Source: {panchang.source}</p>}
            </div>
            <button onClick={() => {
              if (!panchang) return;
              downloadICS({
                title: `Panchang – ${format(today, 'd MMM yyyy')}`,
                description: `Tithi: ${panchang.tithi}\nNakshatra: ${panchang.nakshatra}\nSamvat: ${panchang.samvat}\nSunrise: ${panchang.sunrise}\nSunset: ${panchang.sunset}\nAbhijit Muhurta: ${panchang.abhijitMuhurta}\nRahu Kaal: ${panchang.rahuKaal}`,
                date: today,
              });
            }} className="p-2 bg-amber-100 rounded-full text-amber-800 hover:bg-amber-200 transition-colors">
              <CalendarPlus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-stone-500 mb-0.5">Tithi</p>
              <p className="font-medium text-stone-900 text-sm">{panchang?.tithi || (panchangError ? 'Unavailable' : 'Loading...')}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-0.5">Nakshatra</p>
              <p className="font-medium text-stone-900 text-sm">{panchang?.nakshatra || (panchangError ? 'Unavailable' : 'Loading...')}</p>
            </div>
          </div>

          <p className="text-xs text-amber-900 bg-amber-100/70 rounded-xl px-3 py-2 mb-4">{panchang?.samvat || 'Vikram Samvat'}</p>
          {panchangError && (
            <p className="text-xs text-rose-800 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4">
              Offline panchang calculation is unavailable right now. Please try again after restarting the server.
            </p>
          )}

          <div className="flex items-center gap-4 py-3 border-y border-amber-200/70 mb-4">
            <div className="flex-1 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-[10px] text-stone-500">Sunrise</p>
                <p className="text-xs font-medium text-stone-800">{panchang?.sunrise || '--'}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-amber-200"></div>
            <div className="flex-1 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-[10px] text-stone-500">Sunset</p>
                <p className="text-xs font-medium text-stone-800">{panchang?.sunset || '--'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50/80 border border-emerald-100">
              <span className="text-xs font-medium text-emerald-800">Abhijit Muhurta</span>
              <span className="text-xs text-emerald-700">{panchang?.abhijitMuhurta || '--'}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-rose-50/80 border border-rose-100">
              <span className="text-xs font-medium text-rose-800">Rahu Kaal</span>
              <span className="text-xs text-rose-700">{panchang?.rahuKaal || '--'}</span>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-widest text-amber-900/70 uppercase">Practice</h3>
          <span className="text-xs text-rose-700 flex items-center gap-1"><Flame className="w-3 h-3" /> {homeData?.analytics.currentStreak || 0} day streak</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { to: '/jaap', label: 'Start Jaap', icon: CircleDashed, tone: 'text-rose-700 bg-rose-50' },
            { to: '/puja', label: 'Puja Vidhi', icon: BookOpen, tone: 'text-amber-700 bg-amber-50' },
            { to: '/palm-reading', label: 'Palmistry', icon: Sparkles, tone: 'text-indigo-700 bg-indigo-50' }
          ].map((item, index) => (
            <motion.div key={item.to} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <Link to={item.to} className="flex flex-col items-center justify-center p-4 bg-[#fff8ea]/90 backdrop-blur-md rounded-2xl shadow-sm border border-amber-200/70 hover:border-rose-300 hover:shadow-md transition-all group h-full">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${item.tone}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-stone-800 text-center">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold tracking-widest text-amber-900/70 uppercase">Upcoming Festivals</h3>
          <button className="text-xs text-rose-700 font-medium flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
        </div>
        <div className="space-y-3">
          {(panchang?.festivals || []).map((fest, index) => (
            <motion.div
              key={fest.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-[#fff8ea]/90 backdrop-blur-md rounded-2xl shadow-sm border border-amber-200/70"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 flex flex-col items-center justify-center text-amber-100">
                  <span className="text-[10px] uppercase leading-none">{fest.date.split(' ')[0]}</span>
                  <span className="text-sm font-bold leading-none mt-1">{fest.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h4 className="font-medium text-stone-900 text-sm">{fest.name}</h4>
                  <p className="text-xs text-stone-500">In {fest.daysLeft} days</p>
                </div>
              </div>
              <button onClick={() => {
                const parts = fest.date.split(' ');
                if (parts.length < 2) return;
                const monthAbbr = parts[0];
                const day = parseInt(parts[1], 10);
                const monthMap: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
                const month = monthMap[monthAbbr];
                if (month === undefined || isNaN(day)) return;
                const date = new Date(today.getFullYear(), month, day, 9, 0, 0);
                downloadICS({
                  title: fest.name,
                  description: `Hindu festival on ${fest.date}`,
                  date,
                });
              }} className="p-1 hover:bg-rose-100 rounded-full transition-colors">
                <CalendarPlus className="w-4 h-4 text-rose-700" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
