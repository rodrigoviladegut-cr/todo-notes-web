# Quickstart: Organized Productivity

## Prerequisites

- Node.js 20 or newer
- A modern desktop or mobile browser
- Existing TODO Notes data is optional; migration is tested with both legacy and expanded
  workspace data

## Run and Validate

```bash
npm install
npm run dev
npm run check
npm run test:unit
npm run test:e2e
npm run build
```

Expected result: checks, unit tests, browser acceptance tests, and the production build all
complete successfully.

### Validation Record

Validated on 2026-08-25:

- `npm run check`: passed with 0 errors and 0 warnings.
- `npm run test:unit`: passed 41 tests across 9 files.
- `npm run test:e2e`: passed 13 Chromium acceptance tests.
- `npm run build`: passed with a production bundle generated successfully.

## Acceptance Scenarios

1. Create a title-only task and confirm it appears immediately without opening advanced
   controls. Add a description, due date, priority, category, and tags, reload, and confirm
   every value remains.
2. Create active, completed, overdue, today, and future tasks. Verify All, Active, Completed,
   and Overdue filters, then combine search with a filter and each automatic sort.
3. Open Today and confirm incomplete overdue and due-today tasks appear while completed tasks
   are hidden by default. Open Upcoming and confirm future incomplete tasks are chronological.
4. Add, edit, complete, reopen, and delete subtasks. Verify progress and that completing all
   subtasks leaves the parent active unless parent auto-completion is enabled.
5. Configure Daily, Weekly, and Monthly recurring tasks. Complete each and verify one future
   occurrence with copied details and reset completion states.
6. Drag tasks in manual mode, reload, and verify order. Enable automatic sorting and verify
   drag controls are disabled; disable it and verify manual order returns.
7. Verify total, completed, active, overdue, and completion percentage statistics after
   create, complete, reopen, recurring completion, and delete actions.
8. Switch light/dark themes, reload, and verify the preference and accessible state contrast.
9. Load a legacy simple task payload and verify title, completion state, and order survive
   migration with safe defaults.
10. Exercise storage read/write failures and verify the last valid visible state remains with
    recovery feedback.
