# Org-Scoped Team Invite System & Multi-Org Link Generator

## Goal
1. Allow administrators (especially master iRasus admins) to select any organization they manage and generate a secure, org-scoped invite link.
2. Ensure the invite link specifically binds the invitee to that chosen organization in Clerk and Supabase, without granting access to any other organization.
3. Keep standard sign-ups (e.g. uninvited Google logins) isolated according to multi-tenant rules, ensuring they do NOT automatically join iRasus unless explicitly invited via that org's link.
4. Provide an in-app "Invite Team" dialog in the Topbar with organization selection, role picker, 1-click shareable signed link copy, and Clerk email invitation dispatch.

---

## Relevant Agent Skills
- `.agents/skills/clerk-orgs/` — Clerk organization memberships, multi-tenancy, and invitation APIs.
- `.agents/skills/clerk-nextjs-patterns/` — Route handlers, server actions, and auth guards.
- `.agents/skills/shadcn/` — Dialog, Select, Tabs, Button, Input styling.

---

## Existing Code Inspected
- `components/layout/topbar.tsx`: Topbar has `MASTER_ORG_ID = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE"`. Needs "Invite Team" button.
- `lib/energy/clerk-sync.ts`: Resolves active organization and memberships.
- `lib/energy/types.ts`: Organization and user interfaces.
- Clerk Backend API: supports `clerk.organizations.createOrganizationMembership({ organizationId, userId, role })` and `clerk.organizations.createOrganizationInvitation(...)`.
- Pre-existing Demo User: `demo@demo.com` / `demo1234` already exists and works for iRasus Technologies.

---

## Decisions & Assumptions
1. **Strict Org-Scoping via HMAC Signature**:
   - The invite URL format: `/invite?orgId=<clerk_org_id>&role=<role>&token=<hmac_token>`
   - The token is signed using `CLERK_SECRET_KEY` on the payload `${orgId}:${role}` so no unauthorized actor can forge an invite into an arbitrary organization.
2. **Organization Selection for Master Admin**:
   - If the logged-in user is an admin of master iRasus (or holds memberships in multiple orgs), the "Invite Team" dialog provides an **Organization Dropdown** to select which organization to generate the link for.
   - For regular single-org admins, the dropdown defaults and locks to their active organization.
3. **Invite Landing Experience (`app/invite/page.tsx`)**:
   - If unauthenticated: Displays an Obsidian invitation card: *"You've been invited to join <Org Name> on NEON Energy"*, with a primary button to Sign In / Sign Up with Google or Email (redirecting back to `/invite` after auth).
   - If authenticated: Displays the invitation details and an *"Accept & Enter Fleet"* button (or automatically completes membership and redirects to the dashboard with full telemetry).
   - Calls Clerk Backend API `clerk.organizations.createOrganizationMembership` to enroll them into that specific organization, and updates Supabase `public.users`.
4. **No Arbitrary Auto-Join**:
   - Regular sign-ups without an invite link will NOT be added to iRasus Technologies, maintaining clean tenant isolation.

---

## Files Likely to Change / Create
| File | Action | Description |
|---|---|---|
| `lib/energy/invite-service.ts` | Create | Token generation, validation, and Clerk membership enrollment logic |
| `app/api/v1/org/invite/route.ts` | Create | API endpoint to list manageable orgs and send Clerk email invites |
| `app/invite/page.tsx` | Create | Dedicated `/invite` landing page with org acceptance flow |
| `components/layout/invite-team-dialog.tsx` | Create | Cyber Black / Neon Pink modal with Org Selector, Role Picker, Copy Link, and Email sender |
| `components/layout/topbar.tsx` | Modify | Add "Invite Team" button for admins |

---

## Design System & Visual Adherence
- Void Black `#060709` page background for `/invite`.
- Obsidian Dark `#0B0D13` card surfaces with subtle frost glass `border-white/[0.08]`.
- Neon Pink `#FF2A85` primary actions, active glow shadows, and badges.
- Monospace font (`font-mono`) on tokens, org IDs, and credentials.
- Touch ergonomics: All interactive targets $\ge 48\times 48\text{ px}$.

---

## Security & RBAC Requirements
- Only `org:admin` (or master org members) can open the invite generator and select organizations.
- Link token verified using cryptographic HMAC (SHA-256) with constant-time comparison to prevent spoofing.
- Clerk Backend API enforces max membership limits and valid role assignments.

---

## Acceptance Criteria
- [ ] Admin can open "Invite Team" dialog and see an Organization Selector if they have multiple orgs / master org access.
- [ ] Generated link contains the exact `orgId`, `role`, and secure `token`.
- [ ] An invited user clicking the link (and signing in with Google or Email) is enrolled ONLY into that specified organization.
- [ ] After acceptance, the invited user immediately lands on that organization's dashboard with its live sites.
- [ ] Direct sign-ups without an invite link do NOT gain access to iRasus Technologies.
- [ ] `npx tsc --noEmit` and `npm run build` pass with 0 errors.

---

## Checks to Run
```bash
npx tsc --noEmit
npm run build
```

---

## Exact Manual Test Steps
1. **Desktop ($1440\times 900$)**:
   - Log in as master admin (`archisman.saha@irasus.com` or `demo@demo.com`).
   - Click "Invite Team" in the Topbar.
   - In the modal, verify the Organization Selector lists `iRasus Technologies` (and other available orgs).
   - Select role (`Member` or `Admin`) and click "Copy Invite Link".
   - Open a fresh incognito window and paste the invite link.
   - Sign in with a personal Google account $\to$ verify it asks to join the specified organization, adds membership in Clerk, and redirects to the fleet dashboard.
2. **Mobile ($390\times 844$)**:
   - Open mobile viewport $\to$ tap "Invite Team" $\to$ verify responsive modal with $\ge 48\text{ px}$ tap targets.
