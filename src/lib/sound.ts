import { TextToSpeech } from '@capacitor-community/text-to-speech';

const isCapacitor = typeof (window as any).Capacitor !== 'undefined';

let voices: SpeechSynthesisVoice[] = [];

const ensureVoices = (): SpeechSynthesisVoice[] => {
  if (voices.length > 0) return voices;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const v = window.speechSynthesis.getVoices();
  if (v.length > 0) voices = v;
  return voices;
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  ensureVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices() || [];
  };
}

const getHindiVoice = () => {
  const all = ensureVoices();
  return all.find(v => v.lang.startsWith('hi')) || all.find(v => v.lang.startsWith('en'));
};

export const playChant = async (text: string, language: 'en' | 'hi' = 'hi') => {
  if (!text) return;

  if (isCapacitor) {
    try {
      await TextToSpeech.speak({
        text,
        lang: language === 'hi' ? 'hi-IN' : 'en-IN',
        rate: 0.82,
        pitch: 0.85,
      });
      return;
    } catch (e) {
      console.warn('[SPEECH] Capacitor TTS failed, falling back:', e);
    }
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.82;
    utterance.pitch = 0.85;

    const voice = getHindiVoice();
    if (voice) utterance.voice = voice;

    utterance.onerror = (e) => {
      if ((e as any)?.error !== 'canceled') {
        console.warn('[SPEECH] error:', e);
      }
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  } catch (e) {
    console.warn('[SPEECH]', e);
  }
};

export const stopChant = async () => {
  if (isCapacitor) {
    try {
      await TextToSpeech.stop();
      return;
    } catch {
      // fall through to Web Speech
    }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
