import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('creates, validates, displays, and persists tasks', async ({ page }) => {
  await expect(page.getByText('A clear page.')).toBeVisible();

  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByText('Write something you want to remember.')).toBeVisible();

  await page.getByLabel('What needs your attention?').fill('  Send the project notes  ');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByText('Send the project notes')).toBeVisible();
  await expect(page.getByText('1 note / 1 open')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Send the project notes')).toBeVisible();
});

test('completes and reopens a task with reload persistence', async ({ page }) => {
  await page.getByLabel('What needs your attention?').fill('Review the draft');
  await page.getByRole('button', { name: 'Add note' }).click();

  await page.getByRole('button', { name: 'Complete Review the draft' }).press('Enter');
  await expect(page.getByText('1 note / 0 open')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Reopen Review the draft' })).toBeVisible();

  await page.getByRole('button', { name: 'Reopen Review the draft' }).click();
  await expect(page.getByText('1 note / 1 open')).toBeVisible();
});

test('edits and deliberately deletes a task', async ({ page }) => {
  await page.getByLabel('What needs your attention?').fill('Rough task');
  await page.getByRole('button', { name: 'Add note' }).click();
  await page.getByRole('button', { name: 'Complete Rough task' }).click();

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Edit task').fill('   ');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('A task cannot be empty.')).toBeVisible();
  await page.getByLabel('Edit task').fill('Polished task');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button', { name: 'Reopen Polished task' })).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Keep task' }).click();
  await expect(page.getByText('Polished task')).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete task' }).click();
  await expect(page.getByText('A clear page.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('A clear page.')).toBeVisible();
});

test('supports keyboard focus and a 320px responsive viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Field Notes home' })).toBeFocused();

  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflows).toBe(false);
});
