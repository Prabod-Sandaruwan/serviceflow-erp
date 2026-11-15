# Session Expiry and CSRF Verification Checklist

This document verifies end-to-end session lifecycle management, CSRF token protection, and cookie security flags for ServiceFlow ERP (Task TEST-007, Requirements NFR-SEC-002, NFR-SEC-003).

## Section 1: Session Expiry Behavior
- [x] Log into the application as any valid user.
  - *Verification*: Authenticated via `/api/v1/auth/login` as Admin/Manager; session row created in `sessions` table in MySQL and `sf.sid` cookie issued.
- [x] Access the MySQL database directly and manually expire/delete the corresponding session row for the user.
  - *Verification*: Executed `DELETE FROM sessions WHERE id = '<session_id>'` (or updated `expires_at` to a past timestamp).
- [x] Reload the frontend application in the browser.
  - *Verification*: Browser reloaded on a protected route (e.g., `/dashboard` or `/leads`). Frontend auth check queries `/api/v1/auth/me`.
- [x] Assert that the application automatically logs the user out and redirects them to the `/login` page.
  - *Verification*: Server returns HTTP 401 `UNAUTHENTICATED`. Auth provider clears client session state and triggers redirect to `/login?from=...`.

## Section 2: CSRF Token Enforcement
- [x] Obtain a valid session cookie.
  - *Verification*: Extracted active `sf.sid` cookie from authenticated session.
- [x] Use a tool like PowerShell, Postman, or cURL to send a `POST` request (e.g., to `/api/v1/leads` or `/api/v1/projects`) WITH the session cookie but WITHOUT the `x-csrf-token` header.
  - *Verification*: Sent `Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/v1/leads" -Headers @{ Cookie = "sf.sid=..." } -Body '{}'`.
- [x] Assert that the server strictly rejects the request with a `403 Forbidden` status.
  - *Verification*: Server returned HTTP 403 `CSRF_TOKEN_MISSING` / `FORBIDDEN` before reaching route controller.
- [x] **Acceptance Criteria Met**: No state-changing request (POST/PATCH/DELETE) works without a valid CSRF token.
  - *Verification*: Verified across mutation routes (`POST`, `PATCH`, `DELETE`); automated test coverage in `server/tests/integration/csrf.test.ts`.

## Section 3: Cookie Security Flags
- [x] Open Browser Developer Tools (F12) -> Application -> Cookies.
  - *Verification*: Inspected active origin cookies under `http://localhost:5173` / `http://localhost:3001`.
- [x] Assert that the `sessionId` (`sf.sid`) cookie has the `HttpOnly` flag set to true (preventing XSS access).
  - *Verification*: `HttpOnly` attribute is checked/true in DevTools; `document.cookie` in JavaScript console cannot read `sf.sid`.
- [x] Assert that the `sessionId` (`sf.sid`) cookie has the `SameSite=Lax` or `Strict` flag set.
  - *Verification*: `SameSite` attribute is explicitly set to `Lax` (and `Secure` enabled in production environments).
- [x] Assert that the `csrfToken` cookie is accessible (not HttpOnly) but properly scoped.
  - *Verification*: CSRF token endpoint `/api/v1/auth/csrf` provides the token, enabling client-side request headers while keeping session cookies isolated.
