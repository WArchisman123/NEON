# NEON ENERGY — Clerk Auth + Custom DB User & Org Flow
## Implementation Prompt for Backend Developer
**Version**: `1.0.0-PROD`
**Author**: Platform Engineering
**Date**: 2026-10-26
**Priority**: P0 — Required before any other production endpoint work

---

## 1. Goal

Replace the current direct Supabase PostgreSQL writes (done inside the Next.js frontend at `lib/energy/clerk-sync.ts` and `lib/supabase/db.ts`) with a **clean backend API** that the frontend will call over HTTP.

**After this is done:**
- The Next.js frontend has **zero** direct database connections.
- Every database write goes through your backend API.
- Clerk is the sole auth layer — your backend verifies the Clerk JWT on every request.
- Demo-data seeding is permanently removed.
- The frontend's `lib/api.ts` client attaches the Clerk session JWT as `Authorization: Bearer <token>` on every call.

---

## 2. The Problem Being Solved (Current State)

Right now, the Next.js app:
1. Calls `syncUserAndOrgFromClerk()` (in `lib/energy/clerk-sync.ts`) on every page load.
2. That function directly hits **Supabase PostgreSQL** via a raw `pg` pool connection (`lib/supabase/db.ts`).
3. It upserts rows into `public.users` and `public.organizations` tables in Supabase.
4. It also seeds fake demo sites into Supabase.

**Target state:**
- `syncUserAndOrgFromClerk()` is replaced by a single `POST /api/v1/auth/sync` call to your backend.
- Your backend does the upsert into your database.
- No direct DB connection from the frontend.
- No Supabase dependency anywhere.

---

## 3. Auth Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTH FLOW                                     │
│                                                                     │
│  User logs in via Clerk UI                                          │
│       │                                                             │
│       ▼                                                             │
│  Clerk issues Session JWT                                           │
│  (contains: userId, orgId, orgRole, email, name)                   │
│       │                                                             │
│       ▼                                                             │
│  Next.js Frontend                                                   │
│  ├── Server Components: auth() from @clerk/nextjs/server            │
│  │   └── Gets token via auth().getToken() — passed to API calls     │
│  └── Client Components: useAuth().getToken() — passed to API calls  │
│       │                                                             │
│       ▼  HTTP Request with Authorization: Bearer <clerk_jwt>        │
│                                                                     │
│  Your Backend API (https://api.neonenergy.io)                       │
│  ├── Extract JWT from Authorization header                          │
│  ├── Verify JWT using Clerk's JWKS endpoint (or Clerk SDK)          │
│  ├── Extract claims: sub (userId), org_id, org_role, email          │
│  └── Proceed with DB operation                                      │
│                                                                     │
│  Your PostgreSQL Database                                           │
│  ├── users table                                                    │
│  └── organizations table                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.1 Clerk JWT Claims Available to Your Backend

When you verify the Clerk JWT, you will find these claims:

| Claim | Type | Description |
|---|---|---|
| `sub` | `string` | Clerk User ID (e.g. `user_2abc...`) — use as `clerk_user_id` |
| `org_id` | `string \| null` | Active Clerk Organization ID (e.g. `org_2xyz...`) — use as `clerk_org_id` |
| `org_role` | `string \| null` | Role in org: `org:admin`, `org:member`, `org:engineer`, etc. |
| `org_slug` | `string \| null` | Human-readable org slug |
| `email` | `string` | Primary email (may come from `email_addresses[0]` in Clerk user object) |
| `given_name` | `string \| null` | First name |
| `family_name` | `string \| null` | Last name |
| `picture` | `string \| null` | Avatar URL |
| `iat` | `number` | Issued at (Unix timestamp) |
| `exp` | `number` | Expiry (Unix timestamp) |

> **Important:** If `org_id` is `null`, the user is logged in but has no active organization selected. The frontend will always try to set an active org before calling your API. Handle this gracefully — return `403` if `org_id` is missing on org-scoped endpoints.

### 3.2 How to Verify the Clerk JWT on Your Backend

**Option A — Using the Clerk Backend SDK (Recommended for Node.js backends):**
```bash
npm install @clerk/backend
```
```typescript
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// In your middleware/guard:
async function verifyClerkToken(authHeader: string) {
  const token = authHeader.replace('Bearer ', '');
  const payload = await clerk.verifyToken(token);
  // payload.sub = clerk_user_id
  // payload.org_id = clerk_org_id
  // payload.org_role = role
  return payload;
}
```

**Option B — Standard JWKS Verification (language-agnostic, use for non-Node backends):**
- JWKS URL: `https://api.clerk.dev/v1/jwks` (or `https://<your-clerk-domain>/.well-known/jwks.json`)
- Use any JWT library (e.g. `jsonwebtoken` + `jwks-rsa` for Node, `PyJWT` + `cryptography` for Python, `System.IdentityModel.Tokens.Jwt` for .NET)
- Verify signature, expiry, and issuer.

### 3.3 Standard Error Responses for Auth Failures

```json
// 401 — Token missing or malformed
{ "success": false, "error": "Unauthorized", "code": "AUTH_TOKEN_MISSING" }

// 401 — Token expired
{ "success": false, "error": "Token expired", "code": "AUTH_TOKEN_EXPIRED" }

// 403 — Valid user but no org context on an org-scoped endpoint
{ "success": false, "error": "Organization context required", "code": "ORG_CONTEXT_MISSING" }

// 403 — User is not a member of the requested organization
{ "success": false, "error": "Access denied", "code": "ORG_ACCESS_DENIED" }
```

---

## 4. Database Schema — Tables Your Backend Must Own

These are the two tables that the frontend's auth sync flow writes to. Your backend must create and manage these in your production database.

### 4.1 `users` table

```sql
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id     TEXT UNIQUE NOT NULL,       -- Clerk's `sub` claim
    email             TEXT NOT NULL,
    first_name        TEXT,
    last_name         TEXT,
    image_url         TEXT,
    clerk_org_id      TEXT,                       -- Active org's Clerk ID
    current_org_id    UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role              TEXT DEFAULT 'org:member',  -- Clerk org role string
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_clerk_org_id  ON users(clerk_org_id);
```

### 4.2 `organizations` table

```sql
CREATE TABLE organizations (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_org_id          TEXT UNIQUE NOT NULL,   -- Clerk's `org_id` claim
    name                  TEXT NOT NULL,
    slug                  TEXT NOT NULL,
    tier                  TEXT DEFAULT 'starter'
                            CHECK (tier IN ('starter', 'pro_commercial', 'utility_enterprise')),
    status                TEXT DEFAULT 'active'
                            CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
    stripe_customer_id    TEXT,
    stripe_subscription_id TEXT,
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_organizations_clerk_org_id ON organizations(clerk_org_id);
```

> **Note:** `sites` and all other tables are scoped to the `organizations` table via a `org_id UUID REFERENCES organizations(id)` foreign key. Do NOT auto-create any demo/seed sites — only real sites created by the user go in.

---

## 5. Endpoints to Build — User & Auth Flow

### 5.1 POST `/api/v1/auth/sync`

**Purpose:** Called by the Next.js frontend immediately after a user logs in or when their session is refreshed. Upserts the user and their active organization into your database. This replaces `syncUserAndOrgFromClerk()`.

**Auth Required:** Yes — Clerk JWT in `Authorization: Bearer <token>`.

**Request:**
```http
POST /api/v1/auth/sync
Authorization: Bearer <clerk_jwt>
Content-Type: application/json
```

**Request Body:**
```json
{
  "clerkUserId": "user_2abc123",
  "email": "engineer@irasus.com",
  "firstName": "Arjun",
  "lastName": "Mehta",
  "imageUrl": "https://img.clerk.com/...",
  "clerkOrgId": "org_2xyz456",
  "orgName": "iRasus Technologies",
  "orgSlug": "irasus-technologies",
  "orgRole": "org:admin"
}
```

> **Why send body if it's in the JWT?** The JWT has `sub`, `org_id`, `org_role`. The user's `firstName`, `lastName`, `email`, `imageUrl` come from Clerk's user object (the frontend fetches them via `currentUser()` server-side). Sending them in the body avoids an extra Clerk Backend API call from your backend. However, **always validate that `clerkUserId` in the body matches `sub` in the verified JWT** — never trust the body alone.

**Backend Logic:**
```
1. Verify Clerk JWT → extract sub (must match body.clerkUserId).
2. If body.clerkOrgId is present:
   a. UPSERT organizations ON CONFLICT (clerk_org_id)
      SET name, slug, updated_at = now()
      → Get back org.id (your internal UUID)
3. UPSERT users ON CONFLICT (clerk_user_id)
   SET email, first_name, last_name, image_url,
       clerk_org_id, current_org_id, role, updated_at = now()
4. Return the full user + org records.
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "clerkUserId": "user_2abc123",
      "email": "engineer@irasus.com",
      "firstName": "Arjun",
      "lastName": "Mehta",
      "imageUrl": "https://img.clerk.com/...",
      "clerkOrgId": "org_2xyz456",
      "currentOrgId": "770e8400-e29b-41d4-a716-446655440001",
      "role": "org:admin",
      "createdAt": "2026-10-26T08:00:00.000Z",
      "updatedAt": "2026-10-26T13:44:00.000Z"
    },
    "organization": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "clerkOrgId": "org_2xyz456",
      "name": "iRasus Technologies",
      "slug": "irasus-technologies",
      "tier": "pro_commercial",
      "status": "active",
      "createdAt": "2026-10-01T00:00:00.000Z",
      "updatedAt": "2026-10-26T13:44:00.000Z"
    }
  },
  "meta": { "timestamp": "2026-10-26T13:44:53.000Z" }
}
```

---

### 5.2 GET `/api/v1/users/me`

**Purpose:** Returns the current authenticated user's full profile from your database.

**Auth Required:** Yes — Clerk JWT.

**Request:**
```http
GET /api/v1/users/me
Authorization: Bearer <clerk_jwt>
```

**Backend Logic:**
```
1. Verify JWT → extract sub.
2. SELECT * FROM users WHERE clerk_user_id = sub LIMIT 1.
3. If not found → 404.
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "clerkUserId": "user_2abc123",
    "email": "engineer@irasus.com",
    "firstName": "Arjun",
    "lastName": "Mehta",
    "imageUrl": "https://img.clerk.com/...",
    "clerkOrgId": "org_2xyz456",
    "currentOrgId": "770e8400-e29b-41d4-a716-446655440001",
    "role": "org:admin",
    "createdAt": "2026-10-26T08:00:00.000Z",
    "updatedAt": "2026-10-26T13:44:00.000Z"
  },
  "meta": { "timestamp": "2026-10-26T13:44:53.000Z" }
}
```

---

### 5.3 PUT `/api/v1/users/me`

**Purpose:** Updates profile fields for the currently authenticated user. Used if the frontend lets users update display preferences or if org context changes.

**Auth Required:** Yes — Clerk JWT.

**Request:**
```http
PUT /api/v1/users/me
Authorization: Bearer <clerk_jwt>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "firstName": "Arjun",
  "lastName": "Mehta",
  "imageUrl": "https://img.clerk.com/new-avatar...",
  "clerkOrgId": "org_2xyz456",
  "currentOrgId": "770e8400-e29b-41d4-a716-446655440001",
  "role": "org:admin"
}
```

**Backend Logic:**
```
1. Verify JWT → extract sub.
2. Build UPDATE SET clause for only provided fields + updated_at = now().
3. UPDATE users WHERE clerk_user_id = sub RETURNING *.
4. If no row updated → 404.
```

**Response `200 OK`:** Same shape as GET `/api/v1/users/me`.

---

### 5.4 GET `/api/v1/organizations/me`

**Purpose:** Returns the current authenticated user's active organization details from your database.

**Auth Required:** Yes — Clerk JWT with `org_id` claim.

**Request:**
```http
GET /api/v1/organizations/me
Authorization: Bearer <clerk_jwt>
```

**Backend Logic:**
```
1. Verify JWT → extract org_id claim.
2. If org_id is null → 403 with code ORG_CONTEXT_MISSING.
3. SELECT * FROM organizations WHERE clerk_org_id = org_id LIMIT 1.
4. If not found → 404 (org not yet synced — frontend should call POST /auth/sync first).
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "clerkOrgId": "org_2xyz456",
    "name": "iRasus Technologies",
    "slug": "irasus-technologies",
    "tier": "pro_commercial",
    "status": "active",
    "stripeCustomerId": null,
    "stripeSubscriptionId": null,
    "createdAt": "2026-10-01T00:00:00.000Z",
    "updatedAt": "2026-10-26T13:44:00.000Z"
  },
  "meta": { "timestamp": "2026-10-26T13:44:53.000Z" }
}
```

---

## 6. Clerk Webhooks — Keep DB in Sync Automatically

In addition to the `/auth/sync` endpoint (which the frontend calls on login), set up Clerk webhooks on your backend to handle asynchronous events. This ensures your DB stays consistent even if the user changes their name in Clerk, or an admin removes a member.

### 6.1 Webhook Endpoint

```
POST /api/v1/webhooks/clerk
```

**Verification:** Clerk signs every webhook with a secret using `svix`. Your backend **must** verify this signature before processing.

```typescript
// Node.js example using the 'svix' package:
import { Webhook } from 'svix';

const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
const payload = wh.verify(rawBody, {
  'svix-id': req.headers['svix-id'],
  'svix-timestamp': req.headers['svix-timestamp'],
  'svix-signature': req.headers['svix-signature'],
});
```

### 6.2 Events to Handle

| Clerk Event | Your Action |
|---|---|
| `user.created` | INSERT into `users` (or upsert) |
| `user.updated` | UPDATE `users` SET first_name, last_name, email, image_url WHERE clerk_user_id = event.data.id |
| `user.deleted` | DELETE FROM `users` WHERE clerk_user_id = event.data.id (or soft-delete) |
| `organization.created` | INSERT into `organizations` |
| `organization.updated` | UPDATE `organizations` SET name, slug WHERE clerk_org_id = event.data.id |
| `organization.deleted` | DELETE FROM `organizations` WHERE clerk_org_id = event.data.id |
| `organizationMembership.created` | UPDATE `users` SET clerk_org_id, role WHERE clerk_user_id = event.data.public_user_data.user_id |
| `organizationMembership.updated` | UPDATE `users` SET role WHERE clerk_user_id = event.data.public_user_data.user_id |
| `organizationMembership.deleted` | UPDATE `users` SET clerk_org_id = NULL, current_org_id = NULL WHERE clerk_user_id |

**Webhook Response:** Always return `200 OK` with `{ received: true }` for all events (including ones you don't handle), otherwise Clerk will retry.

### 6.3 Configure in Clerk Dashboard

1. Go to **Clerk Dashboard → Webhooks → Add Endpoint**.
2. URL: `https://api.neonenergy.io/api/v1/webhooks/clerk`
3. Subscribe to: `user.*`, `organization.*`, `organizationMembership.*`
4. Copy the **Signing Secret** → set as `CLERK_WEBHOOK_SECRET` env variable on your backend.

---

## 7. Standard Response Envelope (All Endpoints)

**Every endpoint must wrap responses in this envelope — the frontend's `lib/api.ts` depends on it.**

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-26T13:44:53.000Z"
  }
}

// Error
{
  "success": false,
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "details": [],
  "meta": {
    "timestamp": "2026-10-26T13:44:53.000Z"
  }
}
```

---

## 8. Environment Variables Your Backend Needs

```env
# Clerk
CLERK_SECRET_KEY=sk_live_...          # Used by Clerk SDK to verify JWTs and call Clerk Backend API
CLERK_WEBHOOK_SECRET=whsec_...        # Used to verify incoming Clerk webhook signatures

# Your DB
DATABASE_URL=postgresql://user:pass@host:5432/neon_production

# (Optional) NEON Frontend origin for CORS
ALLOWED_ORIGIN=https://app.neonenergy.io
```

---

## 9. CORS Configuration

Your backend must allow requests from the Next.js frontend origin:

```
Access-Control-Allow-Origin: https://app.neonenergy.io
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Max-Age: 86400
```

---

## 10. What the Frontend Will Change (Context for Backend Dev)

So you understand what the frontend will send, here is what the Next.js side will do after this prompt is implemented:

### 10.1 Updated `lib/api.ts` (Auth-Aware Client)

The frontend's existing `lib/api.ts` will be updated to automatically attach the Clerk JWT:

```typescript
// lib/api.ts — simplified view of what changes
const request = async <T>(endpoint: string, options: RequestOptions & { token?: string } = {}) => {
  const { token, ...rest } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...rest.headers,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
    ...rest,
    headers,
  });
  // ... error handling
};
```

### 10.2 New `lib/api/auth.ts` — Typed Auth API Methods

```typescript
// POST /api/v1/auth/sync
export async function syncUserWithBackend(payload: SyncPayload, token: string)

// GET /api/v1/users/me
export async function getMe(token: string)

// PUT /api/v1/users/me
export async function updateMe(updates: Partial<UserProfile>, token: string)

// GET /api/v1/organizations/me
export async function getMyOrg(token: string)
```

### 10.3 New Environment Variable in Next.js

```env
NEXT_PUBLIC_API_BASE_URL=https://api.neonenergy.io
```

### 10.4 What Gets Removed from the Frontend

| File | Current Purpose | Action |
|---|---|---|
| `lib/supabase/db.ts` | Raw `pg` pool connection | **Deleted** |
| `lib/supabase/server.ts` | Supabase JS client | **Deleted** |
| `lib/supabase/client.ts` | Supabase JS client | **Deleted** |
| `lib/energy/clerk-sync.ts` | Direct DB upsert of user/org | **Replaced** — calls `POST /api/v1/auth/sync` |
| `lib/energy/site-service.ts` | Direct DB queries for sites + demo seeding | **Replaced** — calls your API endpoints |
| `DATABASE_URL` in `.env.local` | Direct DB connection string | **Removed** |

---

## 11. Acceptance Criteria

Before handing off to the frontend team, verify:

- [ ] `POST /api/v1/auth/sync` correctly upserts user and org, returns valid response envelope.
- [ ] `GET /api/v1/users/me` returns `404` for an unknown Clerk user ID (not yet synced).
- [ ] All endpoints return `401` for requests with no `Authorization` header.
- [ ] All endpoints return `401` for requests with an expired or tampered JWT.
- [ ] `GET /api/v1/organizations/me` returns `403` with `code: ORG_CONTEXT_MISSING` when JWT has no `org_id`.
- [ ] Clerk webhook `user.updated` correctly updates the `first_name`/`last_name` in your DB.
- [ ] Clerk webhook `organization.deleted` removes the org record from your DB.
- [ ] Webhook endpoint returns `200 OK` for unhandled event types (no retries triggered).
- [ ] CORS headers are present on all responses when `Origin` header is from the allowed frontend domain.
- [ ] `POST /api/v1/auth/sync` validates that `clerkUserId` in the body matches `sub` in the verified JWT — rejects mismatches with `403`.
- [ ] Upsert logic is idempotent — calling `POST /api/v1/auth/sync` 10 times with the same user creates exactly 1 row.
- [ ] No demo/seed data is inserted at any point.

---

## 12. Endpoint Summary Table

| # | Method | Path | Auth | DB Tables Touched | Priority |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/v1/auth/sync` | Clerk JWT | `users`, `organizations` | **P0** |
| 2 | `GET` | `/api/v1/users/me` | Clerk JWT | `users` | **P0** |
| 3 | `PUT` | `/api/v1/users/me` | Clerk JWT | `users` | P1 |
| 4 | `GET` | `/api/v1/organizations/me` | Clerk JWT | `organizations` | **P0** |
| 5 | `POST` | `/api/v1/webhooks/clerk` | Svix signature | `users`, `organizations` | **P0** |

> Implement in priority order: `POST /auth/sync` → `GET /users/me` → `GET /organizations/me` → webhook → `PUT /users/me`. The frontend is blocked on the first three.

---

## 13. Quick Test Commands (Share with Backend Dev)

Once endpoints are deployed, the frontend team will use these to verify:

```bash
# 1. Get a real Clerk token for testing (from browser DevTools → Application → Cookies → __session)
# Or use Clerk's testing tools.

TOKEN="eyJ..."  # Paste real Clerk JWT here

# 2. Test auth/sync
curl -X POST https://api.neonenergy.io/api/v1/auth/sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clerkUserId":"user_2abc123","email":"test@irasus.com","firstName":"Arjun","lastName":"Mehta","imageUrl":null,"clerkOrgId":"org_2xyz456","orgName":"iRasus Technologies","orgSlug":"irasus-technologies","orgRole":"org:admin"}'

# 3. Test /users/me
curl https://api.neonenergy.io/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Test /organizations/me
curl https://api.neonenergy.io/api/v1/organizations/me \
  -H "Authorization: Bearer $TOKEN"

# 5. Test missing token (should return 401)
curl https://api.neonenergy.io/api/v1/users/me
```

---

*This document covers Phase 1 (User & Auth flow) only. Phase 2 will cover the full telemetry endpoints (`/sites`, `/sites/:id/live`, etc.) once this foundation is stable and tested.*
