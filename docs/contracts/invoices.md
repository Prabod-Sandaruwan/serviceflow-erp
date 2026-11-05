# Invoice Contracts, Lifecycle & Financial Rules (INV-001)

Specification for Invoice Management (Module D, SRS FR-INV-001..010, TDD 9.7).

## 1. Invoice Statuses & Lifecycle
- **Stored States** (Persisted in DB `invoices.status`):
  - `DRAFT`: Initial editable state created from an eligible milestone.
  - `ISSUED`: Finalized, locked, and sent to client with payment due date.
  - `PARTIALLY_PAID`: Active payments exist but sum of active payments < invoice total.
  - `PAID`: Sum of active payments >= invoice total.
  - `CANCELLED`: Voided/cancelled invoice with reason recorded; freed from active milestone key.
- **Derived State (`OVERDUE`)**:
  - `OVERDUE` is **never stored** in the database.
  - Computed on the fly when `dueDate < today()` AND status is `ISSUED` or `PARTIALLY_PAID`.
  - Paid, draft, or cancelled invoices are never considered overdue.

## 2. Milestone Association & Constraints (Resolution C5)
- **Precondition**: Invoices can ONLY be created from an `APPROVED` milestone (`MILESTONE_NOT_ELIGIBLE` 409).
- **Strict 1:1 Active Constraint**: Strictly ONE active (non-cancelled) invoice per milestone.
- **Dual Enforcement**:
  - **Database Level**: Enforced via unique column `active_milestone_key`. While active, `active_milestone_key = milestone_id`. When cancelled, `active_milestone_key` is set to `NULL`.
  - **Service Level**: Verified via `isInvoiceEligible(tx, milestoneId)` before creation or status transition.

## 3. Financial Calculations & Tax Rules
- **Formula**: `Invoice Total = Subtotal + Tax Amount`.
  - `Subtotal = Σ (quantity × unitPrice)` across all invoice line items.
  - `Tax Amount`: Calculated from manual tax rate (`subtotal × taxRate / 100`) or explicit manual tax amount.
- **Revenue Integrity**:
  - Financial & revenue reporting metrics strictly use `Subtotal` (gross billable deliverable amount, excluding tax).
  - Tax is tracked separately for accounting/compliance and never inflated into revenue.

## 4. Immutability & Cancellation Rules
- **Post-Issue Immutability**:
  - Once moved to `ISSUED`, invoice line items, amounts, client, and milestone links are strictly **immutable**.
  - No edits permitted after issue (`INVOICE_LOCKED` 409).
- **Cancellation Precondition**:
  - An invoice can **ONLY** be cancelled if it has **zero active payments** (`INVOICE_HAS_ACTIVE_PAYMENTS` 409).
  - Any previously recorded payments must be voided/cancelled first.
- **Audit Requirement**: Cancellation requires `cancelReason` (5–500 chars), `cancelledBy` (actor ID), and `cancelledAt` timestamp.

## 5. Numbering & Transitions Summary
- **Invoice Number**: `INV-YYYY-NNNN` (unique, generated from invoice sequence/ID).
- **Allowed Transitions**:
  - `DRAFT` -> `ISSUED` | `CANCELLED`
  - `ISSUED` -> `PARTIALLY_PAID` | `PAID` | `CANCELLED` (if 0 active payments)
  - `PARTIALLY_PAID` -> `PAID` | `ISSUED` (if payments voided down to 0)
  - `PAID` -> `PARTIALLY_PAID` (if payment voided)
  - `CANCELLED` -> Terminal state (cannot be reopened).
