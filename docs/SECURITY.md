# Enterprise Security & Compliance

ServiceFlow ERP implements defense-in-depth security across application, data, and network layers.

## Core Security Controls

- **Authentication**: Argon2id password hashing ($m=19456, t=2, p=1$), timing-safe dummy hash verification.
- **Password Policy (CWE-521)**: Minimum 12 characters, uppercase, lowercase, numeric, and symbol enforcement.
- **Session Security**: MySQL-backed store, 24h absolute TTL, 8h sliding window, session regeneration on login.
- **Access Control (RBAC & BOLA)**: Strict tenancy isolation; staff members are scoped strictly to assigned tasks.
- **CSRF Defense**: Double-submit cookie with origin validation and `crypto.timingSafeEqual` header check.
- **Injection Immunization**:
  - **SQLi**: 100% prepared statements via Prisma tagged template literals (`$queryRaw\`...\``).
  - **CSV Formula Injection (CWE-1236)**: Single-quote prefix sanitization for `=`, `+`, `-`, `@`, `\t`, `\r`.
  - **Header Injection**: Strict alphanumeric sanitization of attachment filenames.
- **DoS & Resource Exhaustion (CWE-400)**: Unbounded array limits ($\le 100$ items) on invoices and quotations.
- **Event Loop Protection**: Dedicated rate limiters on CPU-heavy endpoints (PDF rendering, Argon2id hashing).
- **Audit Logging**: Immutable, append-only logs capturing actor, action, timestamp, IP, and request ID.

## Security Verification

The test suite includes 324 authorization tests, concurrent void/approval checks, and injection tests.
