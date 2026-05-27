import store from '../storage';

export interface Reading {
  id?: number;
  user_id?: number;
  reading_text: string;
  created_at?: string;
}

export class ReadingModel {
  static async create(data: { reading_text: string; user_id?: number }): Promise<number> {
    const item = await store.create('palm_readings', {
      reading_text: data.reading_text,
      user_id: data.user_id || null,
    });
    return item.id;
  }
}
