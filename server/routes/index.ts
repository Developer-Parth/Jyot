import { Router } from 'express';
import { PalmReadingController } from '../controllers/PalmReadingController';
import db from '../db/index';
import { PanchangService } from '../services/PanchangService';

const router = Router();

router.post('/palm-reading', PalmReadingController.readPalm);

const todayKey = () => new Date().toISOString().slice(0, 10);

const touchStreak = (userId: number) => {
  const user = db.prepare('SELECT last_active_date, current_streak, longest_streak FROM users WHERE id = ?').get(userId) as any;
  if (!user) return;

  const today = todayKey();
  if (user.last_active_date === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  const currentStreak = user.last_active_date === yesterdayKey ? Number(user.current_streak || 0) + 1 : 1;
  const longestStreak = Math.max(currentStreak, Number(user.longest_streak || 0));

  db.prepare(`
    UPDATE users
    SET last_active_date = ?, current_streak = ?, longest_streak = ?
    WHERE id = ?
  `).run(today, currentStreak, longestStreak, userId);
};

const getCurrentSubscription = (userId: number) => {
  return db.prepare(`
    SELECT plan, status, billing_cycle, amount, created_at
    FROM subscriptions
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(userId) as any;
};

router.post('/auth/login', (req, res) => {
  const { name, phone, city, birthDate, deity, gotra } = req.body;
  if (!name || !phone || !city) {
    return res.status(400).json({ error: 'Name, phone, and city are required.' });
  }

  const email = `${String(phone).replace(/\D/g, '')}@jyot.local`;
  let user = db.prepare('SELECT * FROM users WHERE phone = ? OR email = ?').get(phone, email) as any;

  if (user) {
    db.prepare(`
      UPDATE users
      SET name = ?, phone = ?, city = ?, birth_date = ?, deity = ?, gotra = ?
      WHERE id = ?
    `).run(name, phone, city, birthDate || '', deity || 'Shiva', gotra || '', user.id);
  } else {
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, phone, city, birth_date, deity, gotra)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(email, 'local-profile-login', name, phone, city, birthDate || '', deity || 'Shiva', gotra || '');
    user = { id: Number(result.lastInsertRowid) };
  }

  touchStreak(Number(user.id));
  const freshUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  res.json({ user: freshUser, subscription: getCurrentSubscription(Number(user.id)) || { plan: 'seeker', status: 'active' } });
});

router.get('/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  touchStreak(userId);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const jaaps = db.prepare('SELECT mantra, count, goal, completed_sessions, updated_at FROM jaaps WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as any[];
  const totalJaap = jaaps.reduce((sum, item) => sum + Number(item.count || 0) + (Number(item.completed_sessions || 0) * Number(item.goal || 108)), 0);
  const mostChanted = jaaps[0]?.mantra || 'Begin your first jaap';

  res.json({
    user,
    subscription: getCurrentSubscription(userId) || { plan: 'seeker', status: 'active' },
    analytics: {
      totalJaap,
      currentStreak: Number(user.current_streak || 0),
      longestStreak: Number(user.longest_streak || 0),
      mostChanted
    }
  });
});

router.get('/jaap/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  const jaap = db.prepare('SELECT mantra, count, goal, completed_sessions FROM jaaps WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1').get(userId);
  res.json(jaap || { mantra: 'Om Namah Shivaya', count: 0, goal: 108, completed_sessions: 0 });
});

router.put('/jaap/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  const { mantra, count, goal, completed } = req.body;
  touchStreak(userId);

  const existing = db.prepare('SELECT id, completed_sessions FROM jaaps WHERE user_id = ? AND mantra = ?').get(userId, mantra) as any;
  if (existing) {
    db.prepare(`
      UPDATE jaaps
      SET count = ?, goal = ?, completed_sessions = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(Number(count || 0), Number(goal || 108), Number(existing.completed_sessions || 0) + (completed ? 1 : 0), existing.id);
  } else {
    db.prepare(`
      INSERT INTO jaaps (user_id, mantra, count, goal, completed_sessions)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, mantra, Number(count || 0), Number(goal || 108), completed ? 1 : 0);
  }

  const jaap = db.prepare('SELECT mantra, count, goal, completed_sessions FROM jaaps WHERE user_id = ? AND mantra = ?').get(userId, mantra);
  res.json(jaap);
});

router.get('/panchang', async (req, res) => {
  try {
    const city = String(req.query.city || 'Varanasi');
    const lang = req.query.lang === 'hi' ? 'hi' : 'en';
    const panchang = await PanchangService.getDailyPanchang({ city, lang });
    res.json(panchang);
  } catch (error) {
    res.status(503).json({
      error: error instanceof Error ? error.message : 'Real panchang unavailable.'
    });
  }
});

router.post('/subscriptions', (req, res) => {
  const { userId, plan, billingCycle, amount, billingDetails, paymentMethod } = req.body;
  if (!userId || !plan || !billingDetails?.fullName || !billingDetails?.email || !billingDetails?.phone) {
    return res.status(400).json({ error: 'Plan and billing contact details are required.' });
  }

  const result = db.prepare(`
    INSERT INTO subscriptions (
      user_id, plan, status, billing_cycle, amount, full_name, email, phone,
      address, city, state, pincode, payment_method
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(userId),
    plan,
    plan === 'seeker' ? 'active' : 'pending_payment',
    billingCycle,
    Number(amount || 0),
    billingDetails.fullName,
    billingDetails.email,
    billingDetails.phone,
    billingDetails.address || '',
    billingDetails.city || '',
    billingDetails.state || '',
    billingDetails.pincode || '',
    paymentMethod || 'upi'
  );

  res.json({
    id: result.lastInsertRowid,
    plan,
    status: plan === 'seeker' ? 'active' : 'pending_payment',
    message: 'Payment integration setup is in progress. Enjoy free version till then'
  });
});

export default router;
