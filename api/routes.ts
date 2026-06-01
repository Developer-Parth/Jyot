console.log('[BOOT] api/routes.ts loaded');

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PalmReadingController } from './controllers/PalmReadingController.js';
import store from './storage.js';
import { PanchangService } from './services/PanchangService.js';
import { palmReadingLimiter, authLimiter } from './middleware/rateLimiter.js';
import { requireAuth, requireAdmin, generateToken, generateAdminToken } from './middleware/auth.js';
import {
  validateLogin,
  validateRegistration,
  validateUserUpdate,
  validatePalmReading,
  validateJaapSave,
  validateWishCreate,
  validateAdminLogin,
  validateSubscription,
  validatePassword,
} from './middleware/validate.js';

const router = Router();
const SALT_ROUNDS = 12;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'JyotAdmin@2026';
const LEGACY_PLACEHOLDER = 'local-profile-login';

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const todayKey = () => new Date().toISOString().slice(0, 10);

const touchStreak = async (userId: number) => {
  const user = await store.getById<any>('users', userId);
  if (!user) return;

  const today = todayKey();
  if (user.last_active_date === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  const currentStreak = user.last_active_date === yesterdayKey ? Number(user.current_streak || 0) + 1 : 1;
  const longestStreak = Math.max(currentStreak, Number(user.longest_streak || 0));

  await store.update('users', userId, {
    last_active_date: today,
    current_streak: currentStreak,
    longest_streak: longestStreak,
  });
};

const getCurrentSubscription = async (userId: number) => {
  const subs = await store.where<any>('subscriptions', s => s.user_id === userId);
  subs.sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
  return subs[0] || null;
};

const stripUser = (user: any) => {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
};

// ── Public: Login (existing users only) ──────────────────────
router.post('/auth/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const email = `${String(phone).replace(/\D/g, '')}@jyot.local`;
  const user = await store.findOne<any>('users', u => u.phone === phone || u.email === email);

  if (!user) {
    res.status(404).json({ error: 'No account found with this number. Please register first.', code: 'ACCOUNT_NOT_FOUND' });
    return;
  }

  if (user.password_hash === LEGACY_PLACEHOLDER) {
    res.status(401).json({
      error: 'Your account needs a password to be set up. Please set your password.',
      code: 'LEGACY_ACCOUNT',
    });
    return;
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    console.log(`[SECURITY] Failed login attempt for phone=${phone} (ip=${req.ip})`);
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  await touchStreak(user.id);
  const token = generateToken(user.id);
  const freshUser = await store.getById('users', user.id);
  const subscription = await getCurrentSubscription(user.id);

  res.json({
    token,
    user: stripUser(freshUser),
    subscription: subscription || { plan: 'seeker', status: 'active' },
  });
}));

// ── Public: Register (new users only) ────────────────────────
router.post('/auth/register', authLimiter, validateRegistration, asyncHandler(async (req, res) => {
  const { name, phone, city, birthDate, deity, gotra, password } = req.body;

  if (birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 13) {
      res.status(403).json({ error: 'You must be at least 13 years old to use Jyot.' });
      return;
    }
  }

  const email = `${String(phone).replace(/\D/g, '')}@jyot.local`;
  const existing = await store.findOne<any>('users', u => u.phone === phone || u.email === email);
  if (existing) {
    res.status(409).json({ error: 'An account with this number already exists. Please log in.', code: 'ACCOUNT_EXISTS' });
    return;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await store.create('users', {
    email,
    password_hash,
    name, phone, city,
    birth_date: birthDate || '',
    deity: deity || 'Shiva',
    gotra: gotra || '',
  });

  await touchStreak(newUser.id);
  const token = generateToken(newUser.id);
  const freshUser = await store.getById('users', newUser.id);
  const subscription = await getCurrentSubscription(newUser.id);

  res.json({
    token,
    user: stripUser(freshUser),
    subscription: subscription || { plan: 'seeker', status: 'active' },
  });
}));

// ── Public: Set password for legacy accounts ─────────────────
router.post('/auth/setup-password', authLimiter, asyncHandler(async (req, res) => {
  const { phone, name, password } = req.body;

  if (typeof phone !== 'string' || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
    return;
  }
  if (typeof name !== 'string' || name.length < 1) {
    res.status(400).json({ error: 'Name is required to verify ownership.' });
    return;
  }
  if (typeof password !== 'string' || password.length < 1) {
    res.status(400).json({ error: 'Password is required.' });
    return;
  }

  const pwErr = validatePassword(password);
  if (pwErr) {
    res.status(400).json({ error: pwErr });
    return;
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);
  const email = `${cleanPhone}@jyot.local`;
  const user = await store.findOne<any>('users', u => u.phone === cleanPhone || u.email === email);

  if (!user) {
    res.status(404).json({ error: 'Account not found.', code: 'ACCOUNT_NOT_FOUND' });
    return;
  }

  if (user.password_hash !== LEGACY_PLACEHOLDER) {
    res.status(400).json({ error: 'Account already has a password. Please log in.' });
    return;
  }

  if (user.name !== name) {
    console.log(`[SECURITY] Failed legacy password setup: name mismatch for phone=${cleanPhone} (ip=${req.ip})`);
    res.status(403).json({ error: 'Name does not match our records. Please use the name you registered with.' });
    return;
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await store.update('users', user.id, { password_hash: hash });
  console.log(`[MIGRATION] User ${user.id} password set via legacy setup flow.`);

  const token = generateToken(user.id);
  const freshUser = await store.getById('users', user.id);
  const subscription = await getCurrentSubscription(user.id);

  res.json({
    token,
    user: stripUser(freshUser),
    subscription: subscription || { plan: 'seeker', status: 'active' },
  });
}));

// ── Protected: Profile ───────────────────────────────────────
router.put('/users/me', requireAuth, validateUserUpdate, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const { name, phone, city, birthDate, deity, gotra, reminderTime } = req.body;
  const updated = await store.update('users', userId, {
    name, phone, city,
    birth_date: birthDate ?? undefined,
    deity: deity ?? 'Shiva',
    gotra: gotra ?? '',
    reminder_time: reminderTime ?? '06:00',
  });
  if (!updated) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: stripUser(updated) });
}));

router.get('/users/me', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  await touchStreak(userId);
  const user = await store.getById<any>('users', userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const jaaps = await store.where<any>('jaaps', j => j.user_id === userId);
  jaaps.sort((a: any, b: any) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  const totalJaap = jaaps.reduce((sum, item) =>
    sum + Number(item.count || 0) + (Number(item.completed_sessions || 0) * Number(item.goal || 108)), 0);
  const mostChanted = jaaps[0]?.mantra || 'Begin your first jaap';
  const subscription = await getCurrentSubscription(userId);

  res.json({
    user: stripUser(user),
    subscription: subscription || { plan: 'seeker', status: 'active' },
    analytics: {
      totalJaap,
      currentStreak: Number(user.current_streak || 0),
      longestStreak: Number(user.longest_streak || 0),
      mostChanted,
    },
  });
}));

router.delete('/users/me', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const user = await store.getById('users', userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  await store.delete('users', userId);
  await store.deleteWhere('jaaps', (j: any) => j.user_id === userId);
  await store.deleteWhere('subscriptions', (s: any) => s.user_id === userId);
  await store.deleteWhere('palm_readings', (r: any) => r.user_id === userId);
  await store.deleteWhere('wishes', (w: any) => w.user_id === userId);

  console.log(`[ACCOUNT] User ${userId} permanently deleted.`);
  res.json({ success: true, message: 'Account permanently deleted.' });
}));

// ── Protected: Palm Reading (userId derived from JWT) ────────
router.post('/palm-reading', requireAuth, palmReadingLimiter, validatePalmReading, PalmReadingController.readPalm);

// ── Protected: Jaap ──────────────────────────────────────────
router.get('/jaap', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;

  const all = await store.where<any>('jaaps', j => j.user_id === userId);
  all.sort((a: any, b: any) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  const jaap = all[0] || null;

  res.json(jaap || { mantra: 'Om Namah Shivaya', count: 0, goal: 108, completed_sessions: 0 });
}));

router.put('/jaap', requireAuth, validateJaapSave, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const { mantra, count, goal, completed } = req.body;
  await touchStreak(userId);

  const existing = await store.findOne<any>('jaaps', j => j.user_id === userId && j.mantra === mantra);
  if (existing) {
    await store.update('jaaps', existing.id, {
      count: Number(count || 0),
      goal: Number(goal || 108),
      completed_sessions: Number(existing.completed_sessions || 0) + (completed ? 1 : 0),
      updated_at: new Date().toISOString(),
    });
  } else {
    await store.create('jaaps', {
      user_id: userId,
      mantra,
      count: Number(count || 0),
      goal: Number(goal || 108),
      completed_sessions: completed ? 1 : 0,
      updated_at: new Date().toISOString(),
    });
  }

  const jaap = await store.findOne<any>('jaaps', j => j.user_id === userId && j.mantra === mantra);
  res.json(jaap);
}));

// ── Protected: Wishes (userId from JWT, never from params) ───
router.get('/wishes', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const wishes = await store.where<any>('wishes', w => w.user_id === userId);
  wishes.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
  res.json(wishes);
}));

router.post('/wishes', requireAuth, validateWishCreate, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const { title, description } = req.body;

  const wish = await store.create('wishes', {
    user_id: userId,
    title,
    description: description || '',
    video_id: '',
  });

  res.json(wish);
}));

router.put('/wishes/:wishId', requireAuth, validateWishCreate, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const wishId = Number(req.params.wishId);
  const { title, description } = req.body;

  const wish = await store.getById<any>('wishes', wishId);
  if (!wish || wish.user_id !== userId) {
    res.status(404).json({ error: 'Wish not found.' });
    return;
  }

  const updated = await store.update('wishes', wishId, { title, description: description || '' });
  res.json(updated);
}));

router.delete('/wishes/:wishId', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const wishId = Number(req.params.wishId);

  const wish = await store.getById<any>('wishes', wishId);
  if (!wish || wish.user_id !== userId) {
    res.status(404).json({ error: 'Wish not found.' });
    return;
  }

  await store.delete('wishes', wishId);
  res.json({ success: true });
}));

// ── Public: Panchang ─────────────────────────────────────────
router.get('/panchang', async (req, res) => {
  try {
    const city = String(req.query.city || 'Varanasi');
    const lang = req.query.lang === 'hi' ? 'hi' : 'en';
    const panchang = await PanchangService.getDailyPanchang({ city, lang });
    res.json(panchang);
  } catch (error) {
    res.status(503).json({
      error: error instanceof Error ? error.message : 'Real panchang unavailable.',
    });
  }
});

// ── Protected: Subscriptions (userId from JWT) ───────────────
router.post('/subscriptions', requireAuth, validateSubscription, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const { plan, billingCycle, amount, billingDetails, paymentMethod } = req.body;
  if (!plan || !billingDetails?.fullName || !billingDetails?.email || !billingDetails?.phone) {
    res.status(400).json({ error: 'Plan and billing contact details are required.' });
    return;
  }

  const result = await store.create('subscriptions', {
    user_id: userId,
    plan,
    status: plan === 'seeker' ? 'active' : 'pending_payment',
    billing_cycle: billingCycle,
    amount: Number(amount || 0),
    full_name: billingDetails.fullName,
    email: billingDetails.email,
    phone: billingDetails.phone,
    address: billingDetails.address || '',
    city: billingDetails.city || '',
    state: billingDetails.state || '',
    pincode: billingDetails.pincode || '',
    payment_method: paymentMethod || 'upi',
  });

  res.json({
    id: result.id,
    plan,
    status: plan === 'seeker' ? 'active' : 'pending_payment',
    message: 'Payment integration setup is in progress. Enjoy free version till then',
  });
}));

// ── Admin ────────────────────────────────────────────────────
router.post('/admin/login', authLimiter, validateAdminLogin, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    console.log(`[SECURITY] Failed admin login attempt (ip=${req.ip})`);
    res.status(401).json({ error: 'Invalid admin credentials.' });
    return;
  }

  const token = generateAdminToken();
  const allUsers = await store.all<any>('users');
  const totalWishes = (await store.all('wishes')).length;
  const totalReadings = (await store.all('palm_readings')).length;

  const usersWithData = allUsers.map((u: any) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    city: u.city,
    deity: u.deity,
    gotra: u.gotra,
    birth_date: u.birth_date,
    reminder_time: u.reminder_time,
    current_streak: u.current_streak,
    longest_streak: u.longest_streak,
    created_at: u.created_at,
  }));

  res.json({
    token,
    stats: {
      totalUsers: allUsers.length,
      totalWishes,
      totalPalmReadings: totalReadings,
    },
    users: usersWithData,
  });
}));

router.get('/admin/export/json', requireAdmin, asyncHandler(async (req, res) => {
  const users = (await store.all<any>('users')).map((u: any) => {
    const { password_hash, ...rest } = u;
    return rest;
  });
  const data = {
    exportedAt: new Date().toISOString(),
    users,
    wishes: await store.all('wishes'),
    jaaps: await store.all('jaaps'),
    palmReadings: await store.all('palm_readings'),
    subscriptions: await store.all('subscriptions'),
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=jyot-export.json');
  res.json(data);
}));

router.get('/admin/export/csv', requireAdmin, asyncHandler(async (req, res) => {
  const users = await store.all<any>('users');
  const headers = ['id', 'name', 'phone', 'city', 'deity', 'gotra', 'birth_date', 'created_at'];
  let csv = headers.join(',') + '\n';

  for (const u of users) {
    csv += headers.map(h => {
      const val = String(u[h] || '');
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',') + '\n';
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=jyot-users.csv');
  res.send(csv);
}));

export default router;
