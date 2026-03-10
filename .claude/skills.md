# Frontend Design Skill

This skill guides creation of distinctive, production-grade frontend interfaces with a refined, minimalist aesthetic. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Philosophy

### Typography
- **Primary Font:** Instrument Sans (`--font-sans`) — Used for all UI text, body, buttons
- **Display Font:** Inter (`--font-display`) — Thin weights (200, 300) for hero headlines and large display text
- **Accent Font:** Instrument Serif (`--font-serif`) — Available but rarely used
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Never use generic system fonts (Roboto, Arial, etc.)

### Color Palette (All-Dark Theme)

```
Surfaces:
  --bg-dark: #0c0d10        (Page background — all pages)
  --bg-dark-2: #14151a       (Cards, elevated containers)
  --bg-dark-3: #1a1b21       (Inputs, further elevated)
  --border-dark: #22232a     (Borders everywhere)

Text:
  --text-primary: #ffffff
  --text-secondary: rgba(255,255,255,0.6)
  --text-muted: rgba(255,255,255,0.4)
  --text-faint: rgba(255,255,255,0.3)

Subtle fills:
  rgba(255,255,255,0.03)    (hover states)
  rgba(255,255,255,0.06)    (badges, pills, number circles)
  rgba(255,255,255,0.08)    (bar tracks, ring tracks)

LLM accents:
  --chatgpt-green: #10a37f
  --claude-purple: #c084fc
  --gemini-blue: #4285f4

Status:
  --success: #16a34a
  --warning: #d97706
  --error: #dc2626

Status backgrounds (semi-transparent for dark theme):
  rgba(22,163,74,0.15)     (green bg)
  rgba(217,119,6,0.15)     (amber bg)
  rgba(220,38,38,0.15)     (red bg)
```

### Typography Scale
- Eyebrow: 0.72-0.78rem - uppercase, letter-spacing 0.08em, font-weight 600
- Body: 0.85-0.875rem - standard text
- Body Large: 1rem - hero descriptions
- Headings: clamp() responsive sizing
  - H1: clamp(2rem, 5vw, 3rem) on analyze pages; clamp(2.8rem, 4.5vw, 4rem) on landing
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
- **Hover states:** opacity 0.85 + translateY(-1px), 0.15s ease
- Always respect `prefers-reduced-motion`

### Component Guidelines

**Navigation:**
- Fixed nav at top, 60px height
- Dark background (rgba(12,13,16,0.88)) with white text
- Backdrop blur, centered nav links (rgba(255,255,255,0.5) → white on hover)
- White CTA button on right, border-radius 8px

**Buttons:**
- Primary: white bg (#ffffff), dark text (#0c0d10), border-radius 8px
- Outline: transparent with rgba(255,255,255,0.2) border, white text
- Disabled: rgba(255,255,255,0.2) background, muted text, cursor not-allowed
- Keep 999px radius ONLY for small badge/pill elements

**Cards:**
- Background: #14151a, border: 1px solid #22232a, border-radius 12px
- No box-shadow by default on dark theme

**Forms:**
- Input bg: #1a1b21
- Border: #22232a, focus: rgba(255,255,255,0.3)
- border-radius: 8px
- Text: #ffffff, placeholder: rgba(255,255,255,0.25)
- padding: 0.875rem 1.25rem

**Score Ring (analysis):**
- SVG donut chart, stroke #ffffff on rgba(255,255,255,0.08) track
- Animate with CSS `score-fill` keyframe

**Badges / Pills:**
- border-radius: 999px
- padding: 6px 14px
- Colored dot (8px circle) + label text
- Status colors use semi-transparent backgrounds on dark theme

## Layout Patterns

### Hero Section (landing)
```css
background: #0c0d10; min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
gap: 3rem; padding: 8rem 2.5rem 5rem; max-width: 1140px; margin: 0 auto;
```

### Full-page step (analyze)
```css
min-height: calc(100vh - 60px); display: flex; align-items: center;
justify-content: center; padding: 2rem;
background: #0c0d10;
```

### Content Sections
```css
max-width: 1140px; margin: 0 auto; padding: 6rem 2.5rem;
background: #0c0d10;
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

### Report layout pattern

**Partial report (free tier):**
1. 2-column: Recommendation probability hero ring + key metrics stack
2. Query evidence table (expandable rows with response excerpts)
3. 2-column: Competitor snapshot + Sentiment summary with phrases
4. Blurred: Claude + Gemini sections with unlock overlay (pill-style)
5. Sticky CTA bar at bottom

**Full report (comprehensive):**
1. Methodology section (total queries, platforms, query types badges)
2. Per-provider probability rings in header
3. Cross-platform comparison table (includes recommendation probability row, sources cited)
4. Cross-platform Source Influence Map
5. Tabbed deep-dive per provider:
   - RecommendationHero → QueryEvidence (chat UI) → QueryTypeBreakdown → SourceInfluenceMap → MetricCards → Topics → Competitors → Accuracy → Sentiment
6. Cross-LLM Insights (strengths, opportunities, gaps)
7. Actionable Recommendations (data-driven, priority-ranked)

### LLM provider colors
Always use these exact colors for LLM badges/indicators:
- ChatGPT: `#10a37f`
- Claude: `#c084fc`
- Gemini: `#4285f4`

## Never Use

- Generic system fonts (Roboto, Arial)
- Warm beige (#f0eeea) or white backgrounds anywhere
- Light theme colors (#fafafa, #ffffff for backgrounds, #dddbd7 borders)
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
- `src/components/ui/` — Base primitives (Button, Input, Card)
- `src/components/[feature]/` — Feature-specific components
- `src/lib/` — Utilities, DB client, types
- `src/lib/agents/` — LLM pipeline (clients, prompts, runner, parser, aggregator)

Always export from index files for cleaner imports.

## Landing Page Structure

All sections are DARK (#0c0d10 background):

1. **Nav** — fixed, blur backdrop, white text, "Get free audit" CTA
2. **Hero** — 2-column: text left + HeroReportMockup right (product-first)
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
