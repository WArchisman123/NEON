# Implementation Prompt: Clerk Theme Dark Text & Cyberpunk UI Fix

## Goal
Fix dark text rendering on dark obsidian backgrounds and unstyled white inputs across all Clerk components (`<SignIn />`, `<SignUp />`, `<UserProfile />`, `<UserButton />`, `<OrganizationSwitcher />`, `<OrganizationProfile />`, and organization setup flows). Transform all Clerk auth surfaces into the high-contrast **Cyber Black / Neon Pink** design system specified in `AGENTS.md` and `ui_doc.md`.

---

## Relevant Agent Skills
- `.agents/skills/clerk-custom-ui/` (`SKILL.md`): Appearance customization tokens, themes (`dark`), `variables` (`colorText`, `colorTextSecondary`, `colorInputBackground`, `colorInputText`, `colorPrimary`, `colorBackground`), and elements targeting.
- `.agents/skills/clerk/` (`SKILL.md`): Core router and version detection for Clerk v7+ SDK.
- `.agents/skills/clerk-setup/` (`SKILL.md`): App Router `ClerkProvider` configuration and global appearance injection.
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Multi-tenant organization profile and switcher styling patterns.
- `.agents/skills/shadcn/` (`SKILL.md`): Contrast verification, typography consistency, and minimum 48px touch ergonomics.

---

## Existing Code Inspected
- `public/context/context_img/signup color too dark . replace gray.png`: User reference image demonstrating `<SignUp />`'s "Setup your organization" screen where:
  - Header text ("Setup your organization") is dark gray/black on a `#0B0D13` obsidian card.
  - Subtitle ("Enter your organization details to continue") and field labels ("Logo", "Name", helper text "Recommended size 1:1...") are dark gray and unreadable.
  - Organization Name input box has an unstyled bright `#FFFFFF` white background with black text.
  - Identity preview text ("Signed in as archisman.saha@irasus.com") is dark gray.
  - Watermark ("Secured by clerk") is dark gray.
- `app/layout.tsx`: `ClerkProvider` currently only defines `colorPrimary`, `colorBackground`, `colorDanger`, and `borderRadius`. It completely omits `baseTheme: dark` as well as `colorText`, `colorTextSecondary`, `colorInputBackground`, and `colorInputText`, causing Clerk to default to light-mode typography.
- `app/globals.css`: Missing `color-scheme: dark` on `:root` / `html` and missing `.cl-*` global class overrides for Clerk's internal primitives, file uploaders, and modal cards.
- `components/layout/topbar.tsx`: Contains `<OrganizationSwitcher />` and `<UserButton />`.
- `package.json`: Lacks `@clerk/themes`.

---

## Decisions or Assumptions
1. **Official Base Dark Theme (`@clerk/themes`)**:
   - Install `@clerk/themes` (compatible with Clerk v7 SDK).
   - Pass `baseTheme: dark` to `ClerkProvider` in `app/layout.tsx`.
2. **Comprehensive Appearance Variables**:
   - Set in `ClerkProvider`:
     - `colorPrimary`: `#FF2A85` (Neon Pink)
     - `colorBackground`: `#0B0D13` (Obsidian Dark)
     - `colorInputBackground`: `#121622` (Cyber Elevated Glass)
     - `colorInputText`: `#F8FAFC` (Pure Radiant Text)
     - `colorText`: `#F8FAFC` (Primary Text)
     - `colorTextSecondary`: `#94A3B8` (Muted Silver Text)
     - `colorTextOnPrimaryBackground`: `#FFFFFF`
     - `colorDanger`: `#FF1744` (Neon Red)
     - `colorSuccess`: `#00E676` (Cyber Emerald)
     - `colorWarning`: `#FFAB00` (Vivid Amber)
     - `colorNeutral`: `#F8FAFC`
     - `colorBorder`: `rgba(255, 255, 255, 0.1)`
     - `borderRadius`: `0.5rem`
3. **Exhaustive Component Elements Styling**:
   - Explicitly style:
     - `card`, `cardBox`, `modalContent`, `modalCloseButton`
     - `headerTitle`, `headerSubtitle`
     - `formFieldLabel`, `formFieldLabelRow`, `formFieldInput`, `formFieldHintText`, `formFieldErrorText`, `formFieldSuccessText`
     - `formButtonPrimary`, `formButtonReset`
     - `footer`, `footerActionText`, `footerActionLink`
     - `identityPreviewText`, `identityPreviewEditButton`
     - `socialButtonsBlockButton`, `socialButtonsBlockButtonText`, `dividerLine`, `dividerText`
     - `avatarBox`, `avatarImage`, `avatarUploader`, `fileDropArea`, `fileDropAreaHint`, `fileDropAreaButtonPrimary`
     - `userButtonAvatarBox`, `userButtonPopoverCard`, `userButtonPopoverActionButton`, `userButtonPopoverFooter`
     - `organizationSwitcherTrigger`, `organizationSwitcherPopoverCard`, `organizationProfile`, `userProfile`
4. **Global CSS Enforcement & Fallback (`app/globals.css`)**:
   - Add `color-scheme: dark;` to `:root`, `html`, and `body`.
   - Add targeted `.cl-*` class selectors for guaranteed contrast across any deeply nested subcomponents (file pickers, organization logo preview, dialog overlays, tab headers).

---

## Files Likely to Change
1. `package.json`: Install `@clerk/themes`.
2. `app/layout.tsx`: Update `ClerkProvider` with `baseTheme: dark`, full `variables`, and expanded `elements` definitions.
3. `app/globals.css`: Add `color-scheme: dark;` and robust `.cl-*` cyberpunk styling overrides.
4. `components/layout/topbar.tsx`: Ensure `<OrganizationSwitcher />` and `<UserButton />` inherit and augment obsidian styling.

---

## Implementation Requirements

### 1. Package Installation
- Install `@clerk/themes`:
  ```bash
  npm i @clerk/themes
  ```

### 2. Root Layout (`app/layout.tsx`)
- Import `dark` theme:
  ```typescript
  import { dark } from "@clerk/themes";
  ```
- Configure `ClerkProvider`:
  ```tsx
  <ClerkProvider
    appearance={{
      baseTheme: dark,
      variables: {
        colorPrimary: "#FF2A85",
        colorBackground: "#0B0D13",
        colorInputBackground: "#121622",
        colorInputText: "#F8FAFC",
        colorText: "#F8FAFC",
        colorTextSecondary: "#94A3B8",
        colorTextOnPrimaryBackground: "#FFFFFF",
        colorDanger: "#FF1744",
        colorSuccess: "#00E676",
        colorWarning: "#FFAB00",
        colorNeutral: "#F8FAFC",
        borderRadius: "0.5rem",
      },
      elements: {
        card: "bg-[#0B0D13] border border-white/[0.08] shadow-[0_0_35px_rgba(0,0,0,0.85)] backdrop-blur-xl text-slate-100",
        headerTitle: "text-white font-bold tracking-tight text-lg",
        headerSubtitle: "text-slate-400 text-xs",
        formFieldLabel: "text-slate-300 font-medium text-xs tracking-wide",
        formFieldLabelRow: "text-slate-300",
        formFieldInput:
          "bg-[#121622] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-[#FF2A85] focus:ring-1 focus:ring-[#FF2A85] font-mono rounded-lg transition-colors",
        formFieldHintText: "text-slate-400 text-xs",
        formFieldErrorText: "text-[#FF1744] text-xs font-mono",
        formFieldSuccessText: "text-[#00E676] text-xs font-mono",
        formButtonPrimary:
          "bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,42,133,0.4)] border border-[#FF2A85]/60 transition-all font-mono",
        footer: "border-t border-white/[0.08] bg-[#0B0D13]",
        footerActionText: "text-slate-400 text-xs",
        footerActionLink: "text-[#FF2A85] hover:text-[#ff559f] font-semibold",
        identityPreviewText: "text-slate-200 font-mono",
        identityPreviewEditButton: "text-[#FF2A85] hover:text-[#ff559f]",
        socialButtonsBlockButton:
          "bg-[#121622] border border-white/[0.1] hover:bg-[#1a2030] text-slate-200 hover:text-white font-semibold transition-colors",
        socialButtonsBlockButtonText: "text-slate-200 font-medium",
        dividerLine: "bg-white/[0.1]",
        dividerText: "text-slate-500 text-xs font-mono uppercase",
        userButtonAvatarBox:
          "border border-white/[0.2] shadow-[0_0_8px_rgba(255,42,133,0.4)]",
        userButtonPopoverCard: "bg-[#0B0D13] border border-white/[0.1] shadow-2xl text-slate-100",
        userButtonPopoverActionButton: "text-slate-300 hover:text-white hover:bg-white/[0.05]",
        userButtonPopoverActionButtonText: "text-slate-300 hover:text-white",
        userButtonPopoverFooter: "border-t border-white/[0.08]",
        organizationSwitcherTrigger:
          "bg-[#121622] border border-white/[0.08] hover:border-white/[0.2] text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all",
        organizationSwitcherPopoverCard: "bg-[#0B0D13] border border-white/[0.1] shadow-2xl text-slate-100",
        fileDropArea: "bg-[#121622] border border-white/[0.1] text-slate-300",
        fileDropAreaHint: "text-slate-400 text-xs",
        fileDropAreaButtonPrimary: "text-[#FF2A85] hover:text-[#ff559f]",
      },
    }}
  >
  ```

### 3. Global CSS (`app/globals.css`)
- Configure `color-scheme: dark;` on `:root` and `html`.
- Add explicit Clerk cyberpunk fallback overrides for `.cl-*` selectors:
  ```css
  /* Clerk Cyberpunk Theme Styles */
  :root {
    color-scheme: dark;
    --background: #060709;
    --foreground: #F8FAFC;
  }

  .cl-card,
  .cl-modalContent,
  .cl-userButtonPopoverCard,
  .cl-organizationSwitcherPopoverCard,
  .cl-organizationProfile,
  .cl-userProfile {
    background-color: #0B0D13 !important;
    color: #F8FAFC !important;
    border-color: rgba(255, 255, 255, 0.08) !important;
  }

  .cl-headerTitle,
  .cl-profileSectionTitleText,
  .cl-formFieldLabel,
  .cl-formFieldLabelRow {
    color: #F8FAFC !important;
  }

  .cl-headerSubtitle,
  .cl-formFieldInfoText,
  .cl-formFieldHintText,
  .cl-identityPreviewText,
  .cl-footerActionText,
  .cl-fileDropAreaHint {
    color: #94A3B8 !important;
  }

  .cl-formFieldInput,
  .cl-input {
    background-color: #121622 !important;
    color: #F8FAFC !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
  }

  .cl-formFieldInput:focus,
  .cl-input:focus {
    border-color: #FF2A85 !important;
    box-shadow: 0 0 0 1px #FF2A85 !important;
  }

  .cl-formButtonPrimary {
    background-color: #FF2A85 !important;
    color: #FFFFFF !important;
    box-shadow: 0 0 15px rgba(255, 42, 133, 0.4) !important;
  }
  ```

---

## Design System & Visual Adherence
- **Void Black Background**: `#060709` across all auth screen canvases.
- **Obsidian Dark Cards**: `#0B0D13` for all Clerk auth cards, modals, and dropdown popovers.
- **Elevated Cyber Glass**: `#121622` for input containers and secondary button surfaces.
- **Neon Pink Accent**: `#FF2A85` for primary buttons, active links, and focus rings.
- **Radiant Pure Text**: `#F8FAFC` for high contrast, eliminating dark-on-dark unreadable text.
- **Muted Silver Text**: `#94A3B8` for clear, readable subtitles, labels, and hint text.
- **Mobile Ergonomics**: All interactive buttons and inputs meet $\ge 48\text{px}$ touch targets.

---

## Security & RBAC Requirements
- Preserves Clerk session integrity and multi-tenant organization scoping (`clerk_org_id`).
- All inputs sanitize user text cleanly without affecting Clerk's built-in CSRF and token flows.

---

## Acceptance Criteria
- [ ] No dark/black text appears against the dark obsidian background in any Clerk view.
- [ ] Headings ("Setup your organization", "Sign in", "Create your account") render in crisp, radiant `#F8FAFC` white.
- [ ] Subtitles and helper text ("Enter your organization details to continue", "Recommended size 1:1...", "Logo", "Name", "Signed in as...") render in clearly readable `#94A3B8` slate silver.
- [ ] Text inputs render with `#121622` dark elevated backgrounds and `#F8FAFC` white text, never white boxes.
- [ ] Primary buttons render in vibrant `#FF2A85` with glowing shadow and white bold text.
- [ ] `<OrganizationSwitcher />` and `<UserButton />` popovers display cleanly in dark obsidian theme.
- [ ] `npm run build` succeeds with 0 errors.

---

## Checks to Run
1. `npx tsc --noEmit` / `npm run build`
2. `npm run lint`

---

## Exact Manual Test Steps (Desktop & Mobile)

### Desktop Viewport (1440 x 900)
1. Navigate to `http://localhost:3000/sign-up`.
2. Inspect the `<SignUp />` form:
   - Verify header text is bright white `#F8FAFC`.
   - Verify label texts ("Email address", "Password", etc.) are clear `#94A3B8` slate.
   - Verify input fields have `#121622` dark backgrounds with white text.
3. Advance to the "Setup your organization" screen (matching the user's reference image):
   - Verify "Setup your organization" is radiant `#F8FAFC` white.
   - Verify "Enter your organization details to continue" is readable `#94A3B8`.
   - Verify "Logo" and "Name" labels are clearly visible.
   - Verify the organization Name input box is dark `#121622` with white monospace text, NOT a white box.
   - Verify "Upload" and "Remove" links and "Recommended size..." text are clearly legible.
   - Verify "Signed in as [email]" is crisp slate silver.
4. Navigate to `http://localhost:3000/sign-in`:
   - Verify all texts, inputs, and links render with high contrast.
5. In the authenticated topbar:
   - Click `<UserButton />` and inspect the popover card: verify dark background and light text.
   - Click `<OrganizationSwitcher />` and inspect the popover: verify dark background and light text.

### Mobile Viewport (390 x 844)
1. Open DevTools in mobile simulation mode ($390 \times 844$).
2. Visit `http://localhost:3000/sign-up` and `http://localhost:3000/sign-in`.
3. Verify cards fit comfortably within the viewport with touch targets $\ge 48\text{px}$.
4. Verify all text is completely legible under high ambient light conditions.
