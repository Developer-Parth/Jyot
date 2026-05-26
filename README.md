# Jyot

Jyot is a full-stack spiritual companion app for daily practice, puja guidance, jaap tracking, AI palm reading, streaks, and subscription intent management.

## Features

- Profile-based login with name, phone, city, birth date, deity, and gotra.
- Daily home dashboard with user greeting, streak, offline panchang calculations, and upcoming vrat/festival cards.
- Panchang runs without a paid API using `mhah-panchang` for tithi, paksha, nakshatra, yoga, karana, lunar month, sunrise, and sunset calculations.
- Digital jaap mala with saved mantra, goal, count, completed sessions, vibration, autoplay counting, and chant playback.
- AI palm reading powered by Gemini with automatic API-key failover.
- Puja library with English and Hindi content, search, filters, detailed vidhi, samagri checklist, chant playback, and Amazon search links for each item.
- Profile page with live jaap analytics, streaks, current plan, and language preference.
- Subscription plan selection with billing details saved to SQLite. Payment integration currently shows: "Payment integration setup is in progress. Enjoy free version till then".
- SQLite-backed backend with Express API routes.

## Tech Stack

- React 19, Vite, TypeScript
- Tailwind CSS, Motion, Lucide icons
- Node.js, Express
- Better SQLite3
- Google GenAI SDK

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and add your Gemini keys:

```env
GEMINI_API_KEY=your_primary_key
GEMINI_API_KEY_1=your_backup_key_1
GEMINI_API_KEY_2=your_backup_key_2
```

The backend tries the primary key first, then keys 1 through 10.

Panchang does not require API keys. It is calculated offline from the user's city coordinates. For exact temple-grade decisions, users should still cross-check with a local published panchang because regional observance rules can differ.

3. Create or migrate the SQLite database:

```bash
npm run db:setup
```

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run clean
npm run db:setup
```

## GitHub Upload

This project is prepared for GitHub with `.gitignore` and `.env.example`. Keep `.env`, `database.sqlite`, `node_modules`, and `dist` out of commits.

Target repository:

```bash
git remote add origin https://github.com/Developer-Parth/Jyot.git
git branch -M main
git push -u origin main
```
