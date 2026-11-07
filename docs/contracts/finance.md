# Financial Formulas, Date Bases & Reporting Contracts (FIN-001)

Specification for Financial Formulas, Reporting & Expense Tracking in ServiceFlow ERP (Phase 11).

## 1. Core Financial Rules & Integrity
> Revenue never includes tax; payments are never added to revenue.

- **Accrual vs Cash Separation**: Revenue is recognized upon invoice issuance (`issue_date`), while cash collections are tracked separately through payments received (`payment_date`). Payments are never combined with revenue to prevent double-counting.
- **Tax Exclusion**: Taxes collected on behalf of authorities (VAT/SVAT) are pass-through liabilities and never count towards business revenue.

## 2. Financial Formulas & Date Bases
| Metric | Formula | Date Basis | Filter Criteria |
| :--- | :--- | :--- | :--- |
| **Revenue** | `Σ (invoice.subtotal)` | `invoices.issue_date` | Status in `ISSUED`, `PARTIALLY_PAID`, `PAID` (strictly excluding tax) |
| **Payments Received** | `Σ (payment.amount)` | `payments.payment_date` | Status = `ACTIVE` (tracked separately, NEVER added to revenue) |
| **Outstanding (Receivables)** | `Σ (invoice.total - ACTIVE payments)` | Current Snapshot | Invoices in `ISSUED` or `PARTIALLY_PAID` status as of specific date |
| **Expenses** | `Σ (expense.amount)` | `expenses.expense_date` | Status = `ACTIVE` |
| **Estimated Profit** | `Revenue - Expenses` | Date Range | Net operational surplus based on period revenue & expenses |

## 3. Standardized Terminology & Labels
- **Profitability Labeling**: UI panels, dashboards, exports, and reports must explicitly use the exact label:
  - **`"Estimated project profitability"`**
- Avoid terms like "Net Income" or "Gross Margin" where project-level overhead attribution is estimated.

## 4. Exclusions & Ignored Records
- **Invoices**:
  - `DRAFT`: Invoices being prepared have no financial effect and are strictly excluded.
  - `CANCELLED`: Voided invoices with zero active payments are completely excluded from all financial totals.
- **Payments**:
  - `VOIDED`: Voided payment records are completely excluded from paid balance and cash-inflow calculations.
- **Expenses**:
  - `VOIDED`: Voided expenses are completely excluded from total expenses and profitability metrics.

## 5. Timezones, Boundaries & Default Periods
- **Timezone**: All date computations and period boundaries are processed in the **`Asia/Colombo`** timezone (`UTC+05:30`).
- **Inclusive Range Queries**: Date range queries are always inclusive:
  - `date >= start AND date <= end` (spanning `00:00:00.000` through `23:59:59.999` Colombo time).
- **Default Reporting Period (R-09)**: The default dashboard reporting period is the **"current calendar month"** (first day of the current month at 00:00:00 through the last day of the current month at 23:59:59 Colombo time).
