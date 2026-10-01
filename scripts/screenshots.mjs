// Captures every screen and several scene frames for a visual check.
// Usage: npm run build && npm run preview, then node scripts/screenshots.mjs
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const out = 'screenshots';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: process.env.HTTPS_PROXY ? [`--proxy-server=${process.env.HTTPS_PROXY}`] : [],
});

for (const [name, opts] of [['mobile', devices['Pixel 7']], ['desktop', { viewport: { width: 1280, height: 800 } }]]) {
  const page = await (await browser.newContext({ ...opts, ignoreHTTPSErrors: true })).newPage();
  const shot = (label) => page.screenshot({ path: `${out}/${name}-${label}.png`, fullPage: true });
  await page.goto(BASE);
  await page.waitForTimeout(1800);
  await shot('01-home');
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByLabel('How old are you?').fill('19');
  await page.waitForTimeout(500);
  await shot('02-profile');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(600);
  await shot('03-intro');
  await page.getByRole('button', { name: 'Watch the scene' }).click();
  await page.waitForTimeout(600);
  await shot('04-video-start');
  await page.getByRole('button', { name: 'Play the scene' }).click();
  for (const t of [6.5, 15, 19.5, 30, 37, 47, 52, 59, 66, 69.5]) {
    await page.getByRole('button', { name: /Pause|Play/ }).first().click().catch(() => {});
    await page.locator('.ctl-seek').evaluate((el, v) => { el.value = String(v); el.dispatchEvent(new Event('input')); }, t);
    await page.waitForTimeout(300);
    if (name === 'mobile') await page.locator('.stage-wrap').screenshot({ path: `${out}/scene-${String(t).padStart(4, '0')}.png` });
  }
  await shot('05-video-later');
  await page.getByRole('button', { name: /Skip to the questions|Answer the questions/ }).click();
  await page.waitForTimeout(600);
  await shot('06-question');
  const opts1 = await page.locator('.option').allTextContents();
  await page.locator('.option').nth(opts1.findIndex((t) => /Share it in the batch/.test(t))).click();
  await page.waitForTimeout(1800);
  await shot('07-shift-bad');
  await page.locator('[data-next]').click();
  await page.waitForTimeout(500);
  const opts2 = await page.locator('.option').allTextContents();
  await page.locator('.option').nth(opts2.findIndex((t) => /Report the post/.test(t))).click();
  await page.waitForTimeout(1800);
  await shot('08-shift-good');
  await page.locator('[data-next]').click();
  for (let i = 0; i < 2; i++) {
    await page.waitForTimeout(400);
    await page.locator('.option').first().click();
    await page.waitForTimeout(500);
    await page.locator('[data-next]').click();
  }
  await page.waitForTimeout(2200);
  await page.locator('.review summary').click();
  await shot('09-report');
}
await browser.close();
console.log('saved to', out);
