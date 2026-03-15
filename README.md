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
- Both pricing tiers ($19 / $199) work through the dev bypass flow
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
         Payment gate (tier selector: $19 or $199) → Stripe Checkout
                              ↓
        Comprehensive audit (3 providers, 100+ queries, 5-15min)
                              ↓
         Full report + 80-step action plan + shareable link
```

### Three tiers
- **Free Snapshot** — ChatGPT only, 5 queries, instant results
- **Full Audit ($19)** — ChatGPT + Claude + Gemini, 100+ queries, source influence, action plan, PDF export
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

## Email Outreach System

A full email marketing platform built into the admin dashboard for cold outreach to local businesses. Manages SMTP accounts, contact lists, email templates, and automated drip campaigns — all from `/admin` > **Outreach** tab.

### Getting Started

#### 1. Environment Setup

Add these to your `.env`:

```bash
# Generate encryption key (required for storing SMTP passwords securely):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
OUTREACH_ENCRYPTION_KEY="your-64-char-hex-string"

# Generate cron secret (required for automated sending):
# node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
CRON_SECRET="your-cron-secret"
```

#### 2. Seed Templates (Optional)

Seed 3 starter email templates (Curiosity, Competitor, Branded):

```bash
npx tsx scripts/outreach/seed-templates.ts
```

Or create templates manually in the admin UI.

#### 3. Cron Job (Production)

Set up the send cycle cron on your server:

```bash
# Runs every 2 minutes — processes active campaigns and sends emails
crontab -e
# Add this line:
*/2 * * * * curl -s -X POST http://localhost:3003/api/admin/outreach/send -H "Authorization: Bearer YOUR_CRON_SECRET" > /dev/null 2>&1
```

### How to Use

Access the outreach platform at `/admin` (login with `ADMIN_PASSWORD`), then click the **Outreach** pill toggle.

#### Step 1: Add SMTP Accounts

Go to **Accounts** tab > **Add Account**.

| Field | Example | Notes |
|-------|---------|-------|
| Label | `zoho-main` | Friendly name for the account |
| SMTP Host | `smtp.zoho.com` | Your email provider's SMTP server |
| SMTP Port | `465` | Usually 465 (SSL) or 587 (TLS) |
| Secure | Yes | Enable for port 465 |
| SMTP User | `outreach@yourdomain.com` | Login username |
| SMTP Password | `your-app-password` | Stored encrypted (AES-256-GCM) |
| From Name | `William` | Name recipients see |
| From Email | `outreach@yourdomain.com` | Must match SMTP user for most providers |
| Reply-To | *(optional)* | If different from From Email |
| Enable Warmup | Yes (recommended) | Gradually ramps sending volume |

**Warmup Protocol:** New accounts start at 5 emails/day and ramp up over 3 weeks:

| Phase | Days | Daily Limit |
|-------|------|-------------|
| Phase 1 | 1-3 | 5/day |
| Phase 2 | 4-7 | 10/day |
| Phase 3 | 8-11 | 20/day |
| Phase 4 | 12-16 | 30/day |
| Phase 5 | 17-21 | 40/day |
| Complete | 22+ | 50/day |

The warmup advances automatically each day. If an account hits 3+ consecutive send errors, warmup pauses until errors clear. At 5 errors, the account auto-disables.

**Testing:** Use the **Test** button on each account card to send a test email and verify SMTP credentials work.

#### Step 2: Create Email Templates

Go to **Templates** tab > **New Template**.

Each template has:
- **Name** — internal identifier (e.g., "Curiosity v2")
- **Subject** — email subject line (supports variables)
- **HTML Body** — rich HTML email (supports variables)
- **Plain Text Body** — fallback for email clients that don't render HTML

**Available variables** (click "Template Variables Guide" for the full list):

| Variable | Replaced With | Fallback |
|----------|---------------|----------|
| `{businessName}` | Contact's business name | *(required)* |
| `{firstName}` | Contact's first name | `"there"` |
| `{city}` | Contact's city | `""` |
| `{category}` | Contact's category | `""` |
| `{cuisineType}` | Cuisine type (restaurants) | Falls back to category |
| `{categoryNoun}` | Computed noun from category | `"business"` |
| `{searchExample}` | Computed search query | `"best business in your area"` |
| `{email}` | Contact's email | *(required)* |
| `{website}` | Contact's website | `""` |
| `{phone}` | Contact's phone | `""` |
| `{unsubscribeUrl}` | Auto-generated per contact | *(always set)* |

**Tips:**
- **Cold outreach:** Use minimal HTML that looks like a personal email (no big headers, no heavy styling). The "Curiosity" and "Competitor" seed templates are good examples.
- **Warm leads/follow-ups:** Use the "Branded" template style with BrightWill styling.
- **Always include `{unsubscribeUrl}`** in every template — it's legally required and auto-generated per contact.
- Use **Preview** to see how the template renders with sample data.
- Use **Send Test** to send a real test email to yourself via one of your SMTP accounts.

#### Step 3: Import Contacts

Go to **Contacts** tab. Use the drag-and-drop CSV upload zone at the top.

**CSV format:** Any CSV works. The system auto-detects common column names:

| Our Field | Auto-detected Column Names |
|-----------|---------------------------|
| email | `Email`, `email`, `Email (Website)`, `E-mail` |
| businessName | `Business Name`, `Name`, `Company` |
| firstName | `First Name`, `Contact Name`, `Owner` |
| category | `Category`, `Type`, `Business Type` |
| city | `City` |
| cuisineType | `Cuisine/Type`, `Cuisine`, `Subcategory` |
| website | `Website`, `URL`, `Web` |
| phone | `Phone`, `Phone Number` |
| address | `Full Address`, `Address`, `Street` |
| zipCode | `Zip Code`, `Zip`, `Postal Code` |

**Upload flow:**
1. Drop or select your CSV file
2. Review the auto-detected column mapping — adjust if needed
3. Select an existing list or create a new one (e.g., "Raleigh Restaurants")
4. Click **Import**

The system handles:
- **Duplicate detection** — contacts with the same email are skipped
- **Semicolon-separated emails** — takes the first valid one
- **Invalid rows** — skipped with error count
- **Unmapped columns** — stored as custom fields (JSON)

**Filtering:** Use the status, city, and list dropdowns to filter the contacts table. Pagination at 50 per page.

#### Step 4: Create & Run Campaigns

Go to **Campaigns** tab > **Create Campaign**.

| Field | What it does | Default |
|-------|-------------|---------|
| Name | Campaign identifier | — |
| Contact List | Which list to send to | — |
| Templates | Select 1+ templates (with weights for A/B testing) | — |
| Delay (minutes) | Minimum time between sends | 4 min |
| Jitter (seconds) | Random additional delay (humanizes timing) | 30 sec |
| Skip Weekends | Don't send on Saturday/Sunday | Off |
| Send Window | Hours during which sending is allowed | 9 AM - 5 PM |
| Timezone | Timezone for the send window | America/New_York |
| Allow Resend (days) | Cross-campaign dedup (0 = never resend) | 0 |

**Template weights:** If you assign multiple templates, the system picks one randomly per send, weighted by the numbers you set. E.g., Template A (weight 2) + Template B (weight 1) = A gets picked ~67% of the time. This is your A/B testing mechanism.

**Campaign lifecycle:**
1. **Draft** — created but not started. You can edit, delete, or add templates.
2. **Active** — click **Start** to begin. The cron job picks up active campaigns every 2 minutes.
3. **Paused** — click **Pause** to temporarily stop. Resume anytime with **Start**.
4. **Complete** — auto-set when all eligible contacts in the list have been sent.

**How sending works (per cron cycle):**
1. Checks if the current time is within the campaign's send window
2. Checks if the minimum delay since last send has elapsed (+ random jitter)
3. Finds the next eligible contact (not yet sent, not unsubscribed, not bounced)
4. Picks the SMTP account with the fewest sends today (load balancing)
5. Selects a template by weighted random
6. Renders variables and sends via nodemailer
7. Updates all records (send log, account counters, contact status, campaign counters)

**Viewing sends:** Click on a campaign row to expand its send log — shows each email sent with status, template used, account used, and timestamp.

#### Step 5: Monitor from Dashboard

The **Dashboard** tab shows:
- **KPIs:** Total contacts, sent today, sent this week, active campaigns, bounced, unsubscribed
- **Account Health:** Per-account cards showing warmup progress, sends today vs. daily limit, and error status
- **Recent Sends:** Last 50 emails sent with status and details
- **Run Send Cycle:** Manual trigger button (useful for testing — normally the cron handles this)

### Account Management

Beyond initial setup, accounts support these operations:

- **Test** — sends a real email to verify SMTP credentials work
- **Pause / Resume** — manually pause an account; resuming clears all error counters (`consecutiveErrors`, `lastError`) so the account gets a fresh start
- **Remove** — soft-delete (keeps historical send data, but account is excluded from future sends)
- **Edit** — update label, from name, from email, reply-to, daily limit, or warmup toggle via the API (`PATCH /api/admin/outreach/accounts/[id]`). Re-encrypts password if changed.

**Account status values:**
| Status | Meaning |
|--------|---------|
| `active` | Ready to send |
| `paused` | Manually paused by user |
| `error` | Auto-set at 5 consecutive send errors (must be manually resumed) |
| `disabled` | Permanently disabled |

### Contact Management

**Filtering:** Use the status, city, category, and list dropdowns to filter the contacts table. Pagination defaults to 50 per page (API supports 1-200 via `limit` parameter).

**Contact status values:**
| Status | Meaning |
|--------|---------|
| `pending` | Imported, not yet sent |
| `sent` | At least one email sent |
| `bounced` | Email bounced (excluded from future sends) |
| `replied` | Contact replied (manual status) |
| `unsubscribed` | Clicked unsubscribe link (permanent, excluded from all campaigns) |
| `failed` | Send failed |

**Deleting contacts:** Hard-deletes the contact and cascades to all list memberships and send records. Use with caution.

**Custom fields:** Any CSV columns that don't map to known fields are stored as JSON in the contact's `customFields` — accessible via the API but not currently shown in the UI.

### Template Management

- **Auto-detected variables:** When you create or edit a template, the system auto-scans for `{variable}` patterns and stores them — no manual variable list needed
- **Preview:** Renders the template with sample contact data. The preview API also accepts custom sample data for testing specific scenarios
- **Test Send:** Sends a real email through one of your SMTP accounts with sample data rendered in
- **Delete:** Removes the template (cannot delete templates actively used in campaigns)

### Unsubscribe Handling

Every email automatically includes an `{unsubscribeUrl}` that links to `/api/unsubscribe/{token}`. When clicked:
1. The contact's status is set to `unsubscribed` with a timestamp
2. The user is redirected to a branded confirmation page at `/unsubscribe/{token}`
3. The contact is permanently excluded from all future campaigns

Each contact gets a unique unsubscribe token (auto-generated via CUID on import).

### Safety Features

- **Duplicate prevention:** `@@unique([campaignId, contactId])` constraint on sends + application-level cross-campaign dedup
- **Auto-pause on errors:** Warmup pauses at 3 consecutive errors; account auto-sets to `error` status at 5 errors
- **Send window enforcement:** Emails only sent during configured hours — timezone-aware (falls back to UTC if timezone is invalid)
- **Weekend skip:** Optional per-campaign, uses timezone-aware day detection
- **In-memory lock:** Prevents overlapping send cycles if the cron fires while a cycle is still running
- **Resilient DB updates:** Send cycle uses `Promise.allSettled` so one DB update failure (e.g., contact deleted mid-cycle) doesn't crash the entire cycle
- **Daily reset:** Account send counters reset automatically each day; warmup phase advances on reset
- **Encrypted credentials:** SMTP passwords stored with AES-256-GCM encryption
- **Load balancing:** SMTP account with fewest sends today is picked first (least-loaded strategy)
- **Draft-only deletion:** Campaigns can only be deleted in draft status — active/paused/complete campaigns are preserved
- **Campaign timestamps:** `startedAt`, `pausedAt`, `completedAt` are tracked automatically on status transitions

### Migrating Existing Data

If you have an existing `sent-log.json` from the old file-based outreach system:

```bash
npx tsx scripts/outreach/migrate-to-db.ts
```

This imports contacts from the sent log into the database.

---

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
STRIPE_PRICE_ID="price_..."          # $19 Full Audit
STRIPE_PRICE_ID_STRATEGY="price_..."  # $199 Audit + Strategy

# Admin
ADMIN_PASSWORD="your-password"       # For /admin dashboard

# Outreach System
OUTREACH_ENCRYPTION_KEY="..."        # 32-byte hex for SMTP password encryption (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
CRON_SECRET="..."                    # Secret for cron job auth (generate: node -e "console.log(require('crypto').randomBytes(24).toString('hex'))")
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
