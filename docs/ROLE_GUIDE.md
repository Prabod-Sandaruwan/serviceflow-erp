# Role-Based Workflows & Operational Manual

ServiceFlow ERP enforces three core operational roles with fine-grained responsibilities.

## 1. System Administrator (`ADMIN`)

- **User & Access Provisioning**: Create users, assign roles, enforce password resets.
- **Employee Directory**: Manage employee profiles and synchronize account linkages.
- **Compliance & Audit**: Inspect immutable audit logs across logins, updates, and financial actions.
- **Invariants**: Self-deactivation and self-role revocation are blocked.

## 2. Operations & Project Manager (`MANAGER`)

- **CRM Pipeline**: Track leads, schedule follow-ups, and convert won leads to active clients.
- **Quotations & Estimates**: Draft, revise, submit, and approve quotations.
  - _Guard_: Self-approval of own quotations is strictly blocked (`403 SELF_APPROVAL_FORBIDDEN`).
- **Project Execution**: Convert accepted quotations into active projects, define milestones, assign tasks.
- **Billing & Receivables**: Generate milestone invoices, issue invoices, dispatch dunning notices.
- **Cash Flow & Expenses**: Record payments, void erroneous entries, log project expenses.
- **Analytics & BI**: Monitor executive KPIs, margin trajectories, cash collection rates, export CSVs.

## 3. Staff & Field Engineer (`STAFF`)

- **Scoped Task Execution**: View tasks assigned to their employee record; update progress (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`).
- **Project Visibility**: Access only projects where they have active assigned tasks.
- **Invoice PDF Access**: Fetch PDFs only for projects they are actively assigned to.
- **Financial Masking**: High-level financial KPIs, revenue cards, and margins are automatically hidden.
- **Profile & Credentials**: Update personal contact info, change passwords, purge other sessions.
