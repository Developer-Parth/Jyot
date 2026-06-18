import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import { parse } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PROFILE_DIR = path.join(PROJECT_ROOT, '.browser-profile');
const ENV_FILE = path.join(PROJECT_ROOT, '.env');
const ENV_AUTO_FILE = path.join(PROJECT_ROOT, '.env.auto');
const AI_STUDIO_URL = 'https://aistudio.google.com/apikey';
const KEY_COUNT = 11;
const DEBUG = process.argv.includes('--debug');

const CREATE_BTN_TEXT = 'Create API Key';
const DONE_BTN_TEXT = 'Done';
const DELETE_MENU_TEXT = 'Delete';
const CONFIRM_DELETE_TEXT = 'Delete';

function log(msg: string) {
  console.log(`[refresh-keys] ${msg}`);
}

function debug(msg: string) {
  if (DEBUG) console.log(`[DEBUG] ${msg}`);
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

// Cubic bezier: B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
function bezierPoint(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

async function humanLikeMove(page: any, el: any) {
  // Get element center
  const box = await el.boundingBox();
  if (!box) return;
  const targetX = box.x + box.width / 2;
  const targetY = box.y + box.height / 2;

  // Get current mouse position (default to top-left if unknown)
  let startX: number, startY: number;
  try {
    const pos = await page.evaluate(() => ({ x: (window as any).__lastMouseX || 0, y: (window as any).__lastMouseY || 0 }));
    startX = pos.x;
    startY = pos.y;
  } catch {
    startX = 0;
    startY = 0;
  }

  // If start is too close to target, add offset so we get a nice curve
  const dx = targetX - startX;
  const dy = targetY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 50) {
    // Push start back to create a visible swing
    startX = targetX + rand(-300, -150);
    startY = targetY + rand(-200, -100);
  }

  // Generate 2 control points with random offsets to create "swinging" curves
  const midX = (startX + targetX) / 2 + rand(-200, 200);
  const midY = (startY + targetY) / 2 + rand(-150, 150);
  const cp1x = startX + (midX - startX) * 0.3 + rand(-100, 100);
  const cp1y = startY + (midY - startY) * 0.3 + rand(-80, 80);
  const cp2x = midX + (targetX - midX) * 0.7 + rand(-120, 120);
  const cp2y = midY + (targetY - midY) * 0.7 + rand(-100, 100);

  // Number of steps varies with distance (30-60 steps)
  const steps = Math.max(30, Math.min(60, Math.floor(dist / 5)));

  // Move along bezier with varying speed
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Ease: slow at start and end, faster in middle
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const x = bezierPoint(eased, startX, cp1x, cp2x, targetX);
    const y = bezierPoint(eased, startY, cp1y, cp2y, targetY);

    await page.mouse.move(x, y);

    // Varying delays: 10-35ms between points, slower at start/end
    const delay = t < 0.15 || t > 0.85 ? rand(20, 35) : rand(10, 25);
    await sleep(delay);
  }

  // Subtle overshoot: move slightly past and come back
  if (Math.random() > 0.4) {
    const overshootX = targetX + rand(-8, 8);
    const overshootY = targetY + rand(-8, 8);
    await page.mouse.move(overshootX, overshootY, { steps: 3 });
    await sleep(rand(30, 80));
    await page.mouse.move(targetX, targetY, { steps: 2 });
  }

  // Small random jitter before click (simulating micro-adjustments)
  for (let j = 0; j < randInt(1, 3); j++) {
    await page.mouse.move(
      targetX + rand(-2, 2),
      targetY + rand(-2, 2),
    );
    await sleep(rand(20, 50));
  }

  // Store last position
  await page.evaluate(({ x, y }) => {
    (window as any).__lastMouseX = x;
    (window as any).__lastMouseY = y;
  }, { x: targetX, y: targetY });
}

async function humanClick(page: any, el: any) {
  await humanLikeMove(page, el);
  await sleep(rand(50, 150));
  await el.click();
  debug('clicked');
}

async function runVercelCmd(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = cp.spawn('npx.cmd', ['vercel', ...args], {
      cwd: PROJECT_ROOT,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (d) => { stdout += d.toString(); });
    child.stderr?.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || stdout));
    });
  });
}

async function ensureLoggedIn(page: any): Promise<boolean> {
  log('Checking login status...');
  await page.goto(AI_STUDIO_URL, { waitUntil: 'networkidle' });
  const url = page.url();
  if (url.includes('accounts.google.com') || url.includes('signin') || url.includes('SignIn')) {
    log('Not logged in. Opening browser for you to sign in...');
    log('Please log into your Google account in the opened browser window.');
    log('After signing in successfully, this script will continue automatically.');
    await page.waitForFunction(() => !window.location.href.includes('accounts.google.com'));
  }
  log('Logged in successfully!');
  return true;
}

async function wait10() {
  log('Waiting 10 seconds...');
  await sleep(10000);
}

async function deleteAllKeys(page: any) {
  log('Deleting existing API keys...');
  let deleted = 0;

  while (true) {
    // Try finding any delete-able key on the page
    // First check for direct delete buttons (trash icons, "Delete" buttons)
    const directDel = page.locator('button').filter({ hasText: DELETE_MENU_TEXT });
    const directCount = await directDel.count();
    if (directCount > 0) {
      for (let i = 0; i < directCount; i++) {
        const btn = directDel.nth(0);
        if (await btn.count() === 0) break;
        log(`Deleting key #${deleted + 1}...`);
        await humanClick(page, btn);
        await sleep(rand(800, 1500));

        // Confirm deletion
        const confirm = page.locator('button, [role="button"]').filter({ hasText: CONFIRM_DELETE_TEXT });
        if (await confirm.count() > 0) {
          await humanClick(page, confirm.first());
          await sleep(rand(800, 1500));
        }
        deleted++;
        log(`Deleted key #${deleted}`);
        await wait10();
      }
      continue;
    }

    // Check for three-dot menus
    const menus = page.locator('button[aria-label*="more"], button[aria-label*="menu"]');
    const menuCount = await menus.count();
    if (menuCount > 0) {
      for (let i = 0; i < menuCount; i++) {
        const menu = menus.nth(0);
        if (await menu.count() === 0) break;
        log(`Opening menu for key #${deleted + 1}...`);
        await humanClick(page, menu);
        await sleep(rand(1000, 2000));

        const menuDel = page.locator('[role="menuitem"], li, [class*="menu"]').filter({ hasText: DELETE_MENU_TEXT }).first();
        if (await menuDel.count() > 0) {
          await humanClick(page, menuDel);
          await sleep(rand(800, 1500));
        }

        const confirm = page.locator('button, [role="button"]').filter({ hasText: CONFIRM_DELETE_TEXT });
        if (await confirm.count() > 0) {
          await humanClick(page, confirm.first());
          await sleep(rand(800, 1500));
        }
        deleted++;
        log(`Deleted key #${deleted}`);
        await wait10();
      }
      continue;
    }

    // Check for trash icon buttons
    const trash = page.locator('button[aria-label*="delete"], button[title*="delete"]');
    const trashCount = await trash.count();
    if (trashCount > 0) {
      for (let i = 0; i < trashCount; i++) {
        const btn = trash.nth(0);
        if (await btn.count() === 0) break;
        log(`Deleting key #${deleted + 1} via trash icon...`);
        await humanClick(page, btn);
        await sleep(rand(800, 1500));

        const confirm = page.locator('button, [role="button"]').filter({ hasText: CONFIRM_DELETE_TEXT });
        if (await confirm.count() > 0) {
          await humanClick(page, confirm.first());
          await sleep(rand(800, 1500));
        }
        deleted++;
        log(`Deleted key #${deleted}`);
        await wait10();
      }
      continue;
    }

    break;
  }

  log(`Deleted ${deleted} existing key(s).`);
}

async function createKeys(page: any): Promise<string[]> {
  log(`Creating ${KEY_COUNT} new API keys...`);
  const newKeys: string[] = [];

  for (let i = 0; i < KEY_COUNT; i++) {
    log(`Creating key ${i + 1}/${KEY_COUNT}...`);

    // Click "Create API Key" button
    const createBtn = page.locator('button').filter({ hasText: CREATE_BTN_TEXT });
    const createCount = await createBtn.count();
    if (createCount === 0) {
      const altBtn = page.locator('a, div, span').filter({ hasText: CREATE_BTN_TEXT }).first();
      if (await altBtn.count() === 0) {
        log(`Could not find "${CREATE_BTN_TEXT}" button. Dumping page...`);
        const body = await page.locator('body').textContent();
        debug(body?.substring(0, 2000) || 'empty');
        throw new Error(`Cannot find "${CREATE_BTN_TEXT}" button – selectors may need updating. Run with --debug to inspect.`);
      }
      await humanClick(page, altBtn);
    } else {
      await humanClick(page, createBtn.first());
    }
    await sleep(rand(2000, 3000));

    // Extract the key from the dialog
    let keyValue: string | null = null;
    try {
      const keyInput = page.locator('input[readonly], input:not([type="password"])').first();
      const inputValue = await keyInput.inputValue().catch(() => '');
      if (inputValue && inputValue.startsWith('AIza')) {
        keyValue = inputValue;
      }
    } catch { /* try next */ }

    if (!keyValue) {
      try {
        const keyEl = page.locator('text=AIza').first();
        const text = await keyEl.textContent();
        if (text) {
          const match = text.match(/AIza[a-zA-Z0-9_-]+/);
          if (match) keyValue = match[0];
        }
      } catch { /* fallback */ }
    }

    if (!keyValue) {
      const allText = await page.locator('body').textContent();
      const match = allText?.match(/AIza[a-zA-Z0-9_-]+/);
      if (match) keyValue = match[0];
    }

    if (!keyValue) {
      log(`Could not extract key #${i + 1}. Page content around dialog:`);
      const body = await page.locator('body').textContent();
      log(body?.substring(0, 1000) || 'empty');
      throw new Error(`Failed to extract API key #${i + 1}. The dialog UI may have changed.`);
    }

    newKeys.push(keyValue);
    log(`Key #${i + 1}: ${keyValue.substring(0, 15)}...`);

    // Close dialog
    try {
      const doneBtn = page.locator('button').filter({ hasText: DONE_BTN_TEXT });
      if (await doneBtn.count() > 0) {
        await humanClick(page, doneBtn.first());
      } else {
        const closeBtn = page.locator('button[aria-label*="close"], button[aria-label*="Close"]').first();
        if (await closeBtn.count() > 0) {
          await humanClick(page, closeBtn);
        } else {
          await page.keyboard.press('Escape');
        }
      }
    } catch { await page.keyboard.press('Escape'); }
    await sleep(rand(2000, 3000));
  }

  log(`Created ${newKeys.length} new API keys.`);
  return newKeys;
}

function updateEnvFile(newKeys: string[]) {
  log('Updating .env file...');
  let envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  const envKeys = ['GEMINI_API_KEY', ...Array.from({ length: 10 }, (_, i) => `GEMINI_API_KEY_${i + 1}`)];
  for (let i = 0; i < newKeys.length; i++) {
    const keyName = envKeys[i];
    const regex = new RegExp(`^${keyName}=.*$`, 'm');
    const replacement = `${keyName}=${newKeys[i]}`;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, replacement);
    } else {
      envContent += `\n${replacement}`;
    }
  }
  fs.writeFileSync(ENV_FILE, envContent, 'utf-8');
  log('.env updated successfully.');
}

async function deployToVercel(newKeys: string[]) {
  log('Deploying to Vercel...');
  const envKeys = ['GEMINI_API_KEY', ...Array.from({ length: 10 }, (_, i) => `GEMINI_API_KEY_${i + 1}`)];

  try {
    for (let i = 0; i < newKeys.length; i++) {
      const keyName = envKeys[i];
      const keyValue = newKeys[i];
      log(`Setting ${keyName} on Vercel (production)...`);
      await runVercelCmd(['env', 'add', keyName, 'production', '--force', '--value', keyValue, '--yes']);
    }

    log('Triggering Vercel deploy...');
    await runVercelCmd(['deploy', '--prod']);
    log('Deploy triggered successfully!');
  } catch (e: any) {
    log(`Vercel deployment failed: ${e.message}`);
    log('New keys are saved in .env. You can deploy manually.');
    log('To deploy manually: npx vercel deploy --prod');
  }
}

async function ensureVercelCLI() {
  try {
    cp.execSync('npx vercel --version', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    log('Vercel CLI is available.');
  } catch {
    log('Installing Vercel CLI globally...');
    cp.execSync('npm install -g vercel', { stdio: 'inherit' });
    log('Vercel CLI installed.');
  }
}

async function ensureVercelLogin() {
  try {
    await runVercelCmd(['whoami']);
    log('Vercel CLI is authenticated.');
  } catch {
    log('Vercel CLI is not authenticated. Opening browser for login...');
    log('Please complete the Vercel login in the browser window, then return here.');
    cp.execSync('npx vercel login', { cwd: PROJECT_ROOT, stdio: 'inherit' });
  }
}

async function main() {
  log('=== Gemini API Key Auto-Refresh ===');
  log(`Project root: ${PROJECT_ROOT}`);

  if (!fs.existsSync(ENV_AUTO_FILE)) {
    log(`Missing .env.auto file. Creating template at ${ENV_AUTO_FILE}`);
    fs.writeFileSync(ENV_AUTO_FILE, `# Your Google account email (used to auto-fill login form)
GOOGLE_EMAIL=your.email@gmail.com
`, 'utf-8');
    log('Please fill in your email in .env.auto, then re-run this script.');
    return;
  }

  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
    log(`Created browser profile directory: ${PROFILE_DIR}`);
  }

  log('Launching browser...');
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: undefined,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1280, height: 900 },
  });
  const page = browser.pages()[0] || await browser.newPage();

  try {
    const loggedIn = await ensureLoggedIn(page);
    if (!loggedIn) {
      log('Could not verify login. Aborting.');
      return;
    }

    await deleteAllKeys(page);
    await sleep(rand(1000, 2000));

    const newKeys = await createKeys(page);

    updateEnvFile(newKeys);

    await ensureVercelCLI();
    await ensureVercelLogin();
    await deployToVercel(newKeys);

    log('');
    log('=== DONE ===');
    log(`Successfully created ${newKeys.length} new Gemini API keys, updated .env, and deployed to Vercel.`);
  } catch (e: any) {
    log(`ERROR: ${e.message}`);
    log('');
    log('Troubleshooting:');
    log('  1. Run with --debug to see detailed logs: npm run refresh-keys -- --debug');
    log('  2. The AI Studio page UI may have changed. Open it manually to check:');
    log('     https://aistudio.google.com/apikey');
    log('  3. You can still create keys manually and update .env yourself.');
    log('  4. To deploy manually: npx vercel deploy --prod');
  } finally {
    await sleep(2000);
    await browser.close();
  }
}

main().catch((e) => {
  console.error('[refresh-keys] Fatal error:', e.message);
  process.exit(1);
});
