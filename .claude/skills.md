# Frontend Design Skill

This skill guides creation of distinctive, production-grade frontend interfaces with a refined, minimalist aesthetic. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Philosophy

### Typography
- **Display Font:** Instrument Sans - Used for headlines, hero text, all primary UI
- **Accent Font:** Instrument Serif - Used for italic emphasis, special callouts
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Never use generic fonts like Inter, Roboto, Arial, or system fonts

### Color Palette

```
Warm Neutrals:
  --bg: #f0eeea           (Main background - warm beige)
  --bg2: #e8e5e0          (Secondary background)
  --black: #0c0c0b        (Primary text, dark elements)
  --mid: #3a3936          (Medium contrast text)
  --muted: #9a9793        (Muted text, labels)
  --border: #dddbd7       (Borders, dividers)
  --white: #ffffff        (Pure white for cards, inputs)
  --card-bg: #faf9f7      (Card backgrounds)

Accent (analysis pages only):
  --lavender-bg: linear-gradient(180deg, #f0eeea 0%, #e8e4f0 50%, #ddd6ee 100%)
  --chatgpt-green: #10a37f
  --claude-purple: #c084fc
  --gemini-blue: #4285f4
  --success: #16a34a
  --warning: #f59e0b
  --error: #ef4444
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
  - Floating: gentle 6px vertical (4s ease-in-out infinite)
  - Ticker: horizontal scroll (22s linear infinite)
- **Hover states:** opacity 0.85 + translateY(-1px), 0.15s ease
- Always respect `prefers-reduced-motion`

### Component Guidelines

**Navigation:**
- Fixed nav at top, 60px height
- Backdrop blur with semi-transparent background
- Centered nav links with absolute positioning
- Button-style CTA on right

**Buttons:**
- Primary: #0c0c0b background, white text, border-radius 12px
- Outline: Transparent with border, subtle hover fill
- Disabled: #9a9793 background, opacity 0.6, cursor not-allowed

**Cards:**
- Light backgrounds (#faf9f7)
- Soft borders (#dddbd7)
- rounded-2xl or rounded-3xl corners
- Subtle shadows on hover

**Forms:**
- White backgrounds
- Subtle borders (#dddbd7)
- border-radius: 12px
- Black border on focus (transition 0.15s)
- padding: 0.875rem 1.25rem

**Score Ring (analysis):**
- SVG donut chart, stroke #0c0c0b on #dddbd7 track
- Animate with CSS `score-fill-global` keyframe

**Badges / Pills:**
- border-radius: 999px
- padding: 6px 14px
- Colored dot (8px circle) + label text
- Status states: active (scale 1.05, shadow), done (border + checkmark), pending (opacity 0.3)

## Layout Patterns

### Hero Section (landing)
```css
min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
gap: 3rem; padding: 7rem 2.5rem 4rem; max-width: 1200px; margin: 0 auto;
```

### Full-page step (analyze)
```css
min-height: calc(100vh - 60px); display: flex; align-items: center;
justify-content: center; padding: 2rem;
background: linear-gradient(180deg, #f0eeea 0%, #e8e4f0 50%, #ddd6ee 100%);
```

### Content Sections
```css
max-width: 1200px; margin: 0 auto; padding: 6rem 2.5rem;
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
- Score ring at top (large, centered)
- Metric cards in 2-3 column grid
- Sections: Citations, Sentiment, Competitors, Topics
- Each section: heading + visualization component
- Blurred overlay for locked content: `filter: blur(8px)`, absolute positioned lock icon

### LLM provider colors
Always use these exact colors for LLM badges/indicators:
- ChatGPT: `#10a37f`
- Claude: `#c084fc`
- Gemini: `#4285f4`

## Never Use

- Generic fonts (Inter, Roboto, Arial)
- Dark theme / dark backgrounds (exception: landing CTA block)
- Bouncy/playful animations
- Bright accent colors outside the defined palette
- Tailwind class approximations for exact hex values — use inline styles

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

1. Fixed navigation with backdrop blur + CTA → `/analyze`
2. Hero section (2-column grid with text + visual)
3. Logo strip with ticker animation
4. Features section (accordion + sticky card)
5. How it works (3-step grid)
6. Pricing (3-column cards) → `/signup`
7. CTA block (dark background) → `/signup`
8. Footer

## Documentation Rule

When implementing a new feature:
1. Update `CLAUDE.md` with the feature's architecture and data flow
2. Update this `skills.md` if new UI patterns or components are introduced
3. Keep `mock-data.ts` as source of truth for shared types
