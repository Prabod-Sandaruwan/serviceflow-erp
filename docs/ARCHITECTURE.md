# Enterprise Architecture & Technology Stack

ServiceFlow ERP is built on a clean multi-tiered architecture with deterministic state machines.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   React 19 SPA • Vite • Tailwind CSS 4 • TanStack Query 5   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON / Cookies
┌──────────────────────────────▼──────────────────────────────┐
│                    API Gateway & Middleware                 │
│ Helmet Security • CORS • CSRF Guard • Rate Limiters • Session│
└──────────────────────────────┬──────────────────────────────┘
                               │ Express 5 / TypeScript
┌──────────────────────────────▼──────────────────────────────┐
│                     Domain Business Logic                   │
│ CRM • Quotations • Projects • Milestones • Invoices • Ledger│
│        State Machines (Transitions) • Zod Validation        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma 7 ORM / ACID Tx
┌──────────────────────────────▼──────────────────────────────┐
│                       Data Layer                            │
│           MySQL 8 Database • Connection Pooling (25)        │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Principles

1. **Transaction Integrity**: Multi-record mutations run in ACID transactions with `SELECT ... FOR UPDATE` locks.
2. **Finite State Machines**: Invoices, Milestones, Quotations, and Tasks transition through deterministic state machines.
3. **Idempotent Operations**: Payment mutations require an `Idempotency-Key` header to prevent double charges.
4. **Append-Only Auditing**: Critical operations record immutable audit entries with before/after state diffs.
