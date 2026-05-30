import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = (() => {
  if (!process.env.JWT_SECRET) {
    const generated = crypto.randomBytes(64).toString('hex');
    if (process.env.VERCEL) {
      console.error('[AUTH] ⚠️  JWT_SECRET not set in Vercel environment! Every cold start will invalidate all user sessions.');
      console.error('[AUTH] ⚠️  Set JWT_SECRET in Vercel dashboard → Environment Variables.');
    } else {
      console.warn('[AUTH] JWT_SECRET not set. Using random fallback — tokens invalidated on restart.');
    }
    return generated;
  }
  return process.env.JWT_SECRET;
})();
const JWT_EXPIRY = '7d';
const ADMIN_JWT_EXPIRY = '2h';

export interface JwtPayload {
  userId: number;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId, role: 'user' } satisfies JwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function generateAdminToken(): string {
  return jwt.sign({ userId: 0, role: 'admin' } satisfies JwtPayload, JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRY });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (payload.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Admin session expired.', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ error: 'Invalid admin token.' });
  }
}
