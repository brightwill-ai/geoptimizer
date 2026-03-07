# BrightWill

Minimal MVP signup app for the BrightWill GEO concept. Local businesses can submit interest via a public form and their details are stored in a lightweight SQLite database.

## Quick Start

```bash
npm install
cp .env.example .env.local
npx prisma db push
npm run dev
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + inline styles for landing page
- **Database:** SQLite (`prisma/dev.db`) via Prisma ORM
- **Auth:** None (public signup only)
- **Deployment:** VPC server (Alibaba Cloud) via GitHub Actions + PM2

## Project Structure

```
src/
├── app/
│   ├── api/signups/       # Public signup endpoint
│   ├── signup/            # Public signup form page
│   ├── page.tsx           # Marketing landing page (inline CSS)
│   ├── globals.css        # Global styles & animations
│   └── layout.tsx         # Root layout
├── components/ui/         # Button, Input, Textarea, Card
└── lib/
    ├── prisma.ts          # Prisma client
    └── utils.ts           # Helper functions
```

## Design System

### Typography
- **Primary:** Instrument Sans - All UI elements, headings, body text
- **Accent:** Instrument Serif - Italic emphasis, special callouts

### Colors (Warm Neutral Palette)
```css
--bg: #f0eeea          /* Main background */
--black: #0c0c0b       /* Primary text, buttons */
--muted: #9a9793       /* Secondary text */
--border: #dddbd7      /* Borders */
--card-bg: #faf9f7     /* Card backgrounds */
```

### Key Patterns
- All sections use exact CSS values via inline styles
- Animations defined in globals.css, triggered via classNames
- Responsive breakpoint: 860px

## Data Model

Single Prisma model — `Signup`: id, name, email (unique), businessName?, website?, notes?, createdAt

## Environment Variables

`DATABASE_URL` — SQLite path, e.g. `file:./dev.db` (relative to schema.prisma)

## API Endpoints

- `POST /api/signups` — Create a new signup record

## Deployment

**VPC Server (primary):** Push to `main` triggers GitHub Actions → lint, type-check, build → SSH deploy to `47.251.113.72` → PM2 restart.

**Docker (optional):**
```bash
docker build -t brightwill .
docker run -p 80:3000 brightwill
```

## Naming

- **Frontend/brand:** BrightWill
- **Repo:** geoptimizer
