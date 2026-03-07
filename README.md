# BrightWill

Minimal MVP for collecting signups from local businesses interested in Generative Engine Optimization (GEO).

## Quick Start

```bash
npm install
cp .env.example .env.local
npx prisma db push
npm run dev
```

## Deploy (VPC Server)

Push to `main` auto-deploys via GitHub Actions. Requires `SERVER_PASSWORD` secret in GitHub repo settings.

Manual deploy:
```bash
ssh root@47.251.113.72
cd ~/geoptimizer
git pull origin main
npm ci && npx prisma generate && npx prisma db push && npm run build
pm2 restart brightwill || pm2 start "npm start" --name brightwill
```

## Deploy (Docker)

```bash
docker build -t brightwill .
docker run -p 80:3000 -e DATABASE_URL="file:./dev.db" brightwill
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + inline styles
- **Database:** SQLite via Prisma
- **Deployment:** VPC server + PM2, GitHub Actions CI/CD

## Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run lint          # Run linter
npm run type-check    # TypeScript check
npx prisma studio     # Database GUI
npx prisma db push    # Update database schema
```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
```
