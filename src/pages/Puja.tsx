import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Clock, CheckCircle2, Star, ShoppingBag, ChevronRight, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { amazonSearchUrl, pujas } from '../data/pujas';
import { getLanguage, languageLabels, setLanguage, t, type Language } from '../data/i18n';
import { playChant } from '../lib/sound';

export default function Puja() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [language, updateLanguage] = useState<Language>(getLanguage());

  const categories = ['All', 'Daily', 'Deity', 'Occasion', 'Festival'];
  const filteredPujas = pujas.filter((puja) =>
    (activeCategory === 'All' || puja.category === activeCategory) &&
    `${puja.title} ${puja.titleHi} ${puja.deity} ${puja.deityHi}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!verifiedOnly || puja.verified)
  );

  const changeLanguage = (value: Language) => {
    setLanguage(value);
    updateLanguage(value);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden pb-24">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-serif text-amber-50">{t(language, 'Puja Vidhi', 'पूजा विधि')}</h1>
            <p className="text-xs text-amber-100/70">{t(language, 'Authentic step-by-step guides', 'प्रामाणिक चरणबद्ध मार्गदर्शन')}</p>
          </div>
          <select value={language} onChange={(event) => changeLanguage(event.target.value as Language)} className="bg-amber-100 text-stone-950 rounded-xl px-3 py-2 text-xs font-medium outline-none">
            {Object.entries(languageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700" />
          <input
            type="text"
            placeholder={t(language, 'Search pujas, deities, occasions...', 'पूजा, देवता या अवसर खोजें...')}
            className="w-full pl-10 pr-4 py-3 bg-amber-50/95 border border-amber-200/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${showFilters ? 'text-rose-700' : 'text-stone-400 hover:text-rose-700'}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 bg-[#fff8ea]/90 backdrop-blur-md p-3 rounded-xl border border-amber-200/70 shadow-sm flex items-center justify-between">
            <span className="text-sm text-stone-700 font-medium">{t(language, 'Verified Pujas Only', 'केवल सत्यापित पूजा')}</span>
            <button onClick={() => setVerifiedOnly(!verifiedOnly)} className={`w-10 h-6 rounded-full transition-colors relative ${verifiedOnly ? 'bg-rose-700' : 'bg-stone-200'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${verifiedOnly ? 'left-5' : 'left-1'}`} />
            </button>
          </motion.div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-amber-100 text-stone-950 shadow-md' : 'bg-amber-100/10 text-amber-100 hover:bg-amber-100/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {filteredPujas.map((puja) => (
          <motion.div
            key={puja.id}
            onClick={() => navigate(`/puja/${puja.id}`)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="bg-[#fff8ea]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-amber-200/70 flex flex-col gap-3 group cursor-pointer hover:border-rose-300 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-widest text-rose-700 uppercase">{puja.category}</span>
                  {puja.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> {t(language, 'Verified', 'सत्यापित')}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg text-stone-900 leading-tight mb-1 group-hover:text-rose-700 transition-colors">{t(language, puja.title, puja.titleHi)}</h3>
                <p className="text-xs text-stone-500">{t(language, 'Deity', 'देवता')}: {t(language, puja.deity, puja.deityHi)}</p>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  playChant(puja.soundTextHi || puja.soundText, 'hi');
                }}
                className="w-12 h-12 rounded-xl bg-amber-100 text-rose-700 flex items-center justify-center shrink-0"
                title={t(language, 'Play chant', 'मंत्र सुनें')}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-amber-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-stone-500">
                  <Clock className="w-3.5 h-3.5" />
                  {puja.duration}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {puja.rating}
                </div>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-rose-700 hover:text-rose-800">
                {t(language, 'Start', 'शुरू करें')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {filteredPujas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-1">{t(language, 'No pujas found', 'कोई पूजा नहीं मिली')}</h3>
            <p className="text-stone-500 text-sm">{t(language, 'Try adjusting your search or filters.', 'खोज या फिल्टर बदलकर देखें।')}</p>
          </div>
        )}
      </div>

      <div className="mt-auto p-4">
        <a href={amazonSearchUrl('puja samagri kit')} target="_blank" rel="noreferrer" className="bg-gradient-to-r from-stone-950 to-rose-900 rounded-2xl p-4 text-amber-50 shadow-lg shadow-stone-900/20 flex items-center justify-between">
          <div>
            <h4 className="font-serif font-medium mb-1">{t(language, 'Need Samagri?', 'पूजा सामग्री चाहिए?')}</h4>
            <p className="text-xs text-amber-100/80">{t(language, 'Shop puja essentials', 'पूजा सामग्री खरीदें')}</p>
          </div>
          <span className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <ShoppingBag className="w-5 h-5" />
          </span>
        </a>
      </div>
    </div>
  );
}
