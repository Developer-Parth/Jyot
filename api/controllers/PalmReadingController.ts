console.log('[BOOT] api/controllers/PalmReadingController.ts loaded');

import { Request, Response } from 'express';
import { AiService } from '../services/AiService.js';
import { ReadingModel } from '../models/Reading.js';
import { supabaseAdmin, BUCKET_NAME, isStorageConfigured, ensureBucket } from '../supabase-admin.js';

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
      const mimeMatch = imageBase64.match(/^data:image\/(\w+);base64,/);
      const mimeType = mimeMatch ? `image/${mimeMatch[1]}` : 'image/jpeg';
      const ext = mimeMatch ? mimeMatch[1] : 'jpg';
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      console.log('[PALM] base64Data length after strip:', base64Data.length);

      const isValid = await AiService.validatePalmImage(base64Data);
      if (!isValid) {
        console.log('[PALM] image rejected — not a human palm');
        res.status(400).json({ error: 'कृपया अपनी हथेली की स्पष्ट फ़ोटो अपलोड करें। Please upload a clear photo of your palm.' });
        return;
      }

      console.log('[PALM] calling AiService.getPalmReading()...');
      const reading = await AiService.getPalmReading(base64Data);
      console.log('[PALM] AiService.getPalmReading() succeeded, reading length:', reading?.length);

      // Upload image to Supabase Storage (fire-and-forget style, but await for path)
      let imagePath = '';
      if (isStorageConfigured()) {
        try {
          await ensureBucket();
          const buffer = Buffer.from(base64Data, 'base64');
          imagePath = `palm-readings/${userId}/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabaseAdmin!.storage
            .from(BUCKET_NAME)
            .upload(imagePath, buffer, { contentType: mimeType, upsert: false });
          if (uploadError) {
            console.warn('[PALM] Image upload failed:', uploadError.message);
            imagePath = '';
          } else {
            console.log('[PALM] Image uploaded to:', imagePath);
          }
        } catch (e: any) {
          console.warn('[PALM] Image upload error:', e.message);
        }
      }

      console.log('[PALM] calling ReadingModel.create()...');
      await ReadingModel.create({ reading_text: reading, user_id: userId, image_path: imagePath });
      console.log('[PALM] ReadingModel.create() succeeded');

      res.json({ reading });
    } catch (error) {
      console.error('[PALM] Error:', error);
      const message = error instanceof Error ? error.message : 'Unexpected AI server error.';
      res.status(500).json({ error: message });
    }
  }
}
