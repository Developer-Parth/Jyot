const defaultVoice = () => {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return voices.find((voice) => voice.lang.toLowerCase().startsWith('hi')) || voices.find((voice) => voice.lang.toLowerCase().startsWith('en'));
};

export const playChant = (text: string, language: 'en' | 'hi' = 'hi') => {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = 0.82;
  utterance.pitch = 0.85;
  const voice = defaultVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
};

export const stopChant = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
