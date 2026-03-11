# BrightWill

GEO (Generative Engine Optimization) analysis platform for local businesses. Measures **recommendation probability** — how likely each AI engine is to recommend a business when relevant queries are asked. Two tiers: free (ChatGPT only, 5 queries, instant) and comprehensive (all 3 engines, 40+ queries, email-gated).

## Quick Start

```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + inline styles (dark-first, cool-neutral palette)
- **Database:** SQLite (`prisma/dev.db`) via Prisma ORM
- **LLM SDKs:** OpenAI (`openai`), Anthropic (`@anthropic-ai/sdk`), Google (`@google/genai`)
- **Animations:** Framer Motion + CSS keyframes
- **Email:** Resend SDK (`resend`) — sends report-ready notification after comprehensive analysis
- **Auth:** None (email gate for full reports)
- **Deployment:** Docker on Alibaba Cloud VPC, GitHub Actions CI/CD

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Marketing landing page
│   ├── signup/page.tsx                   # Business signup form
│   ├── analyze/page.tsx                  # GEO analysis orchestrator (step state machine)
│   ├── report/[token]/page.tsx           # Public shareable report page
│   ├── api/
│   │   ├── signups/route.ts              # POST /api/signups
│   │   ├── location/route.ts             # GET /api/location (IP geolocation)
│   │   ├── analysis/route.ts             # POST /api/analysis (create + fire-and-forget)
│   │   ├── analysis/[id]/
│   │   │   ├── route.ts                  # GET /api/analysis/[id] (poll status + query progress + actionPlan)
│   │   │   ├── claim/route.ts            # POST /api/analysis/[id]/claim (email gate)
│   │   │   └── action-plan/
│   │   │       ├── route.ts              # GET (live plan) + POST (regenerate)
│   │   │       └── [itemId]/route.ts     # PATCH (toggle completion, notes)
│   │   └── report/[token]/route.ts       # GET /api/report/[token] (public report data)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                               # Base primitives (button, input, card, textarea)
│   └── analyze/                          # Analysis feature components
│       ├── search-step.tsx               # Business name + location (Nominatim autocomplete) + category form
│       ├── loading-step.tsx              # Provider badges + query progress (tier-aware)
│       ├── partial-report.tsx            # Probability hero + evidence + source influence + blurred teasers
│       ├── email-gate.tsx                # Email collection modal → returns comprehensiveAnalysisId
│       ├── full-report.tsx               # All 3 LLMs in tabs with source map + query breakdown
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
    ├── email.ts                          # Resend client + sendReportReadyEmail() (dark-themed HTML template)
    ├── mock-data.ts                      # Types + mock data generator (source of truth for LLMProvider)
    └── agents/                           # LLM analysis pipeline
        ├── clients.ts                    # SDK singletons + MODEL_CONFIG
        ├── prompts.ts                    # Prompt templates + BUSINESS_CATEGORIES
        ├── runner.ts                     # runFreeAudit() + runComprehensiveAudit() + legacy runAnalysis()
        ├── parser.ts                     # GPT-4o-mini structured extraction
        ├── aggregator.ts                 # Score computation (probability-weighted) + report assembly
        ├── query-bank.ts                 # Query template bank (38 templates per category)
        └── action-plan-generator.ts      # GPT-4.1 generates comprehensive GEO action plan from analysis
```

## Architecture: GEO Analysis Flow

### End-to-end data flow (Free tier)
```
User input → POST /api/analysis (tier=fast) → 1 Analysis + 1 LLMJob (ChatGPT only)
                                                          ↓
                                               runFreeAudit() fire-and-forget
                                                          ↓
                                          5 queries from query bank (sequential)
                                          each: queryLLM → parseResponse → QueryExecution record
                                                          ↓
                                               aggregator → DB update
                                                          ↑
Frontend polls GET /api/analysis/[id] every 2s (includes queryProgress) ─┘
```

### End-to-end data flow (Comprehensive tier)
```
Email gate → POST /api/analysis/[id]/claim → new Analysis + 3 LLMJobs
                                                          ↓
                                          runComprehensiveAudit() fire-and-forget
                                                          ↓
                                       3 providers in parallel (Promise.allSettled)
                                       each: 33+ queries sequential → parse → QueryExecution
                                                          ↓
                                               aggregator → DB update + shareToken
                                                          ↑
Public report page /report/[token] polls /api/report/[token] ─┘
```

### Step-by-step

1. **Search step** (`search-step.tsx`): User enters business name + category + location. Location auto-detected via `GET /api/location` and has Nominatim OpenStreetMap autocomplete dropdown (debounced 280ms, deduplicated). Category dropdown with 10 presets + custom.

2. **POST /api/analysis** (`analysis/route.ts`):
   - Cache check: reuses existing analysis if same business+location+category within 24h (fast) or 72h (comprehensive)
   - Rate limit: 5 per IP per hour
   - **Free tier**: Creates 1 `Analysis` + 1 `LLMJob` (ChatGPT only) → calls `runFreeAudit()` fire-and-forget
   - **Comprehensive tier**: Creates 1 `Analysis` + 3 `LLMJob` rows → calls `runComprehensiveAudit()` fire-and-forget
   - Returns `{ id, status }` immediately

3. **Free audit** (`runner.ts` → `runFreeAudit()`):
   - Loads 5 free-tier queries from QueryTemplate bank for the business's category
   - Runs each query sequentially through ChatGPT (15-25s total)
   - Creates a `QueryExecution` record per query with raw response + parsed data
   - Computes recommendation probability: `mentions / totalQueries`
   - Stores `queryResults` on the LLMReport for frontend display

4. **Comprehensive audit** (`runner.ts` → `runComprehensiveAudit()`):
   - Loads 33+ comprehensive queries from query bank
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

8. **Partial report** (`partial-report.tsx`): Shows recommendation probability hero ring, query evidence table, query type breakdown, competitor snapshot, sentiment, ChatGPT source influence. Blurred teasers for: Claude/Gemini analysis, cross-platform source comparison, full methodology.

9. **Email gate** (`email-gate.tsx`): Collects email → `POST /api/analysis/[id]/claim` → returns `comprehensiveAnalysisId` → parent starts polling comprehensive analysis with loading step.

10. **Full report** (`full-report.tsx`): Methodology section, per-provider probability rings, cross-platform comparison table (with sources cited row), source influence map (cross-platform), tabbed deep-dive per provider with: query evidence, query type breakdown, per-provider source influence, metrics, topics, competitors, accuracy, sentiment.

11. **Public report** (`/report/[token]`): Standalone page polls `/api/report/[token]`. Shows loading during analysis, full report when complete.

12. **Action plan generation** (`action-plan-generator.ts`): After comprehensive analysis completes, GPT-4.1 generates a personalized GEO optimization action plan (80-120 items across 10 categories). Uses the full GEOAnalysis data as context — every item references specific findings (competitor names, probability %, sentiment phrases, failed queries, source gaps). Categories: Entity Trust, Technical AI Crawlability, Schema.org, Content Structure, Citation Authority, Source Presence, Competitor Strategy, Content Marketing, Reputation & Sentiment, Monitoring. Items stored as `ActionPlanItem` DB records for progress tracking (checkbox completion persists). Non-blocking on failure — analysis completes even if action plan generation fails. Retry via `POST /api/analysis/[id]/action-plan`.

### Query Bank System
`query-bank.ts` manages reusable query templates stored in `QueryTemplate` table.

- **38 templates per category** (5 free + 33 comprehensive) across 8 query types: discovery, direct, comparison, use_case, reviews, specifics, source_probing, verification
- Templates use placeholders: `{businessName}`, `{location}`, `{categoryPlural}`, `{categoryDescriptor}`
- Falls back to "generic" category if no specific templates found
- Seeded via `npx tsx prisma/seed.ts` (seeds all 10 categories + generic = 418 templates)

### Prompts (category-aware)
`prompts.ts` exports `BUSINESS_CATEGORIES` and helper functions `categoryPlural()`, `categoryDescriptor()`.

Categories: restaurant, gym, salon, hvac, dental, legal, realtor, saas, ecommerce, agency. Custom categories use raw string.

### Two tiers
- **Free** (15-25s): ChatGPT only, 5 queries from query bank. Shows recommendation probability + query evidence. Cache: 24h.
- **Comprehensive** (5-15min): 3 providers, 33+ queries each. Full methodology, source influence, verification. Generates shareToken. Cache: 72h.

## Data Model

```prisma
model Signup { id, name, email (unique), businessName?, website?, notes?, createdAt }

model User { id, email (unique), name?, createdAt, analyses[] }

model Analysis {
  id, userId?, businessName, location, category, tier, status,
  queryCount Int, recommendationProbability Float?, methodology String?,
  shareToken String? @unique,
  actionPlanJson String?, actionPlanStatus String @default("pending"),
  resultJson?, errorMessage?, startedAt, completedAt?, expiresAt, createdAt,
  llmJobs[], queryExecutions[], sourceInfluences[], actionPlanItems[]
  @@index([businessName, location, tier])
}

model LLMJob {
  id, analysisId, provider, status, promptsSent, rawResponse?, parsedJson?,
  errorMessage?, startedAt?, completedAt?, createdAt
  @@index([analysisId, provider])
}

model QueryTemplate {
  id, category, queryType, template, tier (free|comprehensive), isActive, createdAt, updatedAt
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
```

Status values: `pending` → `running` → `complete` | `failed`

## Key Types (source of truth: `mock-data.ts`)

```typescript
type LLMProvider = "chatgpt" | "claude" | "gemini"  // NO perplexity

interface RecommendationMetrics {
  totalQueries, mentionCount, primaryRecommendationCount, passingMentionCount,
  notMentionedCount, recommendationProbability (0-1), primaryProbability (0-1), mentionTrend
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

### Colors (All-Dark Theme)
```
Surfaces:    #0c0d10 (page bg), #14151a (cards), #1a1b21 (elevated/inputs), #22232a (borders)
Text:        #ffffff (primary), rgba(255,255,255,0.6) (secondary), rgba(255,255,255,0.4) (muted)
Status:      #16a34a (green), #d97706 (amber), #dc2626 (red)
LLM accents: #10a37f (ChatGPT), #c084fc (Claude), #4285f4 (Gemini)
```

### Landing page rhythm
All dark — every section uses #0c0d10 bg with #14151a cards
(Nav → Hero → PlatformBar → Stats → HowWeMeasure → ReportShowcase → Features → HowItWorks → Pricing → CTA → Footer)

### Styling approach
- Inline styles with exact hex values (NOT Tailwind class approximations)
- Border radius: 12px (cards), 8px (inner elements, buttons), 999px (badges/pills only)
- Framer Motion for analyze step transitions
- CSS keyframes + IntersectionObserver reveal animations for landing page
- Responsive breakpoint: 860px

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/signups` | Collect business signup (Zod validated) |
| GET | `/api/location` | IP-based geolocation via ip-api.com |
| POST | `/api/analysis` | Create analysis + start audit (free or comprehensive) |
| GET | `/api/analysis/[id]` | Poll status + query progress + results |
| POST | `/api/analysis/[id]/claim` | Email gate → kick off comprehensive audit |
| GET | `/api/report/[token]` | Public report by share token (no auth) |
| GET | `/api/analysis/[id]/action-plan` | Live action plan with completion states |
| POST | `/api/analysis/[id]/action-plan` | Regenerate action plan |
| PATCH | `/api/analysis/[id]/action-plan/[itemId]` | Toggle item completion / update notes |

## Environment Variables

```
DATABASE_URL=file:./prisma/dev.db    # Path relative to schema.prisma
OPENAI_API_KEY=sk-...                # Required for ChatGPT + parser
OPENAI_BASE_URL=                     # Optional: LiteLLM proxy URL (e.g. Duke AI Gateway)
ANTHROPIC_API_KEY=sk-ant-...         # Required for Claude
GOOGLE_AI_API_KEY=AI...              # Required for Gemini
RESEND_API_KEY=re_...                # Required for report emails (Resend)
APP_URL=http://localhost:3000        # Base URL for report links in emails
RESEND_FROM_EMAIL=                   # Optional: custom from address (default: onboarding@resend.dev)
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
- Docker container `brightwill` on port 80
- `--restart unless-stopped`

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
