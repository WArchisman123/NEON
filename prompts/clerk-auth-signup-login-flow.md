# Implementation Prompt: Clerk Authentication (Sign-Up & Login Flow)

## Goal
Implement a production-grade authentication flow using Clerk (`@clerk/nextjs`) in Next.js 16 App Router. Specifically, when an unauthenticated user navigates to `http://localhost:3000/`, they are automatically intercepted and redirected to `/sign-in`. Once authenticated via `/sign-in` or `/sign-up`, they are routed directly to `/` (the protected Fleet Cockpit dashboard). Both the sign-in and sign-up pages, as well as navigation auth controls (`UserButton`, `OrganizationSwitcher`), must strictly adhere to the Cyber Black / Neon Pink design system.

---

## Relevant Agent Skills
- `.agents/skills/clerk/` (`SKILL.md`): Core router and version detection for Clerk v7+ SDK.
- `.agents/skills/clerk-setup/` (`SKILL.md`): Official App Router setup instructions, `ClerkProvider` wiring, and environment variable integration.
- `.agents/skills/clerk-nextjs-patterns/` (`SKILL.md`): Next.js 16 `proxy.ts` / middleware routing strategies, protected-first route matching, and server-side `auth()` resolution.
- `.agents/skills/clerk-custom-ui/` (`SKILL.md`): Appearance customization tokens, dark theme configuration, and cyberpunk CSS overrides for `<SignIn />` and `<SignUp />`.
- `.agents/skills/shadcn/` (`SKILL.md`): Design system consistency, layout composition, and touch target standards.

---

## Existing Code Inspected
- `.env.local`: Contains active Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/`).
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`: Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`, where either default export or named `proxy` function is supported. Both `proxy.ts` and `middleware.ts` can be verified for Next.js 16 compatibility.
- `app/layout.tsx`: Root HTML layout currently rendering fonts and children without `ClerkProvider`.
- `app/page.tsx`: Default Next.js boilerplate that needs to be replaced with an authenticated Fleet Cockpit home view.
- `components/layout/topbar.tsx`: Layout header with placeholder avatar that should integrate Clerk's `<UserButton />` and `<OrganizationSwitcher />`.
- `AGENTS.md` & `public/context/ui_doc.md`: Mandate Cyber Black (`#060709`), Obsidian (`#0B0D13`), and Neon Pink (`#FF2A85`) design tokens without light mode.

---

## Decisions or Assumptions
1. **SDK Installation**: Install `@clerk/nextjs` (v7.9.4+) compatible with Next.js 16.3.5 and React 19.2.8.
2. **Next.js 16 Proxy / Middleware**:
   - Create `proxy.ts` (Next.js 16 standard) using `clerkMiddleware` from `@clerk/nextjs/server`.
   - Protect all routes by default (`/` and sub-routes).
   - Exempt public routes: `/sign-in(.*)`, `/sign-up(.*)`, `/design-system(.*)`, and static asset files.
   - For backwards-compatibility with tooling that looks for `middleware.ts`, create `proxy.ts` and ensure Next.js 16 Turbopack compiles cleanly.
3. **Dedicated Auth Pages**:
   - `app/sign-in/[[...sign-in]]/page.tsx`: Dedicated catch-all sign-in route rendering `<SignIn />` inside a centered Cyber Black container.
   - `app/sign-up/[[...sign-up]]/page.tsx`: Dedicated catch-all sign-up route rendering `<SignUp />`.
4. **Design System Appearance Styling**:
   - Apply a custom cyberpunk `appearance` prop to `ClerkProvider` and the auth components with `#0B0D13` card backgrounds, `#121622` inputs, `#FF2A85` primary CTA with glowing drop shadows, and `font-mono` accents.
5. **Authenticated Home Dashboard (`app/page.tsx`)**:
   - Wrap in `NeonAppShell`.
   - Display authenticated user welcome, organization context, and the 5-metric Fleet Aggregate Strip.

---

## Files Likely to Change / Be Created
1. `package.json`: Add `@clerk/nextjs`.
2. `proxy.ts` (and `middleware.ts` if needed for dual resolution): Clerk route protection middleware.
3. `app/layout.tsx`: Wrap root `<body>` contents with `<ClerkProvider>` configured with Neon Energy cyberpunk theme appearance variables.
4. `app/sign-in/[[...sign-in]]/page.tsx`: Sign-in page with centered neon glowing card.
5. `app/sign-up/[[...sign-up]]/page.tsx`: Sign-up page with centered neon glowing card.
6. `app/page.tsx`: Protected Home view with authenticated Fleet Cockpit and user credentials banner.
7. `components/layout/topbar.tsx`: Integrate `<UserButton />` and `<OrganizationSwitcher />`.

---

## Implementation Requirements

### 1. ClerkProvider in `app/layout.tsx`
- Wrap `{children}` in `<ClerkProvider>`:
  - Inject theme variables:
    - `colorPrimary`: `#FF2A85`
    - `colorBackground`: `#0B0D13`
    - `colorInputBackground`: `#121622`
    - `colorInputText`: `#F8FAFC`
    - `colorText`: `#F8FAFC`
    - `colorTextSecondary`: `#94A3B8`
    - `colorDanger`: `#FF1744`
    - `borderRadius`: `0.5rem`
  - Inject element class overrides for neon pink button glow (`shadow-[0_0_15px_rgba(255,42,133,0.4)]`), dark card borders (`border-white/[0.08]`), and dark inputs.

### 2. Next.js 16 Request Interception (`proxy.ts`)
- Use `clerkMiddleware` from `@clerk/nextjs/server`:
  ```typescript
  import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

  const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/design-system(.*)",
  ]);

  export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  });
  ```

### 3. Sign-In and Sign-Up Routes
- `app/sign-in/[[...sign-in]]/page.tsx`:
  - Full-screen `#060709` Void Black canvas.
  - Glowing Neon Energy brand badge (`⚡ NEON.ENERGY`).
  - Centered `<SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />`.
- `app/sign-up/[[...sign-up]]/page.tsx`:
  - Full-screen `#060709` Void Black canvas.
  - Glowing Neon Energy brand badge.
  - Centered `<SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />`.

### 4. Authenticated Landing Dashboard (`app/page.tsx`)
- Protected route rendering inside `NeonAppShell`.
- Renders the 5-metric Fleet Aggregate Strip, live site cockpit cards, and an active session status pill indicating the signed-in user email and role.

---

## Design System & Visual Adherence
- **Color Fidelity**: Strictly `#060709` background, `#0B0D13` cards, `#FF2A85` Neon Pink buttons and focus halos.
- **Zero Light Mode**: Backgrounds, modals, and input fields must be dark obsidian with high-contrast slate text.
- **Typography & Units**: All numerical metrics format with `font-mono`.
- **Mobile Touch Ergonomics**: Minimum $48 \times 48\ px$ touch dimensions for all buttons, tabs, and avatar triggers.

---

## Security & RBAC Requirements
- Secret keys (`CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) must never be imported into client components.
- Unauthenticated requests to `/` or any internal route must be redirected immediately to `/sign-in` before any telemetry or UI data renders.
- Public routes explicitly restricted to `/sign-in(.*)`, `/sign-up(.*)`, `/design-system(.*)`.

---

## Acceptance Criteria
1. Navigating to `http://localhost:3000/` without an active session immediately redirects to `http://localhost:3000/sign-in`.
2. `/sign-in` displays the Clerk login component styled in Void Black and Neon Pink with zero white flash.
3. Users can switch between Sign In and Sign Up smoothly (`/sign-in` $\leftrightarrow$ `/sign-up`).
4. Completing authentication redirects user back to `http://localhost:3000/`.
5. Authenticated user profile and session state are accessible in the topbar via `<UserButton />`.
6. `/design-system` remains accessible for living documentation and component testing.
7. `npx tsc --noEmit` passes with 0 errors.
8. `npm run lint` passes with 0 errors.
9. `npm run build` succeeds with static and dynamic routes correctly configured.

---

## Checks to Run
- `npm run typecheck` (`npx tsc --noEmit`)
- `npm run lint` (`eslint`)
- `npm run build` (`next build`)

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Unauthenticated Access Test**:
   - Open an incognito / private browser window.
   - Navigate to `http://localhost:3000/`.
   - Verify immediate redirect to `http://localhost:3000/sign-in`.
   - Verify the login card is rendered in obsidian dark `#0B0D13` with neon pink accents.
2. **Sign-In & Redirect Test**:
   - Sign in using test credentials or click "Sign up" to create a new account.
   - Upon completion, confirm redirection back to `http://localhost:3000/`.
   - Verify topbar renders `<UserButton />` with user avatar and menu.
3. **Direct Navigation Test**:
   - While signed in, navigate to `http://localhost:3000/design-system` and confirm it remains functional.
4. **Mobile Responsiveness Test**:
   - On mobile ($390 \times 844$), visit `/sign-in`; confirm form inputs, buttons, and social buttons fit the screen without horizontal scrolling.
