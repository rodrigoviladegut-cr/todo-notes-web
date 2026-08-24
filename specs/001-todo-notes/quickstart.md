# Quickstart: TODO Notes Web App

## Prerequisites

- Current Node.js LTS and npm
- A modern desktop or mobile browser

## Install and Run

From the repository root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Automated Validation

```bash
npm run check
npm run test:unit
npm run test:e2e
npm run build
```

Expected result: static checks, unit tests, browser acceptance tests, and the production
build complete successfully.

## Manual Acceptance Scenarios

1. Create a task with non-empty text. Confirm it appears as incomplete. Reload and confirm
   it remains present.
2. Mark the task complete, reload, and confirm the completed state remains. Reopen it and
   confirm it returns to incomplete.
3. Edit the task with valid text and confirm its completion state is unchanged. Try an
   empty edit and confirm the original text remains with validation feedback.
4. Start deleting a task and cancel. Confirm it remains. Repeat and confirm deletion, then
   reload and confirm it stays deleted.
5. Use only the keyboard to create, edit, toggle, confirm, and cancel actions. Confirm
   focus is visible and every action has an accessible name.
6. Check the empty state and test viewport widths of 320px, 768px, and 1440px. Confirm no
   horizontal scrolling is required.

## Validation Record

Validated on 2026-08-24 with Node.js 20:

- `npm run check`: passed with 0 errors and 0 warnings.
- `npm run test:unit`: 10 tests passed across 3 test files.
- `npm run test:e2e`: 4 Chromium acceptance tests passed.
- `npm run build`: production build completed successfully.
- `npm audit`: 0 vulnerabilities.
