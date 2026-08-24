# Research: TODO Notes Web App

## Decision: Use Vite with Svelte and TypeScript

**Rationale**: This is required by the project constitution and matches the feature's
single-page, component-based UI. Vite provides the development and production workflow;
Svelte keeps the UI state close to the components without adding a second application
framework.

**Alternatives considered**: React, Vue, and a server-rendered application were rejected
because they violate the established project foundation or add unnecessary architecture.

## Decision: Isolate task rules from UI components

**Rationale**: A task model and store module can enforce trimming, empty-input rejection,
status transitions, and immutable updates independently of rendering. This makes the
critical rules easy to unit test and keeps Svelte components focused on interaction and
presentation.

**Alternatives considered**: Keeping all mutations in `App.svelte` was rejected because it
would make persistence and state transitions harder to test and maintain.

## Decision: Persist tasks through a small browser-storage repository

**Rationale**: The specification defines a single-user local persistence boundary and no
server synchronization. A repository wrapper centralizes serialization, parsing, storage
errors, and recovery messaging while allowing tests to provide an in-memory storage double.

**Alternatives considered**: A backend database and remote API were rejected as out of
scope. Direct storage calls from each component were rejected because they duplicate error
handling and couple the UI to the persistence mechanism.

## Decision: Use unit tests plus browser acceptance tests

**Rationale**: Unit tests efficiently cover task validation, state transitions, ordering,
and persistence failures. Browser tests verify the observable journeys, keyboard actions,
reload persistence, responsive layout, and confirmation behavior required by the spec.

**Alternatives considered**: Unit tests alone were rejected because they cannot prove the
complete accessible user flow. Browser tests alone were rejected because they are slower and
less precise for domain rules.

## Decision: No external contracts

**Rationale**: Version 1 is a client-only application with no public API, backend, or
third-party integration. The UI behavior is specified by acceptance scenarios and the
quickstart guide.

**Alternatives considered**: An API contract was considered but would document a boundary
that does not exist in this feature.
