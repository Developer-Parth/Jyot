import { Request, Response } from 'express';
import { AiService } from '../services/AiService.js';
import { ReadingModel } from '../models/Reading.js';

export class PalmReadingController {
  static async readPalm(req: Request, res: Response) {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        res.status(400).json({ error: "Image data is required" });
        return;
      }

      // Remove the prefix "data:image/jpeg;base64," if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      // 1. Call Service
      const reading = await AiService.getPalmReading(base64Data);

      // 2. Call Model to save in DB
      ReadingModel.create({ reading_text: reading });

      // 3. Return response
      res.json({ reading });
    } catch (error) {
      console.error("Palm reading error:", error);
      res.status(500).json({ error: "Failed to read palm. Please try another image." });
    }
  }
}
