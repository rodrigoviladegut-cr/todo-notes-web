# Data Model: Organized Productivity

## Persisted Workspace

The repository stores a versioned workspace envelope so tasks and preferences migrate
together:

```text
Workspace {
  version: number
  tasks: Task[]
  preferences: UserPreferences
}
```

## Task

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | Stable unique identity |
| `title` | string | Required after trimming; legacy `text` maps here |
| `description` | string | Optional, defaults to empty |
| `completed` | boolean | Explicit task state |
| `priority` | low / medium / high | Defaults to `medium`; sort rank high to low |
| `dueDate` | YYYY-MM-DD or null | Local calendar date; null means undated |
| `category` | string or null | One trimmed optional category |
| `tags` | string[] | Trimmed, non-empty, case-insensitively unique |
| `subtasks` | Subtask[] | Ordered child actions |
| `recurrence` | Recurrence or null | Requires a due date when present |
| `recurrenceSeriesId` | string or null | Shared by occurrences in one series |
| `recurrenceSourceId` | string or null | Prior occurrence that created this one |
| `parentAutoComplete` | boolean | Defaults to false |
| `manualOrder` | number | Stable order used when automatic sorting is off or tied |
| `createdAt` | string | Existing timestamp or migration timestamp |
| `updatedAt` | string | Changes on accepted mutation |

## Subtask

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | Stable within the parent task |
| `title` | string | Required after trimming |
| `completed` | boolean | Independent child state |
| `manualOrder` | number | Stable order within the parent |
| `createdAt` | string | Creation timestamp |
| `updatedAt` | string | Last accepted mutation timestamp |

## Recurrence

```text
Recurrence {
  frequency: none | daily | weekly | monthly
}
```

When frequency is not `none`, `dueDate` is required. Next dates are calculated from the
prior occurrence due date and advanced until they are strictly after the current local date.
Monthly dates clamp to the final valid day of the destination month.

## User Preferences

| Field | Type | Default |
| --- | --- | --- |
| `theme` | light or dark | `light` |
| `sort` | manual, due-date, or priority | `manual` |
| `view` | all, today, or upcoming | `all` |
| `filter` | all, active, completed, or overdue | `all` |
| `search` | string | empty |
| `showCompletedToday` | boolean | false |
| `manualTaskOrder` | string[] | Existing task order |

Search is a session preference but is persisted with the rest of the user preferences so a
reload restores the workspace context. The task collection remains the source of truth for
statistics regardless of these query values.

## Derived Rules

- `isOverdue(task, today)` is true only when `!task.completed`, `dueDate != null`, and
  `dueDate < today`.
- Today contains incomplete tasks where `dueDate <= today`; completed tasks are included only
  when `showCompletedToday` is true.
- Upcoming contains incomplete tasks where `dueDate > today`, ordered ascending by date.
- Search lowercases and matches title, description, category, and every tag.
- Active is `!completed`; Completed is `completed`; Overdue uses `isOverdue`.
- Completion percentage is `completed / total * 100`, or zero when total is zero.
- Subtask progress is `completedSubtasks / totalSubtasks`, or zero when a task has no subtasks.

## State Transitions

| Current | Action | Result |
| --- | --- | --- |
| Active | Complete | Mark complete; if recurring, create one next occurrence |
| Completed | Reopen | Mark active; retain recurrence relationship and existing next occurrence |
| Any | Edit details | Validate, update fields, preserve unrelated state |
| Any | Complete final subtask | Update progress; optionally complete parent |
| Any | Drag or move | Update manual order unless automatic sort is active |
| Any | Delete parent | Confirm, then remove parent and all child subtasks |
| Any | Storage failure | Keep last valid in-memory state and show recovery feedback |

## Migration

- Legacy task `text` becomes `title`.
- Legacy `completed`, timestamps, and array order are preserved.
- New fields receive defaults from the specification.
- A migration is idempotent and writes the new schema only after all records validate.
- Malformed records cause a recoverable error rather than partial migration.
