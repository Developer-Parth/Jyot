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

export class AiService {
  static async getPalmReading(base64Data: string): Promise<string> {
    if (geminiKeys.length === 0) {
      throw new Error('No Gemini API keys configured');
    }

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    };

    const textPart = {
      text: 'Analyze this palm image based on Vedic astrology and palmistry principles. Please provide a respectful, positive, but detailed reading covering Life Line, Heart Line, Head Line, and Fate Line. Offer practical insights about the user\'s future, career, and emotional well-being. Make it engaging, mystical yet modern, and format the output beautifully using Markdown. Include a gentle disclaimer that this is spiritual guidance, not a guaranteed prediction.',
    };

    let lastError: unknown;

    for (const apiKey of geminiKeys) {
      try {
        const aiResponse = await getClient(apiKey).models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, textPart] },
        });

        if (aiResponse.text) {
          return aiResponse.text;
        }

        lastError = new Error('No response from AI');
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error('All Gemini API keys failed');
  }
}
