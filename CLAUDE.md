# BrightWill

Minimal MVP signup app for local businesses interested in Generative Engine Optimization (GEO). Public form collects signups into a SQLite database.

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
- **Deployment:** Docker on Alibaba Cloud VPC, GitHub Actions CI/CD

## Project Structure

```
src/
├── app/
│   ├── api/signups/route.ts   # POST /api/signups (Zod validation)
│   ├── signup/page.tsx        # Public signup form
│   ├── page.tsx               # Marketing landing page (inline CSS)
│   ├── globals.css            # Global styles & CSS animations
│   └── layout.tsx             # Root layout + Google Fonts
├── components/ui/             # Reusable UI (inline styles, warm neutrals)
│   ├── button.tsx             # Variants: primary, secondary, outline
│   ├── input.tsx              # With focus states, error handling
│   ├── textarea.tsx           # Multi-line input
│   ├── card.tsx               # Variants: default, elevated, interactive
│   └── index.ts               # Barrel exports
└── lib/
    ├── prisma.ts              # Prisma client singleton
    └── utils.ts               # cn(), formatDate(), slugify()
```

## Design System

### Typography
- **Primary:** Instrument Sans (400, 500, 600, 700) — all UI
- **Accent:** Instrument Serif (italic) — special callouts
- Loaded via Google Fonts in layout.tsx

### Colors (Warm Neutral Palette)
```
Background: #f0eeea    Text: #0c0c0b    Muted: #9a9793
Border: #dddbd7        Cards: #faf9f7
```

### Styling Approach
- Landing page + signup page: inline styles with exact hex values
- UI components: inline styles (no Tailwind class approximations)
- Animations: CSS keyframes in globals.css (up, float, ticker, reveal)
- Responsive breakpoint: 860px

## Data Model

```prisma
model Signup {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  businessName String?
  website      String?
  notes        String?
  createdAt    DateTime @default(now())
}
```

## Environment Variables

`DATABASE_URL` — SQLite path relative to schema.prisma, e.g. `file:./dev.db`

## API

- `POST /api/signups` — Validates with Zod, creates Signup record, returns `{ id, createdAt }`

## Key Commands

```bash
npm run dev           # Dev server
npm run build         # Production build
npm run lint          # ESLint
npm run type-check    # TypeScript check
npx prisma studio     # Database GUI
npx prisma db push    # Sync schema to database
```

## Deployment

### CI/CD (GitHub Actions)
Push to `main` triggers: lint → type-check → build → SSH into VPC server → docker build → docker run.

Requires GitHub secret: `SERVER_PASSWORD`

### VPC Server (Alibaba Cloud)
- IP: `47.251.113.72`
- Repo on server: `~/geoptimizer`
- Runs as Docker container named `brightwill` on port 3000
- Container auto-restarts via `--restart unless-stopped`

### Docker
```bash
docker build -t brightwill .
docker run -d --name brightwill -p 3000:3000 -e DATABASE_URL="file:./dev.db" --restart unless-stopped brightwill
```

### Dockerfile
Single-stage build: `node:20-alpine` → `npm ci` → `prisma generate` → `npm run build` → `prisma db push && npm start`

## Naming

- **Brand/frontend:** BrightWill
- **Repo:** geoptimizer
