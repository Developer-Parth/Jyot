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

async function getLastMousePos(page: any): Promise<{x: number, y: number}> {
  try {
    return await page.evaluate(() => ({ x: (window as any).__lastMouseX || 0, y: (window as any).__lastMouseY || 0 }));
  } catch {
    return { x: 0, y: 0 };
  }
}

async function humanLikeMoveCoords(page: any, targetX: number, targetY: number) {
  const pos = await getLastMousePos(page);
  let startX = pos.x;
  let startY = pos.y;

  // If start is too close to target, add offset so we get a nice curve
  const dx = targetX - startX;
  const dy = targetY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 50) {
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
    await page.mouse.move(targetX + rand(-2, 2), targetY + rand(-2, 2));
    await sleep(rand(20, 50));
  }

  // Store last position
  await page.evaluate(({ x, y }) => {
    (window as any).__lastMouseX = x;
    (window as any).__lastMouseY = y;
  }, { x: targetX, y: targetY });
}

async function humanLikeMove(page: any, el: any) {
  const box = await el.boundingBox();
  if (!box) return;
  await humanLikeMoveCoords(page, box.x + box.width / 2, box.y + box.height / 2);
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
  await page.goto(AI_STUDIO_URL, { waitUntil: 'networkidle', timeout: 0 });
  const url = page.url();
  if (url.includes('accounts.google.com') || url.includes('signin') || url.includes('SignIn')) {
    log('Not logged in. Opening browser for you to sign in...');
    log('Please log into your Google account in the opened browser window.');
    log('After signing in successfully, this script will continue automatically.');
    await page.waitForFunction(() => !window.location.href.includes('accounts.google.com'), { timeout: 0 });
  }
  log('Logged in successfully!');
  return true;
}

async function wait10() {
  log('Waiting 10 seconds...');
  await sleep(10000);
}

async function dumpPageStructure(page: any) {
  // Dump key areas of the page for debugging
  const info = await page.evaluate(() => {
    // Find all visible elements that contain "AIza"
    const results: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Text | null;
    while (node = walker.nextNode() as Text | null) {
      const t = node.textContent || '';
      if (t.includes('AIza') && node.parentElement && (node.parentElement as HTMLElement).offsetParent !== null) {
        const p = node.parentElement;
        const tag = p.tagName.toLowerCase();
        const cls = (p.className || '').substring(0, 120);
        const parentTag = p.parentElement?.tagName.toLowerCase() || '';
        const parentCls = (p.parentElement?.className || '').substring(0, 80);
        const grandparentTag = p.parentElement?.parentElement?.tagName.toLowerCase() || '';
        const allBtns = p.closest('[class*="card"], [class*="row"], [class*="item"], [class*="list"], li, tr, [role="listitem"]');
        results.push(`AIza in <${tag}.${cls}> parent:<${parentTag}.${parentCls}> gp:<${grandparentTag}> container:${allBtns ? '<' + allBtns.tagName.toLowerCase() + '>' : 'none'}`);
        if (results.length >= 20) break;
      }
    }
    return results;
  });
  
  log('--- Page structure around AIza keys ---');
  for (const line of info) log(line);
  
  // Also dump all buttons with their text and aria-labels
  const btns = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, [role="button"], [role="menuitem"]');
    return Array.from(buttons).slice(0, 40).map(b => {
      const tag = b.tagName.toLowerCase();
      const text = (b.textContent || '').substring(0, 40).trim();
      const aria = b.getAttribute('aria-label') || '';
      const cls = (b.className || '').substring(0, 60);
      const visible = (b as HTMLElement).offsetParent !== null;
      return `${visible ? 'VIS' : 'HID'} <${tag}> text="${text}" aria="${aria}" class="${cls}"`;
    });
  });
  log('--- Page buttons ---');
  for (const b of btns) log(b);
}

async function getKeyRows(page: any): Promise<number> {
  return page.evaluate(() => {
    // Walk all text nodes for "AIza" and map their containers
    const containers = new Set<Element>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Text | null;
    while (node = walker.nextNode() as Text | null) {
      if ((node.textContent || '').includes('AIza')) {
        let el = node.parentElement;
        let depth = 0;
        while (el && depth < 15) {
          const tag = el.tagName.toLowerCase();
          const cls = el.className || '';
          // Look for container elements that typically hold a key row
          if (tag.match(/^(li|tr|article|section)$/) ||
              cls.includes('card') || cls.includes('row') || cls.includes('item') ||
              cls.includes('list') || el.getAttribute('role') === 'listitem') {
            containers.add(el);
            break;
          }
          el = el.parentElement;
          depth++;
        }
      }
    }
    return containers.size;
  });
}

async function deleteAllKeys(page: any) {
  log('Deleting existing API keys...');

  // Dump page structure for debugging
  if (DEBUG || true) {
    await dumpPageStructure(page);
  }

  let deleted = 0;

  while (true) {
    // Find a menu/delete button within a key row using DOM traversal
    const target = await page.evaluate(() => {
      // Walk text nodes for "AIza" and find the nearest container with a menu/delete button
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Text | null;
      while (node = walker.nextNode() as Text | null) {
        if (!(node.textContent || '').includes('AIza')) continue;
        if (!node.parentElement || (node.parentElement as HTMLElement).offsetParent === null) continue;

        let el: HTMLElement | null = node.parentElement;
        let depth = 0;
        while (el && depth < 15) {
          // Look for menu/delete buttons within this element
          const menuBtn = el.querySelector<HTMLElement>(
            'button[aria-label*="more" i], button[aria-label*="menu" i], [role="button"][aria-label*="more" i]'
          );
          if (menuBtn && menuBtn.offsetParent !== null) {
            const rect = menuBtn.getBoundingClientRect();
            return { found: 'menu', x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          }
          const delBtn = el.querySelector<HTMLElement>(
            'button[aria-label*="delete" i], [aria-label*="delete" i][role="button"]'
          );
          if (delBtn && delBtn.offsetParent !== null) {
            const rect = delBtn.getBoundingClientRect();
            return { found: 'delete', x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          }
          el = el.parentElement;
          depth++;
        }
      }
      return { found: 'none', x: 0, y: 0 };
    });

    if (target.found === 'none') {
      log('No more key rows with delete menus found.');
      break;
    }

    // Click via mouse move (human-like) at the target coordinates
    log(`Clicking ${target.found} button for key #${deleted + 1}...`);
    const box = { x: target.x - 10, y: target.y - 10, width: 20, height: 20 };
    await humanLikeMoveCoords(page, target.x, target.y);
    await sleep(rand(50, 150));
    await page.mouse.click(target.x, target.y);
    debug(`clicked at ${target.x}, ${target.y}`);
    await sleep(rand(2000, 3000));

    if (target.found === 'menu') {
      // Menu was opened — now click "Delete" in the dropdown
      const delOption = await page.evaluate(() => {
        // Look for a visible menu item with "Delete" text
        const items = document.querySelectorAll<HTMLElement>(
          '[role="menuitem"], [role="option"], li, [class*="menu"] button, [class*="dropdown"] button'
        );
        for (const item of items) {
          if (item.offsetParent === null) continue;
          const text = (item.textContent || '').toLowerCase().trim();
          if (text === 'delete' || text.startsWith('delete') || text.includes('delete key')) {
            const rect = item.getBoundingClientRect();
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          }
        }
        return null;
      });

      if (delOption) {
        log('Clicking "Delete" in menu...');
        await humanLikeMoveCoords(page, delOption.x, delOption.y);
        await sleep(rand(50, 150));
        await page.mouse.click(delOption.x, delOption.y);
        await sleep(rand(2000, 3000));
      } else {
        log('Could not find "Delete" option in menu. Pressing Escape.');
        await page.keyboard.press('Escape');
        await sleep(1000);
        continue;
      }
    }

    // Confirm deletion dialog
    const confirmBtn = await page.evaluate(() => {
      const btns = document.querySelectorAll<HTMLElement>('button, [role="button"]');
      for (const btn of btns) {
        if (btn.offsetParent === null) continue;
        const t = (btn.textContent || '').toLowerCase().trim();
        if (t === 'delete' || t === 'confirm' || t === 'yes' || t.startsWith('delete key') || t.startsWith('confirm delete')) {
          const rect = btn.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
      return null;
    });

    if (confirmBtn) {
      log('Confirming deletion...');
      await humanLikeMoveCoords(page, confirmBtn.x, confirmBtn.y);
      await sleep(rand(50, 150));
      await page.mouse.click(confirmBtn.x, confirmBtn.y);
      await sleep(rand(2000, 3000));
    }

    deleted++;
    log(`Deleted key #${deleted}`);
    log('Waiting 10 seconds before next action...');
    await sleep(10000);
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
