# Payment Contracts, Financial Rules & Lifecycle (PAY-001)

Specification for Payment Processing, Balance Lifecycle & Concurrency Controls (Module D, SRS FR-INV-005..007, BR-009, TDD 7.2).

---

## 1. Overview & Core Principles

The payment subsystem handles the recording, tracking, and voiding of monetary transactions against issued invoices. It guarantees:
1. **Mathematical Accuracy**: High-precision decimal arithmetic (14, 2) preventing roundoff drift.
2. **Strict Backend Enforcement**: Server-side validation of balance and status—the UI is never trusted for financial bounds.
3. **Pessimistic Row Locking**: Database-level locking (`SELECT ... FOR UPDATE`) during all payment mutations to prevent race conditions and overpayments.
4. **Auditability & Traceability**: Immutable active/void records with actor timestamps and idempotency keys.

---

## 2. Payment Validations & Financial Rules

Every payment recording operation must satisfy all of the following validations before persistence:

### 2.1 Amount Constraints & Overpayment Prevention
- **Strictly Positive**: `amount > 0.00` (`INVALID_PAYMENT_AMOUNT` / 422). Zero or negative payments are rejected.
- **Definitive Balance Ceiling**: `amount <= invoice.balance` (`OVERPAYMENT_NOT_ALLOWED` / 422).
  - `invoice.balance = invoice.total - sum(ACTIVE payments)`.
  - **Backend Enforcement**: The balance check MUST be executed inside an isolated database transaction with row-level locks on the parent invoice. The backend definitively enforces this constraint regardless of UI state.
- **Precision**: Monetary values are stored as `Decimal(14, 2)` and computed via exact currency utilities (`Money` / `toFixed(2)` arithmetic).

### 2.2 Payment Methods & Reference Requirements
- **Supported Methods**:
  - `CASH`: Physical currency. Reference is optional.
  - `BANK_TRANSFER`: Wire or direct bank deposit.
  - `CARD`: Credit, debit, or merchant POS payment.
- **Reference Mandate**:
  - When `method` is `BANK_TRANSFER` or `CARD`, a valid `reference` string (e.g., transaction ID, bank slip #, slip reference) is **MANDATORY** (min length 1, max length 80) (`REFERENCE_REQUIRED` / 422).
  - For `CASH`, `reference` is optional.

### 2.3 Date Constraints
- **No Future Dates**: `paymentDate <= today()` (`PAYMENT_DATE_FUTURE` / 422). Payments cannot be recorded with a future date.
- **No Pre-Issue Dates**: `paymentDate >= invoice.issueDate` (`PAYMENT_PRECEDES_ISSUE` / 422). A payment cannot precede the date the invoice was officially issued.

### 2.4 Idempotency & Duplicate Prevention
- **Idempotency Key**: Each payment submission may provide an `idempotencyKey` header or payload attribute (UUID / alphanumeric string up to 64 chars).
- **Enforcement**:
  - The `payments` table maintains a database-level unique constraint on `idempotency_key`.
  - Duplicate submissions with the identical key within the idempotency window return the existing payment record without double-charging or duplicate balance deductions.

---

## 3. Role Permissions & Authorization Matrix

Payment operations adhere strictly to the role-based access control (RBAC) model:

| Role | Record Payment (`POST /api/v1/invoices/:id/payments`) | View Payments (`GET /api/v1/invoices/:id/payments`) | Void Payment (`POST /api/v1/payments/:id/void`) |
| :--- | :---: | :---: | :---: |
| **ADMIN** | Allowed | Allowed | Allowed |
| **MANAGER** | Allowed | Allowed | Allowed |
| **STAFF** | **Allowed** (Assigned project scope) | **Allowed** (Assigned project scope) | **FORBIDDEN (403)** |

- **Staff Permission**: `STAFF` users are authorized to **record** payments for invoices on projects they are actively assigned to.
- **Void Restriction**: Under no circumstances may `STAFF` void a payment (`FORBIDDEN` / 403). Only `ADMIN` and `MANAGER` roles have authority to void financial transactions.

---

## 4. Invoice Eligibility

Payments may only be applied to invoices in an active, payable state:

- **Eligible Statuses**:
  - `ISSUED`: Finalized invoice awaiting payment.
  - `PARTIALLY_PAID`: Active payment exists, but balance remains `> 0`.
- **Ineligible Statuses** (`INVOICE_NOT_PAYABLE` / 409):
  - `DRAFT`: Cannot record payments on unissued draft invoices.
  - `PAID`: Cannot record payments on fully settled invoices (`balance == 0`).
  - `CANCELLED`: Cannot record payments on voided/cancelled invoices.

---

## 5. Invoice Status Recomputation

Whenever a payment is **recorded** or **voided**, the invoice status is deterministically recomputed within the same database transaction:

$$\text{paidAmount} = \sum_{\text{status} = \text{ACTIVE}} \text{payment.amount}$$
$$\text{balance} = \text{invoice.total} - \text{paidAmount}$$

### State Transition Rules:
1. **$\text{paidAmount} == 0$**:
   - Status: `ISSUED`
   - Occurs when an invoice has no payments, or when all previous payments have been voided.
2. **$0 < \text{paidAmount} < \text{invoice.total}$**:
   - Status: `PARTIALLY_PAID`
   - Occurs when partial payment is received, or when a payment on a `PAID` invoice is voided leaving a remaining balance.
3. **$\text{paidAmount} == \text{invoice.total}$** (i.e. $\text{balance} == 0.00$):
   - Status: `PAID`
   - Invoice is fully settled.

---

## 6. Payment Voiding & Invoice Cancellation Interaction

### 6.1 Void Semantics
- **Soft Void**: Payments are never physically deleted (`DELETE`).
- **Void Mutation**:
  - `status` set to `VOIDED`.
  - `voidedBy` set to the authenticated user ID (Admin/Manager).
  - `voidedAt` set to current timestamp `now()`.
  - `voidReason` required text describing why the payment was voided (min 5 characters).
- **Exclusion from Paid Total**: Voided payments are strictly excluded from subsequent `paidAmount` sums (`WHERE status = 'ACTIVE'`).
- **Rollback of Invoice Status**:
  - Voiding a payment immediately triggers invoice status recomputation.
  - E.g., voiding the final payment of a `PAID` invoice rolls it back to `PARTIALLY_PAID` or `ISSUED`.

### 6.2 Interaction with Invoice Cancellation
- **Zero Active Payments Constraint**:
  - An invoice **CANNOT** be cancelled if it has any active payments (`INVOICE_HAS_ACTIVE_PAYMENTS` / 409).
  - To cancel an invoice with payments, **all payments must first be voided** by an Admin or Manager.
  - Once all payments have `status = VOIDED`, the invoice status is `ISSUED` with `paidAmount = 0`, allowing the cancellation workflow to proceed safely.

---

## 7. Concurrency & Locking Strategy

To ensure absolute financial consistency under concurrent traffic:
1. **Transaction Isolation**: Payment creation and voiding run inside a Prisma interactive transaction.
2. **Pessimistic Lock**:
   ```sql
   SELECT id, status, total FROM invoices WHERE id = ? FOR UPDATE;
   ```
3. **Locking Order**: Always lock the parent `Invoice` first, compute the fresh sum of `ACTIVE` payments, assert `amount <= balance`, and insert the payment or mark voided.
4. **Race Resolution**: If two requests attempt to pay simultaneously, the second request waits for the lock, reads the updated balance, and fails cleanly with `OVERPAYMENT_NOT_ALLOWED` (422) if the first transaction exhausted the remaining balance.

---

## 8. Summary of Error Codes

| Error Code | HTTP Status | Trigger Condition |
| :--- | :---: | :--- |
| `INVOICE_NOT_PAYABLE` | 409 | Invoice status is not `ISSUED` or `PARTIALLY_PAID` |
| `INVALID_PAYMENT_AMOUNT` | 422 | Amount $\le 0.00$ or malformed decimal |
| `OVERPAYMENT_NOT_ALLOWED` | 422 | Payment amount exceeds remaining invoice balance |
| `REFERENCE_REQUIRED` | 422 | Method is `BANK_TRANSFER` or `CARD` and reference is empty |
| `PAYMENT_DATE_FUTURE` | 422 | Payment date is in the future |
| `PAYMENT_PRECEDES_ISSUE` | 422 | Payment date precedes invoice `issue_date` |
| `PAYMENT_ALREADY_VOIDED` | 409 | Attempting to void a payment that is already `VOIDED` |
| `VOID_FORBIDDEN` | 403 | Staff user attempts to void a payment |
| `VOID_REASON_REQUIRED` | 422 | Void reason is missing or less than 5 characters |
| `INVOICE_HAS_ACTIVE_PAYMENTS` | 409 | Attempting to cancel an invoice before voiding all payments |

