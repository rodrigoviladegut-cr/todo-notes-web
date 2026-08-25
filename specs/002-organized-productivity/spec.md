# Feature Specification: Organized Productivity

**Feature Branch**: `add-groups`

**Created**: 2026-08-24

**Status**: Draft

**Input**: User description: "Evolve the existing Todo application into an organized
productivity application with priorities, due dates, categories, tags, search, filters,
sorting, subtasks, recurrence, drag-and-drop ordering, Today and Upcoming views, progress
statistics, dark mode, and persistent task data and preferences."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture and Enrich Tasks (Priority: P1)

As a user, I want to create a task quickly using only a title and optionally add richer
details so that simple capture stays fast while complex work can be fully described.

**Why this priority**: Fast, reliable task capture is the foundation of every other
productivity workflow and must remain useful on its own.

**Independent Test**: Create a title-only task in one action, then create or edit another
task with a description, due date, priority, category, and tags and verify all values remain
after reopening the application.

**Acceptance Scenarios**:

1. **Given** the quick-create control is available, **When** the user enters a non-empty
   title and submits, **Then** an active task is created immediately with Medium priority
   and no optional details.
2. **Given** a task exists, **When** the user adds or edits its description, due date,
   priority, category, and tags, **Then** the task shows the updated details without
   changing its completion state.
3. **Given** an existing task from the simple Todo application, **When** the upgraded
   application first loads it, **Then** the task remains available with its prior title and
   completion state and receives safe defaults for new properties.
4. **Given** a title is empty or whitespace-only, **When** the user creates or edits a task,
   **Then** the invalid change is rejected and the prior task data remains unchanged.

---

### User Story 2 - Find and Focus Tasks (Priority: P2)

As a user, I want to search, filter, sort, and use focused date views so that I can quickly
find the work that matters now.

**Why this priority**: Organization creates value only when users can reduce a large task
list to a clear, relevant set of actions.

**Independent Test**: Populate tasks with different text, dates, priorities, categories,
tags, and statuses; combine search with every filter, sort, Today view, and Upcoming view;
verify the resulting tasks and order.

**Acceptance Scenarios**:

1. **Given** tasks contain different titles, descriptions, categories, and tags, **When**
   the user searches for partial text with any letter casing, **Then** all matching tasks
   and only matching tasks are shown.
2. **Given** active, completed, and overdue tasks exist, **When** the user selects All,
   Active, Completed, or Overdue, **Then** the list contains only tasks belonging to that
   filter.
3. **Given** tasks have different due dates and priorities, **When** the user sorts by due
   date or priority, **Then** tasks are ordered consistently by the selected criterion.
4. **Given** incomplete tasks are overdue or due today, **When** the user opens Today,
   **Then** those tasks appear and completed tasks are excluded by default.
5. **Given** incomplete tasks have future due dates, **When** the user opens Upcoming,
   **Then** they appear in chronological order and tasks without future due dates do not.
6. **Given** search, a status filter, a focused view, and sorting are active together,
   **When** task data changes, **Then** all active criteria remain applied consistently.

---

### User Story 3 - Break Work into Subtasks (Priority: P3)

As a user, I want to divide a task into editable subtasks and see completion progress so
that larger work is easier to execute.

**Why this priority**: Subtasks turn broad tasks into actionable steps without making
simple tasks more cumbersome.

**Independent Test**: Add, edit, complete, reopen, and delete multiple subtasks and verify
the displayed progress and parent completion behavior after each action.

**Acceptance Scenarios**:

1. **Given** a parent task exists, **When** the user adds valid subtasks, **Then** each
   subtask appears under that parent as incomplete.
2. **Given** a parent has several subtasks, **When** individual subtasks are completed,
   reopened, edited, or deleted, **Then** the subtask list and completed-count progress
   update immediately.
3. **Given** every subtask is complete and parent auto-completion is disabled, **When** the
   final subtask is completed, **Then** the parent task remains active.
4. **Given** every subtask is complete and parent auto-completion is enabled for that task,
   **When** the final subtask is completed, **Then** the parent task becomes complete.

---

### User Story 4 - Repeat Recurring Work (Priority: P4)

As a user, I want daily, weekly, or monthly tasks to schedule their next occurrence when
completed so that repeated responsibilities do not need to be recreated manually.

**Why this priority**: Recurrence reduces repeated task entry while preserving the existing
completion workflow.

**Independent Test**: Configure one task for each supported recurrence, complete it, and
verify exactly one next occurrence is created with the expected future due date and copied
properties.

**Acceptance Scenarios**:

1. **Given** a task has a due date and daily, weekly, or monthly recurrence, **When** it is
   completed, **Then** the completed occurrence remains in history and one active next
   occurrence is scheduled on the next applicable future date.
2. **Given** a recurring task has a description, priority, category, tags, subtasks, and an
   auto-completion preference, **When** its next occurrence is created, **Then** those
   properties are preserved while the new task and its subtasks begin incomplete.
3. **Given** a completed recurring task is reopened and completed again, **When** a next
   occurrence already exists, **Then** no duplicate next occurrence is created.
4. **Given** a monthly task is due on a day absent from the next month, **When** its next
   occurrence is calculated, **Then** it uses the final valid day of that month.

---

### User Story 5 - Arrange Tasks Manually (Priority: P5)

As a user, I want to drag tasks into my preferred order so that the unsorted list reflects
my personal workflow.

**Why this priority**: Manual ordering gives users control when date or priority alone does
not express their intended sequence.

**Independent Test**: Drag tasks into a new order, reopen the application, and verify the
order persists; then enable and disable automatic sorting and verify precedence behavior.

**Acceptance Scenarios**:

1. **Given** automatic sorting is not active, **When** the user drags a task to a new
   position, **Then** the list uses and persists the new manual order.
2. **Given** a due-date or priority sort is active, **When** the list is displayed, **Then**
   automatic sorting takes precedence and manual drag ordering is unavailable.
3. **Given** a user disables automatic sorting, **When** the list returns to manual mode,
   **Then** the last saved manual order is restored.
4. **Given** a filtered subset is manually reordered, **When** hidden tasks become visible,
   **Then** hidden tasks retain their relative order and the moved visible tasks reflect the
   user's change.

---

### User Story 6 - Review Productivity Progress (Priority: P6)

As a user, I want a concise productivity overview so that I can understand workload and
completion progress at a glance.

**Why this priority**: Statistics provide useful feedback after the core task organization
and execution workflows are available.

**Independent Test**: Create, complete, reopen, overdue, and delete tasks and verify every
statistic updates immediately and remains mathematically consistent.

**Acceptance Scenarios**:

1. **Given** the saved task collection changes, **When** a task is created, completed,
   reopened, edited, or deleted, **Then** total, completed, active, overdue, and completion
   percentage values update immediately.
2. **Given** no tasks exist, **When** statistics are shown, **Then** all counts and the
   completion percentage display zero rather than an undefined value.

---

### User Story 7 - Choose a Theme (Priority: P7)

As a user, I want to switch between light and dark themes so that the application remains
comfortable and readable in different environments.

**Why this priority**: Theme choice improves comfort and accessibility but does not block
the task-management workflows.

**Independent Test**: Switch between themes, reopen the application, and verify the chosen
theme and readable visual distinctions remain.

**Acceptance Scenarios**:

1. **Given** the application is using either theme, **When** the user switches themes,
   **Then** the entire interface updates immediately and the choice persists.
2. **Given** light or dark theme is active, **When** active, completed, overdue, and
   high-priority tasks are displayed, **Then** each state remains distinguishable without
   relying on color alone.

---

### Edge Cases

- A due date is interpreted as a calendar date in the user's local context; an incomplete
  task becomes overdue only after that date has passed.
- Tasks without due dates appear after dated tasks when sorting by due date and never appear
  in Today, Upcoming, or Overdue.
- Equal due dates or priorities use the saved manual order as a stable tie-breaker.
- Category and tag values are trimmed; empty values are rejected and duplicate tags that
  differ only by letter casing are stored once.
- Search with only whitespace behaves like an empty search and does not hide tasks.
- Deleting a parent task removes its subtasks only after the normal destructive-action
  confirmation; completing or deleting a subtask does not delete the parent.
- A recurring task requires a due date; removing its due date disables recurrence only
  after the user is informed of that consequence.
- Completing an overdue recurring task advances its cadence until the next occurrence is
  in the future, rather than creating multiple missed occurrences.
- Changing a task while a search, filter, sort, or focused view is active may remove it from
  the visible result immediately when it no longer matches.
- If persisted data or preferences cannot be read or written, the last known valid in-memory
  state remains visible and the user receives a clear recovery message.
- Long titles, descriptions, category names, tags, and subtask text wrap without causing
  horizontal scrolling at supported viewport sizes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST allow a task to be created using only a non-empty title
  in a single submission.
- **FR-002**: A newly created title-only task MUST default to active status, Medium priority,
  no due date, no category, no tags, no description, no subtasks, and no recurrence.
- **FR-003**: Users MUST be able to add and edit a task title, optional description, due
  date, Low/Medium/High priority, optional category, multiple tags, subtasks, recurrence,
  and parent auto-completion preference.
- **FR-004**: The application MUST reject empty or whitespace-only task titles while
  preserving the prior valid task state.
- **FR-005**: The application MUST preserve existing simple tasks, their completion state,
  and their stored order when introducing the expanded task properties.
- **FR-006**: The application MUST visually and textually distinguish active, completed,
  overdue, and High-priority tasks without relying on color alone.
- **FR-007**: An incomplete task with a due date before the current local calendar date MUST
  be identified as overdue; completed tasks MUST NOT be considered overdue.
- **FR-008**: Users MUST be able to assign one optional category and multiple tags to each
  task and edit or remove those values later.
- **FR-009**: The application MUST normalize category and tag whitespace, reject empty
  values, and prevent case-insensitive duplicate tags on the same task.
- **FR-010**: Search MUST perform case-insensitive partial matching across title,
  description, category, and tags.
- **FR-011**: Users MUST be able to select exactly one task-state filter: All, Active,
  Completed, or Overdue.
- **FR-012**: Users MUST be able to choose no automatic sort, due-date sort, or priority
  sort.
- **FR-013**: Due-date sorting MUST place the earliest due dates first and undated tasks
  last; priority sorting MUST order High, Medium, then Low.
- **FR-014**: Tasks tied under automatic sorting MUST retain their relative manual order.
- **FR-015**: Search, task-state filtering, focused views, and sorting MUST compose so that
  each active criterion applies to the same displayed result set.
- **FR-016**: The Today view MUST include incomplete tasks due today and incomplete overdue
  tasks and MUST exclude completed tasks by default.
- **FR-017**: Users MUST be able to include or hide completed tasks in Today without
  changing task completion states.
- **FR-018**: The Upcoming view MUST include only incomplete tasks with future due dates and
  organize them chronologically.
- **FR-019**: Users MUST be able to add, edit, delete, complete, and reopen subtasks under a
  parent task.
- **FR-020**: Each parent with subtasks MUST show completed subtasks, total subtasks, and a
  completion percentage or equivalent progress indication.
- **FR-021**: Completing all subtasks MUST leave the parent active by default.
- **FR-022**: Users MUST be able to enable parent auto-completion per task; when enabled,
  completing the final incomplete subtask MUST complete the parent.
- **FR-023**: Users MUST be able to configure no recurrence, Daily, Weekly, or Monthly
  recurrence for a task that has a due date.
- **FR-024**: Completing a recurring task MUST retain the completed occurrence and create
  exactly one active next occurrence on the next cadence date after the completion date.
- **FR-025**: A next recurring occurrence MUST preserve the title, description, priority,
  category, tags, recurrence, subtask definitions, and parent auto-completion preference,
  while resetting the task and all subtasks to incomplete.
- **FR-026**: Reopening and recompleting a recurring occurrence MUST NOT create a duplicate
  next occurrence.
- **FR-027**: Monthly recurrence MUST use the same day number when valid and otherwise the
  final valid day of the target month.
- **FR-028**: Users MUST be able to reorder displayed tasks with drag and drop whenever no
  automatic sort is active.
- **FR-029**: Manual ordering MUST persist across sessions and MUST remain available after
  an automatic sort is disabled.
- **FR-030**: Automatic due-date or priority sorting MUST take precedence over manual order
  and MUST disable drag reordering while active.
- **FR-031**: Reordering a filtered subset MUST preserve the relative order of tasks hidden
  by the active criteria.
- **FR-032**: The productivity overview MUST show total, completed, active, and overdue task
  counts and a completion percentage based on the complete saved task collection.
- **FR-033**: Statistics MUST update immediately after any task action that changes a
  measured value, and completion percentage MUST be zero when no tasks exist.
- **FR-034**: Users MUST be able to switch manually between light and dark themes.
- **FR-035**: The selected theme MUST persist across sessions; users with no saved theme
  preference MUST begin in the light theme.
- **FR-036**: The interface MUST remain readable, keyboard-operable, and usable without
  horizontal scrolling in both themes at supported mobile and desktop sizes.
- **FR-037**: The application MUST persist tasks, subtasks, completion states, priorities,
  due dates, category, tags, descriptions, recurrence settings, recurrence relationships,
  manual order, Today completed-visibility preference, and theme preference.
- **FR-038**: Accepted task and preference changes MUST be reflected immediately in the
  visible interface.
- **FR-039**: Persistence failures MUST retain the last known in-memory state and provide an
  understandable recovery message without silently discarding stored data.
- **FR-040**: Advanced task properties MUST remain optional and MUST NOT add required steps
  to the title-only quick-create flow.

### Key Entities

- **Task**: A unit of work with stable identity, title, optional description, completion
  state, priority, optional due date, optional category, tags, subtasks, recurrence, manual
  order, parent auto-completion preference, and creation/update information.
- **Subtask**: A child action belonging to exactly one task, with stable identity, text,
  completion state, and manual position within its parent.
- **Recurrence**: A task cadence of none, daily, weekly, or monthly plus the relationship
  connecting completed and next occurrences to prevent duplicates.
- **Task Query**: The user's current search text, state filter, focused view, sort choice,
  and Today completed-visibility choice used to derive the displayed task list.
- **Productivity Summary**: Counts and completion percentage calculated from all saved
  tasks, independent of the currently displayed query.
- **User Preferences**: Persistent theme, sort choice, manual ordering information, and
  focused-view display preferences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of users can create a title-only task in 15 seconds or less
  without opening advanced controls.
- **SC-002**: At least 90% of users can add a due date, priority, category, tags,
  description, recurrence, or subtask to an existing task without assistance.
- **SC-003**: Search, filter, sort, Today, and Upcoming results update within 1 second after
  user input for collections of up to 1,000 tasks.
- **SC-004**: 100% of overdue-task test cases are correctly identified across local date
  boundaries, and completed tasks are never counted as overdue.
- **SC-005**: 100% of daily, weekly, and monthly recurrence test cases create exactly one
  correctly dated next occurrence with preserved properties.
- **SC-006**: Manual task order, all expanded task data, and user preferences remain correct
  after reload in 100% of persistence validation scenarios.
- **SC-007**: Productivity counts and completion percentage match the saved task collection
  after 100% of tested create, edit, complete, reopen, recur, and delete actions.
- **SC-008**: All primary and advanced task-management actions can be completed using
  keyboard-only input in both light and dark themes.
- **SC-009**: The interface remains readable and requires no horizontal scrolling from 320
  through 1440 pixels in both themes, including tasks with long content.
- **SC-010**: Existing saved tasks retain their title, completion state, and relative order
  in 100% of upgrade validation cases.

## Assumptions

- The application remains a single-user, local-first product without accounts, sharing, or
  cross-device synchronization.
- Due dates are date-only values; due times, reminders, notifications, and time-zone syncing
  are outside this feature.
- Each task has zero or one category and zero or more tags; category and tag management is
  free-form rather than a separate administrative workflow.
- A recurring task must have a due date, and completing an overdue recurring task schedules
  only the next future occurrence rather than backfilling every missed occurrence.
- Statistics describe the complete saved task collection rather than only the current
  search, filter, or focused view.
- New users start in light theme, Medium default priority, manual ordering, All filter, and
  no focused view.
- Deleting a recurring task deletes only that occurrence because future occurrences are not
  created until completion; bulk series editing and deletion are outside this feature.
- Existing confirmation behavior for destructive parent-task deletion remains in force and
  includes that task's subtasks.
