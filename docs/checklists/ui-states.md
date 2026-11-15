# Frontend UI States Audit Checklist (Loading, Empty, Error, Validation)

This document audits the four essential UI states (Loading, Empty, Error, Validation) across all primary frontend features in ServiceFlow ERP (Task TEST-008, Requirements NFR-USE-004, FR-RPT-006).

## Global Acceptance Criteria
- [x] **No raw error text for 500s**: All pages display a user-friendly fallback component (`<ErrorPanel />` / `QueryBoundary`) instead of raw JSON or stack traces when the server crashes.

## Feature State Audits

### 1. Dashboard
- [x] **Loading State**: Displays skeleton loaders for summary metric cards and recent activity tables.
- [x] **Empty State**: Displays friendly "No activity recorded yet" message when database is fresh.
- [x] **Error State**: Displays `<ErrorPanel />` with a "Retry" button on API failure or network cut.
- [x] **Validation State**: N/A for read-only view; date filters validate boundary bounds.

### 2. Leads
- [x] **Loading State**: Table skeleton renders while paginated leads are fetched.
- [x] **Empty State**: Displays "No leads found. Create your first lead to get started" with call-to-action.
- [x] **Error State**: Displays graceful error card with retry action if lead fetching fails.
- [x] **Validation State**: Inline error messages under required fields (title, expected value, lost reason).

### 3. Clients
- [x] **Loading State**: Displays skeleton placeholder for client list and search filter.
- [x] **Empty State**: Shows "No clients found" placeholder when search yields 0 records.
- [x] **Error State**: Surfaces recoverable error message with retry trigger on network disconnection.
- [x] **Validation State**: Client creation form shows inline errors for invalid email, duplicate reg, or missing name.

### 4. Projects
- [x] **Loading State**: Project list and detail views render loading skeleton placeholders.
- [x] **Empty State**: Displays empty illustration when no projects exist for an active quotation.
- [x] **Error State**: Renders user-friendly failure notice with retry button when project API fails.
- [x] **Validation State**: Project forms validate budget amounts, status transitions, and milestone dependencies.

### 5. Quotations
- [x] **Loading State**: Item table and approval queue show skeleton rows during fetch.
- [x] **Empty State**: Displays empty queue state when no quotations are pending approval.
- [x] **Error State**: Traps 500 and network errors with retryable `<ErrorPanel />`.
- [x] **Validation State**: Rejection dialog validates minimum 5-character reason; item rows enforce quantity > 0.

### 6. Invoices
- [x] **Loading State**: Invoice list and PDF preview components display loading spinners/skeletons.
- [x] **Empty State**: Displays "No invoices generated for this milestone" in empty state.
- [x] **Error State**: Handles cancellation or payment errors without raw stack traces.
- [x] **Validation State**: Cancellation dialog requires >= 5 character reason; tax fields enforce non-negative numbers.

### 7. Expenses
- [x] **Loading State**: Expense tables render skeleton rows during paginated loading.
- [x] **Empty State**: Displays friendly "No expenses logged for this project" message.
- [x] **Error State**: Network/server errors render standard error banner with retry capability.
- [x] **Validation State**: Expense modal validates positive amount, category selection, and non-future date.

### 8. Reports
- [x] **Loading State**: Financial summary cards and charts show skeleton placeholders while aggregating.
- [x] **Empty State**: Displays zero-value indicators ($0.00) and empty state notice for out-of-range dates.
- [x] **Error State**: Rejection on invalid date range or API crash displays clean error alert.
- [x] **Validation State**: Date range picker validates from <= to and flags spans exceeding 5 years.

---
> [!NOTE]
> Developers must fix any unchecked boxes by wrapping components in ErrorBoundaries, utilizing TanStack Query's `isLoading`/`isError` flags, and adding `isEmpty` checks.
