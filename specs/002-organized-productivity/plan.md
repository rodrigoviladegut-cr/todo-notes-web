# Implementation Plan: Organized Productivity

**Branch**: `add-groups` | **Date**: 2026-08-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-organized-productivity/spec.md`

## Summary

Evolve the existing local-first TODO notebook into a focused productivity workspace without
slowing title-only capture. Extend the task model and versioned persistence format, derive
search/filter/view/sort results from one query state, and add subtasks, recurrence, manual
ordering, statistics, and theme preferences through small Svelte components and plain
TypeScript modules.

## Technical Context

**Language/Version**: TypeScript with the existing Node.js 20-compatible Vite/Svelte toolchain

**Primary Dependencies**: Existing Vite, Svelte 5, Vitest, Playwright, and browser APIs; no
new state-management framework or server dependency

**Storage**: Existing versioned browser-storage repository, expanded with migration from the
simple task schema

**Testing**: TypeScript unit tests for migration, date/recurrence, query, ordering, subtasks,
statistics, and preferences; Playwright acceptance tests for each prioritized workflow

**Target Platform**: Current desktop and mobile browsers from 320px through 1440px

**Project Type**: Single-page local-first web application

**Performance Goals**: Search, filtering, sorting, focused views, and statistics update within
1 second for 1,000 tasks; task interactions remain immediate and initial load stays local

**Constraints**: Preserve existing task data and order; keep quick creation title-only; all
task content remains local; automatic sort overrides drag ordering; keyboard alternatives
must exist for drag-and-drop; no reminders, accounts, sharing, or sync in this feature

**Scale/Scope**: One responsive productivity workspace with task detail editing, seven user
stories, one persisted task collection, and up to 1,000 tasks in the tested interaction scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: The feature remains centered on task management and keeps simple creation as the P1
  flow; advanced properties are optional.
- PASS: The implementation continues to use Vite and Svelte with plain TypeScript modules.
- PASS: A single derived query pipeline will compose search, filters, views, and sorting;
  no separate state framework is introduced.
- PASS: Existing versioned storage is migrated without losing title, completion state, or
  manual order; malformed data and write errors preserve the last known state.
- PASS: Date-only overdue and recurrence calculations use local calendar rules and have
  deterministic tests for month-end behavior.
- PASS: Drag-and-drop includes keyboard-accessible reorder controls, and automatic sorting
  disables manual reordering.
- PASS: Light/dark themes, overdue/high-priority/completed states, and status messaging are
  distinguishable without color alone and work at mobile and desktop widths.
- PASS: Unit and browser acceptance tests cover every user story and the production build.

**Post-design gate**: These constraints remain satisfied after the data model and query
design below; no complexity exception is required.

## Project Structure

### Documentation

```text
specs/002-organized-productivity/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
src/
├── lib/
│   ├── task-model.ts
│   ├── task-repository.ts
│   ├── task-migration.ts
│   ├── task-queries.ts
│   ├── recurrence.ts
│   ├── task-statistics.ts
│   ├── task-preferences.ts
│   └── task-store.ts
├── components/
│   ├── TaskComposer.svelte
│   ├── TaskItem.svelte
│   ├── TaskDetails.svelte
│   ├── SubtaskList.svelte
│   ├── TaskToolbar.svelte
│   ├── TaskViews.svelte
│   ├── ProductivitySummary.svelte
│   ├── ThemeToggle.svelte
│   └── StorageMessage.svelte
├── App.svelte
├── main.ts
└── app.css

tests/
├── unit/
│   ├── task-migration.test.ts
│   ├── task-queries.test.ts
│   ├── recurrence.test.ts
│   ├── subtasks.test.ts
│   ├── task-statistics.test.ts
│   └── task-preferences.test.ts
└── e2e/
    └── organized-productivity.spec.ts
```

**Structure Decision**: Extend the existing single-project structure rather than replacing
the app. `src/lib` owns normalized entities, migration, persistence, derived queries,
recurrence, statistics, and preferences. Svelte components own presentation and events.
The one query pipeline returns the visible task set, while statistics always read the full
collection. No external contracts directory is needed because this feature has no public API
or service boundary.

## Complexity Tracking

No constitution violations or complexity exceptions are required.
