# Visibly

Minimal MVP signup app for the Visibly GEO concept. Local businesses can submit interest via a public form and their details are stored in a lightweight SQLite database.

## Quick Start

```bash
npm install
cp .env.example .env.local  # Add your keys
npx prisma db push
npm run dev
```

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 with custom design system
- **Database:** SQLite (`prisma/dev.db`) via Prisma ORM
- **Auth:** None (public signup only)
- **Deployment:** AWS ECS Fargate

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/
│   │   ├── signups/        # Public signup endpoint
│   │   └── health/         # Health check
│   ├── signup/             # Public signup form page
│   ├── page.tsx            # Marketing landing page (inline CSS)
│   ├── globals.css         # Global styles & animations
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Base UI components
│   ├── layout/             # Navbar, Footer
│   └── landing/            # Landing page sections
├── lib/
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helper functions
├── actions/                # Server actions
└── prisma/
    └── schema.prisma       # Prisma data model (Signup only)
```

## Design System (Updated)

### Typography
- **Primary:** Instrument Sans - All UI elements, headings, body text
- **Accent:** Instrument Serif - Italic emphasis, special callouts
- Loaded via Google Fonts in layout.tsx

### Colors (Warm Neutral Palette)
```css
--bg: #f0eeea          /* Main background */
--black: #0c0c0b       /* Primary text, buttons */
--muted: #9a9793       /* Secondary text */
--border: #dddbd7      /* Borders */
--card-bg: #faf9f7     /* Card backgrounds */
```

### Spacing Scale
- Sections: 6rem (96px) vertical padding, 2.5rem (40px) horizontal
- Hero: 7rem top, 4rem bottom
- Grids: 3rem-5rem gaps depending on density

### Aesthetic
Refined minimalist with warm neutrals. Clean, spacious layouts with subtle animations. Focus on readability and hierarchy.

## Key Features

### Landing Page
- Server-side rendered, fully responsive
- Fixed navigation with backdrop blur
- Inline styles for exact CSS control
- CSS animations (up, float, ticker, reveal)
- Responsive breakpoint: 860px

### Signup MVP
- No authentication or protected routes
- Public `/signup` page for businesses to register interest
- Simple `POST /api/signups` API that validates and stores submissions in SQLite

## Key Commands

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run lint          # Run ESLint
npm run type-check    # TypeScript check
npx prisma studio     # Database GUI
npx prisma db push    # Push schema to database
npx prisma generate   # Generate Prisma client
```

## Data Model

Prisma schema (`prisma/schema.prisma`) defines a single model:

- **Signup**
  - `id` (String, cuid, primary key)
  - `name` (String)
  - `email` (String, unique)
  - `businessName` (String, optional)
  - `website` (String, optional)
  - `notes` (String, optional)
  - `createdAt` (DateTime, default `now()`)

## Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` — SQLite connection string, e.g. `file:./prisma/dev.db`

## API Endpoints

- `POST /api/signups` — Create a new signup record
- `GET /api/health` — Health check for ECS / uptime monitoring

## Landing Page Implementation

The landing page (`src/app/page.tsx`) uses a component-based architecture with inline styles for precise CSS control:

**Components:**
- `Nav` - Fixed navigation with backdrop blur and CTA to `/signup`
- `Hero` - 2-column grid with text + GlobeCard visual
- `GlobeCard` - Gradient card with floating AI labels
- `LogosStrip` - Animated ticker with AI platform logos
- `Features` - Accordion with sticky mockup card
- `HowItWorks` - 3-step grid with large numbers
- `Pricing` - 3-column pricing cards with buttons linking to `/signup`
- `CTA` - Dark background call-to-action linking to `/signup`
- `Footer` - Simple footer with logo and links

**Key Patterns:**
- All sections use exact CSS values (no Tailwind approximations)
- Animations defined in globals.css, triggered via classNames
- Intersection Observer for scroll-triggered reveals
- Responsive at 860px with mobile-first approach

## Deployment

The app is configured for AWS ECS with standalone Next.js output. See `Dockerfile` for container build.

## Recent Updates

**Design Redesign (March 2026):**
- Complete UI overhaul from Navy/Gold/Ivory to Warm Neutrals
- Typography change: Cormorant Garamond → Instrument Sans/Serif
- Landing page rewritten with exact HTML template matching
- All CSS values use precise rem/px units from design spec
- Responsive breakpoint changed to 860px
- Dashboard and auth pages updated to match new design system
