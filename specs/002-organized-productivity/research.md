# Research: Organized Productivity

## Decision: Extend the existing versioned local repository with an explicit schema migration

**Rationale**: Existing users already have tasks stored by the simple application. A new
schema version can normalize legacy records with safe defaults while preserving title,
completion state, and order. Reads must never silently replace malformed data with an empty
collection.

**Alternatives considered**: Replacing the storage key was rejected because it risks data
loss. A remote database was rejected because the product remains local-first and has no
account or synchronization requirement.

## Decision: Use one derived query pipeline for search, filters, views, and sorting

**Rationale**: Applying criteria in a fixed order makes combinations predictable and keeps
the displayed list and controls consistent. The pipeline filters by focused view and state,
matches search text across all searchable fields, then applies automatic sorting with manual
order as the stable tie-breaker.

**Alternatives considered**: Separate filtered arrays per control were rejected because they
would drift when multiple controls are active and duplicate business rules.

## Decision: Represent due dates as local calendar dates

**Rationale**: The feature defines due dates rather than timestamps. Comparing normalized
local date strings avoids time-of-day ambiguity for Today and Overdue. Recurrence uses local
calendar arithmetic, including clamping monthly dates to the target month final day.

**Alternatives considered**: UTC timestamps were rejected because users could see tasks move
between Today and adjacent dates around time-zone boundaries.

## Decision: Use a recurrence relationship and idempotent completion transition

**Rationale**: A completed occurrence remains visible while pointing to one active next
occurrence. Recording the source occurrence and recurrence series identifier lets the store
detect an existing next occurrence and avoid duplicates when users reopen and complete again.

**Alternatives considered**: Mutating one task due date was rejected because it loses the
completed history explicitly required by the feature.

## Decision: Support native drag-and-drop plus explicit keyboard reorder controls

**Rationale**: Native pointer drag events avoid a new dependency for a local single-list
workflow. Keyboard Move Up/Move Down controls provide equivalent operation for users who
cannot or do not want to drag. Automatic sorting disables both manual drag and manual reorder
controls.

**Alternatives considered**: A drag-and-drop package was rejected because it adds dependency
and maintenance cost without needing cross-container behavior.

## Decision: Keep derived statistics independent from the active query

**Rationale**: Users need workload totals for the complete collection even while viewing
Today, Upcoming, or a search result. A pure summary function makes zero-task and percentage
edge cases deterministic and directly testable.

**Alternatives considered**: Counting visible rows was rejected because it would make the
summary change unexpectedly when search or filters change.

## Decision: Store theme and view preferences in the same local preference boundary

**Rationale**: Theme, sort, manual ordering, and Today visibility are user-owned preferences
that must survive reloads. Centralizing their serialization keeps preference failures
recoverable and avoids scattering storage calls across components.

**Alternatives considered**: Browser-only theme state was rejected because it would not meet
the persistence requirement.
