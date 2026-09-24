# Team Invite System & Demo Organization Auto-Onboarding

## Goal
1. Enable `demo@demo.com` with password `demo1234` to sign in and immediately access the full iRasus Technologies fleet (already provisioned in Clerk and PostgreSQL).
2. Solve the "blank dashboard on Google sign-in" issue by automatically onboarding new sign-ups into the master `iRasus Technologies` organization (`org_3JgZ51s2g9LkRRE0L61kAXDGDWE`) as `org:member`.
3. Provide a dedicated shareable invite link (`/invite`) and an in-app "Invite Team" modal in the Topbar with one-click link copying and Clerk email invitations.

---

## Relevant Agent Skills
- `.agents/skills/clerk-orgs/` — Clerk organization memberships, invitations, and role management.
- `.agents/skills/clerk-backend-api/` — Programmatic membership creation and invitation dispatch.
- `.agents/skills/shadcn/` — Dialog, Button, Input, and Tooltip primitives.

---

## Existing Code Inspected
- `lib/energy/clerk-sync.ts`: Currently falls back to `user-org-${clerkUser.id}` if a user has no Clerk organization memberships, leaving new Google sign-ups with an empty/isolated personal org.
- `components/layout/topbar.tsx`: Displays brand, organization switcher/badge, alarm bell, and UserButton.
- `app/page.tsx`: Server component calling `syncUserAndOrgFromClerk()` and fetching sites for `clerkOrgId`.
- Clerk API & DB state: Organization `iRasus Technologies` (`org_3JgZ51s2g9LkRRE0L61kAXDGDWE`, DB UUID `937c5bc8-63fb-4239-a719-53aa87a36876`) contains 6 active Solar & BESS sites.
- Provisioned demo account: `demo@demo.com` (`user_3Jly5gIQtsGiGS2ZmXJhR8tCUBe`) in `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` as `org:admin`.

---

## Decisions & Assumptions
1. **Auto-Join Master Org on Sign-In**:
   When any user signs up (via Google OAuth or email/password) without an existing organization, `syncUserAndOrgFromClerk` will automatically join them to `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` via `clerkClient().organizations.createOrganizationMembership(..., role: 'org:member')`. This ensures **zero blank dashboards**—every evaluator or teammate immediately sees the 6 demo sites.
2. **Shareable Invite URL (`/invite`)**:
   Create a Next.js route `app/invite/page.tsx`. If authenticated, it adds the user to `iRasus Technologies` and redirects to `/`. If unauthenticated, Clerk middleware routes them to sign-in/sign-up, then redirects back to `/invite` to finalize membership.
3. **In-App "Invite Team" Modal in Topbar**:
   Add an "Invite Team" button in `components/layout/topbar.tsx` (available to admins):
   - **Tab 1: Shareable Link**: Generates/copies `https://<origin>/invite` with one click.
   - **Tab 2: Send Email Invite**: Allows typing an email address to trigger Clerk's official `createOrganizationInvitation`.
   - **Tab 3: Demo Account Credentials**: Shows `demo@demo.com` / `demo1234` credentials with quick copy buttons for easy client sharing.
4. **API Endpoint (`app/api/v1/org/invite/route.ts`)**:
   Server endpoint validating Clerk session, checking admin permissions, and dispatching invitations via Clerk Backend API.

---

## Files Likely to Change / Create
| File | Status | Description |
|---|---|---|
| `lib/energy/clerk-sync.ts` | Modify | Auto-join users with no org to master `iRasus Technologies` org |
| `app/invite/page.tsx` | Create | Invite acceptance landing page that links user to org |
| `app/api/v1/org/invite/route.ts` | Create | API endpoint to send email invitations via Clerk BAPI |
| `components/layout/invite-team-dialog.tsx` | Create | Cyber Black modal for invite links, email invites, and demo credentials |
| `components/layout/topbar.tsx` | Modify | Add "Invite Team" button opening the dialog |

---

## Design System & Visual Adherence
- Background: Void Black `#060709`, Modal: Obsidian `#0B0D13` with `#121622` inputs.
- Accent: `#FF2A85` Neon Pink glow and button styling (`shadow-[0_0_15px_rgba(255,42,133,0.35)]`).
- Code & links in `font-mono`.
- Mobile touch targets $\ge 48\times 48\text{ px}$.

---

## Security & RBAC Requirements
- Only `org:admin` can dispatch Clerk email invitations.
- Auto-join assigns `org:member` (read-only/operator), reserving `org:admin` for existing administrators.
- Rate limiting and input sanitization on the email invite endpoint.

---

## Acceptance Criteria
- [ ] `demo@demo.com` / `demo1234` logs in and immediately sees the 6 sites and live telemetry.
- [ ] A new user signing in via Google is automatically enrolled into `iRasus Technologies` and sees all 6 sites instead of a blank screen.
- [ ] Navigating to `/invite` while logged in ensures membership in `iRasus Technologies` and redirects to `/`.
- [ ] The "Invite Team" button in the Topbar opens a styled dialog with copyable invite link and Clerk invite email sender.
- [ ] Desktop and mobile views render the invite modal and buttons cleanly without layout shifts.
- [ ] `npx tsc --noEmit` and build pass with 0 errors.

---

## Checks to Run
```bash
npx tsc --noEmit
npm run build
```

---

## Exact Manual Test Steps
1. **Desktop ($1440\times 900$)**:
   - Open `/sign-in` in an incognito window.
   - Enter `demo@demo.com` and `demo1234` $\to$ verify immediate access to Fleet Cockpit with 6 sites.
   - Sign in with a new Google account $\to$ verify automatic membership in iRasus and 6 sites visible.
   - Click "Invite Team" in Topbar $\to$ verify modal opens with shareable link, email form, and demo credentials.
   - Test copying the invite link $\to$ verify toast/feedback.
2. **Mobile ($390\times 844$)**:
   - Open the app on mobile viewport.
   - Tap "Invite Team" button $\to$ ensure dialog fits screen and inputs meet $48\text{ px}$ touch target.
