console.log('[BOOT] api/services/AiService.ts loaded');

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
try {
  dotenv.config();
  console.log('[AI] dotenv.config() OK');
} catch (e: any) {
  console.error('[AI] dotenv.config() FAILED:', e?.message);
}

const geminiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7,
  process.env.GEMINI_API_KEY_8,
  process.env.GEMINI_API_KEY_9,
  process.env.GEMINI_API_KEY_10,
  ...(process.env.GEMINI_API_KEYS || '').split(',')
].map((key) => key?.trim()).filter(Boolean) as string[];

console.log(`[AI] geminiKeys count: ${geminiKeys.length}`);

const getClient = (apiKey: string) => new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'jyot-spiritual-guide',
    },
  },
});

const invalidKeys = new Set<string>();

const imagePart = (base64Data: string, mimeType = 'image/jpeg') => ({
  inlineData: { mimeType, data: base64Data },
});

async function tryKeys(prompt: string, base64Data: string, mimeType = 'image/jpeg'): Promise<string> {
  if (geminiKeys.length === 0) throw new Error('AI service configuration issue.');

  let lastErrorMessage = 'Unexpected AI server error.';

  for (let i = 0; i < geminiKeys.length; i++) {
    const apiKey = geminiKeys[i];
    if (invalidKeys.has(apiKey)) continue;

    console.log(`[AI] trying key[${i}]`);
    try {
      const aiResponse = await getClient(apiKey).models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart(base64Data, mimeType), { text: prompt }] },
      });

      if (aiResponse.text) {
        console.log(`[AI] key[${i}] success`);
        return aiResponse.text;
      }

      lastErrorMessage = 'Unexpected AI server error.';
    } catch (error: any) {
      const status = error?.status || error?.code || error?.response?.status || 0;
      const msg = (error?.message || '').toLowerCase();

      if (status === 403 || msg.includes('reported as leaked') || msg.includes('api key not valid')) {
        invalidKeys.add(apiKey);
        console.log(`[AI] key[${i}] permanently disabled (leaked)`);
        lastErrorMessage = 'AI service configuration issue.';
        continue;
      }

      if (status === 429 || msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('rate')) {
        console.log(`[AI] key[${i}] quota exhausted`);
        lastErrorMessage = 'AI service busy. Please try again later.';
        continue;
      }

      if (msg.includes('timed out') || msg.includes('timeout') || msg.includes('abort') || msg.includes('deadline')) {
        console.log(`[AI] key[${i}] timed out`);
        lastErrorMessage = 'AI request timed out.';
        continue;
      }

      console.log(`[AI] key[${i}] failed:`, error?.message || error);
      lastErrorMessage = 'Unexpected AI server error.';
    }
  }

  console.error('[AI] All keys exhausted, throwing');
  throw new Error(lastErrorMessage);
}

export class AiService {
  static async validatePalmImage(base64Data: string): Promise<boolean> {
    console.log('[AI] validatePalmImage called');
    const prompt = 'Does this image contain a clear, visible human palm (open hand, fingers visible)? Answer only with a single word: yes or no.';
    try {
      const result = await tryKeys(prompt, base64Data);
      const answer = result.trim().toLowerCase().replace(/[^a-z]/g, '');
      console.log(`[AI] validatePalmImage raw response: "${result}" → parsed: "${answer}"`);
      return answer === 'yes';
    } catch {
      console.warn('[AI] validatePalmImage failed, allowing through');
      return true;
    }
  }

  static async getPalmReading(base64Data: string): Promise<string> {
    console.log('[AI] getPalmReading called, base64Data.length:', base64Data.length);

    const prompt = 'Analyze this palm image based on Vedic astrology and palmistry principles. Please provide a respectful, positive, but detailed reading covering Life Line, Heart Line, Head Line, and Fate Line. Offer practical insights about the user\'s future, career, and emotional well-being. Make it engaging, mystical yet modern, and format the output beautifully using Markdown. Include a gentle disclaimer that this is spiritual guidance, not a guaranteed prediction.';

    return tryKeys(prompt, base64Data);
  }
}
