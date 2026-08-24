<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles:
  - I. Task Management First
  - II. Vite and Svelte Foundation
  - III. Accessible and Responsive Experience
  - IV. Reliable Task State
  - V. Tested Simplicity
- Added sections:
  - Product and Technical Constraints
  - Development Workflow and Quality Gates
- Removed sections: none
- Follow-up TODOs: none
-->
# TODO Notes Web Constitution

## Core Principles

### I. Task Management First
The product MUST help users create, view, edit, complete, reopen, and delete tasks. Each
task MUST have a clear description or title and an explicit completion state. Features
outside task and note management MUST be justified by direct user value and MUST NOT
obscure the primary task workflow. This boundary keeps the product focused and usable.

### II. Vite and Svelte Foundation
The web application MUST use Vite as its development and build foundation and Svelte for
the user interface. Application behavior MUST be expressed through small, cohesive Svelte
components and plain modules. Additional frameworks or state-management libraries MUST
only be introduced when a documented requirement cannot be met clearly with the existing
stack. This constraint provides a fast, consistent, and maintainable foundation.

### III. Accessible and Responsive Experience
All primary task-management actions MUST be operable with keyboard and pointer input,
have visible focus states, use semantic controls, and expose meaningful accessible names.
The interface MUST remain usable without horizontal scrolling at common mobile and desktop
viewport sizes. Status, validation, and destructive actions MUST be communicated clearly
without relying on color alone. These rules ensure the core workflow is available to a
broad range of users and devices.

### IV. Reliable Task State
Every accepted task change MUST be reflected immediately and consistently in the visible
task list. Task data MUST survive a normal page reload unless a feature specification
explicitly defines a temporary-data mode. Invalid or incomplete task input MUST NOT create
corrupt records, and destructive actions MUST guard against accidental data loss. Storage
failures MUST leave the user with an understandable state and a clear recovery path.

### V. Tested Simplicity
Each user story MUST be independently testable through its observable behavior. Automated
tests MUST cover task-state rules and critical user journeys when those behaviors are
introduced or changed. The production build, static checks, and relevant tests MUST pass
before work is considered complete. Implementations MUST prefer the smallest design that
meets current requirements; abstractions and dependencies require a concrete present need.

## Product and Technical Constraints

- The product is a client-facing TODO notes web application centered on task management.
- The supported toolchain is Vite with Svelte; changes to this foundation require a
  constitution amendment.
- Core task operations MUST remain understandable and completable without onboarding.
- Task records MUST expose only data required by an approved feature specification.
- Personal task content MUST remain local to the intended user context and MUST NOT be
  transmitted to third parties without an explicit approved requirement.
- Performance work MUST prioritize responsive task interactions and a fast initial load;
  measurable targets belong in each feature specification.

## Development Workflow and Quality Gates

1. Every change MUST begin with a testable specification of user value and acceptance
   scenarios.
2. Plans MUST pass a constitution check before implementation and after design decisions
   are finalized.
3. Work MUST be divided into independently demonstrable user stories, beginning with the
   smallest useful task-management flow.
4. Reviews MUST verify scope, accessibility, state reliability, tests, and dependency
   justification.
5. Completion requires a successful production build, static checks, relevant automated
   tests, and manual verification of affected acceptance scenarios on mobile and desktop.

## Governance

This constitution is the highest-priority project governance document. Specifications,
plans, tasks, implementation, and reviews MUST comply with it. Amendments MUST document the
reason, affected principles, migration impact, and semantic version change before approval.

Versions follow semantic versioning: MAJOR for incompatible principle removals or
redefinitions, MINOR for new principles or materially expanded obligations, and PATCH for
clarifications that do not change obligations. Every feature plan and code review MUST
record compliance or explicitly justify any temporary exception. Approved exceptions MUST
include an owner, a bounded scope, and a resolution date.

**Version**: 1.0.0 | **Ratified**: 2026-08-24 | **Last Amended**: 2026-08-24
