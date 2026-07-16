
# KejaHub v4 — Simplicity Overhaul + CEO-mode HQ

This is a large upgrade over the existing KejaHub. It touches homepage, navigation, listing wizard, dashboards, HQ, notifications, empty states, and theming — while preserving every existing page, route, and workflow. Nothing is deleted; features are re-skinned, re-labeled, and re-organized.

Because this is broad, please confirm the plan (or trim it) before I build. I'll break it into phased commits so nothing regresses.

---

## Important scope note (Firebase)

The user message says "Do NOT remove Firebase integration." KejaHub currently has **no Firebase integration** — the app runs on TanStack Start with **mock data** (`src/lib/mock-data.ts`). I will:
- Preserve the current mock-data architecture (no removal, no rebuild).
- **Not** introduce Firebase in this pass (a real backend swap is a separate, much larger project — auth, Firestore schema, security rules, migration).
- Keep the door open: all new UI reads from the same data layer, so a later Firebase/Lovable Cloud swap is a drop-in.

If you actually want a real backend now, say the word and I'll propose Lovable Cloud (built-in Postgres + Auth) as a follow-up plan — that's the supported path here.

---

## Phase 1 — Simplicity language + icons (low risk, high impact)

- Rename user-facing labels across Navbar, Footer, dashboards, and CTAs:
  - "Post Listing" → **🏠 List My Property**
  - "Browse" / "Search" → **🔍 Find Me a House**
  - "Saved" → **❤️ Saved Homes**
  - "Concierge" → **💬 House Help**
  - "Dashboard Analytics" → **Property Performance**
  - "Verification Status" → **Trusted Seller**
  - "Notifications" → **🔔 Alerts**
- Route paths stay the same (no broken links, no SEO regressions).
- Add leading emoji/icons to primary nav and dashboard cards.

## Phase 2 — Homepage "Golden Rule" hero

Replace the current hero's search-first layout with **two giant action cards** above the fold:

```text
┌───────────────────────┬───────────────────────┐
│  🏠  List My Property │  🔍 Find Me a House   │
│  Free · 2 minutes     │  Rentals · Airbnbs …  │
└───────────────────────┴───────────────────────┘
```

- Existing SearchBar, Trusted Properties, Hidden Gems sections stay below — nothing removed.
- Add subtle parallax on the hero background and animated house-window glow in dark mode.

## Phase 3 — Visual selection cards (Show, don't explain)

Rework the `post-listing` wizard's type step and amenity step to use **image/emoji tile cards** instead of dropdowns:

- Property type tiles: 🛏 Bedsitter · 🚪 Studio · 🏠 1BR · 🏠 2BR · 🏠 3BR · 🏡 House · 🏨 Airbnb · 🏢 Commercial
- Amenity tiles grouped visually (Essentials / Lifestyle / Family) — already have data groups, just visualize them.
- Same visual-card pattern reused on signup role picker and verification plan picker.

## Phase 4 — Guided wizard progress

The post-listing flow already has steps; add a **friendlier shell**:

- Big step header: "📍 Where is your property?" / "🏠 What type?" / "💰 Rent?" / "📸 Photos" / "✨ Features" / "🚀 Publish"
- "Step 3 of 6" indicator + progress bar
- Success screen on publish: 🎉 confetti-lite toast + "Buyers can now see your property"

## Phase 5 — Floating Help button

New `HelpFab.tsx` — bottom-right on every page (except HQ, per your rule "HQ = no floating buttons"). Sheet with:

- 🏠 Help Me List My Property
- 📸 Help Me Upload Photos
- ✍️ Help Me Write My Listing
- 🔍 Help Me Find a House
- ✔️ Help Me Verify My Account
- 💬 Contact Support

Each option opens a prefilled request stored in `helpRequests` (mock store) — surfaced in HQ's new Listing Assistance Center.

## Phase 6 — Smart empty states

Standardize empty states across Saved, Messages, My Properties, Alerts using a shared `FriendlyEmpty` component with icon + one big CTA button.

## Phase 7 — CEO-mode HQ redesign

Rebuild `dashboard.admin` (KejaHub HQ) as a business command center — remove the "magical" gamified hero (achievements, floating orbs, greetings) and replace with structured executive sections. No floating buttons on HQ.

Sections, top to bottom:

1. **Executive Overview** — Total Users, Buyers, Landlords, Agents, Developers, Properties, Active Listings, Airbnb Listings. Clean stat grid, glassmorphism cards.
2. **Today's Activity** — New Users / Listings / Messages / Verification Requests / Help Requests today.
3. **Priority Center** — Pending Verifications, Listing Help Requests, Reported Listings/Users, Awaiting Approval. Urgency badges (red/amber/green).
4. **Listing Assistance Center** (new `/hq/listing-help`) — table of seller help requests with Review / Contact / Publish / Reject actions.
5. **Verification Center** (upgrade existing `/hq/verifications`) — tier selector, doc list, approve/reject/request-more.
6. **User Management** — tabs for Buyers / Landlords / Agents / Developers with search, filter, suspend/activate/verify (upgrade `/hq/users`).
7. **Support Center** — unified queue of help + reports (`/hq/support`).
8. **Business Intelligence** — Most Viewed Property, Most Active Agent, Most Popular Town/County/Type, Most Searched Price Range.
9. **System Health** — Firebase/Auth/DB/Messaging/Notifications status pills (currently all "mock-connected"; wired to a status source later).

Kept: existing `/hq/*` sub-routes remain and are linked from the new structure.

## Phase 8 — Role-scoped notifications

- Add `role` to each notification in mock data.
- `/notifications` filters by current user role (buyer/landlord/agent/HQ).
- NotificationBell badge counts only role-relevant unread items.

## Phase 9 — Day/Night dashboard theming

- Extend `styles.css` tokens with a `--surface-glass` and `--window-glow` for dark mode.
- Add subtle animated SVG city silhouette + glowing windows in dashboard/HQ hero backgrounds (dark mode only, respects `prefers-reduced-motion`).
- Light mode gets a soft morning gradient + faint neighborhood illustration.
- Smooth 300ms transition when toggling theme (already available via existing theme toggle).

## Phase 10 — Property Quality System

New `ListingQuality.tsx` badge on seller dashboard + property cards (owner view only):
- Excellent / Good / Needs Improvement — computed from existing `appealScore()` + `completeness()` in `premium-copy.ts`.
- Shows top 3 fix suggestions (already produced by `coachTips()`).

---

## Technical breakdown

**New files**
- `src/components/site/HelpFab.tsx`
- `src/components/site/FriendlyEmpty.tsx`
- `src/components/site/VisualPicker.tsx` (reusable tile picker)
- `src/components/site/GoldenHero.tsx` (homepage two-card hero)
- `src/components/site/NightSkyline.tsx` (dark-mode animated backdrop)
- `src/components/site/ListingQualityBadge.tsx`
- `src/components/site/hq/ExecutiveOverview.tsx`
- `src/components/site/hq/TodayActivity.tsx`
- `src/components/site/hq/PriorityCenter.tsx`
- `src/components/site/hq/BusinessIntelligence.tsx`
- `src/components/site/hq/SystemHealth.tsx`
- `src/routes/hq.listing-help.tsx`
- `src/routes/hq.support.tsx`
- `src/lib/help-requests.ts` (mock store)
- `src/lib/hq-metrics.ts` (derives all HQ stats from mock-data)

**Edited files**
- `src/routes/index.tsx` — new GoldenHero, keep existing sections
- `src/routes/post-listing.tsx` — VisualPicker for type/amenities, friendly step shell, success screen
- `src/routes/dashboard.admin.tsx` — full CEO redesign
- `src/routes/dashboard.seller.tsx` — simpler big buttons + quality badge + Help section
- `src/routes/dashboard.buyer.tsx` — simpler labels + empty-state polish
- `src/routes/notifications.tsx` — role filter
- `src/components/site/Navbar.tsx` / `Footer.tsx` — friendlier labels + icons
- `src/components/site/NotificationBell.tsx` — role-aware count
- `src/routes/__root.tsx` — mount HelpFab (skip on `/dashboard/admin` and `/hq/*`)
- `src/lib/mock-data.ts` — add `role` to notifications, add `helpRequests` seed
- `src/styles.css` — new tokens, glass utilities, city-silhouette keyframes

**Not touched** — auth flow, routing config, existing HQ sub-routes' URLs, property schema, existing search/filter logic, compare bar, video walkthrough system.

---

## What I need from you

1. Confirm the plan (or trim phases you don't want now).
2. Confirm the **Firebase note** at the top — should I stay on mock data, or should we schedule a real backend via Lovable Cloud as a follow-up?

Reply "go" to build Phase 1–10 in order, or list the phases you want.
