# Implementation Prompt for Email Marketing & Outreach Platform

Copy everything below this line into a new Claude Code chat:

---

## Task

Implement the BrightWill Email Marketing & Outreach Platform. The full detailed plan is at:
`/Users/william/.claude/plans/dynamic-twirling-giraffe.md`

Read that file first — it contains every database model, API route, component, and design decision.

## What You're Building

A proprietary email marketing platform inside the BrightWill admin dashboard (`/admin`). This system lets us:

1. **Manage SMTP email accounts** — add Zoho SMTP credentials via admin UI, track warmup status per account (5 phases over ~3 weeks, 5→10→20→30→40→50 emails/day)
2. **Import contacts** — upload CSV spreadsheets of scraped business contacts (restaurants, salons, etc.), deduplicate by email, organize into named lists
3. **Create email templates** — store in database with `{variable}` placeholders (businessName, city, cuisineType, etc.), preview with sample data, send test emails
4. **Run campaigns** — assign a contact list + templates to a campaign, configure send window (hours/timezone) and throttling (delay between sends), start/pause/resume
5. **Automated sending engine** — cron job hits API route every 2 minutes, processes active campaigns, distributes sends across accounts (least-loaded-first), respects warmup daily limits, prevents duplicate sends via DB constraint
6. **Full analytics** — dashboard with KPIs (sent today, this week, bounced, unsubscribed), per-account warmup progress, recent send log, click into individual campaign send history
7. **Unsubscribe handling** — unique token per contact, public endpoint marks as unsubscribed, never sends again

## Key Context Files to Read First

Read these files before starting implementation (in this order):

1. `/Users/william/.claude/plans/dynamic-twirling-giraffe.md` — THE PLAN. Has all schemas, routes, components, architecture.
2. `/Users/william/Desktop/Brightwill/geoptimzer/CLAUDE.md` — Project architecture, conventions, design system, styling rules.
3. `/Users/william/Desktop/Brightwill/geoptimzer/prisma/schema.prisma` — Current database schema (add 8 new models after existing ones).
4. `/Users/william/Desktop/Brightwill/geoptimzer/src/app/admin/page.tsx` — Existing admin dashboard (modify to add Overview/Outreach toggle).
5. `/Users/william/Desktop/Brightwill/geoptimzer/src/app/api/admin/auth.ts` — Admin auth helpers (`verifyAdmin()`, `unauthorizedResponse()`) — reuse for all new routes.
6. `/Users/william/Desktop/Brightwill/geoptimzer/src/app/api/admin/stats/route.ts` — Existing admin API pattern (Prisma queries, parallel fetching).
7. `/Users/william/Desktop/Brightwill/geoptimzer/src/lib/email-templates.ts` — Existing HTML email component library (20+ functions). Reuse for branded template style.
8. `/Users/william/Desktop/Brightwill/geoptimzer/scripts/outreach/templates.ts` — Existing cold email templates to migrate. Contains `getCategoryNoun()` and 2 template functions to port to `renderer.ts`.
9. `/Users/william/Desktop/Brightwill/geoptimzer/scripts/outreach/send.ts` — Existing CLI sender. Reference for CSV parsing patterns, nodemailer usage, throttling logic.

## Implementation Order

Follow this exact sequence from the plan:

### Step 1: Database Schema
- Add all 8 new Prisma models to `prisma/schema.prisma` (EmailAccount, OutreachContact, OutreachList, OutreachListMember, OutreachTemplate, OutreachCampaign, OutreachCampaignTemplate, OutreachSend)
- Run `npx prisma db push && npx prisma generate`
- Verify with `npx prisma studio`

### Step 2: Backend Library (`src/lib/outreach/`)
Build in dependency order:
1. `encryption.ts` — AES-256-GCM encrypt/decrypt for SMTP passwords (uses `OUTREACH_ENCRYPTION_KEY` env var)
2. `warmup.ts` — Warmup phase schedule (5 phases, ~3 weeks to full capacity)
3. `renderer.ts` — Template `{variable}` replacement + computed vars (`{categoryNoun}`, `{searchExample}`, `{unsubscribeUrl}`)
4. `smtp.ts` — Nodemailer transport factory (decrypts password from DB)
5. `csv-parser.ts` — CSV parsing with dynamic column mapping
6. `send-engine.ts` — Core send cycle logic (see plan for detailed flow diagram)

### Step 3: API Routes (`src/app/api/admin/outreach/`)
All protected by `verifyAdmin()`. Build in this order:
1. Accounts routes (CRUD + test send)
2. Templates routes (CRUD + preview + test-send)
3. Contacts routes (list + upload CSV + CRUD)
4. Lists routes (CRUD)
5. Campaigns routes (CRUD + start/pause + send log)
6. Send engine route (POST, cron-triggered)
7. Stats route (aggregated KPIs)
8. Unsubscribe route (`/api/unsubscribe/[token]` — public, no auth)

### Step 4: Admin UI (`src/components/admin/outreach/`)
6 component files total (not more — keep it lean):
1. `outreach-section.tsx` — Container: fetches data, manages sub-tabs (Dashboard, Campaigns, Contacts, Templates, Accounts)
2. `dashboard-view.tsx` — KPIs + account health cards + recent send log + "Run Send Cycle" button
3. `accounts-view.tsx` — Account cards with warmup progress + add form
4. `templates-view.tsx` — Template cards + create/edit + preview + CSV format guide + test send button
5. `contacts-view.tsx` — Contact table + filters + CSV upload + column mapper
6. `campaigns-view.tsx` — Campaign table + create form + expandable detail with send log

Modify `src/app/admin/page.tsx` to add `[Overview] [Outreach]` toggle at top. Existing content = Overview tab (unchanged). New outreach-section component = Outreach tab.

### Step 5: Unsubscribe Page
- `src/app/unsubscribe/[token]/page.tsx` — branded confirmation page

### Step 6: Seed & Migrate
- Seed 2 existing plain-text templates (curiosity + competitor) + 1 branded template into `OutreachTemplate` table
- Create `scripts/outreach/migrate-to-db.ts` for migrating sent-log.json (if exists) to OutreachContact records

### Step 7: Cleanup
- Delete old files: `scripts/outreach/config.ts`, `scripts/outreach/templates.ts`, `scripts/outreach/send.ts`, `scripts/outreach/test-preview.ts`, `scripts/outreach/sample.csv`
- Remove old `OUTREACH_SMTP_*` env vars from `.env.example` (replaced by DB-stored credentials)
- Add new env vars to `.env.example`: `OUTREACH_ENCRYPTION_KEY`, `CRON_SECRET`

### Step 8: Documentation
- Update `CLAUDE.md` with full outreach system docs (schema, APIs, architecture, warmup protocol, cron setup)
- Create `README.md` with comprehensive project docs including all design decisions

### Step 9: Verify
- `npm run type-check` passes
- `npm run build` succeeds
- All admin UI tabs render correctly
- Test: create account → create template → preview → upload CSV → create campaign → start → manual cron trigger → verify email sent

## Critical Design Rules

1. **Styling**: ALL inline styles. Warm beige theme (#f3efe8 bg, #ffffff cards, #e5e5e5 borders, #171717 text). 12px card radius, 8px button radius. Match existing admin page patterns exactly — read `src/app/admin/page.tsx` for `cellStyle`, `headerCellStyle`, `statusBadge()` patterns.

2. **No bloat**: 6 lib files + 13 route files + 6 component files. No extra abstractions, no utility files that aren't needed. Keep it lean.

3. **Cold email uses nodemailer + Zoho SMTP** (NOT Resend). Resend is only for transactional product emails. Outreach emails go through user-configured SMTP accounts.

4. **SMTP passwords encrypted** with AES-256-GCM before storing in DB. Never store plaintext.

5. **Duplicate prevention**: `@@unique([campaignId, contactId])` on OutreachSend. `email @unique` on OutreachContact. Application-level cross-campaign dedup via `allowResendDays`.

6. **Send engine is stateless**: Cron fires every 2 minutes. Each invocation checks delay since last send per campaign, sends at most 1 email per campaign, returns. In-memory lock prevents overlapping runs.

7. **Warmup auto-advances daily**: 5 phases over ~3 weeks (Days 1-3: 5/day, 4-7: 10/day, 8-11: 20/day, 12-16: 30/day, 17-21: 40/day, 22+: 50/day). Pauses if 3+ consecutive errors. Auto-pauses account at 5 errors.

8. **Everything configurable from frontend**: from name, SMTP credentials, daily limits, warmup on/off, send delay, send window, skip weekends toggle. Nothing hardcoded.

9. **`skipWeekends` defaults to false** — sends 7 days/week.

10. **Default `fromName` is "William"** (not "William Chen"). Editable from admin UI.

11. **Two template styles supported**: Plain-text style for cold outreach (looks personal), branded HTML for warm leads/follow-ups (uses existing `email-templates.ts` component library). Both are just HTML in the DB.

12. **Template test send**: Each template has a "Send Test" button that sends a rendered version to a specified email via a selected SMTP account.

13. **After implementation, update CLAUDE.md** with all new models, routes, components, architecture. This is mandatory per project rules.
