import { MhahPanchang } from 'mhah-panchang';

type PanchangRequest = {
  city: string;
  lang?: 'en' | 'hi';
};

type Festival = {
  name: string;
  date: string;
  daysLeft: number;
};

type PanchangResponse = {
  city: string;
  source: string;
  date: string;
  tithi: string;
  nakshatra: string;
  samvat: string;
  sunrise: string;
  sunset: string;
  brahmaMuhurta: string;
  abhijitMuhurta: string;
  rahuKaal: string;
  festivals: Festival[];
};

type LocationInfo = {
  lat: number;
  lon: number;
  timezone: string;
};

type CalendarResult = {
  Tithi: { ino: number; name_en_IN?: string };
  Paksha: { ino: number; name_en_IN?: string };
  Nakshatra: { name_en_IN?: string };
  Yoga: { name_en_IN?: string };
  Karna: { name_en_IN?: string };
  Masa?: { name_en_IN?: string };
  MoonMasa?: { name_en_IN?: string; isLeapMonth?: boolean };
};

const cityCoordinates: Record<string, LocationInfo> = {
  varanasi: { lat: 25.3176, lon: 82.9739, timezone: 'Asia/Kolkata' },
  delhi: { lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata' },
  'new delhi': { lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata' },
  mumbai: { lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata' },
  pune: { lat: 18.5204, lon: 73.8567, timezone: 'Asia/Kolkata' },
  ujjain: { lat: 23.1765, lon: 75.7885, timezone: 'Asia/Kolkata' },
  jaipur: { lat: 26.9124, lon: 75.7873, timezone: 'Asia/Kolkata' },
  lucknow: { lat: 26.8467, lon: 80.9462, timezone: 'Asia/Kolkata' },
  bengaluru: { lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata' },
  bangalore: { lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata' },
  chennai: { lat: 13.0827, lon: 80.2707, timezone: 'Asia/Kolkata' },
  kolkata: { lat: 22.5726, lon: 88.3639, timezone: 'Asia/Kolkata' },
  hyderabad: { lat: 17.3850, lon: 78.4867, timezone: 'Asia/Kolkata' },
  ahmedabad: { lat: 23.0225, lon: 72.5714, timezone: 'Asia/Kolkata' },
  patna: { lat: 25.5941, lon: 85.1376, timezone: 'Asia/Kolkata' }
};

const tithiHi: Record<string, string> = {
  Pratipada: 'प्रतिपदा',
  Dwitiya: 'द्वितीया',
  Tritiya: 'तृतीया',
  Chaturthi: 'चतुर्थी',
  Panchami: 'पंचमी',
  Sasthi: 'षष्ठी',
  Saptami: 'सप्तमी',
  Astami: 'अष्टमी',
  Navami: 'नवमी',
  Dasami: 'दशमी',
  Ekadasi: 'एकादशी',
  Dvadasi: 'द्वादशी',
  Trayodasi: 'त्रयोदशी',
  Chaturdasi: 'चतुर्दशी',
  Punnami: 'पूर्णिमा',
  Purnima: 'पूर्णिमा',
  Padyami: 'प्रतिपदा',
  Vidhiya: 'द्वितीया',
  Thadiya: 'तृतीया',
  Chaviti: 'चतुर्थी',
  Shasti: 'षष्ठी',
  Sapthami: 'सप्तमी',
  Amavasya: 'अमावस्या'
};

const pakshaHi: Record<string, string> = {
  Shukla: 'शुक्ल',
  Krishna: 'कृष्ण'
};

const normalizeCity = (city: string) => city.trim().toLowerCase();

const locationFor = (city: string) => cityCoordinates[normalizeCity(city)] || cityCoordinates.varanasi;

const panchang = new MhahPanchang();

const localDateParts = (timezone: string, date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value)
  };
};

const todayTimerDate = (timezone: string) => {
  const { year, month, day } = localDateParts(timezone);
  return new Date(Date.UTC(year, month - 1, day, 12));
};

const todayCalendarDate = (timezone: string) => {
  const { year, month, day } = localDateParts(timezone);
  return new Date(Date.UTC(year, month - 1, day, 18, 30));
};

const today = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12));
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const formatTime = (date: Date | string, timezone: string) => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
};

const formatDate = (date: Date, timezone: string) => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    day: 'numeric',
    month: 'short'
  }).format(date);
};

const rangeText = (start: Date, end: Date, timezone: string) => `${formatTime(start, timezone)} - ${formatTime(end, timezone)}`;

const cleanTithi = (name = '') => name.trim();

const normalizeTithiForFestival = (name = '') => cleanTithi(name).toLowerCase();

const tithiAlias: Record<string, string> = {
  punnami: 'purnima',
  pournami: 'purnima',
  padyami: 'pratipada',
  vidiya: 'dwitiya',
  vidhiya: 'dwitiya',
  thadiya: 'tritiya',
  tadiya: 'tritiya',
  chavithi: 'chaturthi',
  chaviti: 'chaturthi',
  shasti: 'sasthi',
  sapthami: 'saptami',
  ashtami: 'astami',
  dwadasi: 'dvadasi'
};

const canonicalTithi = (name = '') => {
  const normalized = normalizeTithiForFestival(name);
  return tithiAlias[normalized] || normalized;
};

const translateTithi = (name: string, lang: 'en' | 'hi') => lang === 'hi' ? tithiHi[name] || name : name;

const translatePaksha = (name: string, lang: 'en' | 'hi') => lang === 'hi' ? pakshaHi[name] || name : name;

const getRahuKaal = (sunrise: Date, sunset: Date, weekday: number, timezone: string) => {
  const orderByDay = [8, 2, 7, 5, 6, 4, 3];
  const segment = orderByDay[weekday] - 1;
  const dayLength = sunset.getTime() - sunrise.getTime();
  const segmentLength = dayLength / 8;
  const start = new Date(sunrise.getTime() + segment * segmentLength);
  const end = new Date(start.getTime() + segmentLength);
  return rangeText(start, end, timezone);
};

const getFestivalName = (cal: CalendarResult) => {
  const tithi = canonicalTithi(cal.Tithi?.name_en_IN);
  const paksha = cal.Paksha?.name_en_IN || '';
  const masa = cal.MoonMasa?.name_en_IN || cal.Masa?.name_en_IN || '';
  const shukla = paksha === 'Shukla';
  const krishna = paksha === 'Krishna';
  const names: string[] = [];

  if (tithi === 'ekadasi') names.push('Ekadashi');
  if (tithi === 'purnima') names.push('Purnima');
  if (tithi === 'amavasya') names.push('Amavasya');
  if (tithi === 'trayodasi') names.push('Pradosh Vrat');
  if (krishna && tithi === 'chaturthi') names.push('Sankashti Chaturthi');
  if (krishna && tithi === 'chaturdasi') names.push('Masik Shivaratri');

  if (masa === 'Chaitra' && shukla && tithi === 'navami') names.push('Rama Navami');
  if (masa === 'Vaisakha' && shukla && tithi === 'tritiya') names.push('Akshaya Tritiya');
  if (masa === 'Ashadha' && tithi === 'purnima') names.push('Guru Purnima');
  if (masa === 'Bhadrapada' && krishna && tithi === 'astami') names.push('Krishna Janmashtami');
  if (masa === 'Bhadrapada' && shukla && tithi === 'chaturthi') names.push('Ganesh Chaturthi');
  if (masa === 'Ashwin' && shukla && tithi === 'pratipada') names.push('Shardiya Navratri Begins');
  if (masa === 'Ashwin' && shukla && tithi === 'dasami') names.push('Vijaya Dashami');
  if (masa === 'Kartika' && tithi === 'amavasya') names.push('Diwali');
  if (masa === 'Phalguna' && tithi === 'purnima') names.push('Holi');
  if (masa === 'Phalguna' && krishna && tithi === 'chaturdasi') names.push('Maha Shivaratri');

  return names[0];
};

const upcomingFestivals = (startCalendarDate: Date, startDisplayDate: Date, location: LocationInfo) => {
  const events = new Map<string, Festival>();

  for (let offset = 0; offset <= 120 && events.size < 8; offset += 1) {
    const calendarDate = addDays(startCalendarDate, offset);
    const displayDate = addDays(startDisplayDate, offset);
    const cal = panchang.calendar(calendarDate, location.lat, location.lon) as CalendarResult;
    const name = getFestivalName(cal);
    if (!name) continue;

    const key = `${name}-${formatDate(displayDate, location.timezone)}`;
    if (!events.has(key)) {
      events.set(key, {
        name,
        date: formatDate(displayDate, location.timezone),
        daysLeft: offset
      });
    }
  }

  return Array.from(events.values());
};

export class PanchangService {
  static async getDailyPanchang({ city, lang = 'en' }: PanchangRequest): Promise<PanchangResponse> {
    const location = locationFor(city);
    const timerDate = todayTimerDate(location.timezone);
    const calendarDate = todayCalendarDate(location.timezone);
    const cal = panchang.calendar(calendarDate, location.lat, location.lon) as CalendarResult;
    const timers = panchang.sunTimer(timerDate, location.lat, location.lon) as Record<string, string>;
    const sunrise = new Date(timers.sunRise);
    const sunset = new Date(timers.sunSet);
    const noon = new Date((sunrise.getTime() + sunset.getTime()) / 2);
    const brahmaStart = new Date(sunrise.getTime() - 96 * 60000);
    const brahmaEnd = new Date(sunrise.getTime() - 48 * 60000);
    const abhijitStart = new Date(noon.getTime() - 24 * 60000);
    const abhijitEnd = new Date(noon.getTime() + 24 * 60000);
    const tithiName = cleanTithi(cal.Tithi?.name_en_IN || 'Unavailable');
    const pakshaName = cal.Paksha?.name_en_IN || '';

    return {
      city,
      source: 'Offline Panchang Engine (mhah-panchang)',
      date: timerDate.toISOString().slice(0, 10),
      tithi: `${translatePaksha(pakshaName, lang)} Paksha ${translateTithi(tithiName, lang)}`.trim(),
      nakshatra: cal.Nakshatra?.name_en_IN || 'Unavailable',
      samvat: `Vikram Samvat ${timerDate.getUTCFullYear() + 57}`,
      sunrise: formatTime(sunrise, location.timezone),
      sunset: formatTime(sunset, location.timezone),
      brahmaMuhurta: rangeText(brahmaStart, brahmaEnd, location.timezone),
      abhijitMuhurta: rangeText(abhijitStart, abhijitEnd, location.timezone),
      rahuKaal: getRahuKaal(sunrise, sunset, timerDate.getUTCDay(), location.timezone),
      festivals: upcomingFestivals(calendarDate, timerDate, location)
    };
  }
}
