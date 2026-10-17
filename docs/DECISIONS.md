# ServiceFlow ERP - Decision Log & Scope

## 1. Scope Mapping (PREP-003)
* Users and Access Control = Module A + audit part of G
* CRM and Quotations = Module B
* Projects and Tasks = Module C
* Invoices and Payments = Module D
* Dashboard and Basic Finance = Module E + F + seed/config part of G

## 2. Exclusions (Out of Scope)
Payroll, Full double-entry accounting, Online payment gateways, Public registration, Advanced AI, Microservices, Public deployment.

## 3. Reconciled Contradictions (PREP-002)
* **R-01:** Accepted - Use 5 modules mapping.
* **R-02:** Accepted - Keep both phase numberings.
* **R-03:** Accepted - Shared frontend foundation before module UIs.
* **R-04:** Accepted - Node 22 LTS as guard.
* **R-05:** Accepted - Root package.json with delegating scripts.
* **R-06:** Accepted - Per-request `is_active` check.
* **R-07:** Accepted - REJECTED revises in place.
* **R-08:** Accepted - Admin creates/updates employees.
* **R-09:** Accepted - Dashboard period is current month.
* **R-10:** Accepted - Extra endpoints included as tasks.
* **R-11:** Accepted - Staff sees project if assigned to a task.
* **R-12:** Accepted - Unique Document numbers.
* **R-13:** Accepted - Register OpenAPI endpoints as built.
* **R-14:** Accepted - PDF phase code hardening.
* **R-15:** Accepted - Quotation always has a client.
* **R-16:** Accepted - Money is strictly a decimal string.
* **R-17:** Accepted - Only `server/.env.test` defines test DB.
* **R-18:** Accepted - Treat versions illustratively.

## 4. Flagged Decisions
* **F-1:** Accepted - Per-request `is_active` check + best-effort JSON LIKE purge.
* **F-2:** Accepted - Use Prisma 7.