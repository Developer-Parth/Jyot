import type { Express } from 'express';
import { createApp } from '../server';

let app: Express;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await createApp();
  }
  app(req, res);
}
