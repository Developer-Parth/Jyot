import dotenv from 'dotenv';
dotenv.config();

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

const cityCoordinates: Record<string, { lat: number; lon: number; timezone: string; cityId: string }> = {
  varanasi: { lat: 25.3176, lon: 82.9739, timezone: 'Asia/Kolkata', cityId: 'varanasi' },
  delhi: { lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata', cityId: 'delhi' },
  'new delhi': { lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata', cityId: 'delhi' },
  mumbai: { lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata', cityId: 'mumbai' },
  pune: { lat: 18.5204, lon: 73.8567, timezone: 'Asia/Kolkata', cityId: 'pune' },
  ujjain: { lat: 23.1765, lon: 75.7885, timezone: 'Asia/Kolkata', cityId: 'ujjain' },
  jaipur: { lat: 26.9124, lon: 75.7873, timezone: 'Asia/Kolkata', cityId: 'jaipur' },
  lucknow: { lat: 26.8467, lon: 80.9462, timezone: 'Asia/Kolkata', cityId: 'lucknow' },
  bengaluru: { lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata', cityId: 'bangalore' },
  bangalore: { lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata', cityId: 'bangalore' },
  chennai: { lat: 13.0827, lon: 80.2707, timezone: 'Asia/Kolkata', cityId: 'chennai' },
  kolkata: { lat: 22.5726, lon: 88.3639, timezone: 'Asia/Kolkata', cityId: 'kolkata' },
  hyderabad: { lat: 17.3850, lon: 78.4867, timezone: 'Asia/Kolkata', cityId: 'hyderabad' }
};

const today = () => new Date().toISOString().slice(0, 10);

const isUsableKey = (value?: string) => Boolean(value && !value.includes('replace_with') && value.trim().length > 8);

const normalizeCity = (city: string) => city.trim().toLowerCase();

const locationFor = async (city: string) => {
  const known = cityCoordinates[normalizeCity(city)];
  if (known) return known;

  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`, {
    headers: { 'User-Agent': 'Jyot/1.0 (https://github.com/Developer-Parth/Jyot)' }
  });
  if (!response.ok) throw new Error('Unable to resolve city coordinates');

  const results = await response.json() as Array<{ lat: string; lon: string }>;
  if (!results[0]) throw new Error('City not found for panchang lookup');

  return {
    lat: Number(results[0].lat),
    lon: Number(results[0].lon),
    timezone: 'Asia/Kolkata',
    cityId: normalizeCity(city).replace(/\s+/g, '-')
  };
};

const daysLeft = (dateText: string) => {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
};

const asText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
    if (value && typeof value === 'object' && 'name' in value && typeof (value as { name?: unknown }).name === 'string') {
      return (value as { name: string }).name;
    }
  }
  return '';
};

const normalizeFestivals = (input: unknown): Festival[] => {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 8).map((festival) => {
    if (typeof festival === 'string') {
      return { name: festival, date: today(), daysLeft: 0 };
    }
    const item = festival as Record<string, unknown>;
    const date = asText(item.date, item.event_date, item.start_date) || today();
    return {
      name: asText(item.name, item.title) || 'Festival',
      date,
      daysLeft: typeof item.daysLeft === 'number' ? item.daysLeft : daysLeft(date)
    };
  });
};

const fromTathaAstu = async ({ city, lang }: PanchangRequest): Promise<PanchangResponse> => {
  if (!isUsableKey(process.env.TATHAASTU_API_KEY)) throw new Error('TathaAstu API key missing');

  const location = await locationFor(city);
  const date = today();
  const url = new URL('https://api.tathaastuapi.com/v1/panchang');
  url.searchParams.set('date', date);
  url.searchParams.set('lat', String(location.lat));
  url.searchParams.set('lon', String(location.lon));
  url.searchParams.set('lang', lang || 'en');

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.TATHAASTU_API_KEY}` }
  });
  if (!response.ok) throw new Error(`TathaAstu returned ${response.status}`);

  const raw = await response.json() as Record<string, any>;
  const data = raw.data || raw;
  const muhurat = data.muhurat || data.muhurta || {};

  return {
    city,
    source: 'TathaAstu API',
    date,
    tithi: [asText(data.tithi), asText(data.tithi?.paksha)].filter(Boolean).join(' ') || 'Unavailable',
    nakshatra: asText(data.nakshatra) || 'Unavailable',
    samvat: asText(data.samvat, data.vikram_samvat, data.hindu_year) || 'Unavailable',
    sunrise: asText(data.sunrise, data.sun?.rise) || 'Unavailable',
    sunset: asText(data.sunset, data.sun?.set) || 'Unavailable',
    brahmaMuhurta: asText(muhurat.brahma, muhurat.brahma_muhurta, data.brahma_muhurta) || 'Unavailable',
    abhijitMuhurta: asText(muhurat.abhijit, muhurat.abhijit_muhurta, data.abhijit_muhurta) || 'Unavailable',
    rahuKaal: asText(data.rahu_kaal, data.rahukaal, data.rahuKaal) || 'Unavailable',
    festivals: normalizeFestivals(data.festivals || data.events)
  };
};

const fromDevDarsha = async ({ city }: PanchangRequest): Promise<PanchangResponse> => {
  if (!isUsableKey(process.env.DEVDARSHA_API_KEY)) throw new Error('DevDarsha API key missing');

  const location = await locationFor(city);
  const date = today();
  const response = await fetch('https://panchang.devdarsha.com/v1/panchang/daily', {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.DEVDARSHA_API_KEY || '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date,
      city_id: location.cityId,
      lat: location.lat,
      lon: location.lon,
      timezone: location.timezone,
      faith_filter: 'hindu'
    })
  });
  if (!response.ok) throw new Error(`DevDarsha returned ${response.status}`);

  const raw = await response.json() as Record<string, any>;
  const data = raw.data || raw;
  const muhurat = data.muhurat || {};

  return {
    city,
    source: 'DevDarsha API',
    date,
    tithi: [asText(data.tithi), asText(data.tithi?.paksha)].filter(Boolean).join(' ') || 'Unavailable',
    nakshatra: asText(data.nakshatra) || 'Unavailable',
    samvat: asText(data.samvat, data.vikram_samvat) || 'Unavailable',
    sunrise: asText(data.sunrise) || 'Unavailable',
    sunset: asText(data.sunset) || 'Unavailable',
    brahmaMuhurta: asText(muhurat.brahma, data.brahma_muhurta) || 'Unavailable',
    abhijitMuhurta: asText(muhurat.abhijit, data.abhijit_muhurta) || 'Unavailable',
    rahuKaal: asText(data.rahu_kaal, data.rahukaal) || 'Unavailable',
    festivals: normalizeFestivals(data.festivals)
  };
};

export class PanchangService {
  static async getDailyPanchang(request: PanchangRequest): Promise<PanchangResponse> {
    const errors: string[] = [];

    for (const provider of [fromTathaAstu, fromDevDarsha]) {
      try {
        return await provider(request);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown panchang provider error');
      }
    }

    throw new Error(`Real panchang unavailable. Configure TATHAASTU_API_KEY or DEVDARSHA_API_KEY. Details: ${errors.join('; ')}`);
  }
}
