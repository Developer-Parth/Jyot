import rateLimit from 'express-rate-limit';

const minute = 60 * 1000;

export const palmReadingLimiter = rateLimit({
  windowMs: 60 * minute,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many palm reading requests. Please try again later.' },
  skip: (req) => req.method === 'OPTIONS',
});

export const authLimiter = rateLimit({
  windowMs: 15 * minute,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
  skip: (req) => req.method === 'OPTIONS',
});

export const generalLimiter = rateLimit({
  windowMs: 15 * minute,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
  skip: (req) => req.method === 'OPTIONS',
});
