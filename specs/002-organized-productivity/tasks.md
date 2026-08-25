# Tasks: Organized Productivity

**Input**: Design documents from `/specs/002-organized-productivity/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Included because the constitution requires automated coverage for task-state rules
and critical user journeys.

**Organization**: Tasks are grouped by user story and ordered by dependency.

## Phase 1: Setup

**Purpose**: Prepare the existing Vite/Svelte app for the expanded domain and test surface.

- [X] T001 Add feature-appropriate test scripts and verify existing dependency versions in `package.json`
- [X] T002 [P] Extend TypeScript include and test configuration for new unit modules in `tsconfig.json` and `vitest.config.ts`
- [X] T003 [P] Add organized-productivity browser test configuration and stable test data helpers in `playwright.config.ts` and `tests/e2e/test-helpers.ts`
- [X] T004 [P] Add expanded workspace storage key constants and schema-version fixtures in `src/lib/task-repository.ts` and `tests/unit/fixtures.ts`

## Phase 2: Foundational

**Purpose**: Establish the normalized model, migration, persistence, derived query pipeline,
preference state, and shared UI contracts before story work begins.

**CRITICAL**: User story implementation depends on this phase.

- [X] T005 [P] Define expanded `Task`, `Subtask`, `Recurrence`, `UserPreferences`, and workspace types with validation helpers in `src/lib/task-model.ts`
- [X] T006 [P] Implement idempotent migration from legacy `text` tasks to the versioned workspace envelope in `src/lib/task-migration.ts`
- [X] T007 Implement versioned workspace read/write, migration invocation, malformed-data recovery, and last-known-state behavior in `src/lib/task-repository.ts`
- [X] T008 [P] Implement local calendar date normalization, overdue checks, and date comparison helpers in `src/lib/task-model.ts`
- [X] T009 [P] Implement Daily, Weekly, and month-end-clamped Monthly next-date calculations in `src/lib/recurrence.ts`
- [X] T010 [P] Implement task statistics over the complete task collection in `src/lib/task-statistics.ts`
- [X] T011 [P] Implement persisted theme, query, Today visibility, and manual-order preference handling in `src/lib/task-preferences.ts`
- [X] T012 Implement one derived query pipeline for search, filters, Today, Upcoming, and stable automatic sorting in `src/lib/task-queries.ts`
- [X] T013 Refactor the task store to expose immutable task, subtask, preference, query, recurrence, statistics, and persistence-error transitions in `src/lib/task-store.ts`
- [X] T014 [P] Add shared task fixtures, local-date clock helpers, and storage doubles in `tests/unit/fixtures.ts` and `tests/unit/test-helpers.ts`
- [X] T015 [P] Add the app-level workspace shell, live status region, and theme class application in `src/App.svelte`
- [X] T016 [P] Add responsive light/dark design tokens, focus states, status indicators, and long-content wrapping rules in `src/app.css`

**Checkpoint**: Expanded workspace state is normalized, persisted, queryable, and testable.

## Phase 3: User Story 1 - Capture and Enrich Tasks (Priority: P1) MVP

**Goal**: Preserve fast title-only creation while supporting editable rich task details and
legacy task migration.

**Independent Test**: Create a title-only task, edit rich details, reload, and verify all
values and legacy records persist.

### Tests

- [X] T017 [P] [US1] Test expanded defaults, title validation, tag normalization, and legacy migration in `tests/unit/task-migration.test.ts`
- [X] T018 [P] [US1] Test task detail mutations preserve completion state and persist all fields in `tests/unit/task-model.test.ts`
- [X] T019 [US1] Add quick-create, detail editing, reload persistence, and legacy-task browser coverage in `tests/e2e/organized-productivity.spec.ts`

### Implementation

- [X] T020 [P] [US1] Keep title-only quick creation fast and default new tasks to Medium with no optional details in `src/components/TaskComposer.svelte`
- [X] T021 [P] [US1] Build editable title, description, due-date, priority, category, and tag controls with validation in `src/components/TaskDetails.svelte`
- [X] T022 [US1] Display expanded task metadata, overdue/high-priority/completed distinctions, and an advanced-details affordance in `src/components/TaskItem.svelte`
- [X] T023 [US1] Connect task creation, detail updates, migration status, and persistence feedback through the expanded store in `src/App.svelte`
- [X] T024 [US1] Add responsive task-detail and tag styles that keep quick creation and long content usable in `src/app.css`
- [X] T025 [US1] Verify P1 scenarios and migration behavior against `specs/002-organized-productivity/quickstart.md` in `tests/e2e/organized-productivity.spec.ts`

**Checkpoint**: User Story 1 is independently functional and is the MVP.

## Phase 4: User Story 2 - Find and Focus Tasks (Priority: P2)

**Goal**: Provide composable search, task-state filters, due-date/priority sorting, Today,
and Upcoming views.

**Independent Test**: Populate varied tasks and verify each query criterion alone and in
combination, including correct overdue and date-view behavior.

### Tests

- [X] T026 [P] [US2] Test search fields, All/Active/Completed/Overdue filters, stable sorting, Today, and Upcoming in `tests/unit/task-queries.test.ts`
- [X] T027 [US2] Add combined search/filter/sort and Today/Upcoming browser scenarios in `tests/e2e/organized-productivity.spec.ts`

### Implementation

- [X] T028 [US2] Build search, filter, sort, and Today/Upcoming controls with accessible labels in `src/components/TaskToolbar.svelte`
- [X] T029 [US2] Build Today and Upcoming view navigation plus completed-Today visibility control in `src/components/TaskViews.svelte`
- [X] T030 [US2] Apply the derived query result to the task list while preserving active criteria after mutations in `src/App.svelte` and `src/lib/task-store.ts`
- [X] T031 [US2] Render overdue, active, completed, and empty-result states with non-color distinctions in `src/components/TaskItem.svelte` and `src/app.css`
- [X] T032 [US2] Verify query composition and date-view scenarios against `specs/002-organized-productivity/quickstart.md` in `tests/e2e/organized-productivity.spec.ts`

**Checkpoint**: Users can reduce the workspace to relevant work and understand date urgency.

## Phase 5: User Story 3 - Break Work into Subtasks (Priority: P3)

**Goal**: Support editable child actions, progress, and explicit parent auto-completion.

**Independent Test**: Add, edit, complete, reopen, and delete subtasks while verifying
progress and both parent-completion modes.

### Tests

- [X] T033 [P] [US3] Test subtask validation, ordering, transitions, progress, and parent auto-completion in `tests/unit/subtasks.test.ts`
- [X] T034 [US3] Add subtask CRUD, progress, keyboard interaction, and parent behavior coverage in `tests/e2e/organized-productivity.spec.ts`

### Implementation

- [X] T035 [US3] Implement subtask add, edit, delete, toggle, reorder, and progress transitions in `src/lib/task-store.ts`
- [X] T036 [US3] Build the subtask editor, progress indicator, and parent auto-complete preference control in `src/components/SubtaskList.svelte`
- [X] T037 [US3] Integrate subtask expansion and actions into task details without making quick creation cumbersome in `src/components/TaskDetails.svelte` and `src/components/TaskItem.svelte`
- [X] T038 [US3] Style progress, child hierarchy, and subtask controls for mobile and dark themes in `src/app.css`
- [X] T039 [US3] Verify subtask scenarios against `specs/002-organized-productivity/quickstart.md` in `tests/e2e/organized-productivity.spec.ts`

**Checkpoint**: Parent tasks expose independently testable subtask workflows and progress.

## Phase 6: User Story 4 - Repeat Recurring Work (Priority: P4)

**Goal**: Configure recurrence and create exactly one future occurrence on completion.

**Independent Test**: Complete Daily, Weekly, and Monthly tasks, including a month-end case,
and verify copied properties, reset states, and duplicate prevention.

### Tests

- [X] T040 [P] [US4] Test daily, weekly, monthly, overdue advancement, and month-end recurrence dates in `tests/unit/recurrence.test.ts`
- [X] T041 [US4] Test recurrence completion idempotency and copied task/subtask properties in `tests/unit/task-store.test.ts`
- [X] T042 [US4] Add recurring-task configuration and next-occurrence browser coverage in `tests/e2e/organized-productivity.spec.ts`

### Implementation

- [X] T043 [US4] Add recurrence frequency and due-date validation controls in `src/components/TaskDetails.svelte`
- [X] T044 [US4] Implement idempotent recurrence completion, series/source relationships, property copying, and reset subtasks in `src/lib/task-store.ts`
- [X] T045 [US4] Display occurrence relationships and recurrence state in `src/components/TaskItem.svelte`
- [X] T046 [US4] Verify recurrence scenarios against `specs/002-organized-productivity/quickstart.md` in `tests/e2e/organized-productivity.spec.ts`

**Checkpoint**: Recurring work preserves history and schedules one correct next occurrence.

## Phase 7: User Story 5 - Arrange Tasks Manually (Priority: P5)

**Goal**: Support persistent manual order, pointer drag-and-drop, keyboard reordering, and
automatic-sort precedence.

**Independent Test**: Reorder tasks manually, reload, activate automatic sorting, then
disable it and verify manual order restoration.

### Tests

- [X] T047 [P] [US5] Test full-list and filtered-subset manual reorder, stable tie order, and automatic-sort precedence in `tests/unit/task-queries.test.ts`
- [X] T048 [US5] Add pointer drag, keyboard Move Up/Move Down, persistence, and sort-disabled-control coverage in `tests/e2e/organized-productivity.spec.ts`

### Implementation

- [X] T049 [US5] Implement manual task-order transitions that merge reordered filtered subsets without moving hidden tasks in `src/lib/task-store.ts`
- [X] T050 [US5] Add native drag-and-drop handlers, drop targets, and keyboard Move Up/Move Down controls in `src/components/TaskItem.svelte` and `src/components/TaskList.svelte`
- [X] T051 [US5] Disable drag and keyboard reorder controls under automatic sort and expose the reason accessibly in `src/components/TaskToolbar.svelte`
- [X] T052 [US5] Verify manual-order persistence and automatic-sort precedence against `specs/002-organized-productivity/quickstart.md` in `tests/e2e/organized-productivity.spec.ts`

**Checkpoint**: Manual organization is persistent, accessible, and subordinate to automatic sort.

## Phase 8: User Story 6 - Review Productivity Progress (Priority: P6)

**Goal**: Display complete-collection productivity statistics that update immediately.

**Independent Test**: Perform task mutations and confirm total, completed, active, overdue,
and percentage values remain mathematically consistent.

### Tests

- [X] T053 [P] [US6] Test zero-task and full-collection statistics after every measured mutation in `tests/unit/task-statistics.test.ts`
- [X] T054 [US6] Add visible statistics updates through create, complete, reopen, recur, and delete flows in `tests/e2e/organized-productivity.spec.ts`

### Implementation

- [X] T055 [US6] Build the productivity summary component with accessible labels and percentage text in `src/components/ProductivitySummary.svelte`
- [X] T056 [US6] Connect statistics to the full task collection rather than the visible query result in `src/App.svelte` and `src/lib/task-store.ts`
- [X] T057 [US6] Style summary cards and zero-state values consistently across responsive light/dark layouts in `src/app.css`
- [X] T058 [US6] Verify statistics scenarios against `specs/002-organized-productivity/quickstart.md` in `tests/e2e/organized-productivity.spec.ts`

**Checkpoint**: Productivity statistics update immediately without being affected by search or filters.

## Phase 9: User Story 7 - Choose a Theme (Priority: P7)

**Goal**: Provide persistent light and dark themes with accessible state distinctions.

**Independent Test**: Toggle theme, reload, and verify theme persistence, readable contrast,
and non-color state cues.

### Tests

- [X] T059 [P] [US7] Test theme defaults, toggling, persistence, and preference failure recovery in `tests/unit/task-preferences.test.ts`
- [X] T060 [US7] Add light/dark reload, keyboard toggle, contrast, and state-distinction coverage in `tests/e2e/organized-productivity.spec.ts`

### Implementation

- [X] T061 [US7] Build the persistent light/dark theme switch with accessible pressed state in `src/components/ThemeToggle.svelte`
- [X] T062 [US7] Apply theme preference during initial load and persist changes through the preference boundary in `src/App.svelte` and `src/lib/task-preferences.ts`
- [X] T063 [US7] Complete dark-theme tokens, overdue/high-priority/completed cues, and focus/contrast styles in `src/app.css`
- [X] T064 [US7] Verify theme scenarios against `specs/002-organized-productivity/quickstart.md` in `tests/e2e/organized-productivity.spec.ts`

**Checkpoint**: Both themes support the full task workflow and preserve accessibility cues.

## Phase 10: Polish and Cross-Cutting Concerns

- [X] T065 [P] Add storage migration and persistence-failure recovery coverage to `tests/e2e/organized-productivity.spec.ts`
- [X] T066 [P] Audit keyboard names, focus order, drag alternatives, and screen-reader status regions in `src/components/` and `src/App.svelte`
- [X] T067 [P] Audit 320px, 768px, and 1440px layouts with long titles, descriptions, tags, and subtasks in `src/app.css` and `tests/e2e/organized-productivity.spec.ts`
- [X] T068 Run `npm run check` and resolve diagnostics in `src/`, `tests/`, `tsconfig.json`, and `svelte.config.js`
- [X] T069 Run `npm run test:unit`, `npm run test:e2e`, and `npm run build`, then record outcomes in `specs/002-organized-productivity/quickstart.md`

## Dependencies and Execution Order

- Setup T001-T004 has no feature dependencies; T002-T004 can run in parallel after T001.
- Foundation depends on Setup; T005-T012 can be parallelized by module, while T013 follows
  the model, repository, query, recurrence, and preference contracts.
- US1 depends on Foundation and delivers the expanded-task MVP.
- US2 depends on US1's expanded task shape and uses the shared query pipeline.
- US3 depends on the expanded task detail surface from US1 but can proceed independently of
  the query views once task identity and store transitions are stable.
- US4 depends on the expanded task model and completion transition; it can proceed alongside
  US2 and US3 after shared store contracts stabilize.
- US5 depends on query output and persisted preferences; it follows US2's ordering contract.
- US6 depends on the full task collection and statistics module; it can proceed after Foundation.
- US7 depends on the preference boundary and app shell; it can proceed alongside US6.
- Polish depends on all desired user stories being complete.

## Parallel Opportunities

- T005-T012 use separate domain modules and can run in parallel after Setup.
- US1 T017-T018 and T020-T021 can be parallelized across unit tests and UI files.
- US2 T026, T028, and T029 can be parallelized after the query interface is agreed.
- US3 T033, T035, and T036 can be parallelized across tests, store, and component files.
- US4 T040-T042 can be parallelized before T043-T045 implementation.
- US6 and US7 can be assigned to separate developers after the shared store is stable.

## Implementation Strategy

1. Complete Setup and Foundation without changing the visible simple-task flow.
2. Complete US1 and validate migration plus rich task editing as the expanded MVP.
3. Add US2 so users can find and focus tasks.
4. Add US3 and US4 for subtasks and recurring work.
5. Add US5 manual organization, US6 statistics, and US7 themes incrementally.
6. Run all polish, accessibility, responsive, persistence, and production quality gates.

Every task follows the required checkbox, sequential ID, optional parallel marker, story
label for story tasks, and exact file-path format.
