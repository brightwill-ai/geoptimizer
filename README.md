# Visibly
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Minimal MVP for collecting signups from local businesses interested in Generative Engine Optimization (GEO).

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (SQLite)
cp .env.example .env.local

# Push database schema (creates prisma/dev.db)
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 with custom design system + inline CSS for the landing page
- **Database:** SQLite file (`prisma/dev.db`) via Prisma
- **Auth:** None (public signup only)
- **Deployment:** AWS ECS Fargate (Dockerfile included)

## Design System

### Typography
- **Primary:** Instrument Sans (sans-serif)
- **Accent:** Instrument Serif (serif, italic)
- Weights: 400, 500, 600, 700

### Colors
```css
Background: #f0eeea (warm beige)
Text:       #0c0c0b (near-black)
Muted:      #9a9793 (gray)
Border:     #dddbd7 (light gray)
Cards:      #faf9f7 (off-white)
```

### Aesthetic
Refined minimalist with warm neutrals. Clean, spacious layouts. Subtle animations.

## Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL="file:./prisma/dev.db"
```

## Project Structure

```
src/
├── app/                 # Pages and API routes
│   ├── api/
│   │   ├── signups/     # Public signup endpoint
│   │   └── health/      # Health check
│   ├── signup/          # Public signup form page
│   ├── globals.css      # Global styles & animations
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Marketing landing page
├── components/
│   ├── ui/              # Base UI components
│   ├── layout/          # Navbar, footer
│   └── landing/         # Landing sections (hero, CTA, etc.)
├── lib/                 # Utilities and configs
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Helper functions
└── actions/             # (Reserved for server actions)
```

## Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run lint          # Run linter
npm run type-check    # TypeScript check
npx prisma studio     # Database GUI
npx prisma db push    # Update database schema
npx prisma generate   # Regenerate Prisma client
```

## Features

- ✅ Marketing landing page with GEO messaging
- ✅ Public signup page (`/signup`)
- ✅ Simple POST API to store signups in SQLite
- ✅ Health check endpoint for infrastructure

## Key Pages

- **Landing Page (`/`)**
  - Hero with globe visual and AI labels
  - Features accordion
  - How it works (3 steps)
  - Pricing (3 tiers)
  - CTA linking to `/signup`

- **Signup Page (`/signup`)**
  - Simple form with:
    - Name
    - Email
    - Business name (optional)
    - Website (optional)
    - Notes (optional)
  - Submits via `POST /api/signups` and shows a thank-you state on success

## Data Model

Prisma schema is defined in `prisma/schema.prisma`:

- **Signup**
  - `id` (string, cuid)
  - `name` (string)
  - `email` (unique string)
  - `businessName` (optional string)
  - `website` (optional string)
  - `notes` (optional string)
  - `createdAt` (DateTime)

## API Routes

- `POST /api/signups` — Validate and store signup records
- `GET /api/health` — Health check for ECS / uptime checks

## Deployment

Configured for AWS ECS Fargate with standalone Next.js output.

```bash
# Build Docker image
docker build -t visibly .

# Run locally
docker run -p 3000:3000 visibly
```

## Recent Updates

**March 2026 - Design Redesign:**
- Complete UI refresh with warm neutral color palette
- New typography: Instrument Sans + Instrument Serif
- Landing page rewritten with exact HTML template
- Refined minimalist aesthetic
- All components updated to match new design system

## License

Private - All rights reserved.
