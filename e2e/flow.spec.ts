import { expect, test, type Page } from '@playwright/test';

async function setDevPanel(page: Page, open: boolean): Promise<void> {
  const toggle = page.getByRole('button', { name: 'DEV' });
  if ((await toggle.getAttribute('aria-expanded')) !== String(open)) await toggle.click();
}

async function devClick(page: Page, label: string, times = 1): Promise<void> {
  await setDevPanel(page, true);
  for (let i = 0; i < times; i++) await page.getByRole('button', { name: label, exact: true }).click();
}

async function dismissCard(page: Page, text: RegExp): Promise<void> {
  const card = page.getByRole('dialog');
  await expect(card).toContainText(text);
  await card.getByRole('button', { name: 'Yay!' }).click();
  await expect(card).toBeHidden();
}

test('adopt, care, grow, adventure, wardrobe and save code', async ({ page }) => {
  await page.goto('./?dev=1');
  await expect(page).toHaveTitle('bnuuy');

  await page.getByPlaceholder('Name your bunny').fill('Clover');
  await page.getByRole('button', { name: 'Adopt' }).click();
  await expect(page.getByRole('heading', { name: 'Clover' })).toBeVisible();
  const meters = page.getByRole('meter');
  await expect(meters).toHaveCount(4);
  for (const meter of await meters.all()) await expect(meter).toHaveAttribute('aria-valuenow', '100');

  await page.getByRole('button', { name: 'Feed' }).click();
  await expect(page.getByText('Clover is full!')).toBeVisible();

  await devClick(page, '+1 h', 4);
  await setDevPanel(page, false);
  const tummy = page.getByRole('meter', { name: 'Tummy' });
  await expect(tummy).toHaveAttribute('aria-valuenow', '50');
  await page.getByRole('button', { name: 'Feed' }).click();
  await expect(tummy).toHaveAttribute('aria-valuenow', '80');
  const scene = page.getByRole('img', { name: /Clover, a baby bunny/ });
  await expect(scene).toHaveAttribute('aria-label', /1 dropping on the floor/);

  await devClick(page, '+1 day');
  await dismissCard(page, /Clover grew into a teen!/);
  await devClick(page, 'Make healthy');
  await setDevPanel(page, false);

  await page.getByRole('link', { name: 'Adventures' }).click();
  await page.getByRole('button', { name: 'Start Garden Stroll' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('Clover is on Garden Stroll. Back in 1 h.')).toBeVisible();
  await devClick(page, '+1 h');
  await dismissCard(page, /found a flower crown/i);
  await setDevPanel(page, false);

  await page.getByRole('link', { name: 'Wardrobe' }).click();
  const crown = page.getByRole('button', { name: 'Flower crown' });
  await expect(crown).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Take off' }).click();
  await expect(crown).toHaveAttribute('aria-pressed', 'false');
  await crown.click();
  await expect(crown).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('link', { name: '‹ Back' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Show save code' }).click();
  const code = await page.getByRole('textbox', { name: 'Your save code' }).inputValue();
  expect(code).toMatch(/^BNUUY1\./);
  await page.getByRole('button', { name: 'Start over' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Start over' }).click();
  await expect(page.getByPlaceholder('Name your bunny')).toBeVisible();

  await page.getByRole('button', { name: 'Have a save code?' }).click();
  await page.getByRole('textbox', { name: 'Load a save code' }).fill(code);
  await page.getByRole('button', { name: 'Load' }).click();
  await expect(page.getByRole('heading', { name: 'Clover' })).toBeVisible();
  await page.getByRole('link', { name: 'Wardrobe' }).click();
  await expect(page.getByRole('button', { name: 'Flower crown' })).toHaveAttribute('aria-pressed', 'true');
});
