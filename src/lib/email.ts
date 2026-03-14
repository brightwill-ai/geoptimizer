import { Resend } from "resend";
import {
  buildEmail,
  emailHeading,
  emailText,
  emailBold,
  emailButton,
  emailButtonOutline,
  emailHighlightBox,
  emailScoreDisplay,
  emailProviderBadges,
  emailFeatureList,
  emailNumberedList,
  emailDivider,
  emailCompetitorCard,
  emailQuote,
  emailAlert,
  emailStatRow,
} from "./email-templates";

let _resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "BrightWill <onboarding@resend.dev>";
}

function getAppUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

// ─── 1. Payment confirmation email ────────────────────────────────────────────

interface PaymentConfirmationParams {
  to: string;
  name?: string;
  businessName: string;
  priceTier: string; // "full_audit" | "audit_strategy"
}

export async function sendPaymentConfirmationEmail(params: PaymentConfirmationParams): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set, skipping payment confirmation email");
    return;
  }

  const tierName = params.priceTier === "audit_strategy" ? "Audit + Strategy" : "Full GEO Audit";
  const greeting = params.name ? `Hi ${params.name},` : "Hi there,";

  const strategySection = params.priceTier === "audit_strategy"
    ? `${emailHighlightBox(`
        <p style="margin:0;font-size:13px;color:#6e6e80;line-height:1.6;">
          ${emailBold("Strategy tier bonus:")} We'll reach out within 24 hours to schedule your 30-minute strategy call and set up your competitor monitoring dashboards.
        </p>
      `, { borderLeft: "#7c3aed" })}`
    : "";

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: `Payment confirmed — your ${tierName} for ${params.businessName}`,
    html: buildEmail({
      cardContent: `
        ${emailHeading("Payment confirmed")}
        ${emailText(`${greeting} Thank you for purchasing the ${emailBold(tierName)} for ${emailBold(params.businessName)}.`)}
        ${emailProviderBadges()}
        ${emailHighlightBox(`
          <p style="margin:0 0 4px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:#8e8ea0;">What happens next</p>
          <p style="margin:0;font-size:14px;color:#171717;line-height:1.6;">
            Your comprehensive audit is running now — we're querying ChatGPT, Claude, and Gemini with ${emailBold("100+ real queries")} about your business. This typically takes ${emailBold("5–15 minutes")}.
          </p>
          <p style="margin:12px 0 0;font-size:14px;color:#171717;line-height:1.6;">
            We'll send you another email with your full report link as soon as it's ready.
          </p>
        `)}
        ${strategySection}
      `,
    }),
  });
}

// ─── 2. Report ready email ────────────────────────────────────────────────────

interface ReportEmailParams {
  to: string;
  businessName: string;
  shareToken: string;
  recommendationProbability: number; // 0-1
}

export async function sendReportReadyEmail(params: ReportEmailParams): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set, skipping email");
    return;
  }

  const reportUrl = `${getAppUrl()}/report/${params.shareToken}`;
  const probPct = Math.round(params.recommendationProbability * 100);

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: `Your GEO report for ${params.businessName} is ready`,
    html: buildEmail({
      cardContent: `
        ${emailHeading("Your GEO report is ready")}
        ${emailText(`We analyzed ${emailBold(params.businessName)} across ChatGPT, Claude, and Gemini with 100+ queries.`)}
        ${emailProviderBadges()}
        ${emailScoreDisplay(probPct, "AI Visibility Score")}
        ${emailButton("View Your Report", reportUrl)}
        ${emailText("This report link is unique to your analysis and expires in 72 hours.", { muted: true, small: true, center: true })}
      `,
    }),
  });
}

// ─── 3. Launch announcement email ─────────────────────────────────────────────

interface LaunchAnnouncementParams {
  to: string;
  name?: string;
}

export async function sendLaunchAnnouncementEmail(params: LaunchAnnouncementParams): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set, skipping launch email");
    return;
  }

  const analyzeUrl = `${getAppUrl()}/analyze`;
  const greeting = params.name ? `Hey ${params.name},` : "Hey there,";

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: "Search is changing. Is your business keeping up?",
    html: buildEmail({
      cardContent: `
        ${emailHeading("Search is changing.")}
        ${emailText(`${greeting}`)}
        ${emailText(`Your customers don't just Google anymore. They ask ChatGPT. They read AI Overviews. They pick businesses from AI recommendations.`)}
        ${emailText(`${emailBold("If your business isn't showing up — your competitors are.")}`)}
        ${emailDivider()}
        ${emailText(`We built BrightWill to answer a simple question: ${emailBold("Does AI recommend your business?")}`)}
        ${emailText(`It runs 100+ real queries across ChatGPT, Claude, and Gemini — the same questions your customers are asking — and shows you exactly how AI sees your business vs competitors.`)}
        ${emailProviderBadges()}
        ${emailHighlightBox(`
          <p style="margin:0;font-size:14px;color:#171717;line-height:1.6;">
            ${emailBold("The free audit takes 30 seconds.")} No signup. No credit card. You'll see your AI Visibility Score instantly.
          </p>
        `)}
        ${emailButton("Check your AI visibility — free", analyzeUrl)}
        ${emailDivider()}
        ${emailText(`Here's what you'll learn:`, { muted: false })}
        ${emailFeatureList([
          "Whether AI recommends you or your competitors",
          "Which AI engine likes you most (they often disagree)",
          "What sources AI pulls from when making recommendations",
          "Exactly what to fix to improve your visibility",
        ])}
        ${emailDivider()}
        ${emailText(`No agencies. No bloated tools. No monthly subscriptions.`, { muted: false })}
        ${emailText(`The full audit across all 3 AI engines is ${emailBold("$19 one-time")}. But start with the free snapshot first.`)}
        ${emailButton("Run free audit →", analyzeUrl)}
      `,
      unsubscribeUrl: `${getAppUrl()}/unsubscribe`,
    }),
  });
}

// ─── 4. Free audit results email (email capture follow-up) ───────────────────

interface FreeAuditResultsParams {
  to: string;
  name?: string;
  businessName: string;
  analysisId: string;
  probability: number; // 0-1
  topCompetitor?: string;
  totalQueries: number;
  mentionCount: number;
}

export async function sendFreeAuditResultsEmail(params: FreeAuditResultsParams): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set, skipping free audit results email");
    return;
  }

  const analyzeUrl = `${getAppUrl()}/analyze`;
  const probPct = Math.round(params.probability * 100);
  const greeting = params.name ? `Hi ${params.name},` : "Hi there,";

  const competitorSection = params.topCompetitor
    ? emailCompetitorCard(params.businessName, params.topCompetitor, probPct, Math.max(1, params.totalQueries - params.mentionCount))
    : "";

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: `Your AI Visibility Score: ${probPct}% — ${params.businessName}`,
    html: buildEmail({
      cardContent: `
        ${emailHeading(`Your AI visibility snapshot for ${params.businessName}`)}
        ${emailText(greeting)}
        ${emailText(`Here are your free audit results:`)}
        ${emailScoreDisplay(probPct)}
        ${emailStatRow([
          { label: "Queries Tested", value: String(params.totalQueries) },
          { label: "Times Mentioned", value: String(params.mentionCount) },
          { label: "Platform", value: "ChatGPT" },
        ])}
        ${competitorSection}
        ${probPct < 40
          ? emailAlert(`Your AI visibility needs work. ${params.topCompetitor ? `${params.topCompetitor} is significantly ahead of you in AI recommendations.` : "Most queries don't mention your business."}`, "warning")
          : probPct < 70
            ? emailAlert(`You're showing up, but there's room to improve.${params.topCompetitor ? ` ${params.topCompetitor} still has the edge.` : ""}`, "info")
            : emailAlert("Strong showing! You're well-positioned in AI recommendations.", "success")
        }
        ${emailDivider()}
        ${emailText(`Want the complete picture? Our ${emailBold("Full Audit")} tests 100+ queries across ${emailBold("all three AI engines")}:`)}
        ${emailFeatureList([
          "ChatGPT, Claude & Gemini — cross-platform comparison",
          "Source influence map — what drives AI recommendations",
          "80-step optimization action plan, prioritized by impact",
          "Downloadable PDF report & shareable link",
        ])}
        ${emailButton("Unlock full audit — $19", analyzeUrl)}
        ${emailText("One-time payment. No subscription. No upsells.", { muted: true, small: true, center: true })}
      `,
      unsubscribeUrl: `${getAppUrl()}/unsubscribe`,
    }),
  });
}

// ─── 5. Drip email 1: "What your customers see" (Day 2) ──────────────────────

interface DripEmail1Params {
  to: string;
  name?: string;
  businessName: string;
  sampleQuery: string;
  verbatimResponse: string;
  businessMentioned: boolean;
  topCompetitor?: string;
}

export async function sendDripEmail1(params: DripEmail1Params): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set, skipping drip email 1");
    return;
  }

  const analyzeUrl = `${getAppUrl()}/analyze`;
  const firstName = params.name?.split(" ")[0] || "there";

  const mentionResult = params.businessMentioned
    ? `You were mentioned, but ${params.topCompetitor ? `${emailBold(params.topCompetitor)} was recommended first` : "you weren't the top recommendation"}.`
    : `${emailBold(params.businessName)} wasn't mentioned at all.${params.topCompetitor ? ` ${emailBold(params.topCompetitor)} was.` : ""}`;

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: `This is what ChatGPT tells your customers`,
    html: buildEmail({
      cardContent: `
        ${emailHeading("This is what your customers see")}
        ${emailText(`Hey ${firstName},`)}
        ${emailText(`When someone asks ChatGPT "${emailBold(params.sampleQuery)}" — a real query from your audit — here's what they see:`)}
        ${emailQuote(params.verbatimResponse, "ChatGPT response")}
        ${emailAlert(mentionResult, params.businessMentioned ? "warning" : "warning")}
        ${emailDivider()}
        ${emailText(`The free snapshot only tested ChatGPT. Our ${emailBold("Full Audit")} reveals:`)}
        ${emailFeatureList([
          "How Claude and Gemini see you (often very different from ChatGPT)",
          "Which sources AI pulls from (Yelp? Google? News? Blogs?)",
          "An 80-step action plan to improve your visibility",
        ])}
        ${emailButton("Get the full picture — $19", analyzeUrl)}
      `,
      unsubscribeUrl: `${getAppUrl()}/unsubscribe`,
    }),
  });
}

// ─── 6. Drip email 2: "3 quick wins" (Day 5) ─────────────────────────────────

interface DripEmail2Params {
  to: string;
  name?: string;
  businessName: string;
  quickWins: string[]; // 3 specific, actionable tips
}

export async function sendDripEmail2(params: DripEmail2Params): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set, skipping drip email 2");
    return;
  }

  const analyzeUrl = `${getAppUrl()}/analyze`;
  const firstName = params.name?.split(" ")[0] || "there";

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: `3 things you can do TODAY to improve AI visibility`,
    html: buildEmail({
      cardContent: `
        ${emailHeading("3 quick wins for your AI visibility")}
        ${emailText(`Hey ${firstName},`)}
        ${emailText(`Based on your GEO snapshot, here are 3 things you can do ${emailBold("today")} to improve how AI sees ${emailBold(params.businessName)}:`)}
        ${emailNumberedList(params.quickWins)}
        ${emailAlert("These are free to implement and can improve your visibility within weeks.", "success")}
        ${emailDivider()}
        ${emailText(`These 3 items are just the start. Our Full Audit includes a personalized ${emailBold("80-step action plan")} — prioritized by impact, with effort estimates for each item.`)}
        ${emailButton("Get your full action plan — $19", analyzeUrl)}
        ${emailText("One-time payment. No subscription.", { muted: true, small: true, center: true })}
      `,
      unsubscribeUrl: `${getAppUrl()}/unsubscribe`,
    }),
  });
}

// ─── 7. Drip email 3: "Snapshot expires" (Day 10) ─────────────────────────────

interface DripEmail3Params {
  to: string;
  name?: string;
  businessName: string;
  topCompetitor?: string;
  analyzeUrl?: string;
}

export async function sendDripEmail3(params: DripEmail3Params): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set, skipping drip email 3");
    return;
  }

  const analyzeUrl = params.analyzeUrl || `${getAppUrl()}/analyze`;
  const firstName = params.name?.split(" ")[0] || "there";

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: `Your GEO snapshot expires soon`,
    html: buildEmail({
      cardContent: `
        ${emailHeading("Your snapshot expires in 14 days")}
        ${emailText(`Hey ${firstName},`)}
        ${emailText(`Quick heads up — your free GEO snapshot for ${emailBold(params.businessName)} expires in 14 days.`)}
        ${params.topCompetitor
          ? emailAlert(`Since your audit, ${emailBold(params.topCompetitor)} has likely continued building their AI presence. The gap may be widening.`, "warning")
          : emailText("AI models update their knowledge constantly — your visibility may have changed.")
        }
        ${emailDivider()}
        ${emailText("Before it expires, you might want to:")}
        ${emailNumberedList([
          "Screenshot your results for reference",
          "Run a fresh audit to see if your score has changed",
          "Upgrade to the Full Audit for a complete cross-platform analysis",
        ])}
        ${emailButton("Run a fresh audit — free", analyzeUrl)}
        ${emailButtonOutline("Upgrade to Full Audit — $19", analyzeUrl)}
      `,
      unsubscribeUrl: `${getAppUrl()}/unsubscribe`,
    }),
  });
}

// ─── 8. Upsell email (Day 7 after paid audit) ────────────────────────────────

interface UpsellEmailParams {
  to: string;
  name?: string;
  businessName: string;
  reportUrl: string;
  probability: number; // 0-1
}

export async function sendUpsellEmail(params: UpsellEmailParams): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set, skipping upsell email");
    return;
  }

  const firstName = params.name?.split(" ")[0] || "there";
  const probPct = Math.round(params.probability * 100);

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: `How's your GEO optimization going?`,
    html: buildEmail({
      cardContent: `
        ${emailHeading("How's your optimization going?")}
        ${emailText(`Hey ${firstName},`)}
        ${emailText(`It's been a week since your GEO audit for ${emailBold(params.businessName)}. Have you started on the action plan?`)}
        ${emailScoreDisplay(probPct, "Your current AI Visibility Score")}
        ${emailText("Here's how to get the most from your report:")}
        ${emailNumberedList([
          `${emailBold("Start with the Action Plan tab")} — focus on the first 5 "High Priority" items`,
          `${emailBold("Check the Sources tab")} — make sure your profiles are up to date on the sites AI pulls from`,
          `${emailBold("Review the Evidence tab")} — read the actual AI responses to see what your customers see`,
          `${emailBold("Share your report")} — forward the link to your marketing team or web developer`,
        ])}
        ${emailButton("View your report", params.reportUrl)}
        ${emailDivider()}
        ${emailText("Want help executing? Our Strategy plan includes:")}
        ${emailFeatureList([
          "30-minute call to prioritize what matters for YOUR business",
          "Custom execution roadmap built together",
          "Monthly re-audits to track your progress",
          "3 competitor monitoring dashboards",
        ])}
        ${emailButton("Upgrade to Strategy — $199", `${getAppUrl()}/analyze`)}
        ${emailText("Questions? Reply to this email — I read every response.", { muted: true, small: true, center: true })}
      `,
      unsubscribeUrl: `${getAppUrl()}/unsubscribe`,
    }),
  });
}
