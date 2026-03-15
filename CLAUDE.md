# BrightWill

GEO (Generative Engine Optimization) analysis platform for businesses of all types — local, digital (SaaS, ecommerce, creators), and hybrid (agencies, consultants). Measures **AI Visibility Score** (0-100) — how likely each AI engine is to recommend a business when relevant queries are asked. Three tiers: free (ChatGPT only, 5 queries, instant), Full Audit ($19, all 3 engines, 100+ queries), and Audit + Strategy ($199, full audit plus execution roadmap, monthly re-audits, strategy call).

## Quick Start

```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + inline styles (warm beige palette, Anthropic-inspired)
- **Database:** PostgreSQL (Supabase) via Prisma ORM
- **LLM SDKs:** OpenAI (`openai`), Anthropic (`@anthropic-ai/sdk`), Google (`@google/genai`)
- **Animations:** Framer Motion + CSS keyframes
- **Email:** Resend SDK (`resend`) — 8 branded templates (payment, report, launch, free audit results, 3 drips, upsell) with shared component library
- **Payments:** Stripe Checkout ($19 Full Audit + $199 Audit+Strategy) — `stripe` SDK, promotion codes enabled, dev bypass via NODE_ENV
- **PDF:** Client-side export via `html2canvas` + `jspdf`
- **Auth:** None (Stripe payment gate for full reports)
- **Deployment:** Docker on Alibaba Cloud VPC, GitHub Actions CI/CD

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Marketing landing page
│   ├── signup/page.tsx                   # Business signup form
│   ├── analyze/page.tsx                  # GEO analysis orchestrator (step state machine)
│   ├── report/[token]/page.tsx           # Public shareable report page
│   ├── report/[token]/opengraph-image.tsx # Dynamic OG image (1200x630) for social sharing
│   ├── api/
│   │   ├── signups/route.ts              # POST /api/signups
│   │   ├── location/route.ts             # GET /api/location (IP geolocation)
│   │   ├── analysis/route.ts             # POST /api/analysis (create + fire-and-forget)
│   │   ├── checkout/route.ts              # POST /api/checkout (Stripe Checkout Session)
│   │   ├── webhooks/stripe/route.ts      # POST /api/webhooks/stripe (Stripe webhook handler)
│   │   ├── health/route.ts               # GET /api/health (DB health check)
│   │   ├── analysis/[id]/
│   │   │   ├── route.ts                  # GET /api/analysis/[id] (poll status + query progress + actionPlan)
│   │   │   ├── claim/route.ts            # POST /api/analysis/[id]/claim (payment verification + comprehensive audit)
│   │   │   ├── email-capture/route.ts   # POST /api/analysis/[id]/email-capture (save email for follow-up)
│   │   │   └── action-plan/
│   │   │       ├── route.ts              # GET (live plan) + POST (regenerate)
│   │   │       └── [itemId]/route.ts     # PATCH (toggle completion, notes)
│   │   ├── admin/
│   │   │   ├── auth.ts                   # Admin cookie auth helpers
│   │   │   ├── login/route.ts            # POST /api/admin/login (password → cookie)
│   │   │   ├── stats/route.ts            # GET /api/admin/stats (KPIs + recent data)
│   │   │   └── outreach/                 # Outreach system API (all admin-protected)
│   │   │       ├── accounts/route.ts     # GET + POST (SMTP accounts)
│   │   │       ├── accounts/[id]/route.ts # PATCH + DELETE + POST (test send)
│   │   │       ├── contacts/route.ts     # GET (paginated, filterable)
│   │   │       ├── contacts/[id]/route.ts # PATCH + DELETE
│   │   │       ├── contacts/upload/route.ts # POST (CSV upload with column mapping)
│   │   │       ├── lists/route.ts        # GET + POST
│   │   │       ├── lists/[id]/route.ts   # PATCH + DELETE
│   │   │       ├── templates/route.ts    # GET + POST
│   │   │       ├── templates/[id]/route.ts # PATCH + DELETE
│   │   │       ├── templates/[id]/preview/route.ts # POST (render preview)
│   │   │       ├── templates/[id]/test-send/route.ts # POST (send test email)
│   │   │       ├── campaigns/route.ts    # GET + POST
│   │   │       ├── campaigns/[id]/route.ts # GET (sends) + PATCH (start/pause) + DELETE
│   │   │       ├── send/route.ts         # POST (cron-triggered send cycle)
│   │   │       └── stats/route.ts        # GET (outreach KPIs)
│   │   ├── unsubscribe/[token]/route.ts  # GET (public, no auth — marks unsubscribed, redirects)
│   │   └── report/[token]/route.ts       # GET /api/report/[token] (public report data)
│   ├── admin/
│   │   └── page.tsx                      # Admin dashboard (Overview/Outreach toggle, KPIs + tables)
│   ├── unsubscribe/[token]/page.tsx      # Public branded unsubscribe confirmation page
│   ├── sitemap.ts                       # XML sitemap (homepage, /analyze, /report/demo)
│   ├── robots.ts                        # robots.txt (allow all except /api/, /admin/)
│   ├── globals.css
│   └── layout.tsx                       # Root layout with OG metadata, Twitter Cards, Google Fonts
├── components/
│   ├── ui/                               # Base primitives (button, input, card, textarea)
│   ├── admin/outreach/                   # Outreach system UI (6 components)
│   │   ├── outreach-section.tsx          # Container: data fetching, sub-tab nav (Dashboard/Campaigns/Contacts/Templates/Accounts)
│   │   ├── dashboard-view.tsx            # KPIs + account health cards + recent send log + "Run Send Cycle" button
│   │   ├── campaigns-view.tsx            # Campaign table + create form + expandable send detail
│   │   ├── contacts-view.tsx             # Contact table + filters + CSV upload + column mapper
│   │   ├── templates-view.tsx            # Template cards + create/edit + preview + CSV guide + test send
│   │   └── accounts-view.tsx             # Account cards + add form + warmup progress bars
│   └── analyze/                          # Analysis feature components
│       ├── search-step.tsx               # Business name + location (Nominatim autocomplete) + category form
│       ├── loading-step.tsx              # Provider badges + query progress (tier-aware)
│       ├── partial-report.tsx            # Competitor-first dashboard: 2 tabs (Overview + Evidence), "what customers see" card, $19 CTAs
│       ├── email-gate.tsx                # Payment gate modal with tier selector ($19/$199) → Stripe Checkout redirect
│       ├── full-report.tsx               # Dashboard layout: 5 tabs (Overview, Providers, Sources, Evidence, Action Plan) + PDF download
│       ├── dashboard-shell.tsx           # Dashboard outer container: sticky KPI + nav, cross-fade tab content
│       ├── dashboard-card.tsx            # Glassmorphism card wrapper with lock overlay support
│       ├── dashboard-nav.tsx             # Animated sliding pill tab bar (layoutId spring animation)
│       ├── kpi-row.tsx                   # Auto-flowing stat card strip with accent borders + mini rings
│       ├── insight-cards.tsx             # Severity-coded insight cards (strengths/opportunities/gaps)
│       ├── provider-comparison-visual.tsx # 3-column visual provider comparison with rings + stat rows
│       ├── recommendation-hero.tsx       # Large probability ring + description
│       ├── query-evidence.tsx            # Chat-style query/response viewer with provider avatars
│       ├── query-type-breakdown.tsx      # Visibility by query type (stacked bars + stats)
│       ├── source-influence-map.tsx      # Source attribution visualization (per-provider or cross-platform)
│       ├── score-ring.tsx                # SVG donut chart
│       ├── bar-chart.tsx                 # Horizontal bar visualization
│       ├── metric-card.tsx               # KPI card
│       ├── sentiment-badge.tsx           # Color-coded sentiment pill
│       ├── competitor-table.tsx          # Ranked competitor list
│       ├── llm-comparison-table.tsx      # Cross-platform comparison grid (guarded for missing providers)
│       ├── action-items.tsx             # Data-driven actionable recommendations (5-8 items, free tier fallback)
│       ├── action-plan.tsx              # Comprehensive GEO action plan (80-120 items, 10 categories)
│       ├── action-plan-category.tsx     # Expandable accordion per category
│       └── action-plan-item.tsx         # Individual checklist item with checkbox + priority + effort
└── lib/
    ├── prisma.ts                         # Prisma singleton
    ├── utils.ts                          # cn(), formatDate(), slugify()
    ├── email.ts                          # Resend client + 8 email templates (payment, report, launch, free audit results, 3 drips, upsell)
    ├── email-templates.ts                # Shared HTML email component library (20+ functions: header, footer, button, score display, competitor card, etc.)
    ├── pdf.ts                            # Client-side PDF generation (html2canvas + jspdf)
    ├── mock-data.ts                      # Types + mock data generator (source of truth for LLMProvider)
    ├── outreach/                         # Email outreach system backend
    │   ├── encryption.ts                 # AES-256-GCM encrypt/decrypt for SMTP passwords
    │   ├── warmup.ts                     # Warmup phase schedule (5 phases → 50/day in ~3 weeks)
    │   ├── renderer.ts                   # Template {variable} replacement + computed vars
    │   ├── smtp.ts                       # Nodemailer transport factory + sendEmail()
    │   ├── csv-parser.ts                 # CSV parsing, column detection, contact extraction
    │   └── send-engine.ts               # Core send cycle (cron-triggered, stateless)
    └── agents/                           # LLM analysis pipeline
        ├── clients.ts                    # SDK singletons + MODEL_CONFIG
        ├── prompts.ts                    # Prompt templates + BUSINESS_CATEGORIES
        ├── profiler.ts                   # Business profiler (GPT-4.1-mini + web search → subcategory/specialties)
        ├── runner.ts                     # runFreeAudit() + runComprehensiveAudit() + legacy runAnalysis()
        ├── parser.ts                     # GPT-4o-mini structured extraction
        ├── aggregator.ts                 # Score computation (probability-weighted) + report assembly
        ├── query-bank.ts                 # Query template bank (37+ templates per category × 3 providers = 100+ queries, ~65% generic / ~35% direct)
        └── action-plan-generator.ts      # GPT-4.1 generates comprehensive GEO action plan from analysis
```

## Architecture: GEO Analysis Flow

### End-to-end data flow (Free tier)
```
User input → POST /api/analysis (tier=fast) → 1 Analysis + 1 LLMJob (ChatGPT only)
                                                          ↓
                                               runFreeAudit() fire-and-forget
                                                          ↓
                                          profileBusiness() → subcategory/specialties (~2-4s)
                                                          ↓
                                          5 queries from query bank (sequential, subcategory-aware)
                                          each: queryLLM → parseResponse → QueryExecution record
                                                          ↓
                                               aggregator + split metrics → DB update
                                                          ↑
Frontend polls GET /api/analysis/[id] every 2s (includes queryProgress) ─┘
```

### End-to-end data flow (Comprehensive tier)
```
Payment gate → POST /api/checkout → Stripe Checkout → redirect back → POST /api/analysis/[id]/claim (verifies payment) → new Analysis + 3 LLMJobs
                                                          ↓
                                          runComprehensiveAudit() fire-and-forget
                                                          ↓
                                          profileBusiness() → subcategory/specialties (~2-4s)
                                                          ↓
                                       3 providers in parallel (Promise.allSettled)
                                       each: 37+ queries sequential → parse → QueryExecution
                                                          ↓
                                               aggregator → DB update + shareToken
                                                          ↑
Public report page /report/[token] polls /api/report/[token] ─┘
```

### Step-by-step

1. **Search step** (`search-step.tsx`): User enters business name + category + conditional fields based on scope. Location auto-detected via `GET /api/location` and has Nominatim OpenStreetMap autocomplete dropdown (debounced 280ms, deduplicated). Category dropdown with 16 presets + custom. **Scope-adaptive form**: local categories show location (required), digital categories hide location and show product description (required) + target audience (optional), hybrid categories show all fields with location optional.

2. **POST /api/analysis** (`analysis/route.ts`):
   - Cache check: reuses existing free analysis if same business+location+category within 24h. Paid audits always run fresh (no cache).
   - Rate limit: 5 per IP per hour
   - **Free tier**: Creates 1 `Analysis` + 1 `LLMJob` (ChatGPT only) → calls `runFreeAudit()` fire-and-forget
   - **Comprehensive tier**: Creates 1 `Analysis` + 3 `LLMJob` rows → calls `runComprehensiveAudit()` fire-and-forget
   - Returns `{ id, status }` immediately

3. **Free audit** (`runner.ts` → `runFreeAudit()`):
   - Profiles business via `profileBusiness()` → gets subcategory, specialties, search terms (~2-4s)
   - Loads 5 free-tier queries from QueryTemplate bank, rendered with subcategory-aware placeholders
   - Runs each query sequentially through ChatGPT (15-25s total)
   - Creates a `QueryExecution` record per query with raw response + parsed data
   - Computes recommendation probability: `mentions / totalQueries`
   - Computes split metrics: `organicDiscoveryRate` (generic queries) + `brandAwarenessRate` (direct queries)
   - Stores `queryResults` on the LLMReport for frontend display

4. **Comprehensive audit** (`runner.ts` → `runComprehensiveAudit()`):
   - Profiles business first (same as free audit)
   - Loads 37 comprehensive queries from query bank (subcategory-aware)
   - Runs 3 providers in parallel, each processing queries sequentially
   - Creates `QueryExecution` records per query per provider
   - Generates `shareToken` (nanoid) for public report URL
   - Sends report-ready email via Resend with unique report link (`/report/[token]`)
   - Target: 5-15 minutes

5. **Parsing** (`parser.ts`): Raw LLM text → GPT-4.1-mini (via LiteLLM or direct OpenAI) extracts: businessMentioned, mentionType, rankPosition, sentiment (nullable — null when business not mentioned), competitors, topics, accuracy, sourcesCited (review platforms, directories, news, etc.).

6. **Aggregation** (`aggregator.ts`): GEO Score (0-100) computed from:
   - Recommendation probability (40%), primary rate (25%), sentiment (15%), topic breadth (10%), accuracy (10%)
   - Source influence: per-provider `SourceCitation[]` aggregated into cross-platform `SourceInfluenceEntry[]`
   - Query types: collected from queryResults into methodology.queryTypes

7. **Frontend polling** (`analyze/page.tsx`): Polls every 2s. Response includes `queryProgress: { completed, total, currentQueryText }`. `total` comes from `Analysis.queryCount` (set before the query loop starts). Loading step is tier-aware: free shows ChatGPT badge only, comprehensive shows all 3 provider badges with individual status.

8. **Partial report** (`partial-report.tsx`): Competitor-first dashboard layout with sticky KPI row + 2 tabs (Overview, Evidence). Overview: hero card with competitor callout ("ChatGPT recommends [competitor] over you"), "What your customers see" card (scrollable chat-style with verbatim AI response), email capture card ("Save your results" — optional, non-blocking, creates Signup record), "3 quick wins" card (rule-based action items from audit data referencing actual findings), snapshot blockers/wins, query patterns, competitive context, blurred full audit preview with unlock overlay, and $19 CTA. Evidence: QueryEvidence component + source/sentiment readout. Sticky CTA bar at bottom with competitor-aware messaging. Share buttons (LinkedIn + Copy Link) in header. Score ring glow and gradient hero background.

9. **Payment gate** (`email-gate.tsx`): Shows tier selector ($19 Full Audit vs $199 Audit + Strategy) + email form → `POST /api/checkout` with `priceTier` → Stripe Checkout Session (with `allow_promotion_codes: true`) → redirects to Stripe hosted page. On success, Stripe redirects back to `/analyze?session_id={id}&analysis_id={id}`. Page detects URL params → `POST /api/analysis/[id]/claim` with `stripeSessionId` → claim route verifies payment with Stripe API, reads `priceTier` from session metadata → creates comprehensive analysis with `priceTier` field → sends payment confirmation email. Dev bypass: skips Stripe in `NODE_ENV=development`, redirects directly. Webhook (`/api/webhooks/stripe`) serves as backup reconciliation.

10. **Full report** (`full-report.tsx`): Dashboard layout with sticky KPI row (avg + per-provider probabilities with mini rings) + 5 tabs (Overview, AI Models, Sources, Evidence, Action Plan). Overview: ProviderComparisonVisual + InsightCards + Methodology + LLMComparisonTable. AI Models: provider sub-tabs → 2-column grid with hero, metrics, query breakdown, competitors, topics, accuracy, sentiment, evidence. Sources: cross-platform source influence + accuracy issues + per-provider source breakdowns. Evidence: provider sub-tabs → QueryEvidence. Action Plan: ActionPlan or ActionItems. All user-facing "provider" labels renamed to "AI model". Share buttons (LinkedIn + Copy Link) and PDF download in header.

11. **Public report** (`/report/[token]`): Standalone page polls `/api/report/[token]`. Shows loading during analysis, full report when complete. Dynamic OG image (`opengraph-image.tsx`) generates 1200x630 preview with business name, AI Visibility Score (color-coded), provider badges, and BrightWill branding on warm beige background.

12. **Action plan generation** (`action-plan-generator.ts`): After comprehensive analysis completes, GPT-4.1 generates a personalized GEO optimization action plan (80-120 items across 10 categories). Uses the full GEOAnalysis data as context — every item references specific findings (competitor names, probability %, sentiment phrases, failed queries, source gaps). Categories: Entity Trust, Technical AI Crawlability, Schema.org, Content Structure, Citation Authority, Source Presence, Competitor Strategy, Content Marketing, Reputation & Sentiment, Monitoring. Items stored as `ActionPlanItem` DB records for progress tracking (checkbox completion persists). Non-blocking on failure — analysis completes even if action plan generation fails. Retry via `POST /api/analysis/[id]/action-plan`.

### Query Bank System
`query-bank.ts` manages reusable query templates stored in `QueryTemplate` table.

- **37+ templates per category** (5 free + 32+ comprehensive) across 9 query types, run against all 3 providers = **100+ total queries** per comprehensive audit: discovery, subcategory_discovery, direct, comparison, use_case, reviews, specifics, source_probing, verification
- **~65% generic / ~35% direct-mention** — most queries do NOT mention the business name, mirroring real user search behavior. Only direct, reviews, specifics, source_probing, and verification queries mention `{businessName}`.
- Templates use placeholders: `{businessName}`, `{marketContext}`, `{categoryPlural}`, `{categoryDescriptor}`, `{subcategoryPlural}`, `{specialty}`, `{searchTerm}`
- `{marketContext}` smart placeholder replaces old `{location}` — resolves to "in Miami" (local), "for startups" (digital), or "in NYC for enterprise" (hybrid) via `buildMarketContext()`
- Scope-filtered loading: local gets `scope IN ('local', 'all')`, digital gets `scope IN ('digital', 'all')`, hybrid gets all
- 8 digital-only templates (alternatives, pricing, integrations, reviews) with `scope: "digital"`
- Subcategory-aware placeholders (`{subcategoryPlural}`, `{specialty}`, `{searchTerm}`) are populated by the business profiler — e.g., a sushi restaurant gets "sushi restaurants" not "restaurants"
- Falls back to "generic" category if no specific templates found
- Seeded via `npx tsx prisma/seed.ts` (seeds all 10 categories + generic = 407 templates). Use `--force` flag to clear and re-seed.

### Business Profiler
`profiler.ts` runs a quick GPT-4.1-mini call with web search before queries start (~2-4s, ~$0.002) to determine the business's subcategory, specialties, and realistic search terms. Accepts optional `productDescription` and `targetAudience` params — when scope is digital, adapts the GPT prompt to focus on product niche, target audience, and competitive landscape instead of location-based subcategories. Returns a `BusinessProfile` with `subcategory`, `specialties[]`, `searchTerms[]`, `subcategoryPlural`. Falls back to generic category profile on failure — analysis never fails due to profiling.

### Prompts (category-aware)
`prompts.ts` exports `BUSINESS_CATEGORIES` with scope classification, helper functions `categoryPlural()`, `categoryDescriptor()`, `getCategoryScope()`, and type `BusinessScope`.

16 categories with scope: restaurant (local), gym (local), salon (local), hvac (local), dental (local), legal (local), realtor (local), saas (digital), ecommerce (digital), agency (hybrid), consultant (hybrid), freelancer (hybrid), creator (digital), online_course (digital), nonprofit (hybrid), healthcare_digital (digital). Custom categories default to "hybrid".

### Three tiers
- **Free Snapshot** (15-25s): ChatGPT only, 5 queries from query bank. Shows recommendation probability + query evidence. Competitor-first messaging to drive upgrades. Cache: 24h.
- **Full Audit — $19** (5-15min): 3 providers, 37+ queries each (100+ total). Full methodology, source influence, verification, 80-step action plan, PDF export. Gated by Stripe Checkout (dev bypass in development). Generates shareToken. Every payment runs a fresh audit (no cache). Report link never expires.
- **Audit + Strategy — $199**: Everything in Full Audit plus dedicated execution roadmap, monthly re-audit, 3 competitor monitoring dashboards, custom GEO strategy call (30 min), priority email support. Payment works (separate Stripe Price ID via `STRIPE_PRICE_ID_STRATEGY`), stored as `priceTier: "audit_strategy"` on Analysis. Strategy extras (call scheduling, re-audits, competitor monitoring) are delivered manually by founder — no backend automation yet.

## Data Model

```prisma
model Signup { id, name, email (unique), businessName?, website?, notes?, createdAt }

model User { id, email (unique), name?, createdAt, analyses[] }

model Analysis {
  id, userId?, businessName, location, category, tier, status,
  businessScope String @default("local"),     // "local" | "digital" | "hybrid"
  productDescription String?,                  // digital businesses: "project management software"
  targetAudience String?,                      // "small business owners"
  queryCount Int, recommendationProbability Float?, methodology String?,
  shareToken String? @unique,
  paid Boolean @default(false), priceTier String @default("free"),
  stripeSessionId String?, paidAt DateTime?, email String?,
  actionPlanJson String?, actionPlanStatus String @default("pending"),
  resultJson?, errorMessage?, startedAt, completedAt?, expiresAt?, createdAt,
  llmJobs[], queryExecutions[], sourceInfluences[], actionPlanItems[]
  @@index([businessName, location, tier])
}

model LLMJob {
  id, analysisId, provider, status, promptsSent, rawResponse?, parsedJson?,
  errorMessage?, startedAt?, completedAt?, createdAt
  @@index([analysisId, provider])
}

model QueryTemplate {
  id, category, queryType, template, tier (free|comprehensive), isActive,
  scope String @default("all"),  // "local" | "digital" | "all"
  createdAt, updatedAt
  @@index([category, tier, isActive])
}

model QueryExecution {
  id, analysisId, queryTemplateId?, provider, promptSent, rawResponse?,
  parsedJson?, modelVersion?, responseTimeMs?, businessMentioned Boolean,
  mentionType String?, rankPosition Int?, sentiment String?,
  status, errorMessage?, createdAt
  @@index([analysisId, provider])
}

model SourceInfluence {
  id, analysisId, sourceType, sourceName, provider, citationCount, influence, createdAt
  @@index([analysisId])
}

model ActionPlanItem {
  id, analysisId, categoryKey, categoryLabel, itemIndex Int,
  priority, title, description, reasoning, effort,
  dataPoints String?, completed Boolean @default(false),
  completedAt?, notes?, createdAt
  @@index([analysisId, categoryKey])
  @@index([analysisId, completed])
}
// ─── Outreach System ─────────────────────────────────────────────────

model EmailAccount {
  id, label, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass (encrypted AES-256-GCM),
  fromName @default("William"), fromEmail @unique, replyTo?,
  warmupEnabled, warmupStartDate, warmupDay, warmupPhase, dailyLimit, sentToday, sentTodayDate,
  status (active|paused|error|disabled), lastErrorAt?, lastError?, consecutiveErrors, totalSent,
  isActive, createdAt, updatedAt, sends[]
  @@index([isActive, status])
}

model OutreachContact {
  id, email @unique, businessName, firstName?, category, city, cuisineType?, website?, phone?,
  address?, zipCode?, source?, customFields? (JSON),
  status (pending|sent|bounced|replied|unsubscribed|failed), unsubscribedAt?, unsubscribeToken @unique,
  createdAt, updatedAt, sends[], listMemberships[]
  @@index([status]) @@index([email]) @@index([city, category])
}

model OutreachList { id, name, description?, contactCount, createdAt, updatedAt, members[], campaigns[] }

model OutreachListMember { id, listId, contactId, addedAt @@unique([listId, contactId]) }

model OutreachTemplate {
  id, name, subject, htmlBody, plainTextBody, description?, variables (JSON array),
  isActive, createdAt, updatedAt, sends[], campaignTemplates[]
}

model OutreachCampaign {
  id, name, listId, status (draft|active|paused|complete),
  delayMinutes @default(4), jitterSeconds @default(30), skipWeekends @default(false),
  sendWindowStart @default(9), sendWindowEnd @default(17), timezone, allowResendDays @default(0),
  totalContacts, sentCount, failedCount,
  startedAt?, pausedAt?, completedAt?, lastSendAt?,
  createdAt, updatedAt, templates[], sends[]
  @@index([status])
}

model OutreachCampaignTemplate { id, campaignId, templateId, weight @default(1) @@unique([campaignId, templateId]) }

model OutreachSend {
  id, campaignId, contactId, templateId, accountId,
  renderedSubject, renderedHtml?,
  status (pending|sent|failed|bounced), errorMessage?, sentAt?, messageId?,
  createdAt
  @@unique([campaignId, contactId])
  @@index([campaignId, status]) @@index([contactId]) @@index([accountId, sentAt]) @@index([sentAt])
}
```

Status values: `pending` → `running` → `complete` | `failed`

## Key Types (source of truth: `mock-data.ts`)

```typescript
type LLMProvider = "chatgpt" | "claude" | "gemini"  // NO perplexity

interface RecommendationMetrics {
  totalQueries, mentionCount, primaryRecommendationCount, passingMentionCount,
  notMentionedCount, recommendationProbability (0-1), primaryProbability (0-1), mentionTrend,
  organicDiscoveryRate? (0-1), brandAwarenessRate? (0-1)
}

interface QueryResult {
  queryText, queryType, provider, businessMentioned, mentionType, rankPosition?,
  sentiment?, rawResponseExcerpt, timestamp
}

interface MethodologySection { totalQueries, providers, dateRange, queryTypes, verificationPrompts, disclaimer }
interface SourceInfluenceEntry { source, sourceType, citedBy, citationCount, influence }

type LLMReport = { provider, overallScore, citations, recommendations: RecommendationMetrics,
  sentiment, ranking, topics, competitors, accuracy, queryResults: QueryResult[] }
type GEOAnalysis = { businessName, reports, methodology, sourceInfluences, summary: {
  averageScore, averageProbability, bestPerformer, worstPerformer, totalCitations, totalQueries, ... } }

interface ActionPlan = { generatedAt, businessName, totalItems, completedItems,
  categories: ActionPlanCategory[], estimatedTotalEffort }
interface ActionPlanCategory = { key, label, description, estimatedEffort,
  priority, items: ActionPlanItemData[], completedCount }
interface ActionPlanItemData = { id, title, description, reasoning,
  priority, effort, dataPoints: string[], completed }
```

## Design System

### Typography
- **Primary:** Instrument Sans (400, 500, 600, 700) — all UI
- **Accent:** Instrument Serif — available but rarely used (landing page uses Instrument Sans only)
- Loaded via Google Fonts in layout.tsx

### Colors (Warm Beige Theme)
```
Page bg:     #f3efe8 (warm beige, Anthropic-inspired)
Surfaces:    #ffffff (cards), #f7f7f8 (elevated / input), #f0f0f0 (hover / track)
Borders:     #e5e5e5 (default), #ececec (subtle)
Text:        #171717 (primary), #6e6e80 (secondary), #8e8ea0 (muted)
Status:      #16a34a (green), #d97706 (amber), #dc2626 (red)
LLM accents: #10a37f (ChatGPT), #c084fc (Claude), #4285f4 (Gemini)
Mesh base:   #fdf8f5 (warm blush base for orb container)
Mesh orbs:   #f0a070 (amber-orange), #f490b0 (rose-pink), #f5c080 (warm gold),
             #f0a0b0 (coral-rose), #f5d0a0 (peach)
```

### Mesh gradient background
Animated warm blush mesh at the top of landing, analyze, and report pages. Five blurred orbs with saturated warm tones over a `#fdf8f5` base, creating a soft fluid light effect:
- **Container:** `position: fixed` (fixed mode) or `position: absolute` (hero/inline), 520px tall, `background: #fdf8f5`
- **Orbs:** 5 blurred circles (`border-radius: 50%`, `filter: blur(90px)`) with `radial-gradient` fills:
  - Amber-orange `#f0a070` (700px, opacity 0.92) — top-left
  - Rose-pink `#f490b0` (650px, opacity 0.78) — top-right
  - Warm gold `#f5c080` (600px, opacity 0.74) — bottom-left
  - Coral-rose `#f0a0b0` (550px, opacity 0.68) — bottom-right
  - Peach `#f5d0a0` (450px, opacity 0.58) — center
- **Animation:** CSS keyframes `drift1`–`drift5` with staggered durations (14s, 18s, 15s, 20s, 16s) and `ease-in-out infinite alternate`
- **Subtle mode:** Multiplies all orb opacities by 0.65 for subdued section backgrounds
- **Bottom fade:** `linear-gradient(to bottom, transparent 0%, #f3efe8 100%)` at 60% height (fixed mode)
- **Scroll fade (hero mode):** Overlay fades to `rgba(243, 239, 232, 1)` (page bg) as user scrolls
- **Nav:** Transparent (`background: "transparent"`, no backdrop filter) so mesh shows through

### Landing page rhythm
Warm beige theme with mesh hero — (Nav → Hero [mesh bg] → PlatformBar → Stats → HowWeMeasure → ReportShowcase → Features → HowItWorks → Pricing → FAQ → CTAFooter [mesh bg])
- Vertical bounding lines via `.grid-bg` pseudo-elements (repeating-radial-gradient dotted pattern)
- Section dividers via `.section-divider-dotted` (horizontal dotted pattern)
- CTAFooter combines CTA + Footer with bottom mesh gradient
- Hero h1 uses `fontWeight: 400` (medium), subtitle uses `fontWeight: 450`

### Dashboard UI design language
Clean light dashboard (Linear/Notion-inspired) on warm beige page:
- **Dashboard shell:** Header/KPI zone is transparent (mesh gradient shows through from parent page), fades via 60px gradient into `#f3efe8` content zone
- **Card depth:** `box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)` with hover `translateY(-2px)` + `0 8px 24px rgba(0,0,0,0.06)`
- **KPI cards:** White bg, `1px solid #e5e5e5`, optional 3px left accent bar
- **Score rings:** SVG donut with `#f0f0f0` track, `#171717` fill, rAF-deferred CSS transition (animates once on mount, stable on re-renders)
- **Tab nav:** Bottom dotted border via `repeating-radial-gradient`, active tab has 2px solid underline
- **Motion easing:** `cubic-bezier(0.16, 1, 0.3, 1)` for enters, `type: "spring", bounce: 0.15` for Framer Motion
- **Provider-colored sub-tabs:** DashboardNav supports per-tab `color` for active underline tinting

### Styling approach
- Inline styles with exact hex values (NOT Tailwind class approximations)
- Border radius: 12px (cards), 8px (inner elements, buttons), 999px (badges/pills only)
- Framer Motion for analyze step transitions
- CSS keyframes + IntersectionObserver reveal animations for landing page
- Responsive breakpoint: 860px
- Dotted patterns: `repeating-radial-gradient(circle, rgba(0,0,0,0.10-0.12) 0 1px, transparent 1px 6px)` for borders/dividers

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/signups` | Collect business signup (Zod validated) |
| GET | `/api/location` | IP-based geolocation via ip-api.com |
| POST | `/api/analysis` | Create analysis + start audit (free or comprehensive) |
| GET | `/api/analysis/[id]` | Poll status + query progress + results |
| POST | `/api/analysis/[id]/claim` | Verify Stripe payment → kick off comprehensive audit |
| POST | `/api/analysis/[id]/email-capture` | Save email + name to Analysis + create Signup (free report) |
| POST | `/api/checkout` | Create Stripe Checkout Session (supports priceTier, promotion codes, dev bypass) |
| POST | `/api/webhooks/stripe` | Stripe webhook handler (backup payment reconciliation) |
| GET | `/api/health` | DB health check (for UptimeRobot monitoring) |
| GET | `/api/report/[token]` | Public report by share token (no auth) |
| GET | `/api/analysis/[id]/action-plan` | Live action plan with completion states |
| POST | `/api/analysis/[id]/action-plan` | Regenerate action plan |
| PATCH | `/api/analysis/[id]/action-plan/[itemId]` | Toggle item completion / update notes |
| POST | `/api/admin/login` | Admin login (password → cookie) |
| GET | `/api/admin/stats` | Admin KPIs + recent analyses/signups (cookie-protected) |
| GET | `/api/admin/outreach/accounts` | List all SMTP accounts |
| POST | `/api/admin/outreach/accounts` | Create SMTP account (password encrypted) |
| PATCH | `/api/admin/outreach/accounts/[id]` | Update / pause / resume account |
| DELETE | `/api/admin/outreach/accounts/[id]` | Soft-delete account |
| POST | `/api/admin/outreach/accounts/[id]` | Send test email via account |
| GET | `/api/admin/outreach/templates` | List all templates |
| POST | `/api/admin/outreach/templates` | Create template |
| PATCH | `/api/admin/outreach/templates/[id]` | Update template |
| DELETE | `/api/admin/outreach/templates/[id]` | Delete template |
| POST | `/api/admin/outreach/templates/[id]/preview` | Preview template with sample data |
| POST | `/api/admin/outreach/templates/[id]/test-send` | Send test email with rendered template |
| GET | `/api/admin/outreach/contacts` | List contacts (paginated, filterable by status/city/list) |
| PATCH | `/api/admin/outreach/contacts/[id]` | Update contact |
| DELETE | `/api/admin/outreach/contacts/[id]` | Delete contact |
| POST | `/api/admin/outreach/contacts/upload` | CSV upload with column mapping |
| GET | `/api/admin/outreach/lists` | List all contact lists |
| POST | `/api/admin/outreach/lists` | Create list |
| PATCH | `/api/admin/outreach/lists/[id]` | Rename list |
| DELETE | `/api/admin/outreach/lists/[id]` | Delete list |
| GET | `/api/admin/outreach/campaigns` | List all campaigns |
| POST | `/api/admin/outreach/campaigns` | Create campaign |
| GET | `/api/admin/outreach/campaigns/[id]` | Get campaign send log |
| PATCH | `/api/admin/outreach/campaigns/[id]` | Update / start / pause campaign |
| DELETE | `/api/admin/outreach/campaigns/[id]` | Delete campaign (draft only) |
| POST | `/api/admin/outreach/send` | Cron-triggered send cycle (admin cookie or Bearer CRON_SECRET) |
| GET | `/api/admin/outreach/stats` | Outreach KPIs + account health + recent sends |
| GET | `/api/unsubscribe/[token]` | Public unsubscribe (marks contact, redirects to confirmation) |

## Environment Variables

```
DATABASE_URL=postgresql://...         # Supabase PostgreSQL connection string
OPENAI_API_KEY=sk-...                # Required for ChatGPT + parser
OPENAI_BASE_URL=                     # Optional: LiteLLM proxy URL (e.g. Duke AI Gateway)
ANTHROPIC_API_KEY=sk-ant-...         # Required for Claude
GOOGLE_AI_API_KEY=AI...              # Required for Gemini
RESEND_API_KEY=re_...                # Required for report emails (Resend)
APP_URL=http://localhost:3000        # Base URL for report links in emails
RESEND_FROM_EMAIL=                   # Optional: custom from address (default: onboarding@resend.dev)
STRIPE_SECRET_KEY=sk_test_...        # Stripe secret key (test for dev, live for prod)
STRIPE_PUBLISHABLE_KEY=pk_test_...   # Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...      # Stripe webhook signing secret
STRIPE_PRICE_ID=price_...            # Stripe Price ID for $19 Full Audit
STRIPE_PRICE_ID_STRATEGY=price_...   # Stripe Price ID for $199 Audit + Strategy
ADMIN_PASSWORD=...                   # Password for /admin dashboard
OUTREACH_ENCRYPTION_KEY=...          # 32-byte hex for AES-256-GCM SMTP password encryption
CRON_SECRET=...                      # Secret for cron job auth (POST /api/admin/outreach/send)
```

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
Push to `main` triggers: lint → type-check → build → SSH into VPC → docker build → docker run.
Requires GitHub secret: `SERVER_PASSWORD`

### VPC Server (Alibaba Cloud)
- IP: `47.251.113.72`
- Docker container `brightwill` maps port 3003 → 3000 internal
- `--restart unless-stopped`
- Env vars loaded from `~/geoptimizer/.env` via `--env-file`
- **Outreach cron**: `*/2 * * * * curl -s -X POST http://localhost:3003/api/admin/outreach/send -H "Authorization: Bearer $CRON_SECRET" > /dev/null 2>&1`

### Admin Dashboard
- `/admin` — password-gated (env var `ADMIN_PASSWORD`)
- Cookie-based session (7-day expiry)
- **Overview tab**: KPIs (revenue, paid count, conversion rate), paid customer table, free analyses, signups
- **Outreach tab**: Full email marketing platform (see Outreach System below)

## Outreach System

Proprietary email marketing platform inside the admin dashboard (`/admin` → Outreach tab). Manages cold email outreach to local businesses via SMTP accounts with warmup protocol.

### Architecture
```
Admin UI (6 React components) → 15 API routes (admin-protected) → 6 library modules → PostgreSQL + SMTP
                                                                                           ↑
Cron (every 2min) → POST /api/admin/outreach/send (Bearer CRON_SECRET) → send-engine.ts → nodemailer → Zoho SMTP
                                                                                           ↓
Public: GET /api/unsubscribe/[token] → marks contact unsubscribed → redirects to /unsubscribe/[token] page
```

### Library Layer (`src/lib/outreach/`)

| Module | Purpose | Key exports |
|--------|---------|-------------|
| `encryption.ts` | AES-256-GCM encrypt/decrypt for SMTP passwords | `encrypt(plaintext)`, `decrypt(ciphertext)` — stores as `iv:authTag:ciphertext` hex-encoded. Key from `OUTREACH_ENCRYPTION_KEY` env (32-byte hex). |
| `warmup.ts` | 5-phase warmup schedule over ~3 weeks | `advanceWarmup(state)` → returns new phase/limit/day. `getWarmupInfo(phase)` → label/limit for UI display. Pauses if `consecutiveErrors >= 3`. |
| `renderer.ts` | Template `{variable}` replacement | `renderTemplate(template, contactData)` — replaces all `{var}` placeholders with contact data + computed vars (`{categoryNoun}`, `{searchExample}`, `{unsubscribeUrl}`). `extractVariables(template)` — regex extraction for auto-detecting used vars. `SAMPLE_CONTACT` — mock data for previews. `CATEGORY_NOUN_MAP` — 16-entry map for category → noun conversion. |
| `smtp.ts` | Nodemailer transport factory | `createTransport(account)` — decrypts `smtpPass`, creates nodemailer transport. `sendEmail(transporter, options)` — sends and returns `messageId`. |
| `csv-parser.ts` | CSV parsing with column auto-detection | `detectColumns(headers)` — maps CSV headers to our fields via `AUTO_MAP` aliases. `parseCSV(content, columnMapping)` — returns `{ contacts, errors, duplicates, headers }`. Handles BOM, semicolon-separated emails, unmapped columns as `customFields` JSON. |
| `send-engine.ts` | Core cron-triggered send cycle | `runSendCycle()` — stateless, in-memory lock (`let sendCycleRunning = false`), processes all active campaigns. Returns `SendCycleResult { sent, failed, campaignsProcessed, details[] }`. |

### Send Engine Flow (detailed)

`runSendCycle()` in `send-engine.ts` is the core loop, triggered every 2 min by cron:

1. **In-memory lock** — `sendCycleRunning` flag prevents overlapping cycles
2. **Daily reset** — for each active account: if `sentTodayDate !== today`, reset `sentToday = 0` and advance warmup via `advanceWarmup()`
3. **Campaign loop** — for each campaign with `status: "active"`:
   - **Send window check** — `getHourInTimezone(now, campaign.timezone)` must be within `sendWindowStart..sendWindowEnd`
   - **Weekend check** — if `skipWeekends`, skip Saturday/Sunday (in campaign timezone)
   - **Delay check** — `elapsed since lastSendAt` must exceed `delayMinutes * 60s + random(0..jitterSeconds)s`
   - **Find eligible contact** — query list members, exclude: already sent in this campaign (`OutreachSend` records), cross-campaign dedup (all sent contacts if `allowResendDays=0`, or recent if >0), unsubscribed/bounced contacts
   - **Pick account** — least `sentToday` first, must be under `dailyLimit`
   - **Select template** — weighted random from campaign's assigned templates
   - **Render** — `renderTemplate()` for subject, htmlBody, plainTextBody
   - **Create OutreachSend** — status "pending", catches unique constraint violations for dedup
   - **Send via nodemailer** — `createTransport(account)` + `sendEmail()`
   - **Update records** — on success: send→"sent", account sentToday++/totalSent++/consecutiveErrors=0, contact→"sent", campaign sentCount++/lastSendAt. On failure: send→"failed" with error, account consecutiveErrors++, auto-disable at 5 errors
4. **Campaign completion** — if no eligible contacts remain and all have been sent, campaign status → "complete"

### API Routes (`src/app/api/admin/outreach/`)

All outreach API routes (except unsubscribe) are admin-protected via `requireAdmin()` from `src/app/api/admin/auth.ts` (cookie-based). The `send/route.ts` also accepts `Bearer CRON_SECRET` for cron authentication.

| Route file | Methods | Key implementation notes |
|-----------|---------|------------------------|
| `accounts/route.ts` | GET, POST | POST encrypts `smtpPass` via `encrypt()` before storing. Sets initial warmup state based on `warmupEnabled`. |
| `accounts/[id]/route.ts` | PATCH, DELETE, POST | DELETE is soft-delete (`isActive: false`). POST sends a test email via the account's SMTP. PATCH can update any field; if `smtpPass` is provided, re-encrypts. |
| `contacts/route.ts` | GET | Paginated (50/page), filterable by `status`, `city`, `listId`. Includes `listMemberships` with list names. |
| `contacts/[id]/route.ts` | PATCH, DELETE | DELETE is hard delete (cascades list memberships + sends). |
| `contacts/upload/route.ts` | POST | Two-phase: first call with just file returns `{ headers, autoMapping }`. Second call with file + `columnMapping` JSON + optional `listName`/`listId` does the import. Creates contacts with `upsert` (skip existing emails), auto-generates `unsubscribeToken` (nanoid). Creates/reuses list, creates `OutreachListMember` entries, updates list `contactCount`. |
| `lists/route.ts` | GET, POST | GET includes `contactCount`. POST creates empty list. |
| `lists/[id]/route.ts` | PATCH, DELETE | DELETE cascades members. |
| `templates/route.ts` | GET, POST | POST auto-extracts variables from subject+htmlBody+plainTextBody via `extractVariables()`, stores as JSON array. |
| `templates/[id]/route.ts` | PATCH, DELETE | PATCH re-extracts variables on update. |
| `templates/[id]/preview/route.ts` | POST | Renders template with `SAMPLE_CONTACT` data from renderer.ts. Returns `{ subject, html }`. |
| `templates/[id]/test-send/route.ts` | POST | Accepts `{ testEmail, accountId }`. Renders with sample data, sends real email via specified account. |
| `campaigns/route.ts` | GET, POST | GET includes list details + template details. POST creates with status "draft", creates `OutreachCampaignTemplate` join records with weights. |
| `campaigns/[id]/route.ts` | GET, PATCH, DELETE | GET returns send log with contact/template/account details. PATCH handles start (→"active") / pause (→"paused") status transitions + field updates. DELETE only allowed for "draft" campaigns. |
| `send/route.ts` | POST | Dual auth: admin cookie OR `Authorization: Bearer CRON_SECRET`. Calls `runSendCycle()` and returns result JSON. |
| `stats/route.ts` | GET | Aggregates: totalContacts, totalSent, sentToday, sentThisWeek, activeCampaigns, totalBounced, totalUnsubscribed, accounts (summary), recentSends (last 20). |

### Unsubscribe Flow

1. `GET /api/unsubscribe/[token]` — public route, no auth. Finds contact by `unsubscribeToken`, sets `status: "unsubscribed"` + `unsubscribedAt`. Redirects (302) to `/unsubscribe/[token]`.
2. `/unsubscribe/[token]/page.tsx` — server component. Queries contact to show business name. Renders branded confirmation page ("You've been unsubscribed" with BrightWill branding on warm beige background).

### Admin UI Components (`src/components/admin/outreach/`)

| Component | Role | Key patterns |
|-----------|------|-------------|
| `outreach-section.tsx` | Container — fetches all data (stats, templates, lists, campaigns, accounts) via `Promise.all`, manages sub-tab state, passes data to child views. Lazy-loaded in admin page via `React.lazy()`. Exports shared TypeScript interfaces (`Account`, `RecentSend`, `OutreachTemplate`, `OutreachList`, `Campaign`, `AccountFull`). |
| `dashboard-view.tsx` | KPI cards + account health cards (warmup progress bars) + recent send log table + "Run Send Cycle" button that POSTs to `/api/admin/outreach/send`. |
| `campaigns-view.tsx` | Campaign table with status badges + start/pause buttons. Create form: name, list selector, template multi-select with weight inputs, delay/jitter/window config. Expandable send log per campaign (fetches `GET /api/admin/outreach/campaigns/[id]`). |
| `contacts-view.tsx` | CSV drag-drop upload zone with two-phase flow (detect → map → import). Contact table with pagination (50/page) + status/city/list filters. Uses `eslint-disable` for `react-hooks/set-state-in-effect`. |
| `templates-view.tsx` | Template cards with edit/preview/test-send/delete buttons. Create/edit form with name, subject, HTML body (monospace textarea), plain text body, description. Collapsible "Template Variables Guide". Preview rendered in iframe-like panel. Test send prompts for email address, uses first available account. |
| `accounts-view.tsx` | Account cards showing SMTP host, warmup phase/progress bar, sends today vs limit, status, error info. Add form: all SMTP fields + warmup toggle. Test/pause/remove actions per account. |

### Warmup Protocol

| Phase | Days | Daily Limit | Rationale |
|-------|------|-------------|-----------|
| phase_1 | 1-3 | 5 | Establish sender reputation |
| phase_2 | 4-7 | 10 | Gentle ramp |
| phase_3 | 8-11 | 20 | Doubling, monitor bounces |
| phase_4 | 12-16 | 30 | Nearing full capacity |
| phase_5 | 17-21 | 40 | Near-max volume |
| complete | 22+ | 50 | Fully warmed |

Implemented in `warmup.ts` as `PHASES` array. `advanceWarmup()` increments `warmupDay` and looks up the phase for that day. Auto-pauses if `consecutiveErrors >= 3`. Account auto-disabled at 5 errors (set in `send-engine.ts` failure handler).

### Template Variables

Implemented in `renderer.ts`. `renderTemplate()` builds a vars map and does `string.replace(regex)` for each key.

| Variable | Source | Fallback |
|----------|--------|----------|
| `{businessName}` | contact.businessName | (required) |
| `{city}` | contact.city | "" |
| `{category}` | contact.category | "" |
| `{cuisineType}` | contact.cuisineType | category |
| `{firstName}` | contact.firstName | "there" |
| `{email}` | contact.email | (required) |
| `{website}` | contact.website | "" |
| `{phone}` | contact.phone | "" |
| `{address}` | contact.address | "" |
| `{zipCode}` | contact.zipCode | "" |
| `{categoryNoun}` | computed via `CATEGORY_NOUN_MAP` (16 categories → nouns) | "business" |
| `{searchExample}` | computed from cuisineType/category + city | "best business in your area" |
| `{unsubscribeUrl}` | `${APP_URL}/api/unsubscribe/${contact.unsubscribeToken}` | (always set) |

### Duplicate Prevention

Two layers:
1. **Database constraint** — `@@unique([campaignId, contactId])` on `OutreachSend`. The send engine catches unique constraint violations gracefully.
2. **Application-level cross-campaign dedup** — `allowResendDays` on campaign. If 0 (default), queries ALL previously sent contacts across all campaigns. If >0, only deduplicates within that time window.

### Seed Templates

`scripts/outreach/seed-templates.ts` seeds 3 templates:
1. **Curiosity** — personal cold email asking "Is ChatGPT recommending {businessName}?"
2. **Competitor** — frames it as competitive intelligence: "{businessName} vs. your competitors on ChatGPT"
3. **Branded** — full HTML email with BrightWill styling, card layout, CTA button

All templates include `{unsubscribeUrl}` in footer. Run via `npx tsx scripts/outreach/seed-templates.ts` (skips existing by name).

### Cron Setup (VPC)
```bash
*/2 * * * * curl -s -X POST http://localhost:3003/api/admin/outreach/send -H "Authorization: Bearer $CRON_SECRET" > /dev/null 2>&1
```

### Key Commands
```bash
npx tsx scripts/outreach/seed-templates.ts   # Seed 3 initial email templates
npx tsx scripts/outreach/migrate-to-db.ts    # Migrate sent-log.json contacts to DB
```

## Local Development

### First-time setup
```bash
npm install
cp .env.example .env                  # Fill in your Supabase URL + API keys
npx prisma db push                    # Creates tables in your Supabase database
npx tsx prisma/seed.ts                # Seeds 407 query templates (required for audits to work)
npm run dev                           # Starts on http://localhost:3000
```

### How dev mode works
- `NODE_ENV=development` is set automatically by `npm run dev`
- **Stripe is bypassed** — clicking "Pay" in the email gate skips real checkout and redirects directly to the claim flow. No card needed.
- Both `priceTier` options ($19 / $199) work in dev — the tier is passed through the dev bypass URL
- Database points to Supabase (same or separate project from prod)
- LLM API keys can be free-tier/test keys

### Key dev commands
```bash
npm run dev           # Dev server (port 3000, falls back to 3001)
npm run build         # Production build
npm run lint          # ESLint
npm run type-check    # TypeScript check
npx prisma studio     # Database GUI (connects to your DATABASE_URL)
npx prisma db push    # Sync schema changes to database
npx prisma generate   # Regenerate Prisma client after schema changes
npx tsx prisma/seed.ts          # Seed query templates
npx tsx prisma/seed.ts --force  # Clear and re-seed templates
```

### Environment files
- **Local dev**: `.env` in project root (git-ignored). Uses test Stripe keys, free LLM keys.
- **Production server**: `~/geoptimizer/.env` on the VPC. Uses live Stripe keys, paid LLM keys.
- `NODE_ENV` controls Stripe bypass logic — no other config needed.

## Agent Instructions

### MANDATORY: Update documentation after every change
After completing ANY code change — feature, bugfix, refactor, schema change, etc. — you MUST update documentation before considering the task done. This is not optional.

1. **`CLAUDE.md`** (this file): Update the relevant section (architecture, data model, API reference, project structure, etc.) to reflect the change. If adding a new feature, document its full flow.
2. **`.claude/skills.md`**: Update if the change introduces new UI patterns, components, colors, or layout conventions.
3. **`prisma/schema.prisma`** section in this file: Update the Data Model section if any models changed.
4. **API Reference table**: Update if any endpoints were added or modified.

If you skip documentation, the next agent will make incorrect assumptions and break things. Treat docs updates as part of the implementation, not a follow-up.

### Code conventions
- `mock-data.ts` is the source of truth for LLM provider list and TypeScript types
- `prompts.ts` exports `BUSINESS_CATEGORIES` — the source of truth for category options
- Components that iterate `LLM_PROVIDERS` auto-adjust when providers change
- Always run `npm run type-check` after changes

### Naming
- **Brand/frontend:** BrightWill
- **Repo:** geoptimizer
