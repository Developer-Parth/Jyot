import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Star, CheckCircle2, Circle, CheckCircle, Info, PlayCircle, ShoppingBag, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { amazonSearchUrl, getPujaById } from '../data/pujas';
import { getLanguage, languageLabels, setLanguage, t, type Language } from '../data/i18n';
import { playChant, stopChant } from '../lib/sound';

export default function PujaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'samagri' | 'vidhi'>('overview');
  const [language, updateLanguage] = useState<Language>(getLanguage());

  const basePuja = getPujaById(Number(id)) || getPujaById(1)!;
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const changeLanguage = (value: Language) => {
    setLanguage(value);
    updateLanguage(value);
  };

  const toggleSamagri = (itemId: number) => {
    setCheckedItems((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
  };

  const allChecked = checkedItems.length === basePuja.samagri.length;

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden pb-24">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => { stopChant(); navigate(-1); }} className="p-2 -ml-2 text-amber-100/70 hover:text-amber-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">{t(language, basePuja.deity, basePuja.deityHi)}</span>
                {basePuja.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> {t(language, 'Verified', 'सत्यापित')}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-serif text-amber-50 leading-tight truncate">{t(language, basePuja.title, basePuja.titleHi)}</h1>
            </div>
          </div>
          <select value={language} onChange={(event) => changeLanguage(event.target.value as Language)} className="bg-amber-100 text-stone-950 rounded-xl px-2 py-2 text-xs font-medium outline-none">
            {Object.entries(languageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-amber-100/70 mb-6">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {basePuja.duration}
          </div>
          <div className="flex items-center gap-1 text-amber-300 font-medium">
            <Star className="w-4 h-4 fill-amber-400" /> {basePuja.rating}
          </div>
          <button onClick={() => playChant(basePuja.soundText, language)} className="ml-auto flex items-center gap-1 text-amber-100">
            <Volume2 className="w-4 h-4" /> {t(language, 'Play', 'सुनें')}
          </button>
        </div>

        <div className="flex bg-amber-100/10 p-1 rounded-xl border border-amber-200/20">
          {(['overview', 'samagri', 'vidhi'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                activeTab === tab ? 'bg-amber-100 text-stone-950 shadow-sm' : 'text-amber-100/70 hover:text-amber-100'
              }`}
            >
              {tab === 'overview' ? t(language, 'Overview', 'परिचय') : tab === 'samagri' ? t(language, 'Samagri', 'सामग्री') : t(language, 'Vidhi', 'विधि')}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-[#fff8ea]/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-amber-200/70">
              <h3 className="font-serif text-lg text-stone-950 mb-2">{t(language, 'About this Puja', 'इस पूजा के बारे में')}</h3>
              <p className="text-stone-700 text-sm leading-relaxed">{t(language, basePuja.overview, basePuja.overviewHi)}</p>
            </div>

            <div className="bg-amber-50/95 p-5 rounded-2xl border border-amber-200/70 flex gap-4 items-start">
              <Info className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-stone-950 mb-1">{t(language, 'Before you begin', 'शुरू करने से पहले')}</h4>
                <p className="text-sm text-stone-700">{t(language, 'Take a bath, wear clean clothes, sit facing East or North, and keep all samagri ready.', 'स्नान करें, स्वच्छ वस्त्र पहनें, पूर्व या उत्तर दिशा में बैठें और सभी सामग्री पहले से तैयार रखें।')}</p>
              </div>
            </div>

            <button onClick={() => setActiveTab('samagri')} className="w-full py-4 rounded-xl bg-stone-950 text-amber-50 font-medium shadow-lg hover:bg-stone-800 transition-colors">
              {t(language, 'Check Samagri List', 'सामग्री सूची देखें')}
            </button>
          </motion.div>
        )}

        {activeTab === 'samagri' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <h3 className="font-serif text-lg text-amber-50">{t(language, 'Required Items', 'आवश्यक सामग्री')}</h3>
              <span className="text-xs font-medium text-amber-100/80">
                {checkedItems.length} / {basePuja.samagri.length} {t(language, 'Ready', 'तैयार')}
              </span>
            </div>

            <div className="bg-[#fff8ea]/90 backdrop-blur-md rounded-2xl shadow-sm border border-amber-200/70 overflow-hidden">
              {basePuja.samagri.map((item, index) => {
                const checked = checkedItems.includes(item.id);
                return (
                  <div key={item.id} className={`flex items-center gap-3 p-4 transition-colors ${index !== basePuja.samagri.length - 1 ? 'border-b border-amber-100' : ''} ${checked ? 'bg-stone-50' : 'hover:bg-stone-50'}`}>
                    <button onClick={() => toggleSamagri(item.id)} className="shrink-0">
                      {checked ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-stone-300" />}
                    </button>
                    <button onClick={() => toggleSamagri(item.id)} className={`text-left text-sm flex-1 ${checked ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                      {t(language, item.name, item.hindiName)}
                    </button>
                    <a href={amazonSearchUrl(item.name)} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-amber-100 text-rose-700 flex items-center justify-center" title={t(language, 'Buy item', 'खरीदें')}>
                      <ShoppingBag className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveTab('vidhi')}
              disabled={!allChecked}
              className={`w-full py-4 rounded-xl font-medium shadow-lg transition-colors ${
                allChecked ? 'bg-rose-700 text-white hover:bg-rose-800 shadow-rose-700/20' : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {allChecked ? t(language, 'Start Vidhi', 'विधि शुरू करें') : t(language, 'Gather all items to start', 'शुरू करने के लिए सारी सामग्री तैयार करें')}
            </button>
          </motion.div>
        )}

        {activeTab === 'vidhi' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {basePuja.steps.map((step, index) => (
              <div key={step.step} className="relative pl-8">
                {index !== basePuja.steps.length - 1 && <div className="absolute left-3.5 top-8 bottom-[-24px] w-px bg-amber-200"></div>}
                <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-amber-100 text-rose-700 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                  {step.step}
                </div>
                <div className="bg-[#fff8ea]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-amber-200/70">
                  <h4 className="font-medium text-stone-950 mb-2">{t(language, step.title, step.titleHi)}</h4>
                  <p className="text-sm text-stone-700 mb-3">{t(language, step.instruction, step.instructionHi)}</p>

                  {step.mantra && (
                    <button onClick={() => playChant(step.audioText || step.mantra || '', language)} className="w-full text-left bg-amber-50/80 p-3 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-1">
                        <PlayCircle className="w-4 h-4 text-rose-700" />
                        <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">{t(language, 'Chant', 'मंत्र')}</span>
                      </div>
                      <p className="text-sm font-medium text-stone-950 italic">"{step.mantra}"</p>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4">
              <button
                onClick={() => {
                  stopChant();
                  navigate('/home');
                }}
                className="w-full py-4 rounded-xl bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> {t(language, 'Complete Puja', 'पूजा पूर्ण करें')}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
