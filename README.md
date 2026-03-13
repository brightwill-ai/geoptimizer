# BrightWill

GEO (Generative Engine Optimization) analysis platform for local businesses. Measures how likely AI engines (ChatGPT, Claude, Gemini) are to recommend a business when users ask relevant queries.

**Live:** [brightwill.ai](https://brightwill.ai)

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in: DATABASE_URL (Supabase PostgreSQL), LLM API keys, Stripe keys

# 3. Set up database
npx prisma db push          # Creates tables in Supabase
npx tsx prisma/seed.ts       # Seeds 407 query templates (required)

# 4. Run
npm run dev                  # http://localhost:3000
```

### Dev mode behavior
- **Stripe is bypassed** — payment gate skips real checkout, no card needed
- Both pricing tiers ($99 / $199) work through the dev bypass flow
- LLM API keys can be free-tier or test keys
- Admin dashboard at `/admin` (set `ADMIN_PASSWORD` in `.env`)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| Styling | Tailwind CSS v4 + inline styles (warm beige palette) |
| LLM SDKs | OpenAI, Anthropic, Google GenAI |
| Payments | Stripe Checkout (one-time, promotion codes enabled) |
| Email | Resend (payment confirmation + report-ready) |
| PDF | Client-side via html2canvas + jspdf |
| Animations | Framer Motion + CSS keyframes |
| Deployment | Docker on Alibaba Cloud VPC, GitHub Actions CI/CD |

## Architecture

```
User enters business → Free snapshot (ChatGPT, 5 queries, 15-25s)
                              ↓
              Partial report (competitor-first, upgrade CTAs)
                              ↓
         Payment gate (tier selector: $99 or $199) → Stripe Checkout
                              ↓
        Comprehensive audit (3 providers, 40+ queries, 5-15min)
                              ↓
         Full report + 80-step action plan + shareable link
```

### Three tiers
- **Free Snapshot** — ChatGPT only, 5 queries, instant results
- **Full Audit ($99)** — ChatGPT + Claude + Gemini, 40+ queries, source influence, action plan, PDF export
- **Audit + Strategy ($199)** — Full Audit + execution roadmap, monthly re-audit, competitor monitoring, strategy call

## Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run lint          # ESLint
npm run type-check    # TypeScript check
npx prisma studio     # Database GUI
npx prisma db push    # Sync schema to database
npx prisma generate   # Regenerate Prisma client
npx tsx prisma/seed.ts          # Seed query templates
npx tsx prisma/seed.ts --force  # Clear and re-seed
```

## Environment Variables

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[ref]:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# LLM API Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="AI..."
# OPENAI_BASE_URL="..."              # Optional: LiteLLM proxy

# Email (Resend)
RESEND_API_KEY="re_..."
APP_URL="https://brightwill.ai/"
# RESEND_FROM_EMAIL="BrightWill <reports@brightwill.ai>"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."      # sk_live_... in production
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."          # $99 Full Audit
STRIPE_PRICE_ID_STRATEGY="price_..."  # $199 Audit + Strategy

# Admin
ADMIN_PASSWORD="your-password"       # For /admin dashboard
```

## Deployment

### Automatic (CI/CD)
Push to `main` → GitHub Actions runs lint + type-check + build → SSH deploys Docker container to VPC.

Requires GitHub secret: `SERVER_PASSWORD`

### Manual deploy
```bash
ssh root@47.251.113.72
cd ~/geoptimizer
git pull origin main
docker build -t brightwill .
docker stop brightwill 2>/dev/null || true
docker rm brightwill 2>/dev/null || true
docker run -d --name brightwill -p 3003:3000 --env-file ~/geoptimizer/.env --restart unless-stopped brightwill
```

### After first deploy to new database
```bash
docker exec brightwill npx tsx prisma/seed.ts
```

## Key Pages

| Path | Description |
|------|-------------|
| `/` | Marketing landing page |
| `/analyze` | GEO analysis flow (search → loading → report → payment → full report) |
| `/report/[token]` | Public shareable report |
| `/admin` | Admin dashboard (password-gated) |
| `/signup` | Business signup / waitlist form |

## Project Structure

See [CLAUDE.md](CLAUDE.md) for the full project structure, data model, architecture flows, API reference, and design system documentation.

## Support

support@brightwill.ai
