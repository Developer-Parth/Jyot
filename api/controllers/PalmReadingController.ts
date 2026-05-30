console.log('[BOOT] api/controllers/PalmReadingController.ts loaded');

import { Request, Response } from 'express';
import { AiService } from '../services/AiService.js';
import { ReadingModel } from '../models/Reading.js';

export class PalmReadingController {
  static async readPalm(req: Request, res: Response) {
    try {
      console.log('[PALM] readPalm called, body keys:', Object.keys(req.body));

      const { imageBase64 } = req.body;
      if (!imageBase64) {
        console.log('[PALM] missing imageBase64 in body');
        res.status(400).json({ error: 'Image data is required' });
        return;
      }

      const userId = req.user?.userId;
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      console.log('[PALM] base64Data length after strip:', base64Data.length);

      console.log('[PALM] calling AiService.getPalmReading()...');
      const reading = await AiService.getPalmReading(base64Data);
      console.log('[PALM] AiService.getPalmReading() succeeded, reading length:', reading?.length);

      console.log('[PALM] calling ReadingModel.create()...');
      await ReadingModel.create({ reading_text: reading, user_id: userId });
      console.log('[PALM] ReadingModel.create() succeeded');

      res.json({ reading });
    } catch (error) {
      console.error('[PALM] Error:', error);
      const message = error instanceof Error ? error.message : 'Unexpected AI server error.';
      res.status(500).json({ error: message });
    }
  }
}
