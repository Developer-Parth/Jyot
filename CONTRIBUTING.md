# Contributing to Jyot

Thank you for considering contributing to Jyot. This document outlines the guidelines for contributing to the project.

## Code of Conduct

By participating, you agree to maintain a respectful and inclusive environment for everyone.

## Security

**Never commit or push:**
- `.env` files or any file containing real API keys
- Keystore files (`*.jks`, `*.keystore`, `*.p12`, `*.pfx`, `*.key`)
- `signing.properties` or `local.properties`
- `node_modules/`, `dist/`, `android/app/build/`
- Database files (`*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal`)

All sensitive files and build outputs are listed in `.gitignore`. Please verify with `git status` before committing.

## Getting Started

1. Fork the repository.
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Jyot.git
   cd Jyot
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
6. Add your Gemini API keys to `.env`.
7. Start the dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3003`.

## Development Workflow

### Code Style
- TypeScript strict mode is enabled. Run `npm run lint` (`tsc --noEmit`) before committing.
- Follow the existing code conventions: async/await, no semicolons in the codebase style, single quotes for strings.
- No commented-out code. Delete it.
- Components use React 19 with functional components and hooks.

### Project Structure
```
api/              — Express backend (serverless function entry)
  app.ts          — Express app creation
  routes.ts       — All API route handlers
  storage.ts      — JSON file-based data store
  controllers/    — Route controllers
  models/         — Data models
  services/       — External service integrations (Gemini, panchang)
src/              — React frontend
  pages/         — Route page components
  components/    — Shared UI components
  hooks/         — Custom React hooks
  services/      — API client
  lib/           — Utilities (sound, branding, helpers)
  data/          — Static data (pujas, i18n)
android/          — Capacitor Android native project
server.ts         — Local dev server entry point
```

### Backend (Express + JSON Store)
- No database setup is needed. The app uses JSON files stored in `server/data/` (local) or `/tmp/data` (Vercel).
- Collections are auto-created on first access: `users`, `jaaps`, `subscriptions`, `palm_readings`.
- The store uses atomic writes (write to `.tmp`, then rename).

### Frontend (React + Vite)
- Tailwind CSS v4 with a custom dark theme (brown/amber/golden).
- Client-side routing via `react-router-dom` v7.
- Language switching (English/Hindi) via a simple helper, persisted in `localStorage`.

## Making Changes

1. Make your changes and test locally.
2. Run the type checker:
   ```bash
   npm run lint
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add widget to display upcoming festivals"
   ```
5. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request against the `main` branch.

## Pull Request Guidelines

- Keep PRs focused on a single concern.
- Include a clear description of what the PR does and why.
- Reference any related issues.
- Ensure all existing functionality still works.
- Update README.md if adding or changing features.

## Questions?

Open a GitHub Issue for discussion before starting significant work.
