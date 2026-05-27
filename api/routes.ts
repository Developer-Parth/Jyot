console.log('[BOOT] api/routes.ts loaded');

import { Router, Request, Response, NextFunction } from 'express';
import { PalmReadingController } from './controllers/PalmReadingController.js';
import store from './storage.js';
import { PanchangService } from './services/PanchangService.js';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.post('/palm-reading', PalmReadingController.readPalm);

const todayKey = () => new Date().toISOString().slice(0, 10);

const touchStreak = async (userId: number) => {
  const user = store.getById<any>('users', userId);
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

const getCurrentSubscription = (userId: number) => {
  const subs = store.where<any>('subscriptions', s => s.user_id === userId);
  subs.sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
  return subs[0] || null;
};

router.post('/auth/login', asyncHandler(async (req, res) => {
  try {
    const { name, phone, city, birthDate, deity, gotra } = req.body;
    if (!name || !phone || !city) {
      res.status(400).json({ error: 'Name, phone, and city are required.' });
      return;
    }

    const email = `${String(phone).replace(/\D/g, '')}@jyot.local`;
    let user = store.findOne<any>('users', u => u.phone === phone || u.email === email);

    if (user) {
      await store.update('users', user.id, {
        name, phone, city,
        birth_date: birthDate || '',
        deity: deity || 'Shiva',
        gotra: gotra || '',
      });
    } else {
      const newUser = await store.create('users', {
        email,
        password_hash: 'local-profile-login',
        name, phone, city,
        birth_date: birthDate || '',
        deity: deity || 'Shiva',
        gotra: gotra || '',
      });
      user = newUser;
    }

    await touchStreak(user.id);
    const freshUser = store.getById('users', user.id);
    res.json({
      user: freshUser,
      subscription: getCurrentSubscription(user.id) || { plan: 'seeker', status: 'active' },
    });
  } catch (e: any) {
    console.error('[LOGIN] ERROR:', e?.message || e);
    console.error('[LOGIN] stack:', e?.stack);
    throw e;
  }
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  await touchStreak(userId);
  const user = store.getById<any>('users', userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const jaaps = store.where<any>('jaaps', j => j.user_id === userId);
  jaaps.sort((a: any, b: any) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  const totalJaap = jaaps.reduce((sum, item) =>
    sum + Number(item.count || 0) + (Number(item.completed_sessions || 0) * Number(item.goal || 108)), 0);
  const mostChanted = jaaps[0]?.mantra || 'Begin your first jaap';

  res.json({
    user,
    subscription: getCurrentSubscription(userId) || { plan: 'seeker', status: 'active' },
    analytics: {
      totalJaap,
      currentStreak: Number(user.current_streak || 0),
      longestStreak: Number(user.longest_streak || 0),
      mostChanted,
    },
  });
}));

router.get('/jaap/:userId', (req, res) => {
  const userId = Number(req.params.userId);

  const all = store.where<any>('jaaps', j => j.user_id === userId);
  all.sort((a: any, b: any) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  const jaap = all[0] || null;

  res.json(jaap || { mantra: 'Om Namah Shivaya', count: 0, goal: 108, completed_sessions: 0 });
});

router.put('/jaap/:userId', asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const { mantra, count, goal, completed } = req.body;
  await touchStreak(userId);

  const existing = store.findOne<any>('jaaps', j => j.user_id === userId && j.mantra === mantra);
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

  const jaap = store.findOne<any>('jaaps', j => j.user_id === userId && j.mantra === mantra);
  res.json(jaap);
}));

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

router.post('/subscriptions', asyncHandler(async (req, res) => {
  const { userId, plan, billingCycle, amount, billingDetails, paymentMethod } = req.body;
  if (!userId || !plan || !billingDetails?.fullName || !billingDetails?.email || !billingDetails?.phone) {
    res.status(400).json({ error: 'Plan and billing contact details are required.' });
    return;
  }

  const result = await store.create('subscriptions', {
    user_id: Number(userId),
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

export default router;
