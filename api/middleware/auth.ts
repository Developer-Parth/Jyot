import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import store from '../storage.js';

let _jwtSecret: string | null = null;

function getJwtSecret(): string {
  if (_jwtSecret) return _jwtSecret;
  if (!process.env.JWT_SECRET) {
    throw new Error(
      '[AUTH] JWT_SECRET environment variable is not set.\n' +
      '  Generate one: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n' +
      '  Then set it in .env (local) or Vercel dashboard (all environments).\n' +
      '  Without a stable JWT_SECRET, every restart invalidates all user sessions.'
    );
  }
  _jwtSecret = process.env.JWT_SECRET;
  return _jwtSecret;
}

export function validateEnv(): void {
  if (!process.env.JWT_SECRET) {
    const msg =
      '[AUTH] FATAL: JWT_SECRET environment variable is not set.\n' +
      '  Generate one: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n' +
      '  Then set it in:\n' +
      '    - .env file (local development)\n' +
      '    - Vercel dashboard → Environment Variables (Production, Preview, Development)\n' +
      '  Without a stable JWT_SECRET:\n' +
      '    - Every server restart / cold start invalidates ALL user sessions\n' +
      '    - Users are force-logged out and must re-enter credentials\n' +
      '  No fallback secret will be generated — this is a hard failure.';
    throw new Error(msg);
  }
}

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
  return jwt.sign({ userId, role: 'user' } satisfies JwtPayload, getJwtSecret(), { expiresIn: JWT_EXPIRY });
}

export function generateAdminToken(): string {
  return jwt.sign({ userId: 0, role: 'admin' } satisfies JwtPayload, getJwtSecret(), { expiresIn: ADMIN_JWT_EXPIRY });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.user = payload;

    if (payload.role !== 'admin') {
      const ok = await checkUserStatus(payload.userId, res);
      if (!ok) return;
    }

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

async function checkUserStatus(userId: number, res: Response): Promise<boolean> {
  const user = await store.getById<any>('users', userId);
  if (!user) {
    res.status(401).json({ error: 'User not found.', code: 'USER_NOT_FOUND' });
    return false;
  }

  if (user.is_banned) {
    const reason = user.ban_reason ? ` Reason: ${user.ban_reason}` : '';
    res.status(403).json({ error: `Your account has been permanently banned.${reason}`, code: 'BANNED' });
    return false;
  }

  if (user.is_suspended) {
    if (user.suspended_until) {
      const until = new Date(user.suspended_until);
      if (until > new Date()) {
        const reason = user.suspension_reason ? ` Reason: ${user.suspension_reason}` : '';
        res.status(403).json({
          error: `Your account is suspended until ${until.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.${reason}`,
          code: 'SUSPENDED',
          suspendedUntil: user.suspended_until,
        });
        return false;
      }
      await store.update('users', userId, { is_suspended: false, suspended_until: null });
    } else {
      const reason = user.suspension_reason ? ` Reason: ${user.suspension_reason}` : '';
      res.status(403).json({ error: `Your account is suspended.${reason}`, code: 'SUSPENDED' });
      return false;
    }
  }

  return true;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
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
