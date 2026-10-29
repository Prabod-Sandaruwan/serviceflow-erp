# CRM API Contracts (CRM-001)

Specification for CRM and Client Management (Module B, TDD Section 9.4, SRS Section 3).

## 1. Endpoints

| Method | Path | Description | Access Roles |
|---|---|---|---|
| `GET` | `/clients` | List clients with pagination and search | Admin, Manager, Staff (scoped) |
| `POST` | `/clients` | Create a new client record | Admin, Manager, Staff |
| `GET` | `/clients/:id` | Get client details by ID | Admin, Manager, Staff (scoped) |
| `PATCH` | `/clients/:id` | Update client details and status | Admin, Manager, Staff (scoped) |
| `GET` | `/leads` | List leads with pagination and status filters | Admin, Manager, Staff (scoped) |
| `POST` | `/leads` | Create a new sales lead | Admin, Manager, Staff |
| `GET` | `/leads/:id` | Get lead details with follow-ups | Admin, Manager, Staff (scoped) |
| `PATCH` | `/leads/:id` | Update lead status and details | Admin, Manager, Staff (scoped) |
| `POST` | `/leads/:id/convert` | Convert lead into an active Client | Admin, Manager, Staff (scoped) |
| `GET` | `/follow-ups` | List follow-up activities | Admin, Manager, Staff (scoped) |
| `POST` | `/follow-ups` | Schedule a new follow-up activity | Admin, Manager, Staff |
| `PATCH` | `/follow-ups/:id` | Update follow-up status and outcome | Admin, Manager, Staff (scoped) |

## 2. Staff Access & Ownership

- **Lead Scoping**: Staff members can only view and mutate leads where `owner_id === authUser.id` or leads explicitly assigned to them.
- **Client Scoping**: Staff members can only access client records they created, or clients linked to leads and quotations they currently own.
- **Administrative Access**: Admin and Manager roles possess global visibility and modification permissions across all clients, leads, and follow-ups.

## 3. Lead Status Rules

- **Conversion (Won Status)**: The `CONVERTED` (Won) status is strictly achievable via `POST /leads/:id/convert`. Direct status transitions to `CONVERTED` via generic `PATCH` requests are disallowed.
- **Lost Reason Mandate**: Updating a lead status to `LOST` strictly requires providing a non-empty `lost_reason` explaining the lost sale opportunity.
- **Immutability of Converted Leads**: Once a lead is converted to a client, core sales attributes (`expected_value`, conversion target, owner) become read-only to safeguard historical audit trails. Only supplemental notes may be appended.

## 4. Database Verification

- The core relational storage schemas (`clients`, `leads`, and `follow_ups`) were created, indexed, and verified in MySQL during task **DB-005**.
- Relational integrity rules (e.g. `onDelete: Cascade` on lead follow-ups, unique constraints on `converted_client_id`) are enforced at the database engine level.
