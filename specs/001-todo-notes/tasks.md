# Tasks: TODO Notes Web App

**Input**: Design documents from `/specs/001-todo-notes/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Included because the constitution requires automated coverage for task-state
rules and critical user journeys.

**Organization**: Tasks are grouped by user story and ordered by dependency.

## Phase 1: Setup

**Purpose**: Initialize the Vite/Svelte project and quality gates.

- [X] T001 Initialize the Vite/Svelte TypeScript project and npm scripts in `package.json`
- [X] T002 [P] Configure TypeScript and Svelte checking in `tsconfig.json` and `svelte.config.js`
- [X] T003 [P] Configure Vitest and Playwright commands in `vitest.config.ts` and `playwright.config.ts`
- [X] T004 [P] Add application entry points in `index.html` and `src/main.ts`

## Phase 2: Foundational

**Purpose**: Establish shared task state, persistence, app shell, and accessible visual
foundations. This phase blocks user story work.

- [X] T005 [P] Define the validated `Task` type, task factory, text normalization, and timestamp rules in `src/lib/task-model.ts`
- [X] T006 [P] Implement versioned browser-storage read/write handling and storage errors in `src/lib/task-repository.ts`
- [X] T007 Implement task-list transitions and last-known-state error handling in `src/lib/task-store.ts`
- [X] T008 [P] Create the responsive application shell and live status region in `src/App.svelte`
- [X] T009 [P] Define mobile-first layout, visible focus, semantic control, and non-color status styles in `src/app.css`
- [X] T010 [P] Add shared unit-test setup and storage doubles in `tests/unit/test-helpers.ts`

**Checkpoint**: Foundation is ready; user stories can be implemented independently.

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) MVP

**Goal**: Let users create valid tasks and see all saved tasks with their current state.

**Independent Test**: Submit non-empty text, verify an incomplete task appears, reload,
and verify it remains visible.

### Tests

- [X] T011 [P] [US1] Test task creation, whitespace normalization, and empty-input rejection in `tests/unit/task-model.test.ts`
- [X] T012 [P] [US1] Test task loading, creation persistence, empty state, and malformed-storage feedback in `tests/unit/task-repository.test.ts`
- [X] T013 [US1] Test the create transition and immediate list update in `tests/unit/task-store.test.ts`
- [X] T014 [US1] Add create/view, reload persistence, and empty-input coverage in `tests/e2e/todo-notes.spec.ts`

### Implementation

- [X] T015 [P] [US1] Implement task input, submit validation, and accessible errors in `src/components/TaskComposer.svelte`
- [X] T016 [P] [US1] Implement task rendering and the empty state in `src/components/TaskList.svelte`
- [X] T017 [US1] Connect composer, list, store, and initial repository load in `src/App.svelte`
- [X] T018 [US1] Verify the create/view story against `specs/001-todo-notes/quickstart.md` and refine e2e selectors in `tests/e2e/todo-notes.spec.ts`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

## Phase 4: User Story 2 - Update Task Status (Priority: P2)

**Goal**: Let users complete and reopen tasks with status persistence.

**Independent Test**: Toggle a task complete and incomplete, reload, and confirm the last
status remains.

### Tests

- [X] T019 [P] [US2] Test complete and reopen transitions with `updatedAt` changes in `tests/unit/task-store.test.ts`
- [X] T020 [US2] Add keyboard and reload persistence coverage for status toggling in `tests/e2e/todo-notes.spec.ts`

### Implementation

- [X] T021 [US2] Add accessible complete/reopen controls with state-specific labels in `src/components/TaskItem.svelte`
- [X] T022 [US2] Render task items and route toggle actions through the store in `src/components/TaskList.svelte` and `src/App.svelte`
- [X] T023 [US2] Add completed-state text treatment that does not rely on color alone in `src/app.css`
- [X] T024 [US2] Verify completion transitions, keyboard operation, and reload persistence against `specs/001-todo-notes/quickstart.md`

**Checkpoint**: User Stories 1 and 2 are independently functional and persistent.

## Phase 5: User Story 3 - Edit and Delete Tasks (Priority: P3)

**Goal**: Let users edit valid text and delete tasks only after deliberate confirmation.

**Independent Test**: Edit while preserving status, reject an empty edit, cancel deletion,
then confirm deletion and verify it remains deleted after reload.

### Tests

- [X] T025 [P] [US3] Test edit validation, status preservation, and delete transitions in `tests/unit/task-store.test.ts`
- [X] T026 [US3] Add edit, invalid-edit, cancel-delete, confirm-delete, and reload coverage in `tests/e2e/todo-notes.spec.ts`

### Implementation

- [X] T027 [US3] Add edit mode, controlled input, valid-submit handling, and invalid feedback in `src/components/TaskItem.svelte`
- [X] T028 [US3] Add accessible delete confirmation and cancellation flow in `src/components/TaskItem.svelte`
- [X] T029 [US3] Implement edit and delete store actions with persistence error feedback in `src/lib/task-store.ts`
- [X] T030 [US3] Connect edit, delete, and storage status events in `src/components/TaskList.svelte` and `src/App.svelte`
- [X] T031 [US3] Style editing controls, confirmation UI, and storage feedback responsively in `src/app.css`
- [X] T032 [US3] Verify all edit/delete scenarios against `specs/001-todo-notes/quickstart.md`

**Checkpoint**: All user stories are independently functional and preserve prior behavior.

## Phase 6: Polish and Cross-Cutting Concerns

- [X] T033 [P] Add accessible-name, focus-order, and responsive-layout checks in `tests/e2e/todo-notes.spec.ts`
- [X] T034 [P] Review malformed-data and storage-failure recovery in `src/lib/task-repository.ts` and `src/lib/task-store.ts`
- [X] T035 Run `npm run check` and resolve diagnostics in `src/`, `tests/`, `tsconfig.json`, and `svelte.config.js`
- [X] T036 Run `npm run test:unit`, `npm run test:e2e`, and `npm run build` and record validation in `specs/001-todo-notes/quickstart.md`

## Dependencies and Execution Order

- Setup T001-T004 has no feature dependencies; T002-T004 can run in parallel after T001.
- Foundation depends on Setup; T005, T006, T008, T009, and T010 can run in parallel, then T007 follows T005 and T006.
- US1 depends on Foundation and delivers the MVP.
- US2 depends on Foundation and US1 task rendering; its domain tests can run in parallel with UI work.
- US3 depends on Foundation and US1 task rendering; it can proceed alongside US2 after shared events stabilize.
- Polish depends on the desired user stories being complete.

## Parallel Opportunities

- T005, T006, T008, T009, and T010 use separate files and can be parallelized after Setup.
- US1 T011, T012, T015, and T016 can be parallelized.
- US2 T019, T021, and T023 can be parallelized after the US1 component contract is stable.
- US3 T025 and T031 can be parallelized with implementation once event names are agreed.

## Implementation Strategy

1. Complete Setup and Foundation.
2. Complete and validate User Story 1 as the MVP.
3. Add and validate User Story 2.
4. Add and validate User Story 3.
5. Run all polish and quality gates.

Every task follows the required checkbox, sequential ID, optional parallel marker, story
label for story tasks, and exact file-path format.
