# Authentication API Contracts & Security Rules

Complies with TDD Section 9.2, SRS FR-AUTH, and Architectural Decisions (R-06, F-1).

## 1. Endpoints

### GET /api/v1/auth/csrf
- **Description**: Returns a CSRF token required for subsequent state-changing requests.
- **Success**: `200 OK`
  ```json
  { "data": { "csrfToken": "<string>" } }
  ```

### POST /api/v1/auth/login
- **Headers**: `X-CSRF-Token: <token>`
- **Request Body**:
  ```json
  { "email": "<email>", "password": "<password>" }
  ```
- **Success**: `200 OK` (Sets `sf.sid` session cookie)
  ```json
  { "data": { "user": { "id": "<id>", "email": "<email>", "role": "ADMIN" } } }
  ```
- **Errors**: `INVALID_CREDENTIALS` (401), `RATE_LIMITED` (429), `CSRF_INVALID` (403)

### POST /api/v1/auth/logout
- **Headers**: `X-CSRF-Token: <token>`
- **Success**: `204 No Content` (Destroys session and clears `sf.sid` cookie)
- **Errors**: `CSRF_INVALID` (403)

### GET /api/v1/auth/me
- **Description**: Returns profile for currently authenticated session.
- **Success**: `200 OK`
  ```json
  { "data": { "user": { "id": "<id>", "email": "<email>", "role": "ADMIN" } } }
  ```
- **Errors**: `UNAUTHENTICATED` (401)

### POST /api/v1/auth/change-password
- **Headers**: `X-CSRF-Token: <token>`
- **Request Body**:
  ```json
  { "currentPassword": "<string>", "newPassword": "<string>" }
  ```
- **Success**: `204 No Content`
- **Errors**: `INVALID_CREDENTIALS` (401), `CSRF_INVALID` (403), `UNAUTHENTICATED` (401)

## 2. Security Parameters

| Parameter | Specification |
|---|---|
| **Session Cookie** | `sf.sid` (`HttpOnly`, `Secure`, `SameSite=Strict`) |
| **Idle Timeout** | 8 hours of inactivity (`rolling: true`) |
| **Absolute Timeout** | 24 hours maximum lifetime from creation |
| **Password Policy** | 12 to 128 characters; hashed with Argon2id |
| **Brute-Force Guard** | Rate limit: 5 failed attempts per 15 minutes |

## 3. Business Rules

1. **CSRF Requirement**: All mutating requests (`POST`, `PATCH`, `DELETE`) require a valid `X-CSRF-Token`. The login request itself requires a CSRF token fetched prior via `GET /api/v1/auth/csrf`.
2. **First-Login Guard**: If `must_change_password` is flagged (`true`), all API routes are blocked with `403 PASSWORD_CHANGE_REQUIRED`, except `/api/v1/auth/me`, `/api/v1/auth/logout`, and `/api/v1/auth/change-password`.
3. **Authoritative Active Check (Resolution R-06 / F-1)**: Authoritative DB verification of user `is_active` status occurs on every authenticated request.
4. **Session Purge (Resolution F-1)**: Deactivating a user must attempt a best-effort purge of their session records in the database session store.
