# Acceptance Scenario Walkthrough Record (REL-013)

**Date**: 2026-11-16  
**Standard**: ServiceFlow ERP Software Requirements Specification (SRS §14 / Handbook §23)  
**Status**: All 16 Acceptance Scenarios Verified & Passed

---

## Acceptance Verification Matrix

| ID | Scenario | Verification Method / Automated Test Suite | Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **AS-01** | Admin creates users & assigns roles | `tests/integration/users.test.ts` | **PASS** | Role assignment & forced password change verified |
| **AS-02** | Staff records lead & follow-up | `tests/integration/leads.test.ts` | **PASS** | Scoped access and CRM interaction logs verified |
| **AS-03** | Staff creates quotation & submits | `tests/integration/quotations.test.ts` | **PASS** | Line items, VAT/SSCL calculation and submission |
| **AS-04** | Manager approves; self-approval blocked | `tests/integration/quotations.approval.test.ts` | **PASS** | Segregation of duties strictly enforced (403) |
| **AS-05** | Client acceptance recorded | `tests/integration/quotations.status.test.ts` | **PASS** | Status transitions to ACCEPTED with client note |
| **AS-06** | Accepted quotation creates 1 project | `tests/integration/projects.conversion.test.ts` | **PASS** | 1:1 idempotency; duplicate project blocked |
| **AS-07** | Manager creates/approves milestone | `tests/integration/milestones.test.ts` | **PASS** | Milestone workflow and percentage weighting verified |
| **AS-08** | Invoice issued for approved milestone | `tests/integration/invoices.milestone.test.ts` | **PASS** | Unapproved milestone invoice creation blocked |
| **AS-09** | Partial payments update balance | `tests/integration/payments.workflow.test.ts` | **PASS** | Exact decimal arithmetic; PARTIALLY_PAID / PAID |
| **AS-10** | Overpayments & invalid amounts rejected | `tests/integration/payments.validation.test.ts` | **PASS** | Overpayment blocked; concurrent race prevented |
| **AS-11** | Expenses affect project profitability | `tests/integration/reports.test.ts` | **PASS** | Net margin recalculated accurately with expenses |
| **AS-12** | Cancelled invoices excluded from revenue | `tests/integration/invoices.cancel.test.ts` | **PASS** | Revenue report ignores CANCELLED invoices |
| **AS-13** | Unauthorized operations rejected | `tests/integration/rbac-matrix.test.ts` | **PASS** | Complete RBAC matrix returns 401/403 on denied routes |
| **AS-14** | PDFs & CSVs contain correct data | `tests/integration/pdf.test.ts`, `reports.test.ts` | **PASS** | PDF generation valid; CSV export totals match DB |
| **AS-15** | Audit logs recorded for key actions | `tests/integration/audit.test.ts` | **PASS** | Immutable audit trails logged for auth & finance |
| **AS-16** | Clean clone, configure, run, and test | `README.md` Quickstart & CI Pipeline | **PASS** | Fresh database migration and quality gate pass |

---

## Sign-Off
All 16 acceptance scenarios have been executed with concrete test evidence. No defects remain unresolved.
