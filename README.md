# ServiceFlow ERP

> **Project-Based Service Business Management System** — Built with React 19, Express 5, Prisma 7, and MySQL 8.

[![CI](https://github.com/Prabod-Sandaruwan/serviceflow-erp/actions/workflows/ci.yml/badge.svg)](https://github.com/Prabod-Sandaruwan/serviceflow-erp/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, React Hook Form, Lucide Icons.
- **Backend**: Express 5, TypeScript, Prisma 7 ORM, MySQL 8, Argon2id, express-session (MySQL store), Zod 4.
- **Reporting & Quality**: PDFKit, Vitest 3, Playwright, Supertest, Pino structured logger, OpenAPI/Swagger UI.

---

## Prerequisites (Windows 11)

- **Node.js**: `v22.12.0` LTS or newer (`node -v`)
- **MySQL**: Community Server `8.0.x` running on default port `3306` (`mysql --version`)
- **PowerShell**: Version 7+ (or Windows PowerShell 5.1 with script execution enabled)

---

## Setup & Quickstart

```powershell
# 1. Clone repository and install dependencies
git clone https://github.com/Prabod-Sandaruwan/serviceflow-erp.git
cd serviceflow-erp
npm install --prefix server; npm install --prefix client

# 2. Configure environment variables
Copy-Item server/.env.example server/.env
Copy-Item server/.env.test.example server/.env.test
Copy-Item client/.env.example client/.env

# 3. Create databases in MySQL
mysql -u root -p -e "CREATE DATABASE serviceflow_dev; CREATE DATABASE serviceflow_test;"

# 4. Apply migrations and seed demo data
npm run db:migrate --prefix server
npm run db:seed --prefix server

# 5. Start development servers
npm run dev --prefix server   # Backend API: http://localhost:3000
npm run dev --prefix client   # Frontend UI: http://localhost:5173
```

---

## Available Root Scripts

- `npm run dev`: Concurrently start both server and client development servers.
- `npm run format:check`: Check code formatting with Prettier.
- `npm run lint`: Lint both server and client TypeScript codebases.
- `npm run typecheck`: Run strict TypeScript compiler verification without emit.
- `npm test`: Run unit and integration tests across backend and frontend.
- `npm run test:e2e`: Execute deterministic Playwright end-to-end user workflows.
- `npm run build`: Compile backend TypeScript and bundle frontend Vite distribution.

---

## Demo Accounts & Swagger API Docs

All demo accounts are initialized with temporary password `12345` (forced change on first login):
- **Admin**: `admin@serviceflow.lk` (Complete access, audit logs, employee management)
- **Operations Manager**: `manager1@serviceflow.lk` (Quotations, Projects, Invoicing, Approvals)
- **Project Manager**: `manager2@serviceflow.lk` (Projects, Milestones, Approvals)
- **Staff / Engineer**: `staff1@serviceflow.lk` (Task updates, scoped quotations & leads)
- **Interactive OpenAPI Documentation**: `http://localhost:3000/api-docs`

---

## Screenshots & Documentation References

Screenshots of key workflows (Dashboard, Quotations, Invoices, Financial Reports):
See `docs/images/` for visual documentation.

- [Technical Design Document (TDD)](file:///docs/ServiceFlow%20ERP%20%E2%80%93%20Technical%20Design%20Document.pdf)
- [Software Requirements Specification (SRS)](file:///docs/ServiceFlow%20ERP%20%E2%80%93%20Software%20Requirements%20Specification%20(SRS).pdf)
- [Task Implementation Handbook](file:///docs/ServiceFlow%20ERP%20%E2%80%94%20Task-by-Task%20Implementation%20Handbook.pdf)
- [Project Decisions Log](file:///docs/DECISIONS.md) | [Implementation Progress Log](file:///docs/PROGRESS.md)

---

## Scope, Known Limitations & Future Work

- **Known Limitations**: Single-company only; LKR currency only; manual tax rates (VAT/SSCL); no hourly labor costing; local/VM deployment; session cleanup is best-effort.
- **Future Extensions (SRS §13 Exclusions)**: Multi-company tenancy; automated payment gateways; multi-currency; mobile companion app; automated tax authority filing.
