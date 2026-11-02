# Quotation API Contracts & Lifecycle Rules (QUOT-001)

Specification for Quotation Management (Module B, TDD Section 9.5, SRS FR-QUOT).

## 1. State Transition Table

| Current Status | Target Status | Action / Trigger | Allowed Roles | Preconditions / Validations |
|---|---|---|---|---|
| `DRAFT` | `PENDING_APPROVAL` | `submit` | Staff, Manager, Admin | Has >= 1 item; client linked; validUntil in future |
| `PENDING_APPROVAL` | `APPROVED` | `approve` | Manager, Admin | Actor !== submitter (`SELF_APPROVAL_FORBIDDEN`) |
| `PENDING_APPROVAL` | `REJECTED` | `reject` | Manager, Admin | `rejectionReason` >= 5 chars; Actor !== submitter |
| `REJECTED` | `DRAFT` | `revise` (in-place) | Staff, Manager, Admin | Revise in-place (R-07); clears rejectionReason, keeps number |
| `APPROVED` | `SENT` | `send` | Staff, Manager, Admin | Quotation not expired (`validUntil >= today`) |
| `SENT` | `ACCEPTED` | `client-response` | Staff, Manager, Admin | Client accepted; quotation not expired |
| `SENT` | `DECLINED` | `client-response` | Staff, Manager, Admin | Client declined; optional responseNote |

## 2. Revise Semantics (Resolution R-07)

- **In-Place Revision (REJECTED)**: A quotation rejected internally (`REJECTED`) is revised in place back to `DRAFT`. It retains its unique `quotationNumber` and identity.
- **Copy Revision (DECLINED / EXPIRED)**: Quotations that are client-declined (`DECLINED`) or expired (`EXPIRED`) CANNOT be revised in place.
- **Revision Linkage**: To revise a declined or expired quotation, a NEW `DRAFT` quotation must be created with a new document number, linked to the ancestor quotation via `revision_of_id`.

## 3. Business Rules

1. **Self-Approval Prohibition**: Self-approval is strictly forbidden across all roles (Admin, Manager, Staff). The user who created/submitted the quotation cannot approve it (`createdBy !== actorUserId`).
2. **Rejection Reason Mandate**: Transitioning from `PENDING_APPROVAL` to `REJECTED` strictly requires a `rejectionReason` of at least 5 characters.
3. **Internal vs. External Refusal**:
   - `REJECTED` represents **internal management refusal** during the internal review workflow.
   - `DECLINED` represents **external client refusal** after the quotation was presented to the client.
4. **Dynamic Expiry (`EXPIRED`)**:
   - `EXPIRED` is not an explicitly saved state in the database `quotations.status` enum.
   - It is derived dynamically when `validUntil < today (Asia/Colombo)` and status is not final (`ACCEPTED` / `DECLINED`). Expired quotations cannot transition to `SENT` or `ACCEPTED`.
5. **Mandatory Client Association (R-15)**: Every quotation must be associated with an existing active `client_id`.

## 4. Expected API Error Codes

| Error Code | HTTP Status | Trigger Condition |
|---|---|---|
| `SELF_APPROVAL_FORBIDDEN` | `403 Forbidden` | Submitter attempts to approve their own quotation (`createdBy === actorUserId`) |
| `QUOTATION_EXPIRED` | `409 Conflict` | Attempting to send or accept a quotation whose `validUntil` date has passed |
| `INVALID_STATE_TRANSITION` | `409 Conflict` | Attempting a status transition not permitted by the state machine |
| `VALIDATION_ERROR` | `422 Unprocessable` | Missing `rejectionReason` (< 5 chars) on rejection, or invalid dates/items |
