import { Request, Response, NextFunction } from 'express';

const MAX_NAME = 100;
const MAX_CITY = 100;
const MAX_DEITY = 100;
const MAX_GOTRA = 100;
const MAX_MANTRA = 200;
const MAX_IMAGE_BASE64 = 4 * 1024 * 1024;
const MAX_WISH_TITLE = 200;
const MAX_WISH_DESC = 2000;

function sanitize(v: string): string {
  return v.replace(/<[^>]*>/g, '').trim();
}

function isValidDate(v: string): boolean {
  const d = new Date(v);
  if (isNaN(d.getTime())) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d < tomorrow;
}

function logRejection(route: string, reason: string, ip: string) {
  console.log(`[SECURITY] Rejected ${route}: ${reason} (ip=${ip})`);
}

export const PASSWORD_RULES = {
  minLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true,
};

export function validatePassword(password: string): string | null {
  if (!password || password.length < PASSWORD_RULES.minLength) {
    return 'Password must be at least 8 characters.';
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter.';
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(password)) {
    return 'Password must include at least one number.';
  }
  if (PASSWORD_RULES.requireSpecial && !/[^a-zA-Z0-9]/.test(password)) {
    return 'Password must include at least one special character.';
  }
  return null;
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '?';
  const { phone, password } = req.body;

  if (typeof phone !== 'string' || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    logRejection('/auth/login', 'invalid phone', ip);
    return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
  }
  req.body.phone = phone.replace(/\D/g, '').slice(0, 10);

  if (typeof password !== 'string' || password.length < 1) {
    logRejection('/auth/login', 'missing password', ip);
    return res.status(400).json({ error: 'Password is required.' });
  }

  next();
}

export function validateRegistration(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '?';
  const { name, phone, city, birthDate, deity, gotra, password } = req.body;

  if (typeof name !== 'string' || name.length < 1 || name.length > MAX_NAME) {
    logRejection('/auth/register', 'invalid name', ip);
    return res.status(400).json({ error: 'Name is required (max 100 chars).' });
  }
  req.body.name = sanitize(name);

  if (typeof phone !== 'string' || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    logRejection('/auth/register', 'invalid phone', ip);
    return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
  }
  req.body.phone = phone.replace(/\D/g, '').slice(0, 10);

  if (typeof city !== 'string' || city.length < 1 || city.length > MAX_CITY) {
    logRejection('/auth/register', 'invalid city', ip);
    return res.status(400).json({ error: 'City is required (max 100 chars).' });
  }
  req.body.city = sanitize(city);

  if (birthDate && (typeof birthDate !== 'string' || !isValidDate(birthDate))) {
    logRejection('/auth/register', 'invalid birthDate', ip);
    return res.status(400).json({ error: 'Invalid birth date.' });
  }

  if (deity && typeof deity === 'string') {
    req.body.deity = sanitize(deity).slice(0, MAX_DEITY);
  }
  if (gotra && typeof gotra === 'string') {
    req.body.gotra = sanitize(gotra).slice(0, MAX_GOTRA);
  }

  if (typeof password !== 'string') {
    logRejection('/auth/register', 'missing password', ip);
    return res.status(400).json({ error: 'Password is required.' });
  }

  const pwErr = validatePassword(password);
  if (pwErr) {
    logRejection('/auth/register', 'weak password', ip);
    return res.status(400).json({ error: pwErr });
  }

  next();
}

export function validateUserUpdate(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '?';
  const { name, phone, city, birthDate, deity, gotra } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.length < 1 || name.length > MAX_NAME) {
      logRejection('/users/:id', 'invalid name', ip);
      return res.status(400).json({ error: 'Name must be 1-100 chars.' });
    }
    req.body.name = sanitize(name);
  }

  if (phone !== undefined) {
    if (typeof phone !== 'string' || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      logRejection('/users/:id', 'invalid phone', ip);
      return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
    }
    req.body.phone = phone.replace(/\D/g, '').slice(0, 10);
  }

  if (city !== undefined) {
    if (typeof city !== 'string' || city.length < 1 || city.length > MAX_CITY) {
      logRejection('/users/:id', 'invalid city', ip);
      return res.status(400).json({ error: 'City must be 1-100 chars.' });
    }
    req.body.city = sanitize(city);
  }

  if (birthDate !== undefined && (typeof birthDate !== 'string' || !isValidDate(birthDate))) {
    logRejection('/users/:id', 'invalid birthDate', ip);
    return res.status(400).json({ error: 'Invalid birth date.' });
  }

  if (deity !== undefined && typeof deity === 'string') {
    req.body.deity = sanitize(deity).slice(0, MAX_DEITY);
  }
  if (gotra !== undefined && typeof gotra === 'string') {
    req.body.gotra = sanitize(gotra).slice(0, MAX_GOTRA);
  }

  next();
}

export function validatePalmReading(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '?';
  const { imageBase64 } = req.body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    logRejection('/palm-reading', 'missing imageBase64', ip);
    return res.status(400).json({ error: 'Image data is required.' });
  }

  if (imageBase64.length > MAX_IMAGE_BASE64) {
    logRejection('/palm-reading', `base64 payload too large: ${imageBase64.length}`, ip);
    return res.status(413).json({ error: 'Image too large. Please upload a smaller image.' });
  }

  if (!/^data:image\/(jpeg|png|webp);base64,/.test(imageBase64)) {
    logRejection('/palm-reading', 'invalid mime type', ip);
    return res.status(400).json({ error: 'Invalid image format. Accepted: JPEG, PNG, WebP.' });
  }

  const base64 = imageBase64.split(',')[1];
  if (!base64 || base64.length < 100) {
    logRejection('/palm-reading', 'base64 body too short or missing', ip);
    return res.status(400).json({ error: 'Image data appears corrupted. Please upload a valid image.' });
  }

  try {
    const decoded = Buffer.from(base64, 'base64');
    if (decoded.length < 1024) {
      logRejection('/palm-reading', 'decoded image too small', ip);
      return res.status(400).json({ error: 'Image data appears corrupted. Please upload a valid image.' });
    }
    const jpegHeader = decoded.slice(0, 3).toString('hex');
    const pngHeader = decoded.slice(0, 4).toString('hex');
    if (jpegHeader !== 'ffd8ff' && pngHeader !== '89504e47' && imageBase64.includes('image/webp')) {
      const webpHeader = decoded.slice(0, 4).toString('hex');
      if (webpHeader !== '52494646') {
        logRejection('/palm-reading', 'invalid image magic bytes', ip);
        return res.status(400).json({ error: 'Invalid image data.' });
      }
    } else if (jpegHeader !== 'ffd8ff' && pngHeader !== '89504e47') {
      logRejection('/palm-reading', 'invalid image magic bytes', ip);
      return res.status(400).json({ error: 'Invalid image data.' });
    }
  } catch {
    logRejection('/palm-reading', 'base64 decode failed', ip);
    return res.status(400).json({ error: 'Image data is corrupted.' });
  }

  next();
}

export function validateJaapSave(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '?';
  const { mantra, count, goal } = req.body;

  if (typeof mantra !== 'string' || mantra.length < 1 || mantra.length > MAX_MANTRA) {
    logRejection('/jaap/:userId', 'invalid mantra', ip);
    return res.status(400).json({ error: 'Mantra is required (max 200 chars).' });
  }

  if (count !== undefined && (typeof count !== 'number' || count < 0 || count > 999999)) {
    logRejection('/jaap/:userId', 'invalid count', ip);
    return res.status(400).json({ error: 'Invalid count value.' });
  }

  if (goal !== undefined && (typeof goal !== 'number' || goal < 1 || goal > 999999)) {
    logRejection('/jaap/:userId', 'invalid goal', ip);
    return res.status(400).json({ error: 'Invalid goal value.' });
  }

  next();
}

export function validateWishCreate(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '?';
  const { title, description } = req.body;

  if (typeof title !== 'string' || title.length < 1 || title.length > MAX_WISH_TITLE) {
    logRejection('/wishes', 'invalid title', ip);
    return res.status(400).json({ error: 'Wish title is required (max 200 chars).' });
  }
  req.body.title = sanitize(title);

  if (description !== undefined) {
    if (typeof description !== 'string' || description.length > MAX_WISH_DESC) {
      logRejection('/wishes', 'invalid description', ip);
      return res.status(400).json({ error: 'Description must be under 2000 chars.' });
    }
    req.body.description = sanitize(description);
  }

  next();
}

export function validateAdminLogin(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '?';
  const { username, password } = req.body;

  if (typeof username !== 'string' || username.length < 1) {
    logRejection('/admin/login', 'missing username', ip);
    return res.status(400).json({ error: 'Username is required.' });
  }
  if (typeof password !== 'string' || password.length < 1) {
    logRejection('/admin/login', 'missing password', ip);
    return res.status(400).json({ error: 'Password is required.' });
  }

  next();
}

export function validateSubscription(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '?';
  const { email, phone } = req.body.billingDetails || {};

  if (email && typeof email === 'string' && email.length > 254) {
    logRejection('/subscriptions', 'email too long', ip);
    return res.status(400).json({ error: 'Email too long.' });
  }

  if (phone && typeof phone === 'string') {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      logRejection('/subscriptions', 'invalid billing phone', ip);
      return res.status(400).json({ error: 'Invalid billing phone number.' });
    }
  }

  next();
}
