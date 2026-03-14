# Frontend Design Skill

This skill guides creation of distinctive, production-grade frontend interfaces with a refined, minimalist aesthetic. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Philosophy

### Typography
- **Primary Font:** Instrument Sans (`--font-sans`) — Used for all UI text, body, buttons
- **Display Font:** Inter (`--font-display`) — Medium weight (400) for hero headlines and large display text
- **Accent Font:** Instrument Serif (`--font-serif`) — Available but rarely used
- Font weights: 400 (regular), 450 (subtitle), 500 (medium), 600 (semibold), 700 (bold)
- Never use generic system fonts (Roboto, Arial, etc.)

### Color Palette (Warm Beige Theme — Anthropic-inspired)

```
Surfaces:
  --bg-page: #f3efe8         (Page background — warm beige, all pages)
  --bg-card: #ffffff          (Cards, white)
  --bg-elevated: #f7f7f8      (Elevated containers, inputs)
  --bg-hover: #f0f0f0         (Hover states, tracks)

Borders:
  --border-default: #e5e5e5
  --border-subtle: #ececec

Text:
  --text-primary: #171717
  --text-secondary: #6e6e80
  --text-muted: #8e8ea0

LLM accents:
  --accent-chatgpt: #10a37f
  --accent-claude: #c084fc
  --accent-gemini: #4285f4

Status:
  --status-green: #16a34a
  --status-amber: #d97706
  --status-red: #dc2626

Status tinted backgrounds:
  --tint-green: #f0fdf4
  --tint-amber: #fffbeb
  --tint-red: #fef2f2

Mesh gradient:
  Base: #fdf8f5 (warm blush, orb container background)
  Orbs: #f0a070 (amber-orange), #f490b0 (rose-pink), #f5c080 (warm gold),
        #f0a0b0 (coral-rose), #f5d0a0 (peach)
```

### Typography Scale
- Eyebrow: 0.72-0.78rem - uppercase, letter-spacing 0.08em, font-weight 600
- Body: 0.85-0.875rem - standard text
- Body Large: 1rem - hero descriptions (fontWeight 450)
- Headings: clamp() responsive sizing
  - H1: clamp(2rem, 5vw, 3rem) on analyze pages; clamp(2.8rem, 4.5vw, 4rem) on landing (fontWeight 400)
  - H2: clamp(2rem, 3.5vw, 2.8rem)

### Animation Guidelines

- **Framer Motion** for page/step transitions (analyze flow):
  - `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}` → `exit={{ opacity: 0 }}`
  - Staggered entry: incrementing `delay` per element (0.1, 0.2, 0.3...)
  - AnimatePresence with `mode="wait"` for step transitions
- **CSS keyframes** for landing page (globals.css):
  - Entry: fade + slide up from 20px (0.5s ease)
  - Reveal animations: `.reveal`, `.reveal-scale`, `.reveal-left`, `.reveal-right`, `.reveal-blur`
  - IntersectionObserver via `useReveal()` hook triggers `.visible` class
  - Mesh orb drifts: `drift1`–`drift5` (14s–20s, ease-in-out infinite alternate)
- **Hover states:** opacity 0.85 + translateY(-1px), 0.15s ease
- Always respect `prefers-reduced-motion`

### Component Guidelines

**Navigation:**
- Fixed nav at top, 60px height
- Transparent background, no backdrop filter (mesh shows through)
- Dark text (#171717), nav links (#6e6e80 → #171717 on hover)
- Dark CTA button (#171717 bg, white text), border-radius 8px

**Buttons:**
- Primary: dark bg (#171717), white text, border-radius 8px
- Outline: transparent with #e5e5e5 border, dark text, hover → #f7f7f8 bg
- Disabled: muted background, muted text, cursor not-allowed
- Keep 999px radius ONLY for small badge/pill elements

**Cards:**
- Background: #ffffff, border: 1px solid #e5e5e5, border-radius 12px
- Box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)
- Hover: translateY(-2px) + 0 8px 24px rgba(0,0,0,0.06)

**Forms:**
- Input bg: #f7f7f8
- Border: #e5e5e5, focus: #171717
- border-radius: 8px
- Text: #171717, placeholder: #8e8ea0
- padding: 0.875rem 1.25rem

**Score Ring (analysis):**
- SVG donut chart, stroke #171717 on #f0f0f0 track
- Animates once on mount via rAF-deferred state update, stable on re-renders

**Badges / Pills:**
- border-radius: 999px
- padding: 6px 14px
- Colored dot (8px circle) + label text
- Status colors use tinted backgrounds (#f0fdf4, #fffbeb, #fef2f2)

## Layout Patterns

### Hero Section (landing)
```css
background: #fdf8f5; min-height: 90vh; display: grid; grid-template-columns: 1fr 1fr;
gap: 80px; padding: 10rem 60px 5rem; max-width: 1280px; margin: 0 auto;
```
Overlaid with MeshGradient (hero mode) + scroll-fade to #f3efe8.

### Full-page step (analyze)
```css
min-height: calc(100vh - 60px); display: flex; align-items: center;
justify-content: center; padding: 2rem;
background: #f3efe8;
```

### Content Sections
```css
max-width: 1280px; margin: 0 auto; padding: 6rem 2.5rem;
background: #f3efe8;
```

### Responsive: 860px breakpoint
- Hero → single column
- Grid layouts → stack
- Nav links hidden
- Reduced padding

## Analyze Feature Patterns

### Step state machine (`analyze/page.tsx`)
Steps: `search` → `loading` → `partial` → `email-gate` → `full`

Each step is a separate component. Orchestrator manages:
- Current step state
- analysisId, analysisData, jobStatuses
- Polling interval (2s) during loading

### Dashboard layout pattern (v2)

Both reports use `DashboardShell` → sticky KPI row + animated tab nav + cross-fade content.

**Dashboard wrapper components:**
- `DashboardShell`: full-width (maxWidth 1400px), sticky section (KPI + nav at top: 60px), cross-fade tab transitions (AnimatePresence + blur)
- `DashboardCard`: white card (#ffffff, 1px #e5e5e5 border, hover lift), lock overlay support
- `DashboardNav`: animated sliding pill tabs (motion.div layoutId spring), pill-style active state
- `KPIRow`: auto-fit grid (minmax 180px) stat cards with accent-colored top borders + mini ScoreRings
- `InsightCards`: 3-column severity grid (strengths/opportunities/gaps) with colored icons
- `ProviderComparisonVisual`: 3-column provider cards with rings + stat rows

**Partial report (free tier):**
- KPI row: Probability, Mentions, Primary, Avg Rank
- 2 tabs: Overview + Evidence
- Overview: hero with competitor callout, "What your customers see" scrollable chat card, snapshot blockers/wins, query patterns, competitive context, blurred full audit preview with unlock overlay
- Evidence: QueryEvidence + source/sentiment readout
- Chat-style scroll containers: `maxHeight: 360`, `overflowY: auto`, `overscrollBehavior: contain`, query + response scroll together
- `formatResponseText()` renders raw LLM markdown as structured React (numbered lists with badges, bullets, bold)
- Sticky CTA bar at bottom with competitor-aware messaging

**Full report (comprehensive):**
- KPI row: Avg Probability + per-provider probabilities with mini rings
- 5 tabs: Overview, AI Models, Sources, Evidence, Action Plan
- Overview: 2-col grid (ProviderComparisonVisual + InsightCards + Methodology + LLMComparisonTable)
- AI Models (was "Providers"): provider sub-tabs → 2-col asymmetric grid (1.2fr + 0.8fr)
- Sources: cross-platform source influence + accuracy issues + per-provider source breakdowns
- Evidence: provider sub-tabs → QueryEvidence
- Action Plan: ActionPlan or ActionItems
- All user-facing "provider" labels renamed to "AI model" / "AI models"

**Responsive:** 1024px (2-col → 1-col), 860px (full stack, existing analyze-grid)

**CSS classes:** `.dashboard-grid` (1fr 1fr), `.dashboard-grid-deep` (1.2fr 0.8fr), `.dashboard-grid-insights` (1fr 1fr 1fr), `.dash-card` (hover transitions)

### LLM provider colors
Always use these exact colors for LLM badges/indicators:
- ChatGPT: `#10a37f`
- Claude: `#c084fc`
- Gemini: `#4285f4`

## Never Use

- Generic system fonts (Roboto, Arial)
- Pure white (#ffffff) as page background — use #f3efe8 warm beige
- Dark theme colors (#0c0d10, #14151a) — theme is warm beige light
- Bouncy/playful animations
- Bright accent colors outside the defined palette
- Tailwind class approximations for exact hex values — use inline styles
- Large border-radius (20px+) on cards — use 12px max

## Code Patterns

### Inline styles (preferred for feature components)
```tsx
<div style={{ maxWidth: 560, width: "100%", textAlign: "center",
  display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
```

### Framer Motion step transition
```tsx
<AnimatePresence mode="wait">
  {step === "search" && <SearchStep key="search" onSubmit={handleSubmit} />}
  {step === "loading" && <LoadingStep key="loading" jobStatuses={jobStatuses} />}
</AnimatePresence>
```

## File Organization

- `src/app/` — Next.js App Router pages
- `src/components/ui/` — Base primitives (Button, Input, Card, MeshGradient)
- `src/components/[feature]/` — Feature-specific components
- `src/lib/` — Utilities, DB client, types
- `src/lib/agents/` — LLM pipeline (clients, prompts, runner, parser, aggregator)

Always export from index files for cleaner imports.

## Landing Page Structure

Warm beige (#f3efe8) background with blush mesh gradient hero:

1. **Nav** — fixed, transparent, dark text, "Get free audit" CTA
2. **Hero** — 2-column: text left (fontWeight 400 h1) + HeroReportMockup right, MeshGradient behind
3. **PlatformBar** — static row: "Analyzes responses from" + ChatGPT/Claude/Gemini dots
4. **Stats** — 3 animated counters with vertical dividers (100M+, 40+, 3)
5. **HowWeMeasure** — 2-column: methodology text left, example query table + probability ring right
6. **ReportShowcase** — wider mockup (960px), 2-column: evidence left, competitors+sentiment right
7. **Features** — 4 alternating cards, data visualizations
8. **HowItWorks** — 3-step grid with large numbers
9. **Pricing** — 3-column, featured card has brighter border
10. **CTA** — centered headline + CTA
11. **Footer** — brand + links

### Animation System
- `reveal` — fade up 24px (0.6s ease)
- `reveal-scale` — scale 0.92→1 (0.8s cubic-bezier)
- `reveal-left` / `reveal-right` — slide 40px from side (0.8s cubic-bezier)
- `reveal-blur` — blur 8px→0 (0.8s ease)
- `stagger-1` through `stagger-5` — transition delays 0.1s–0.5s
- All triggered by IntersectionObserver via shared `useReveal()` hook
- `AnimatedCounter` — requestAnimationFrame counter with ease-out cubic

## Documentation Rule

When implementing a new feature:
1. Update `CLAUDE.md` with the feature's architecture and data flow
2. Update this `skills.md` if new UI patterns or components are introduced
3. Keep `mock-data.ts` as source of truth for shared types
