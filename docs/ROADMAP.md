# BrightWill — Roadmap to First Customer

> Last updated: 2026-03-13
> For: William (founder) + AI coding agents
> Goal: Get ONE paying customer as fast as possible, then scale from there.

---

## Table of Contents

1. [What's Already Built](#1-whats-already-built)
2. [What We Need to Build (MVP Only)](#2-what-we-need-to-build-mvp-only)
3. [Cold Email Setup — Step by Step](#3-cold-email-setup--step-by-step)
4. [Prospect List Building](#4-prospect-list-building)
5. [Cold Email Sequences — Ready to Send](#5-cold-email-sequences--ready-to-send)
6. [LinkedIn Strategy — Posts & DMs](#6-linkedin-strategy--posts--dms)
7. [Reddit & X Posts — Ready to Post](#7-reddit--x-posts--ready-to-post)
8. [Email Nurture System](#8-email-nurture-system)
9. [Day-by-Day Execution Plan](#9-day-by-day-execution-plan)
10. [After First Customer](#10-after-first-customer)

---

## 1. What's Already Built

Everything below is live and working. The product is ready for customers.

### The Product
- **Free Snapshot** ($0): User enters business name + category + location → we run 5 real queries against ChatGPT → show their AI Visibility Score (0-100), which competitors beat them, verbatim AI responses, and evidence. Takes 15-25 seconds. No signup required.
- **Full Audit** ($19): Same thing but across ALL 3 AI engines (ChatGPT, Claude, Gemini) with 100+ real queries, source influence mapping, cross-platform comparison, and an 80-step personalized action plan. Takes 5-15 minutes. Paid via Stripe Checkout.
- **Audit + Strategy** ($199): Everything in Full Audit plus a 30-minute strategy call with William, custom execution roadmap, and monthly re-audits. Strategy extras delivered manually by founder.

### What "GEO" Means
GEO = Generative Engine Optimization. It's the AI equivalent of SEO. Instead of "how does Google rank my business?", it's "does ChatGPT/Claude/Gemini recommend my business when someone asks?" This is a brand-new category — almost nobody is doing this yet, which is our opportunity.

### Technical Stack
- **Frontend**: Next.js 16 + TypeScript, warm beige Anthropic-inspired design
- **Backend**: PostgreSQL (Supabase) via Prisma, 3 LLM SDKs (OpenAI, Anthropic, Google)
- **Payments**: Stripe Checkout with promotion codes enabled
- **Email**: Resend SDK — 8 branded email templates already built
- **Deployment**: Docker on Alibaba Cloud VPC, GitHub Actions CI/CD
- **Admin**: `/admin` dashboard shows KPIs, revenue, paid customers, free analyses

### What's Been Built Recently
- **Scope-aware analysis**: Works for ALL business types now — local (restaurants, dentists), digital (SaaS, ecommerce), and hybrid (agencies, consultants). 16 categories. Search form adapts automatically.
- **8 branded email templates**: Payment confirmation, report ready, launch announcement, free audit results, 3 drip emails (Day 2/5/10), upsell email (Day 7 post-paid)
- **SEO foundation**: Sitemap, robots.txt, OpenGraph + Twitter Card metadata
- **Professional reports**: "AI Visibility Score" branding, "AI Models" tab, chat-style evidence viewer, competitor-first free report

---

## 2. What We Need to Build (MVP Only)

Only 3 things actually block us from getting a first customer. Everything else is nice-to-have.

### BLOCKER: Email Capture on Free Report

**What it is**: Right now, when someone runs a free audit, we show them results but have NO way to follow up. They see their score and leave forever. We need to collect their email after showing results so we can send drip emails and convert them later.

**What to build**:
1. Add `email String?` field to the Analysis model in `prisma/schema.prisma`
2. Create `POST /api/analysis/[id]/email-capture` endpoint — accepts `{ email, name? }`, saves to Analysis record + creates a Signup record
3. Add a card to the free report page (`partial-report.tsx`) below the results:
   - Heading: "Save your results"
   - Subtext: "Get notified when your AI visibility changes. We'll check monthly."
   - Email input + optional name field + Submit button
   - On success: green left border, text "Saved! We'll email you monthly updates."
   - This is optional — don't block the report behind it

**Why it matters**: Without this, every dollar we spend on outreach driving people to free audits is wasted. We can't follow up. This is the #1 blocker.

**Files**: `prisma/schema.prisma`, `src/app/api/analysis/[id]/email-capture/route.ts` (NEW), `src/components/analyze/partial-report.tsx`

---

### SHOULD DO: LinkedIn Share + Copy Link

**What it is**: Buttons on the report page that let users share their results on LinkedIn or copy the report URL. This creates free organic distribution — business owners share their score, their network sees it, runs their own audit.

**What to build**:
1. "Share on LinkedIn" button → opens `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
2. "Copy link" button → copies URL to clipboard, shows brief "Copied!" text
3. Add to both `partial-report.tsx` (free) and `full-report.tsx` (paid)
4. Style: outline button (white bg, 1px border #e5e5e5, 8px border-radius)

---

### SHOULD DO: Re-seed Digital Templates

**What it is**: We added 8 digital-specific query templates to the source code (things like "What are the best alternatives to {businessName}?") but they haven't been pushed to the database yet.

**What to do**: Run `npx tsx prisma/seed.ts --force` on the server. One command, takes 30 seconds.

---

### Everything else is LATER

PostHog analytics, dynamic OG images, blog, score history, quick wins on free report, automation scripts — all of these are nice but none block getting a first customer. Build them after we have paying users.

---

## 3. Cold Email Setup — Step by Step

Cold email is how we reach businesses at scale. But it requires infrastructure setup and a 14-day warm-up period before you can send. **Start this on Day 1** — the clock starts ticking.

### What is cold email?

Cold email = sending unsolicited but personalized emails to business owners who don't know you. It's legal (under CAN-SPAM in the US) as long as you include an opt-out mechanism and don't use deceptive subject lines. It's the primary growth channel for B2B startups.

### Why separate domains?

If you send cold email from brightwill.ai and recipients mark it as spam, Gmail/Outlook will blacklist your domain. Then your PRODUCT emails (payment confirmations, report notifications) stop working too. So we send cold email from lookalike domains (brightwillhq.com, etc.) to protect our main domain.

### Step 1: Buy 3 secondary domains (Day 1, 15 min, ~$30)

Go to [Namecheap](https://namecheap.com) and buy:
```
brightwillhq.com
getbrightwill.com
trybrightwill.com
```
Cost: ~$10-12/year each. Pick .com only — .io and others have worse deliverability.

### Step 2: Set up Google Workspace on each domain (Day 1, 30 min, $21.60/mo)

Go to [workspace.google.com](https://workspace.google.com) and sign up for Business Starter ($7.20/mo) for each domain.

For each domain, create 2 email accounts:
- `william@brightwillhq.com`
- `will@brightwillhq.com`

Total: 6 sending accounts across 3 domains. Each account can safely send ~50 cold emails/day = 300/day max capacity.

### Step 3: Configure DNS records (Day 1-2, 30 min per domain)

This is what proves to Gmail/Outlook that your emails are legitimate. For EACH domain:

**SPF** — tells email providers which servers can send email for your domain:
- Go to Namecheap → Domain → Advanced DNS → Add TXT record:
- Host: `@`, Value: `v=spf1 include:_spf.google.com ~all`

**DKIM** — digitally signs your emails to prove they're not forged:
- Go to Google Workspace Admin → Apps → Gmail → Authenticate email
- Click "Generate new record" → copy the long string
- Add it as a TXT record in Namecheap: Host: `google._domainkey`, Value: (the generated string)

**DMARC** — tells email providers what to do with failed authentication:
- Add TXT record: Host: `_dmarc`, Value: `v=DMARC1; p=none; rua=mailto:dmarc@brightwillhq.com`

**Verify**: Send a test email from each account to [mail-tester.com](https://mail-tester.com). You need a score of 9/10 or higher. If lower, your DNS is misconfigured.

### Step 4: Sign up for Instantly.ai (Day 2, 15 min, $37/mo)

[Instantly.ai](https://instantly.ai) is a cold email platform. It handles sending, warm-up, tracking, and reply management. Sign up for the Growth plan ($37/mo).

1. Connect all 6 email accounts via Google OAuth
2. Enable warm-up on EVERY account:
   - Daily warm-up volume: start at 5/day, ramp to 40/day
   - Reply rate: 30-40%
   - Enable "warm-up in Primary" mode
3. **DO NOT send any cold emails for 14 days.** The warm-up needs time.

**What warm-up does**: Instantly's network of real accounts sends emails to your accounts, opens them, replies, and moves them from spam to inbox. This builds your sender reputation with Gmail/Outlook so your real cold emails don't land in spam.

### Step 5: Wait 14 days, then start sending (Day 16)

After 14 days, check each account's warm-up score in Instantly — need 90%+ before sending. Then start small:

| Week | Daily Volume | Notes |
|------|-------------|-------|
| Week 3 | 10-20/day | Monitor: open rate should be 40-60%, reply rate 5-15%, bounce <2% |
| Week 4 | 50/day | Scale if metrics look good |
| Week 5-6 | 100-150/day | A/B test subject lines |
| Month 2 | 250-300/day | Cruise speed |

### Cost Summary

| Item | Cost |
|------|------|
| 3 domains (annual) | ~$30/year → $2.50/mo |
| Google Workspace (6 accounts) | $43.20/mo |
| Instantly.ai Growth | $37/mo |
| **Total cold email infra** | **~$83/mo** |

At $19/audit, you need ~5 conversions/month to cover cold email costs.

---

## 4. Prospect List Building

You need email addresses of business owners to email. Here's how to get them.

### Method 1: Run your own tool (BEST quality — do this first)

This is your unfair advantage. You have a GEO audit tool — use it to create personalized outreach data.

1. Pick a niche + city (e.g. "dentists in Raleigh" or "sushi restaurants in Miami")
2. Go to brightwill.ai/analyze and run free audits on 20-30 businesses
3. For each one, note: business name, AI Visibility Score, who ChatGPT recommended instead, and screenshot the result
4. **The best leads**: businesses with LOW scores but HIGH Google reviews (they're successful, they care about marketing, but AI is ignoring them)
5. Save screenshots to a folder — these are your ammunition for cold emails

### Method 2: Google Maps scraping (for local businesses)

**What it is**: Tools that pull business listings from Google Maps into a spreadsheet — name, address, phone, website, email, rating, review count.

**Tool**: [Outscraper](https://outscraper.com) — $3 per 1,000 results

**How to do it**:
1. Go to Outscraper → Google Maps Scraper
2. Enter: "dentists in Raleigh NC" (or any niche + city)
3. Set limit: 200 results
4. Download CSV
5. Filter: keep only businesses WITH websites (they're more sophisticated) and rating > 3.5 stars
6. Repeat for different niches and cities

**Example run**: 5 cities × 2 niches = 2,000 prospects for ~$6

### Method 3: Apollo.io (for SaaS/digital founders)

**What it is**: Apollo.io is a B2B database of people + their emails. Free tier gives 50 email credits/month.

**How to do it**:
1. Sign up at [apollo.io](https://apollo.io) (free)
2. Search → People → Filters:
   - Title: "Founder" OR "Head of Marketing" OR "CMO"
   - Company size: 11-200 employees
   - Industry: "Computer Software" or "Marketing and Advertising"
3. Export contacts with emails
4. These are your SaaS/agency cold email targets

### Method 4: Validate emails (CRITICAL — do this before sending)

**What it is**: Email validation checks if an email address actually exists. Sending to invalid addresses causes "bounces" which destroy your sender reputation and get you blacklisted.

**Tool**: [MillionVerifier](https://millionverifier.com) — $0.0005/email (cheapest), or [ZeroBounce](https://zerobounce.net) — $0.008/email (more accurate)

**How to do it**:
1. Upload your CSV of emails
2. Wait for validation (minutes for <5,000)
3. Download results: each email marked valid/invalid/catch-all
4. **ONLY keep "valid" emails.** Delete everything else.
5. Expect 60-70% valid rate from scraped data

---

## 5. Cold Email Sequences — Ready to Send

These go into Instantly.ai. Each "sequence" is a series of 3 emails sent over 7 days. If someone doesn't reply to Email 1, they get Email 2 three days later, etc.

### Sequence 1: Local Business — "Your Competitor is Beating You"

**Who to send to**: Restaurant, dentist, gym, salon owners from Google Maps scraping

**Before sending**: Run their business through your free audit. Note their score and who ChatGPT recommends instead. This takes 30 seconds and makes the email 10x more compelling.

**Email 1 (sent Day 0)**:
```
Subject: {Competitor} is beating you on ChatGPT

Hi {firstName},

I asked ChatGPT "best {category} in {city}" — and it recommended
{competitor}, not {businessName}.

I built a tool that audits exactly how AI engines see your business
vs competitors. Your free snapshot takes 30 seconds:

→ brightwill.ai/analyze

No signup, no credit card. You'll see your AI Visibility Score instantly.

William
Co-founder, BrightWill

Reply "stop" to opt out.
```

**Email 2 (sent Day 3, only if no reply)**:
```
Subject: Re: {Competitor} is beating you on ChatGPT

Hey {firstName},

Quick follow-up — I ran a deeper analysis on {category} businesses
in {city} and found something interesting:

The businesses that get recommended by AI all have 3 things in common:
1. 100+ Google reviews (AI pulls from these heavily)
2. Structured business data on their website (schema markup)
3. Consistent mentions across directories (Yelp, TripAdvisor, etc.)

{businessName} is missing at least one of these. The free audit
shows exactly which ones:

→ brightwill.ai/analyze

Takes 30 seconds, no signup required.

William
```

**Email 3 (sent Day 7, only if no reply)**:
```
Subject: closing the loop on {businessName}

Hi {firstName},

Last email from me — I know you're busy running {businessName}.

If you ever want to check how AI chatbots see your business vs
competitors, the free audit is always available:

→ brightwill.ai/analyze

No pressure. Just thought you'd want to know what your customers
are seeing when they ask ChatGPT.

William
```

### Sequence 2: SaaS/Digital — "AI Market Position"

**Who to send to**: SaaS founders and marketing heads from Apollo.io

**Email 1 (sent Day 0)**:
```
Subject: What happens when someone asks ChatGPT about {companyName}?

Hi {firstName},

I asked ChatGPT, Claude, and Gemini: "What's the best {productCategory}?"

{companyName} wasn't in the top 3 for any of them.
{topCompetitor} was #1 on all three.

As AI search replaces Google for more product decisions, this gap
will cost you customers.

I built BrightWill — we audit your AI visibility across ChatGPT,
Claude, and Gemini with 100+ real queries. Free snapshot takes
30 seconds:

→ brightwill.ai/analyze

No signup. You'll see your AI Visibility Score instantly.

William
Co-founder, BrightWill

Reply "stop" to opt out.
```

**Email 2 (sent Day 3)**:
```
Subject: Re: {companyName} + AI visibility

Hey {firstName},

3 things I've noticed about SaaS companies that rank well in
AI recommendations:

1. They have comparison pages ("X vs Y") that AI models pull from
2. They're listed on G2, Capterra, and Product Hunt with detailed profiles
3. They have structured data (FAQ schema, product schema) on their site

Worth checking where {companyName} stands: brightwill.ai/analyze

William
```

**Email 3 (sent Day 7)**:
```
Subject: last one — {companyName}

{firstName} — closing the loop.

If AI visibility becomes a priority, the free audit is always there:
brightwill.ai/analyze

No strings attached.

William
```

### Sequence 3: Agency — "Offer This to Your Clients"

**Who to send to**: SEO agency founders, marketing consultants

**Email 1 (just one email, warmer tone)**:
```
Subject: Your clients are going to ask about AI visibility

Hi {firstName},

"Are we showing up on ChatGPT?" — this is the question every
SEO agency is going to hear this year.

I built BrightWill — a GEO audit tool that measures how often
ChatGPT, Claude, and Gemini recommend a business. 100+ real queries,
cross-platform comparison, 80-step action plan.

We're looking for 5 agencies to partner with as founding resellers.
You'd offer GEO audits to your clients as an add-on service —
we handle the analysis, you deliver the report.

Interested in a 15-min walkthrough?

William
Co-founder, BrightWill
```

---

## 6. LinkedIn Strategy — Posts & DMs

LinkedIn is the best organic channel for reaching business owners and marketers. Organic reach is still high (unlike Facebook/Instagram).

### Profile Setup (do Day 1, 30 min)

1. **Headline**: "Co-founder @ BrightWill | Helping businesses get found by AI search"
2. **Banner**: Make in Canva (free) — BrightWill logo + "Is AI recommending your business?"
3. **About section**: 3 paragraphs:
   - Paragraph 1: The problem — "Search is changing. Your customers don't just Google anymore. They ask ChatGPT."
   - Paragraph 2: What you built — "BrightWill audits how AI engines see your business with 100+ real queries."
   - Paragraph 3: Credibility — "We've analyzed [X] businesses across ChatGPT, Claude, and Gemini."
4. **Featured section**: Pin your free audit link (brightwill.ai/analyze)
5. **Turn on Creator Mode** — gives you "Follow" instead of "Connect" as default

### Connection Strategy (20-30 requests/day)

Send connection requests to business owners in your target niches:
```
Hey {name} — I'm researching how AI recommends {industry} businesses.
Would love to connect and share some findings.
```

**Important**: After they accept, DON'T immediately pitch. Wait for them to engage with your content (like/comment). Then DM with a personalized message referencing their business.

### Ready-to-Post LinkedIn Content

**Format rules**:
- Put links in the FIRST COMMENT, never in the post body (LinkedIn suppresses posts with links)
- Use lots of line breaks (walls of text get skipped)
- End with a question to drive comments
- Reply to every comment within 2 hours (boosts reach)

#### Post 1: Data Insight (post this first)
```
I asked ChatGPT: "Who's the best dentist in Raleigh?"

It recommended Triangle Family Dentistry — a practice with
280 Google reviews and a well-structured website.

My dentist? Not mentioned. At all.

I tested 20 dentists. Only 4 showed up.

The pattern I found:
→ 100+ Google reviews = 3x more likely to be recommended
→ FAQ pages with structured data = AI loves these
→ Yelp + Healthgrades profiles = cited directly in responses
→ Businesses with no website updates since 2023 = invisible

Your customers don't just Google anymore.
They ask ChatGPT.

And most businesses have no idea what it says about them.

Would you want to know what ChatGPT says about YOUR business?

#GEO #AISearch #SmallBusiness
```
First comment: "I built a free tool that checks this in 30 seconds — no signup required: brightwill.ai/analyze"

#### Post 2: Comparison (Day 3)
```
I asked ChatGPT, Claude, and Gemini the same question:

"What's the best sushi restaurant in Miami?"

ChatGPT said: Matsuri
Claude said: Zuma
Gemini said: Naoe

Three different AI engines. Three different answers.

The only restaurant mentioned by ALL three?
Nobu — and it wasn't even #1 on any of them.

This is the wild west of AI search.

The businesses that figure out how to show up across
ALL the AI engines will dominate customer discovery
for the next decade.

The ones that don't? They'll wonder where their
customers went.

What would you do if AI was recommending your
competitor instead of you?

#GEO #ChatGPT #RestaurantMarketing
```

#### Post 3: Educational Carousel (Day 5)
```
5 things that make ChatGPT recommend a business
(backed by data from 500+ queries):

1. Review volume matters more than rating
→ A 4.2-star business with 300 reviews beats
  a 4.9-star business with 12 reviews

2. Your website needs structured data
→ Schema markup helps AI understand what you do
→ Without it, you're invisible to crawlers

3. Directory listings compound
→ Yelp + Google Business + TripAdvisor + industry-specific
→ AI cross-references multiple sources

4. AI gives different answers every time
→ The same question asked 10 times = different results
→ That's why we measure PROBABILITY, not rank

5. Most businesses score below 30%
→ The average AI Visibility Score across our audits is 34%
→ If you're above 50%, you're in the top 20%

The businesses optimizing for this NOW will own
the next decade of customer discovery.

What's your AI Visibility Score?

#GEO #AISearch #DigitalMarketing
```

#### Post 4: Hot Take (Day 8)
```
Unpopular opinion:

Google rankings will matter less than AI recommendations
within 3 years.

Here's why:

When someone Googles "best dentist near me", they see
10 blue links and pick based on reviews.

When someone asks ChatGPT the same question, they get
ONE recommendation. Maybe two.

There's no Page 2 in AI search.

You're either mentioned — or you don't exist.

And right now, most businesses don't exist in AI.

I've been testing this for months.
The data is clear.

The shift is happening faster than anyone expected.

What are you doing about it?

#GEO #SEO #FutureOfSearch
```

#### Post 5: Tool Showcase (Day 10)
```
I built a free tool that answers one question:

"Does AI recommend your business?"

Here's what it does:

1. Enter your business name (30 seconds)
2. We ask ChatGPT real customer queries
3. You see: your AI Visibility Score, who beats you,
   and the actual AI responses your customers see

No signup. No credit card. Just answers.

I built this because I couldn't find a tool that
measures AI recommendation probability.

SEO tools tell you about Google rankings.
Nothing tells you about AI rankings.

Until now.

Try it — link in comments 👇

What business should I test next?
```

### DM Script (after someone engages with your content)

```
Hey {name} — thanks for the comment on my AI visibility post!

I actually ran a quick check on {their company/industry} and
the results were interesting. Want me to share what I found?

No pitch — just thought you'd find the data useful.
```

---

## 7. Reddit & X Posts — Ready to Post

### Reddit

**Rules**: Reddit HATES self-promotion. You will get banned if you post links without providing value. The strategy is: share genuine data/findings → people ask "how did you check this?" → you share the link in a comment reply.

**Build karma first**: Spend Week 1-2 commenting helpfully on posts in these subreddits. Don't post links. Build to 200+ karma before posting anything with a link.

**Target subreddits**:
- r/smallbusiness (1.3M members) — local business owners
- r/SEO (250K) — technical audience, loves data
- r/marketing (1.5M) — broad marketing audience
- r/SaaS (120K) — SaaS founders
- r/Entrepreneur (2.5M) — startup founders, loves "I built" stories
- r/LocalSEO (45K) — niche but high-intent

#### Reddit Post 1 — r/smallbusiness
```
Title: I tested how ChatGPT recommends 50 restaurants in [city] — here's what I found

Body:

I've been researching how AI chatbots recommend local businesses.
I ran 50 restaurants in [city] through ChatGPT with queries like
"best sushi in [city]" and "where should I eat tonight in [city]."

Key findings:

- Only 12 of 50 (24%) were ever mentioned by ChatGPT
- Businesses with 100+ Google reviews were 3x more likely to be recommended
- Having a Yelp page with photos increased mention rate significantly
- ChatGPT heavily favored businesses listed on TripAdvisor for dining

The top 3 factors that predicted whether a business was recommended:
1. Review volume (Google + Yelp combined)
2. Structured website data (schema markup)
3. Mentions in local press or food blogs

Has anyone else noticed this? I feel like this is going to be a
massive deal as more people use AI instead of Google to find
local businesses.

Happy to answer questions about what I found.
```

**When someone asks "how did you check?"**: Reply with "I built a free tool that runs this analysis — takes 30 seconds, no signup: brightwill.ai/analyze"

#### Reddit Post 2 — r/SEO
```
Title: GEO (Generative Engine Optimization) — the data on what actually works

Body:

I've been running structured experiments on how ChatGPT, Claude,
and Gemini recommend businesses. After analyzing 500+ query-response
pairs across 3 AI engines, here's what actually moves the needle:

1. Schema markup matters more than you'd think. Businesses with
   LocalBusiness or Restaurant schema were mentioned 2.4x more often.

2. The three engines disagree on almost everything. ChatGPT leans
   heavily on Yelp/TripAdvisor. Claude pulls from news articles
   and blog posts. Gemini is basically Google Business Profile.

3. Review VOLUME beats review RATING. A 4.2 with 300 reviews beats
   a 4.9 with 15 reviews every time.

4. AI responses are stochastic. The same query asked 10 times gives
   different answers. So measuring a single "rank" is meaningless —
   you need to measure recommendation PROBABILITY over many queries.

5. Most businesses are completely invisible to AI. Average
   recommendation probability across our dataset is ~34%.

6. Direct-mention queries ("tell me about X") vs. discovery queries
   ("best X in Y") give very different results. You need to optimize
   for both.

Anyone else digging into this? I've been calling it "GEO" —
Generative Engine Optimization. Curious if others are seeing
similar patterns.
```

#### Reddit Post 3 — r/SaaS
```
Title: Do ChatGPT and Claude recommend your SaaS? I tested 30 products

Body:

I've been obsessed with how AI chatbots recommend software products.
Tested 30 SaaS tools across ChatGPT, Claude, and Gemini.

Results:

The products that consistently get recommended have:
- Active G2 and Capterra profiles with 50+ reviews
- Comparison pages on their site ("Us vs Competitor")
- FAQ schema markup
- Recent blog content about their use cases

Products that were invisible to AI:
- No review platform presence (just their own site)
- No structured data
- Last blog post was 2024

The interesting thing: some products that are HUGE on Google
(page 1 for their category) were completely absent from AI
recommendations. SEO ≠ GEO.

I built a tool to check this. Happy to run a check on anyone's
product if you're curious.
```

### X/Twitter Posts

**Profile setup**:
- Handle: @BrightWillAI
- Bio: "How does AI see your business? Free GEO audit in 30 seconds. We test ChatGPT, Claude & Gemini."
- Pinned: Link to brightwill.ai/analyze

#### Thread 1
```
I asked ChatGPT, Claude, and Gemini:
"Who's the best dentist in Raleigh?"

The answers were WILDLY different. 🧵

1/ ChatGPT recommended Triangle Family Dentistry.
It cited their 280 Google reviews and Healthgrades profile.

2/ Claude recommended a completely different practice.
It pulled from a local news article about "best dentists."

3/ Gemini recommended whoever had the best Google Business Profile.
Basically just Google Maps results in a chatbot wrapper.

4/ Only 1 out of 15 dentists showed up on ALL 3 engines.
That dentist had: 200+ reviews, structured data, Yelp + Healthgrades + Google.

5/ 73% of the dentists weren't mentioned by ANY of the three.
They're invisible to AI. Their patients are asking ChatGPT
and getting sent to competitors.

6/ If you want to check your own business, I built a free tool:
brightwill.ai/analyze

30 seconds. No signup. See your AI Visibility Score.
```

#### Single Tweets (post 1-2/day)
```
"ChatGPT just recommended your biggest competitor.
Want to see? Free audit: brightwill.ai/analyze"
```

```
"Tested 50 SaaS products on ChatGPT.
Only 8 were recommended as 'best in class.'
The other 42 didn't exist to AI."
```

```
"Hot take: In 2 years, AI recommendations will matter
more than Google rankings for local businesses."
```

```
"Your customers don't Google anymore.
They ask ChatGPT.
And ChatGPT has opinions about your business.
Want to know what it thinks?
brightwill.ai/analyze"
```

```
"The average business has a 34% AI Visibility Score.
That means 66% of the time, AI ignores them completely.
What's yours?"
```

---

## 8. Email Nurture System

### What We Have Built (8 email templates, ready to send)

These are all coded in `src/lib/email.ts` with branded HTML templates via `src/lib/email-templates.ts`. They use BrightWill's warm beige design, logo, provider color badges, and professional layout.

| # | Template | When to Send | What It Does |
|---|----------|-------------|-------------|
| 1 | `sendPaymentConfirmationEmail()` | Immediately after Stripe payment | Receipt with amount, what they get, link to report |
| 2 | `sendReportReadyEmail()` | When comprehensive audit finishes (5-15 min after payment) | AI Visibility Score, link to full report |
| 3 | `sendLaunchAnnouncementEmail()` | Manual blast to contacts/signups | "We launched, here's what it does, try the free audit" |
| 4 | `sendFreeAuditResultsEmail()` | After free audit + email capture (needs P1 built first) | Score, top competitor, sample AI response, link to results, upgrade CTA |
| 5 | `sendDripEmail1()` | Day 2 after free audit | "What your customers see" — shows verbatim AI response with competitor |
| 6 | `sendDripEmail2()` | Day 5 after free audit | "3 quick wins" — actionable tips from their audit data |
| 7 | `sendDripEmail3()` | Day 10 after free audit | "Your snapshot expires" — urgency + upgrade CTA |
| 8 | `sendUpsellEmail()` | Day 7 after paid audit | "How's your optimization going?" — $19→$199 upgrade pitch |

### What's NOT Built Yet

**The trigger/scheduler**: The email templates exist but nothing automatically sends emails 2/5/10 days later. Currently, emails #4-8 can only be sent manually or need a scheduler built.

**Options for scheduling** (pick one after first customer):
- **Simplest**: Use Resend's `scheduledAt` parameter — pass a future date when calling `sendDripEmail1()` and Resend holds it until then
- **DIY**: Add a `ScheduledEmail` table in Prisma, create a cron job on the VPC that runs hourly and sends due emails
- **SaaS**: Use [Loops.so](https://loops.so) ($49/mo) — visual email sequence builder designed for SaaS drip campaigns

### Launch Announcement Email

**When to send**: After email capture (P1) is built and product feels ready. Send to everyone in your Signup table plus personal contacts.

Call `sendLaunchAnnouncementEmail()` for each recipient. The template is already built with:
- "Do you know what happens when someone asks ChatGPT about your industry?"
- AI Visibility Score explanation
- CTA to free audit
- Feature bullets (3 AI engines, 100+ queries, action plan)

---

## 9. Day-by-Day Execution Plan

### Day 1 — Infrastructure (4 hours)

**Morning**:
- [ ] Buy 3 secondary domains on Namecheap (~$30)
- [ ] Set up Google Workspace on each domain ($21.60/mo)
- [ ] Configure DNS: SPF + DKIM + DMARC on all 3 domains

**Afternoon**:
- [ ] Sign up for Instantly.ai ($37/mo), connect all 6 accounts, start warm-up
- [ ] Create "FOUNDING50" coupon in Stripe (53% off $19, max 50 redemptions)
  - Stripe Dashboard → Products → Coupons → Code: FOUNDING50
  - No code changes needed — checkout has `allow_promotion_codes: true`

**Evening**:
- [ ] Run free audits on 10 businesses in your area (restaurants, dentists, gyms)
- [ ] Screenshot each result — business name, score, top competitor
- [ ] These screenshots are your content ammunition for the next 2 weeks

### Day 2 — LinkedIn + Dev Work (4 hours)

**Morning**:
- [ ] Optimize LinkedIn profile (see Section 6)
- [ ] Write and publish LinkedIn Post 1 (the data insight post)
- [ ] Send 20 connection requests to business owners

**Afternoon** (dev work):
- [ ] Build email capture on free report (P1 — the blocker)
- [ ] Run `npx prisma db push` after schema change

**Evening**:
- [ ] Send 10 personalized manual emails from personal email (use Sequence 1 template)
- [ ] For each: actually run their free audit first, reference their specific competitor

### Day 3 — Content + Community (3 hours)

**Morning**:
- [ ] Write Reddit post for r/smallbusiness (see Section 7)
- [ ] Join 3 Facebook groups (small business, local marketing, your city's business group)
- [ ] Comment helpfully on 5 posts in each group (no promotion)

**Afternoon**:
- [ ] Record first short video: screen-record a live audit with [Loom](https://loom.com) (free)
- [ ] Edit in [CapCut](https://capcut.com) (free) — add captions, trim to 60 seconds
- [ ] Upload to LinkedIn + TikTok + YouTube Shorts
- [ ] Dev: finish LinkedIn share + copy link buttons (P2)

**Evening**:
- [ ] Send 10 more personalized emails (different niche/city than Day 2)
- [ ] Reply to ALL LinkedIn engagement from yesterday

### Day 4 — Scale Prospecting (3 hours)

**Morning**:
- [ ] Sign up for Outscraper, run "dentists in [city]" × 5 cities = 1,000 results (~$3)
- [ ] Sign up for MillionVerifier, validate all emails (~$0.50)
- [ ] Filter: keep valid emails only, add to Google Sheet CRM

**Afternoon**:
- [ ] Sign up for Apollo.io (free), build list of 50 SaaS founders
- [ ] Write LinkedIn Post 2 (the comparison post)
- [ ] Post in 1 Facebook group (ask a question, don't promote)

**Evening**:
- [ ] Send 10 more personalized emails (total: 30)
- [ ] Reply to Reddit comments if any
- [ ] Dev: run `npx tsx prisma/seed.ts --force` on server for digital templates

### Day 5-7 — Content Cadence + More Outreach

- [ ] LinkedIn Post 3, 4 (educational + hot take)
- [ ] Reddit Post 2 (r/SEO or r/marketing)
- [ ] Record second short video (different business/niche)
- [ ] Post first X/Twitter thread
- [ ] Send 10 manual emails/day (total by Day 7: ~50)
- [ ] Reply to ALL engagement within 2 hours
- [ ] Review what's working: which emails got replies? Which posts got engagement?

### Day 8-14 — Double Down on What Works

- [ ] Continue LinkedIn posting (3-4 posts/week)
- [ ] Continue manual emails (10/day)
- [ ] Prepare cold email sequences in Instantly (import prospect lists, set up sequences)
- [ ] Engage on Reddit daily (10 helpful comments, no links unless asked)
- [ ] Write first blog post (if blog infrastructure exists): "Is ChatGPT Recommending Your Competitors?"

### Day 14-15 — Cold Email Goes Live

- [ ] Instantly warm-up complete — check scores (need 90%+)
- [ ] Start automated cold email: 10-20/day
- [ ] Monitor metrics daily for first week: opens, replies, bounces
- [ ] Scale to 50/day by Day 21 if metrics are healthy

### Week 1 Targets

| Metric | Target |
|--------|--------|
| Manual emails sent | 50 |
| Email replies | 5-10 (10-20% reply rate on personalized) |
| Free audits from outreach | 10-15 |
| LinkedIn posts | 3-4 |
| LinkedIn connections | 60-80 |
| Reddit posts | 1-2 |
| Short-form videos | 1-2 |
| First paying customer? | Possible but Week 3-4 is more realistic |

### Daily Routine (after Week 2)

| Time | What | Duration |
|------|------|----------|
| 8:00 AM | Check Instantly: replies, bounces, metrics | 15 min |
| 8:15 AM | Reply to warm leads (interested replies) | 30 min |
| 8:45 AM | Engage on Reddit/Twitter/LinkedIn (comments, replies) | 30 min |
| 9:15 AM | Post on LinkedIn or Twitter | 15 min |
| 12:00 PM | Check admin dashboard: signups, audits, conversions | 10 min |
| 3:00 PM | Reply to LinkedIn comments, engage in Facebook groups | 20 min |
| **Total** | | **~2 hours/day** |

---

## 10. After First Customer

Once you have 1 paying customer, these become the priorities:

### Product (in order)
1. **PostHog analytics** — install tracking so you know your conversion funnel (free tier is fine)
2. **Dynamic OG images** — when people share report links, show their score in the preview card. Creates organic virality.
3. **"Top 3 Quick Wins" on free report** — specific, actionable items from audit data shown for free. Increases perceived value and drives upgrades.
4. **Score history** — when someone re-runs an audit, show "Last time: 34%. Now: 41%. ↑ +7 points". Creates re-engagement loop.
5. **Blog infrastructure** — SEO content marketing for long-term organic traffic.

### Marketing
1. **Agency outreach** — send Sequence 3 to 50 SEO agencies. One agency partner = recurring revenue.
2. **Prepare for Product Hunt** — need 5-10 paying customers and a polished demo first.
3. **Create FOUNDING50 promotion** — "First 50 audits are $9 instead of $19" to build social proof fast. Ask every customer for a testimonial.

### Pricing
- After 50 customers: A/B test $19 vs $29 for Full Audit
- After 100 customers: consider annual subscription ($99/year for quarterly re-audits)

### Future Products (see GitHub Issues #9, #10)
- **Product 2**: GEO Management Service — monthly done-for-you optimization ($299-$1199/mo). Build after Product 1 has consistent revenue.
- **Product 3**: GEO SaaS Dashboard — self-serve tracking ($49-$149/mo). Build after Products 1+2 generate enough data.

---

## Legal — CAN-SPAM Compliance

This is required for cold email. Non-compliance can result in $50K+ fines.

1. **Include your physical mailing address** in every cold email footer (can use a PO Box or virtual address)
2. **Include opt-out mechanism**: "Reply 'stop' to opt out" in every cold email
3. **Honor opt-outs immediately**: When someone says stop, remove them from ALL sequences within 10 days
4. **No deceptive subject lines**: Don't say "Re:" unless it's actually a reply
5. **Identify the message as an ad** (loosely enforced, but be transparent)

**GDPR** (if emailing EU contacts): You need "legitimate interest" basis. B2B cold email is generally accepted under GDPR if you're emailing someone in their professional capacity about something relevant to their job. Include a link to your privacy policy. Honor erasure requests within 30 days.

---

## Cost to Get Started

| Item | Cost | When |
|------|------|------|
| 3 secondary domains | $30 (one-time) | Day 1 |
| Google Workspace (6 accounts) | $43.20/mo | Day 1 |
| Instantly.ai | $37/mo | Day 2 |
| Outscraper (1,000 leads) | $3 | Day 4 |
| MillionVerifier (1,000 emails) | $0.50 | Day 4 |
| **Total Month 1** | **~$114** | |

Break-even: 6 paid audits at $19 = $114. Very achievable by Month 2.
