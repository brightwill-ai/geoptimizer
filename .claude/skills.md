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
```

### Typography Scale
- Eyebrow: 0.78rem (12.5px) - uppercase, tracked
- Body: 0.875rem (14px) - standard text
- Body Large: 1rem (16px) - hero descriptions
- Headings: clamp() responsive sizing
  - H1: clamp(2.8rem, 4.5vw, 4rem)
  - H2: clamp(2rem, 3.5vw, 2.8rem)
  - H3: clamp(2.2rem, 4vw, 3.5rem)

### Animation Guidelines

Use CSS animations with these principles:

- **Entry animations:** Fade + slide up from 20px (0.5s ease)
- **Floating elements:** Gentle 6px vertical movement (4s ease-in-out infinite)
- **Scroll reveals:** Fade + 24px slide up (0.6s ease) on intersection
- **Ticker animations:** Smooth horizontal scroll (22s linear infinite)
- **Hover states:** Quick opacity/transform (0.15s ease)
- Always respect `prefers-reduced-motion`

### Component Guidelines

**Navigation:**
- Fixed nav at top, 60px height
- Backdrop blur with semi-transparent background
- Centered nav links with absolute positioning
- Button-style CTA on right

**Buttons:**
- Primary: Black background, white text, rounded-full
- Outline: Transparent with border, subtle hover fill
- Hover: Opacity 0.85 + -1px translateY

**Cards:**
- Light backgrounds (#faf9f7)
- Soft borders (#dddbd7)
- rounded-2xl or rounded-3xl corners
- Subtle shadows on hover

**Forms:**
- White backgrounds
- Subtle borders (#dddbd7)
- 10px border radius
- Black border on focus

## Layout Patterns

### Hero Section
```css
min-height: 100vh
display: grid
grid-template-columns: 1fr 1fr
gap: 3rem
padding: 7rem 2.5rem 4rem
max-width: 1200px
margin: 0 auto
```

### Content Sections
```css
max-width: 1200px
margin: 0 auto
padding: 6rem 2.5rem
```

### Grid Spacing
- Features grid: gap 5rem
- Pricing grid: gap 1rem
- Steps row: 3-column with 0 gap, borders between

## Never Use

- Generic fonts (Inter, Roboto, Arial)
- High-contrast color palettes
- Bouncy/playful animations
- Cookie-cutter layouts
- Over-the-top effects that distract
- Bright accent colors (no blues, purples, greens unless specified)

## Code Patterns

### Inline Style Example
```tsx
<div
  style={{
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "6rem 2.5rem",
  }}
>
  {/* Content */}
</div>
```

### CSS Class Example
```css
.btn-pill {
  background: var(--black);
  color: var(--white);
  border: none;
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: opacity 0.15s, transform 0.15s;
}

.btn-pill:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}
```

### Animation Example
```tsx
<div className="animate-up" style={{ animationDelay: "0.2s" }}>
  <h1>Heading</h1>
</div>
```

## Responsive Design

Break point: 860px (not 768px)

At 860px and below:
- Hero becomes single column
- Grid layouts stack to single column
- Nav links hidden
- Reduced padding and margins

## File Structure

Components should follow this pattern:
- `src/app/` - Next.js App Router pages
- `src/components/ui/` - Base primitives (Button, Input, Card)
- `src/components/layout/` - Layout components (Navbar, Footer)
- `src/components/[feature]/` - Feature-specific components

Always export from index files for cleaner imports.

## Landing Page Structure

The landing page follows this exact structure:
1. Fixed navigation with backdrop blur and a primary CTA linking to `/signup`
2. Hero section (2-column grid with text + visual)
3. Logo strip with ticker animation
4. Features section (accordion + sticky card)
5. How it works (3-step grid)
6. Pricing (3-column cards) with buttons linking to `/signup`
7. CTA block (dark background) with button linking to `/signup`
8. Footer

All sections use exact spacing and sizing from the design system above.

## Signup MVP Context

- The app is now a minimal public signup MVP (no auth, no dashboard).
- All business interest submissions happen on `/signup`, which posts to `POST /api/signups`.
- Signups are stored in a single Prisma `Signup` model backed by SQLite (`prisma/dev.db`).
- When extending functionality, prefer adding new models and endpoints alongside this flow rather than re-introducing complex auth or dashboards unless explicitly required.
