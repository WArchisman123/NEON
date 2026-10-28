# Implementation Prompt: Fixed Control-Room Sidebar & Independent Main Content Scrolling

## Goal
Fix layout scrolling behavior so the **Desktop Sidebar stays permanently fixed in place** while only the main workspace area (`<main>`) scrolls independently. When the user scrolls through the telemetry dashboards, tables, and heatmaps, the sidebar and topbar remain firmly pinned at all times.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: Application layout composition, viewport height constraints, independent scroll containers, control-room UI ergonomics.

---

## Existing Code Inspected
- [`components/layout/neon-app-shell.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/layout/neon-app-shell.tsx): Currently uses `min-h-screen flex flex-col` on outer container and `flex-1` on `<main>`, which makes the entire window scroll as a single document, carrying the sidebar with it.
- [`components/layout/desktop-sidebar.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/layout/desktop-sidebar.tsx): `aside` element has `relative` and no pinned height or sticky positioning, causing it to scroll out of view.
- [`components/layout/topbar.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/layout/topbar.tsx): Has `sticky top-0 z-30 h-14 sm:h-16 shrink-0`.

---

## Implementation Details

### 1. App Shell Viewport Container (`components/layout/neon-app-shell.tsx`)
Change the layout from a full-page scrolling document to an application layout with pinned navigation:
- Outer wrapper: `h-screen overflow-hidden flex flex-col bg-theme-canvas`
- `Topbar`: `shrink-0` pinned at top.
- Inner workspace wrapper: `flex-1 flex min-h-0 min-w-0 overflow-hidden`
- `DesktopSidebar`: `shrink-0 h-full overflow-y-auto no-scrollbar` — permanently docked on the left, never scrolls away.
- `<main>` content container: `flex-1 h-full overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-[1600px] mx-auto w-full pb-24 lg:pb-8` — scrolls independently with smooth momentum scrolling.
- `MobileBottomBar`: `shrink-0 lg:hidden` pinned at bottom.

### 2. Desktop Sidebar Scrolling & Height (`components/layout/desktop-sidebar.tsx`)
- Ensure `aside` is `h-full flex flex-col justify-between overflow-y-auto no-scrollbar`.
- Add internal scroll handling if user's display has limited vertical height, so all 10 subsystems and bottom platform links remain effortlessly reachable.

---

## Acceptance Criteria
1. When scrolling down the page, the topbar and the left sidebar remain pinned in place; they never scroll off screen.
2. Only the active subsystem content in `<main>` scrolls vertically.
3. If vertical height is constrained, the sidebar can scroll its own list independently without affecting the main page.
4. Mobile view continues to function with sticky topbar, scrolling main content, and sticky bottom navigation dock.
5. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with **0 errors**.

---

## Checks to Run
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Exact Manual Test Steps
1. Navigate to `http://localhost:3000/`.
2. Scroll down through the Page 1 Dashboard (or Metering & SCADA tab with tall tables and charts).
3. Confirm the **left sidebar and topbar remain permanently fixed** in place.
4. Confirm only the dashboard / main workspace scrolls.
5. Click between subsystems while scrolled down to verify instant tab switching.
