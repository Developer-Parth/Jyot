import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, CircleDashed, Sparkles, BookOpen, Heart, Calendar, MessageCircle, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { APP_NAME, APP_AUTHOR, APP_AUTHOR_URL } from '../lib/branding';

const faqs = [
  {
    icon: CircleDashed,
    title: 'Jaap Mala (जप माला)',
    titleHi: 'जप माला',
    english: `The Jaap counter helps you track mantra repetitions (japa). 
• Tap the center to count each chant
• Set a goal (108, 216, 540, or 1080)
• Tap the speaker to hear the mantra
• Your progress auto-saves
    
What is 108? It's a sacred number — 108 represents the universe (1 = self, 0 = emptiness, 8 = infinity).`,
    hindi: `जप काउंटर मंत्र जप की संख्या गिनने में मदद करता है।
• केंद्र पर टैप करें — एक जप गिना जाएगा
• अपना लक्ष्य निर्धारित करें (108, 216, 540, या 1080)
• मंत्र सुनने के लिए स्पीकर पर टैप करें
• आपकी प्रगति अपने आप सेव हो जाती है
    
108 क्यों? यह एक पवित्र संख्या है — 1 (स्वयं), 0 (शून्यता), 8 (अनंत)।`,
  },
  {
    icon: Sparkles,
    title: 'Palm Reading (हस्तरेखा)',
    titleHi: 'हस्तरेखा',
    english: `Upload a clear photo of your palm for an AI-powered reading based on Vedic palmistry.
• Hold your palm flat, fingers open
• Good lighting, no shadows
• The AI analyzes Life Line, Heart Line, Head Line, and Fate Line
• Readings are for spiritual reflection only
    
Tip: Use your right palm (left is also accepted).`,
    hindi: `वैदिक हस्तरेखा के आधार पर अपनी हथेली की स्पष्ट फ़ोटो अपलोड करें।
• हथेली को सपाट रखें, उंगलियां खुली हों
• अच्छी रोशनी में, परछाई न हो
• AI जीवन रेखा, हृदय रेखा, मस्तिष्क रेखा और भाग्य रेखा का विश्लेषण करता है
• यह आध्यात्मिक मार्गदर्शन है, निश्चित भविष्यवाणी नहीं`,
  },
  {
    icon: BookOpen,
    title: 'Puja Vidhi (पूजा विधि)',
    titleHi: 'पूजा विधि',
    english: `Guided step-by-step puja rituals with item checklists and mantra chanting.
• Choose a puja (Shiva, Satyanarayan, Ganesh, Durga, Hanuman)
• Check off items as you gather them
• Follow each step with mantra audio
• Complete the puja and get a sense of peace
    
Each puja includes the required items (samagri), step-by-step instructions (vidhi), and chants (mantra).`,
    hindi: `पूजा की चरणबद्ध विधि — सामग्री सूची और मंत्र के साथ।
• पूजा चुनें (शिव, सत्यनारायण, गणेश, दुर्गा, हनुमान)
• सामग्री एकत्र करके चेक करें
• मंत्र के साथ हर चरण का पालन करें
• पूजा पूर्ण करें
    
हर पूजा में सामग्री, विधि और मंत्र शामिल हैं।`,
  },
  {
    icon: Heart,
    title: 'Wish Vault (मनोकामना)',
    titleHi: 'मनोकामना',
    english: `Record your wishes with a short video message (max 30 seconds).
• Write your wish title and description
• Record a video message
• Videos are stored safely on your device only
• Revisit your wishes anytime
    
Your wishes are private — videos never leave your phone.`,
    hindi: `अपनी मनोकामनाओं को 30 सेकंड के वीडियो संदेश के साथ रिकॉर्ड करें।
• अपनी मनोकामना का शीर्षक और विवरण लिखें
• वीडियो संदेश रिकॉर्ड करें
• वीडियो केवल आपके डिवाइस पर सुरक्षित रहते हैं
• कभी भी अपनी मनोकामनाएं देखें
    
आपकी मनोकामनाएं गोपनीय हैं — वीडियो आपका फ़ोन कभी नहीं छोड़ते।`,
  },
  {
    icon: Calendar,
    title: 'Panchang (पंचांग)',
    titleHi: 'पंचांग',
    english: `Daily Hindu calendar with auspicious timings, festivals, and planetary positions.
• View today's tithi, nakshatra, and yoga
• See upcoming festivals
• Add festivals to your phone calendar
• Panchang data is fetched live
    
The panchang updates daily based on your city.`,
    hindi: `दैनिक हिंदू कैलेंडर — शुभ मुहूर्त, त्योहार और ग्रह स्थिति।
• आज की तिथि, नक्षत्र और योग देखें
• आने वाले त्योहार देखें
• अपने फ़ोन कैलेंडर में त्योहार जोड़ें
• पंचांग लाइव अपडेट होता है
    
पंचांग आपके शहर के अनुसार प्रतिदिन अपडेट होता है।`,
  },
  {
    icon: MessageCircle,
    title: 'Terms & Glossary (शब्दावली)',
    titleHi: 'शब्दावली',
    english: `• Tithi — Lunar day (15 in each fortnight)
• Nakshatra — Lunar mansion (27 total)
• Yoga — Auspicious time window
• Karana — Half of a tithi
• Rahu Kaal — Inauspicious period (avoid starting new things)
• Abhijit Muhurat — Auspicious 48-minute window
• Gotra — Lineage/clan identity
• Samagri — Items needed for puja
• Vidhi — Step-by-step ritual procedure`,
    hindi: `• तिथि — चंद्र दिवस (प्रत्येक पक्ष में 15)
• नक्षत्र — चंद्र भवन (कुल 27)
• योग — शुभ समय सीमा
• करण — तिथि का आधा भाग
• राहु काल — अशुभ समय (नया कार्य न करें)
• अभिजीत मुहूर्त — 48 मिनट का शुभ समय
• गोत्र — वंश/पारिवारिक पहचान
• सामग्री — पूजा के लिए आवश्यक वस्तुएं
• विधि — चरणबद्ध पूजा प्रक्रिया`,
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden pb-24">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-amber-100/70 hover:text-amber-100">
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-serif text-amber-50">Help & Guide</h1>
          </div>
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-100/10 text-amber-100 border border-amber-500/20"
          >
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
        <p className="text-amber-100/60 text-xs">
          {lang === 'en' ? `Learn how to use ${APP_NAME} and understand spiritual terms` : `${APP_NAME} का उपयोग और आध्यात्मिक शब्दों को समझें`}
        </p>
      </header>

      <div className="p-4 space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-[#fff8ea]/90 backdrop-blur-md rounded-2xl border border-amber-200/70 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <faq.icon className="w-5 h-5 text-rose-700" />
              </div>
              <span className="flex-1 font-serif text-base text-stone-950">
                {lang === 'en' ? faq.title : faq.titleHi}
              </span>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0">
                    <div className="border-t border-amber-100 pt-3 text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                      {lang === 'en' ? faq.english : faq.hindi}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="p-4 text-center text-xs text-stone-400">
        {lang === 'en'
          ? `${APP_NAME} is a spiritual companion — all readings are for reflection and entertainment.`
          : `${APP_NAME} एक आध्यात्मिक साथी है — सभी रीडिंग चिंतन और मनोरंजन के लिए हैं।`}
      </div>

      <div className="px-4 pb-6 flex justify-center gap-4 text-xs">
        <Link to="/terms" className="text-stone-400 hover:text-amber-700 underline underline-offset-2">Terms</Link>
        <Link to="/privacy-policy" className="text-stone-400 hover:text-amber-700 underline underline-offset-2">Privacy Policy</Link>
      </div>

      <p className="pb-6 text-center text-xs text-stone-400">
        Made by{' '}
        <a href={APP_AUTHOR_URL} target="_blank" rel="noreferrer" className="text-amber-700 underline hover:text-amber-900">{APP_AUTHOR}</a>
      </p>
    </div>
  );
}
