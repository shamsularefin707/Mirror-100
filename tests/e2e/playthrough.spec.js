import { test, expect } from '@playwright/test';

// Plays the whole game: age entry, the scene, four questions, the report.

// Serve an empty font stylesheet so the tests run offline and stay deterministic.
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
});
async function enterAge(page, age) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /MIRROR\s*100/ })).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByLabel('How old are you?').fill(String(age));
  await page.getByRole('button', { name: 'Continue' }).click();
}

async function answerAll(page, pickResponsible) {
  for (let i = 0; i < 4; i++) {
    await expect(page.getByText(`Question ${i + 1} of 4`)).toBeVisible();
    const options = page.locator('.option');
    await expect(options).toHaveCount(4);
    const texts = await options.allTextContents();
    const pattern = pickResponsible(i);
    const idx = texts.findIndex((t) => pattern.test(t));
    expect(idx, `option matching ${pattern} on question ${i + 1}`).toBeGreaterThanOrEqual(0);
    await options.nth(idx).click();
    await expect(page.getByText('Perspective Shift')).toBeVisible();
    await page.getByRole('button', { name: i < 3 ? 'Next question' : 'See your Mirror Report' }).click();
  }
}

test('validates the age field', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Enter your age to begin.')).toBeVisible();
  await page.getByLabel('How old are you?').fill('9');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText(/made for ages 13 to 60/)).toBeVisible();
});

test('a fully responsible player ends 20 years older and 100% responsible', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await enterAge(page, 19);
  await expect(page.getByRole('heading', { name: 'The Cyberbullying Dilemma' })).toBeVisible();
  await page.getByRole('button', { name: 'Watch the scene' }).click();

  // Play a few seconds of the scene, then make sure time advances.
  await page.getByRole('button', { name: 'Play the scene' }).click();
  await page.waitForTimeout(2500);
  const t = Number(await page.locator('.ctl-seek').inputValue());
  expect(t).toBeGreaterThan(1);
  await page.getByRole('button', { name: /Skip to the questions/ }).click();

  const responsible = [/Refuse, delete it/, /Report the post/, /offer to help her report/, /Keep your decision/];
  await answerAll(page, (i) => responsible[i]);

  await expect(page.getByText(/You are\s*100%\s*responsible digital citizen/)).toBeVisible();
  await expect(page.locator('.ages-mental b')).toHaveText('39', { timeout: 5000 });
  await expect(page.getByText('Responsible Digital Citizen ·')).toBeVisible();
  expect(errors).toEqual([]);
});

test('a mixed player sees growth areas and the better choice', async ({ page }) => {
  await enterAge(page, 22);
  await page.getByRole('button', { name: 'Watch the scene' }).click();
  await page.getByRole('button', { name: /Skip to the questions/ }).click();

  const picks = [/Share it in the batch group/, /Report the post/, /Leave her alone/, /Keep your decision/];
  for (let i = 0; i < 4; i++) {
    const options = page.locator('.option');
    const texts = await options.allTextContents();
    await options.nth(texts.findIndex((x) => picks[i].test(x))).click();
    if (i === 0) {
      await expect(page.getByText('A more responsible choice')).toBeVisible();
      await expect(page.locator('.shift-years')).toContainText('−5');
    }
    await page.locator('[data-next]').click();
  }
  await expect(page.getByText(/You are\s*50%\s*responsible digital citizen/)).toBeVisible();
  await expect(page.locator('.ages-mental b')).toHaveText('22', { timeout: 5000 });
  await expect(page.getByText('To work on')).toBeVisible();
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
});

test('the scene plays to the end and offers the questions', async ({ page }) => {
  await enterAge(page, 18);
  await page.getByRole('button', { name: 'Watch the scene' }).click();
  await page.getByRole('button', { name: 'Play the scene' }).click();
  // Jump near the end instead of waiting 70 seconds.
  await page.locator('.ctl-seek').evaluate((el) => { el.value = String(Number(el.max) - 1.5); el.dispatchEvent(new Event('input')); });
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByRole('button', { name: 'Answer the questions' })).toBeVisible({ timeout: 6000 });
  await expect(page.locator('.freeze-text')).toBeVisible();
});

test('no horizontal scrolling on any screen', async ({ page }) => {
  await enterAge(page, 20);
  for (const step of ['intro', 'video', 'question']) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, step).toBeLessThanOrEqual(0);
    if (step === 'intro') await page.getByRole('button', { name: 'Watch the scene' }).click();
    if (step === 'video') await page.getByRole('button', { name: /Skip to the questions/ }).click();
  }
});
