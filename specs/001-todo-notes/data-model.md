# Data Model: TODO Notes Web App

## Task

Represents one user-owned item of work.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | yes | Stable and unique for the task's lifetime |
| `text` | string | yes | Trim outer whitespace; reject empty result |
| `completed` | boolean | yes | New tasks start `false`; may toggle either direction |
| `createdAt` | string | yes | Stable creation timestamp used for creation ordering |
| `updatedAt` | string | yes | Changes whenever text or completion changes |

## Task List State

The UI state has one of these observable conditions:

- `loading`: initial read has not completed.
- `ready`: zero or more valid tasks are available.
- `error`: storage read or write failed; the last known in-memory state remains visible and
  the user receives recovery feedback.

## State Transitions

| Current | Action | Result |
| --- | --- | --- |
| `ready` | Create valid text | Append incomplete task and persist |
| `ready` | Toggle task | Invert `completed` and persist |
| `ready` | Edit valid text | Replace `text`, preserve status, and persist |
| `ready` | Confirm delete | Remove task and persist |
| `ready` | Cancel delete or reject invalid text | Preserve prior state |
| Any loaded state | Reload | Read persisted task list and display it |

## Persistence Rules

- Store a versioned serialized task-list value under one application-owned storage key.
- On read, reject malformed data rather than silently treating it as an empty list.
- Validate task shape before exposing records to the UI.
- Keep the last known in-memory state when a write fails.
- Surface read and write failures through a non-color-only status message.
