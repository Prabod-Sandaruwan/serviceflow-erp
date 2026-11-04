# Project, Milestone & Task Contracts & Rules (PROJ-001)

Specification for Delivery Management (Module C, SRS FR-PRJ-001..010, TDD 9.6).

## 1. Domain Definitions
- **Tasks**: Internal units of work assigned to employees (trackable by status and priority).
- **Milestones**: Billable, approvable deliverables for the client (with `billingAmount >= 0`).

## 2. Project Creation & Numbering (FR-PRJ-001, BR-004, BR-005)
- **Precondition**: Projects can ONLY be created from `ACCEPTED` quotations (`QUOTATION_NOT_ACCEPTED` 409).
- **1:1 Constraint**: Strictly one project per quotation (`PROJECT_ALREADY_EXISTS` 409).
- **Number Format**: Project code format is `PRJ-YYYY-NNNN` (using the database row ID).
- **Initial State**: Starts in `PLANNED` with budget copied from quotation subtotal.

## 3. Completion & State Rules (FR-PRJ-003, FR-PRJ-008, FR-PRJ-009)
- **Project Completion**: To mark as `COMPLETED`, all non-cancelled milestones must be `APPROVED` and all non-cancelled tasks must be `DONE` (`PROJECT_HAS_OPEN_WORK` 409).
- **Project Cancellation**: Setting `CANCELLED` requires a reason (5-500 chars) and blocks new tasks, milestones, invoices, or expenses.
- **Milestone Completion**: Moving to `COMPLETED` requires all linked non-cancelled tasks to be `DONE` (`MILESTONE_HAS_OPEN_TASKS` 409).
- **Milestone Approval**: Admin/Manager can approve only `COMPLETED` milestones. Once approved, the milestone is invoice-eligible (FR-PRJ-010).

## 4. Progress Calculation Formula (FR-PRJ-007)
- **Task Progress**: `Progress % = (DONE tasks / non-cancelled tasks) × 100` (rounded to nearest integer).
- **Default**: If there are no tasks (or 0 non-cancelled tasks), progress is `0`.
- **Milestone Progress**: `Milestone Progress = (APPROVED milestones / non-cancelled milestones)`.
- *Note*: Cancelled items are excluded from denominators; overdue items remain counted.

## 5. Staff Role Limits (FR-PRJ-002, FR-PRJ-006, R-11)
- **Project Visibility**: `STAFF` users can ONLY read projects they are explicitly assigned to (i.e. where at least one task is assigned to their linked employee ID).
- **Task Updates**: `STAFF` can ONLY update the `status` of tasks assigned to them (`PATCH /tasks/:id`). Changing any other fields or editing another user's task returns 403 `FORBIDDEN`.
- **Finance Privacy**: Financial summaries and invoice data on project detail are hidden from `STAFF`.

## 6. State Transition Summary
- **Project**: `PLANNED` -> `ACTIVE` | `CANCELLED`; `ACTIVE` -> `ON_HOLD` | `COMPLETED` | `CANCELLED`; `ON_HOLD` -> `ACTIVE`.
- **Milestone**: `PENDING` -> `IN_PROGRESS` | `CANCELLED`; `IN_PROGRESS` -> `COMPLETED` | `CANCELLED`; `COMPLETED` -> `IN_PROGRESS` | `APPROVED`.
- **Task**: `TODO` -> `IN_PROGRESS` | `CANCELLED`; `IN_PROGRESS` -> `DONE` | `CANCELLED`; `DONE` -> `IN_PROGRESS`.
