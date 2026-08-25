import { expect, test } from '@playwright/test';
import {
  localDateFromToday,
  resetWorkspace,
  seedWorkspace,
  taskFixture,
} from './test-helpers';

test.beforeEach(async ({ page }) => {
  await resetWorkspace(page);
});

async function quickAdd(page: import('@playwright/test').Page, title: string) {
  await page.getByLabel('What needs your attention?').fill(title);
  await page.getByRole('button', { name: 'Add note' }).click();
}

test('captures rich details and preserves them across reload', async ({ page }) => {
  await quickAdd(page, 'Prepare launch brief');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Description').fill('Collect the final narrative and links.');
  await page.getByLabel('Due date').fill(localDateFromToday(3));
  await page.getByLabel('Priority', { exact: true }).selectOption('high');
  await page.getByLabel('Category').fill('Launch');
  await page.getByLabel('Tags').fill('Planning, Deep Work, planning');
  await page.getByLabel('Recurrence').selectOption('weekly');
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  const card = page.getByTestId('task-item');
  await expect(card).toContainText('Collect the final narrative and links.');
  await expect(card).toContainText('high priority');
  await expect(card).toContainText('Category: Launch');
  await expect(card).toContainText('#Planning');
  await expect(card).toContainText('#Deep Work');
  await expect(card).toContainText('Repeats weekly');

  await page.reload();
  await expect(page.getByTestId('task-item')).toContainText('Collect the final narrative and links.');
});

test('composes search, status filters, Today, and Upcoming views', async ({ page }) => {
  await seedWorkspace(page, [
    taskFixture('overdue', 'Send budget', {
      dueDate: localDateFromToday(-2),
      description: 'Finance review',
      priority: 'high',
    }),
    taskFixture('today', 'Call supplier', { dueDate: localDateFromToday(), tags: ['phone'] }),
    taskFixture('future', 'Book workshop', { dueDate: localDateFromToday(4), category: 'Team' }),
    taskFixture('done', 'Archive notes', { dueDate: localDateFromToday(), completed: true }),
  ]);

  await page.getByLabel('Search tasks').fill('finance');
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByText('Send budget')).toBeVisible();
  await page.getByLabel('Search tasks').fill('');
  await page.getByLabel('Status filter').selectOption('overdue');
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-item').getByText('Overdue', { exact: true })).toBeVisible();

  await page.getByLabel('Status filter').selectOption('all');
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(page.getByText('Send budget')).toBeVisible();
  await expect(page.getByText('Call supplier')).toBeVisible();
  await expect(page.getByText('Archive notes')).not.toBeVisible();
  await page.getByLabel('Show completed tasks today').check();
  await expect(page.getByText('Archive notes')).toBeVisible();

  await page.getByRole('button', { name: 'Upcoming', exact: true }).click();
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByText('Book workshop')).toBeVisible();
});

test('manages subtasks, progress, and parent auto-completion', async ({ page }) => {
  await quickAdd(page, 'Publish release');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Complete the parent automatically').check();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Edit' }).click();

  const addSubtask = page.getByLabel('Add a subtask to Publish release');
  await addSubtask.fill('Write announcement');
  await page.getByRole('button', { name: 'Add subtask' }).click();
  await addSubtask.fill('Notify customers');
  await page.getByRole('button', { name: 'Add subtask' }).click();
  await expect(page.getByText('0/2')).toBeVisible();

  await page.getByRole('button', { name: 'Delete subtask: Notify customers' }).click();
  await page.getByRole('button', { name: 'Confirm delete' }).click();
  await expect(page.getByText('0/1')).toBeVisible();
  await addSubtask.fill('Notify customers');
  await page.getByRole('button', { name: 'Add subtask' }).click();

  await page.getByRole('button', { name: 'Edit subtask: Write announcement' }).click();
  await page.getByLabel('Edit subtask: Write announcement').fill('Write launch announcement');
  await page.getByRole('button', { name: 'Save subtask' }).click();
  await page.getByRole('button', { name: 'Complete subtask: Write launch announcement' }).click();
  await expect(page.getByText('1/2')).toBeVisible();
  await page.getByRole('button', { name: 'Reopen subtask: Write launch announcement' }).click();
  await expect(page.getByText('0/2')).toBeVisible();
  await page.getByRole('button', { name: 'Complete subtask: Write launch announcement' }).click();
  await page.getByRole('button', { name: 'Complete subtask: Notify customers' }).click();
  await expect(page.getByRole('button', { name: 'Reopen Publish release' })).toBeVisible();
});

test('creates one future occurrence for a recurring task', async ({ page }) => {
  const dueDate = localDateFromToday(1);
  const nextDueDate = localDateFromToday(2);
  await quickAdd(page, 'Daily review');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Due date').fill(dueDate);
  await page.getByLabel('Recurrence').selectOption('daily');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Complete Daily review' }).click();

  await expect(page.getByTestId('task-item')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Reopen Daily review' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Complete Daily review' })).toHaveCount(1);
  await expect(page.getByText(`Due ${nextDueDate}`)).toBeVisible();

  await page.getByRole('button', { name: 'Reopen Daily review' }).click();
  await page.getByRole('button', { name: 'Complete Daily review' }).first().click();
  await expect(page.getByTestId('task-item')).toHaveCount(2);
});

test('persists manual order and disables reordering under automatic sort', async ({ page }) => {
  await quickAdd(page, 'First task');
  await quickAdd(page, 'Second task');
  await quickAdd(page, 'Third task');
  await page.getByTestId('task-item').first().dragTo(page.getByTestId('task-item').nth(2));
  await expect(page.getByTestId('task-item').first()).toContainText('Second task');
  await page.getByRole('button', { name: 'Move down' }).first().press('Enter');
  await expect(page.getByTestId('task-item').first()).toContainText('First task');
  await page.reload();
  await expect(page.getByTestId('task-item').first()).toContainText('First task');

  await page.getByLabel('Sort tasks').selectOption('priority');
  await expect(page.getByRole('button', { name: 'Move down' }).first()).toBeDisabled();
  await expect(page.getByText('Manual reorder is unavailable while automatic sorting is active.')).toBeVisible();
  await page.getByLabel('Sort tasks').selectOption('manual');
  await expect(page.getByTestId('task-item').first()).toContainText('First task');
});

test('updates full-collection statistics and persists the dark theme', async ({ page }) => {
  await seedWorkspace(page, [
    taskFixture('late', 'Late item', { dueDate: localDateFromToday(-1) }),
    taskFixture('done', 'Done item', { completed: true }),
  ]);

  const summary = page.getByRole('region', { name: 'Productivity summary' });
  await expect(summary).toContainText(/Total tasks\s*2/);
  await expect(summary).toContainText(/Completed tasks\s*1/);
  await expect(summary).toContainText(/Active tasks\s*1/);
  await expect(summary).toContainText(/Overdue tasks\s*1/);
  await expect(summary).toContainText('50% complete');

  await page.getByRole('button', { name: 'Dark theme: off' }).press('Enter');
  await expect(page.locator('body')).toHaveClass(/theme-dark/);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Dark theme: on' })).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/theme-dark/);
});

test('updates visible statistics through task mutations and recurrence', async ({ page }) => {
  const summary = page.getByRole('region', { name: 'Productivity summary' });
  await quickAdd(page, 'Measured task');
  await expect(summary).toContainText(/Total tasks\s*1/);
  await expect(summary).toContainText(/Active tasks\s*1/);

  await page.getByRole('button', { name: 'Complete Measured task' }).click();
  await expect(summary).toContainText(/Completed tasks\s*1/);
  await expect(summary).toContainText('100% complete');
  await page.getByRole('button', { name: 'Reopen Measured task' }).click();
  await expect(summary).toContainText(/Completed tasks\s*0/);

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Due date').fill(localDateFromToday(-1));
  await page.getByLabel('Recurrence').selectOption('daily');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(summary).toContainText(/Overdue tasks\s*1/);
  await page.getByRole('button', { name: 'Complete Measured task' }).click();
  await expect(summary).toContainText(/Total tasks\s*2/);
  await expect(summary).toContainText(/Completed tasks\s*1/);
  await expect(summary).toContainText(/Active tasks\s*1/);

  await page.getByTestId('task-item').first().getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete task' }).click();
  await expect(summary).toContainText(/Total tasks\s*1/);
});

test('migrates legacy tasks and retains an in-memory change after storage failure', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('todo-notes.tasks', JSON.stringify({
      version: 1,
      tasks: [{
        id: 'legacy',
        text: 'Legacy task',
        completed: true,
        createdAt: '2026-08-24T12:00:00.000Z',
        updatedAt: '2026-08-24T12:00:00.000Z',
      }],
    }));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Reopen Legacy task' })).toBeVisible();

  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new Error('storage full'); };
  });
  await quickAdd(page, 'Visible unsaved task');
  await expect(page.getByText('Visible unsaved task')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('could not be saved');
});

test('wraps long rich content without horizontal scrolling at supported widths', async ({ page }) => {
  const longText = 'Long-content '.repeat(24).trim();
  await seedWorkspace(page, [taskFixture('long', longText, {
    description: longText,
    category: longText,
    tags: [longText],
    subtasks: [{
      id: 'long-subtask',
      title: longText,
      completed: false,
      manualOrder: 0,
      createdAt: '2026-08-24T12:00:00.000Z',
      updatedAt: '2026-08-24T12:00:00.000Z',
    }],
  })]);
  await page.getByRole('button', { name: 'Edit' }).click();

  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflows).toBe(false);
  }
});
