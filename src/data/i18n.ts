export type Language = 'en' | 'hi';

export const languageLabels: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी'
};

export const getLanguage = (): Language => {
  const stored = localStorage.getItem('language');
  return stored === 'hi' ? 'hi' : 'en';
};

export const setLanguage = (language: Language) => {
  localStorage.setItem('language', language);
};

export const t = (language: Language, en: string, hi: string) => language === 'hi' ? hi : en;
