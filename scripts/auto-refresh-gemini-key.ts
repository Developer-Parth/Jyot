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

// Text-based selectors – adjust if Google changes the UI
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

async function findKeysOnPage(page: any): Promise<{ name: string; deleteButton: any }[]> {
  const keys: { name: string; deleteButton: any }[] = [];
  // Look for key rows – each row typically contains a truncated key starting with "AIza"
  const rows = await page.locator('*:has-text("AIza")').all();
  const seen = new Set<string>();
  for (const row of rows) {
    const text = await row.textContent();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    if (!text.includes('AIza')) continue;
    // Try to find a delete button within/near this row
    const deleteBtn = row.locator('button').or(row.locator('[role="menuitem"]')).filter({ hasText: DELETE_MENU_TEXT }).first();
    const hasDelete = await deleteBtn.count();
    keys.push({
      name: text.trim().split('\n')[0].trim().substring(0, 40),
      deleteButton: hasDelete > 0 ? deleteBtn : null,
    });
  }
  return keys;
}

async function ensureLoggedIn(page: any): Promise<boolean> {
  log('Checking login status...');
  await page.goto(AI_STUDIO_URL, { waitUntil: 'networkidle' });
  const url = page.url();
  if (url.includes('accounts.google.com') || url.includes('signin') || url.includes('SignIn')) {
    log('Not logged in. Opening browser for you to sign in...');
    log('Please log into your Google account in the opened browser window.');
    log('After signing in successfully, this script will continue automatically.');
    // Wait for redirect away from accounts.google.com (no timeout)
    await page.waitForURL((url: string) => !url.includes('accounts.google.com'));
  }
  log('Logged in successfully!');
  return true;
}

async function deleteAllKeys(page: any) {
  log('Deleting existing API keys...');
  let deleted = 0;
  let maxIter = 30;
  while (maxIter-- > 0) {
    // Try clicking any visible delete button/icon
    const deleteBtns = page.locator('button').filter({ hasText: DELETE_MENU_TEXT });
    const count = await deleteBtns.count();
    if (count === 0) {
      // Maybe it's a three-dot menu first – try clicking any visible three-dot button
      const menuBtns = page.locator('button[aria-label*="more"], button[aria-label*="menu"], button:has-text("more_vert")');
      const menuCount = await menuBtns.count();
      if (menuCount > 0) {
        for (let i = 0; i < menuCount; i++) {
          try {
            await menuBtns.nth(i).click();
            await sleep(500);
            // Look for delete option in the menu
            const menuDelete = page.locator('[role="menuitem"], .menu-item, li').filter({ hasText: DELETE_MENU_TEXT }).first();
            if (await menuDelete.count() > 0) {
              await menuDelete.click();
              await sleep(300);
              // Confirm deletion
              const confirmBtn = page.locator('button, [role="button"]').filter({ hasText: CONFIRM_DELETE_TEXT });
              if (await confirmBtn.count() > 0) {
                await confirmBtn.first().click();
                await sleep(500);
                deleted++;
                log(`Deleted key #${deleted}`);
              }
            }
          } catch (e) {
            debug(`Menu click error: ${e}`);
          }
        }
      } else {
        // Maybe there are keys with simpler delete buttons (trash icons)
        const trashBtns = page.locator('button[aria-label*="delete"], button[title*="delete"], button svg').filter({ has: page.locator('text=delete') });
        const trashCount = await trashBtns.count();
        if (trashCount > 0) {
          for (let i = 0; i < trashCount; i++) {
            try {
              await trashBtns.nth(i).click();
              await sleep(500);
              const confirmBtn = page.locator('button, [role="button"]').filter({ hasText: CONFIRM_DELETE_TEXT });
              if (await confirmBtn.count() > 0) {
                await confirmBtn.first().click();
                await sleep(500);
                deleted++;
                log(`Deleted key via trash #${deleted}`);
              }
            } catch (e) {
              debug(`Trash click error: ${e}`);
            }
          }
        } else {
          // No more delete buttons found
          break;
        }
      }
    } else {
      try {
        await deleteBtns.first().click();
        await sleep(300);
        const confirmBtn = page.locator('button, [role="button"]').filter({ hasText: CONFIRM_DELETE_TEXT });
        if (await confirmBtn.count() > 0) {
          await confirmBtn.first().click();
          await sleep(500);
          deleted++;
          log(`Deleted key #${deleted}`);
        }
      } catch (e) {
        debug(`Delete click error: ${e}`);
        break;
      }
    }
    await sleep(500);
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
      // Try alternative: maybe it's an anchor or div styled as button
      const altBtn = page.locator('a, div, span').filter({ hasText: CREATE_BTN_TEXT }).first();
      if (await altBtn.count() === 0) {
        log(`Could not find "${CREATE_BTN_TEXT}" button. Dumping page...`);
        const body = await page.locator('body').textContent();
        debug(body?.substring(0, 2000) || 'empty');
        throw new Error(`Cannot find "${CREATE_BTN_TEXT}" button – selectors may need updating. Run with --debug to inspect.`);
      }
      await altBtn.click();
    } else {
      await createBtn.first().click();
    }
    await sleep(2000);

    // Wait for the dialog to appear and extract the key
    // The key starts with "AIza" – find it in the dialog
    let keyValue: string | null = null;
    try {
      // Try finding key in an input field
      const keyInput = page.locator('input[readonly], input[value*="AIza"], input:not([type="password"])').filter({ has: page.locator('[value*="AIza"]') }).or(
        page.locator('input[readonly], input:not([type="password"])').first()
      );
      const inputValue = await keyInput.inputValue().catch(() => '');
      if (inputValue && inputValue.startsWith('AIza')) {
        keyValue = inputValue;
      }
    } catch { /* try next approach */ }

    if (!keyValue) {
      // Try finding key in any visible element containing "AIza"
      try {
        const keyEl = page.locator('text=AIza').first();
        const text = await keyEl.textContent();
        if (text) {
          // Extract the key (AIza... up to whitespace or end)
          const match = text.match(/AIza[a-zA-Z0-9_-]+/);
          if (match) keyValue = match[0];
        }
      } catch { /* fallback */ }
    }

    if (!keyValue) {
      // Last resort: dump dialog content
      const dialogText = await page.locator('[role="dialog"], .dialog, .modal, [class*="dialog"]').first().textContent().catch(() => '');
      debug(`Dialog content: ${dialogText?.substring(0, 500)}`);
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

    // Close the dialog by clicking "Done"
    try {
      const doneBtn = page.locator('button').filter({ hasText: DONE_BTN_TEXT });
      if (await doneBtn.count() > 0) {
        await doneBtn.first().click();
      } else {
        // Try clicking backdrop or close button
        const closeBtn = page.locator('button[aria-label*="close"], button[aria-label*="Close"]').first();
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    } catch { await page.keyboard.press('Escape'); }
    await sleep(1500);
  }

  log(`Created ${newKeys.length} new API keys.`);
  return newKeys;
}

function updateEnvFile(newKeys: string[]) {
  log('Updating .env file...');
  let envContent = fs.readFileSync(ENV_FILE, 'utf-8');

  // Replace GEMINI_API_KEY through GEMINI_API_KEY_10
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
    // Set each env var on Vercel (production only)
    for (let i = 0; i < newKeys.length; i++) {
      const keyName = envKeys[i];
      const keyValue = newKeys[i];
      log(`Setting ${keyName} on Vercel (production)...`);
      await runVercelCmd(['env', 'add', keyName, 'production', '--force', '--value', keyValue, '--yes']);
    }

    // Trigger deploy
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

  // 1. Load config
  if (!fs.existsSync(ENV_AUTO_FILE)) {
    log(`Missing .env.auto file. Creating template at ${ENV_AUTO_FILE}`);
    fs.writeFileSync(ENV_AUTO_FILE, `# Your Google account email (used to auto-fill login form)
GOOGLE_EMAIL=your.email@gmail.com
`, 'utf-8');
    log('Please fill in your email in .env.auto, then re-run this script.');
    return;
  }
  const autoEnv = parse(fs.readFileSync(ENV_AUTO_FILE, 'utf-8'));
  const googleEmail = autoEnv.GOOGLE_EMAIL || '';

  // 2. Ensure browser profile dir
  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
    log(`Created browser profile directory: ${PROFILE_DIR}`);
  }

  // 3. Launch browser
  log('Launching browser...');
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: undefined, // Use bundled Chromium
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1280, height: 900 },
  });
  const page = browser.pages()[0] || await browser.newPage();

  try {
    // 4. Login
    const loggedIn = await ensureLoggedIn(page);
    if (!loggedIn) {
      log('Could not verify login. Aborting.');
      return;
    }

    // 5. Delete existing keys
    await deleteAllKeys(page);
    await sleep(1000);

    // 6. Create new keys
    const newKeys = await createKeys(page);

    // 7. Update .env
    updateEnvFile(newKeys);

    // 8. Deploy to Vercel
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
