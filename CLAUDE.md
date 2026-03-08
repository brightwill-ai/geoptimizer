# BrightWill

GEO (Generative Engine Optimization) analysis platform for local businesses. Users enter a business name, the system queries 3 AI engines (ChatGPT, Claude, Gemini) in parallel, and generates a scored report on how each AI sees, ranks, and recommends the business.

## Quick Start

```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + inline styles (warm neutral palette)
- **Database:** SQLite (`prisma/dev.db`) via Prisma ORM
- **LLM SDKs:** OpenAI (`openai`), Anthropic (`@anthropic-ai/sdk`), Google (`@google/genai`)
- **Animations:** Framer Motion + CSS keyframes
- **Auth:** None (email gate for full reports)
- **Deployment:** Docker on Alibaba Cloud VPC, GitHub Actions CI/CD

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Marketing landing page
│   ├── signup/page.tsx                   # Business signup form
│   ├── analyze/page.tsx                  # GEO analysis orchestrator (step state machine)
│   ├── api/
│   │   ├── signups/route.ts              # POST /api/signups
│   │   ├── location/route.ts             # GET /api/location (IP geolocation)
│   │   ├── analysis/route.ts             # POST /api/analysis (create + fire-and-forget)
│   │   └── analysis/[id]/
│   │       ├── route.ts                  # GET /api/analysis/[id] (poll status)
│   │       └── claim/route.ts            # POST /api/analysis/[id]/claim (email gate)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                               # Base primitives (button, input, card, textarea)
│   └── analyze/                          # Analysis feature components
│       ├── search-step.tsx               # Business name + location form
│       ├── loading-step.tsx              # Real-time LLM progress badges
│       ├── partial-report.tsx            # ChatGPT visible, others blurred
│       ├── email-gate.tsx                # Email collection modal
│       ├── full-report.tsx               # All 3 LLMs in tabs
│       ├── score-ring.tsx                # SVG donut chart
│       ├── bar-chart.tsx                 # Horizontal bar visualization
│       ├── metric-card.tsx               # KPI card
│       ├── sentiment-badge.tsx           # Color-coded sentiment pill
│       ├── competitor-table.tsx          # Ranked competitor list
│       └── llm-comparison-table.tsx      # Cross-platform comparison grid
└── lib/
    ├── prisma.ts                         # Prisma singleton
    ├── utils.ts                          # cn(), formatDate(), slugify()
    ├── mock-data.ts                      # Types + mock data generator (source of truth for LLMProvider)
    └── agents/                           # LLM analysis pipeline
        ├── clients.ts                    # SDK singletons + MODEL_CONFIG
        ├── prompts.ts                    # Prompt templates (fast: 3, comprehensive: 8)
        ├── runner.ts                     # Orchestrator (parallel provider queries)
        ├── parser.ts                     # GPT-4o-mini structured extraction
        └── aggregator.ts                # Score computation + report assembly
```

## Architecture: GEO Analysis Flow

### End-to-end data flow
```
User input → POST /api/analysis → DB rows created → fire-and-forget runAnalysis()
                                                          ↓
                                               runner.ts (Promise.allSettled)
                                              ┌──────┬──────┬──────┐
                                           ChatGPT  Claude  Gemini
                                           (w/web)  (base)  (w/web)
                                              │       │       │
                                              └──→ GPT-4o-mini parser ←──┘
                                                       ↓
                                               aggregator → DB update
                                                       ↑
Frontend polls GET /api/analysis/[id] every 2s ────────┘
```

### Step-by-step

1. **Search step** (`search-step.tsx`): User enters business name + location + category. Location auto-detected via `GET /api/location` (ip-api.com). Category is a dropdown with 10 presets (Restaurant, Gym, Salon, HVAC, Dental, Legal, Real Estate, SaaS, E-commerce, Agency) plus "Other..." for custom text input. Category drives prompt generation so queries are domain-appropriate.

2. **POST /api/analysis** (`analysis/route.ts`):
   - Cache check: reuses existing analysis if same business+location+category within 24h (fast) or 72h (comprehensive)
   - Rate limit: 5 per IP per hour (in-memory Map)
   - Creates 1 `Analysis` row + 3 `LLMJob` rows (one per provider)
   - Calls `runAnalysis()` **without await** (fire-and-forget background work)
   - Returns `{ analysisId }` immediately

3. **Background LLM work** (`runner.ts`):
   - Runs all 3 providers in parallel via `Promise.allSettled`
   - Per provider: sends prompt templates → gets raw text → parses with GPT-4o-mini → aggregates into LLMReport
   - **ChatGPT**: OpenAI Responses API with `web_search_preview` tool (real-time web data)
   - **Claude**: Anthropic messages API (training data only, no web search)
   - **Gemini**: Google GenAI with `googleSearch` grounding (real-time web data)
   - Each call has 30s timeout + 1 retry with 2s backoff

4. **Parsing** (`parser.ts`): Raw LLM text → GPT-4o-mini extracts structured data:
   - Business mentioned? Position in ranking? Sentiment? Exact citations? Competitors? Topics? Accuracy?

5. **Aggregation** (`aggregator.ts`): Parsed responses → GEO Score (0-100) computed from:
   - Citation rate, sentiment, ranking position, topic coverage, factual accuracy

6. **Frontend polling** (`analyze/page.tsx`): Polls `GET /api/analysis/[id]` every 2s. Loading screen shows real per-LLM status badges.

7. **Partial report** (`partial-report.tsx`): Shows ChatGPT results visible, Claude + Gemini blurred with lock overlay.

8. **Email gate** (`email-gate.tsx`): Collects email → `POST /api/analysis/[id]/claim` → upserts User, links Analysis, kicks off comprehensive tier.

9. **Full report** (`full-report.tsx`): All 3 LLMs in tabs + cross-platform comparison table.

### Prompts (category-aware)
All prompts in `prompts.ts` take `(businessName, location, category)` and generate natural-language queries appropriate to the business type. Helper functions `categoryPlural()` and `categoryDescriptor()` convert category IDs to natural language (e.g. "gym" → "gyms and fitness centers", "place to work out").

Categories defined in `BUSINESS_CATEGORIES` array (exported from `prompts.ts`): restaurant, gym, salon, hvac, dental, legal, realtor, saas, ecommerce, agency. Custom categories use the raw string in prompts.

### Two tiers
- **Fast** (15-30s): 3 prompts per LLM (discovery, direct, comparison). Cache: 24h.
- **Comprehensive** (async): 8 prompts per LLM (adds use_case x2, reviews, specifics, rephrased_discovery). Cache: 72h.

## Data Model

```prisma
model Signup {
  id, name, email (unique), businessName?, website?, notes?, createdAt
}

model User {
  id, email (unique), name?, createdAt, analyses[]
}

model Analysis {
  id, userId?, businessName, location, category (default "restaurant"), tier, status,
  resultJson?, errorMessage?, startedAt, completedAt?, expiresAt, createdAt, llmJobs[]
  @@index([businessName, location, tier])
}

model LLMJob {
  id, analysisId, provider, status, promptsSent, rawResponse?, parsedJson?,
  errorMessage?, startedAt?, completedAt?, createdAt
  @@index([analysisId, provider])
}
```

Status values for Analysis/LLMJob: `pending` → `running` → `complete` | `failed`

## Key Types (source of truth: `mock-data.ts`)

```typescript
type LLMProvider = "chatgpt" | "claude" | "gemini"  // NO perplexity
type GEOAnalysis = { summary, reports: Record<LLMProvider, LLMReport>, ... }
type LLMReport = { provider, score, citations, sentiment, competitors, topics, ... }
```

## Design System

### Typography
- **Primary:** Instrument Sans (400, 500, 600, 700) — all UI
- **Accent:** Instrument Serif (italic) — special callouts
- Loaded via Google Fonts in layout.tsx

### Colors (Warm Neutral Palette)
```
Background: #f0eeea    Text: #0c0c0b    Muted: #9a9793
Border: #dddbd7        Cards: #faf9f7   White: #ffffff
```

### Styling approach
- Inline styles with exact hex values (NOT Tailwind class approximations)
- Framer Motion for step transitions
- CSS keyframes in globals.css for landing page animations
- Responsive breakpoint: 860px

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/signups` | Collect business signup (Zod validated) |
| GET | `/api/location` | IP-based geolocation via ip-api.com |
| POST | `/api/analysis` | Create analysis + start LLM jobs |
| GET | `/api/analysis/[id]` | Poll status + get results |
| POST | `/api/analysis/[id]/claim` | Email gate → unlock full report |

## Environment Variables

```
DATABASE_URL=file:./prisma/dev.db    # Path relative to schema.prisma
OPENAI_API_KEY=sk-...                # Required for ChatGPT + parser
ANTHROPIC_API_KEY=sk-ant-...         # Required for Claude
GOOGLE_AI_API_KEY=AI...              # Required for Gemini
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
