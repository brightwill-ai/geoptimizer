import { Resend } from "resend";

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

// ─── Payment confirmation email ────────────────────────────────────────────────

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

  const strategyNote = params.priceTier === "audit_strategy"
    ? `<tr><td style="padding:16px 24px;background-color:rgba(124,58,237,0.06);border-radius:8px;margin-top:12px;"><p style="margin:0;font-size:13px;color:#6e6e80;line-height:1.6;"><strong style="color:#171717;">Strategy tier bonus:</strong> We'll reach out within 24 hours to schedule your 30-minute strategy call and set up your competitor monitoring dashboards.</p></td></tr>`
    : "";

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: `Payment confirmed — your ${tierName} for ${params.businessName}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3efe8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f3efe8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:32px;text-align:center;">
          <span style="font-size:20px;font-weight:600;color:#171717;letter-spacing:-0.02em;">BrightWill</span>
        </td></tr>
        <tr><td style="background-color:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:40px 32px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#171717;line-height:1.3;">
            Payment confirmed
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:#6e6e80;line-height:1.6;">
            ${greeting} Thank you for purchasing the <strong style="color:#171717;">${tierName}</strong> for <strong style="color:#171717;">${params.businessName}</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
            <tr><td style="background-color:#f7f7f8;border-radius:8px;padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:#8e8ea0;">What happens next</p>
              <p style="margin:0;font-size:14px;color:#171717;line-height:1.6;">
                Your comprehensive audit is running now — we're querying ChatGPT, Claude, and Gemini with 40+ real queries about your business. This typically takes <strong>5–15 minutes</strong>.
              </p>
              <p style="margin:12px 0 0;font-size:14px;color:#171717;line-height:1.6;">
                We'll send you another email with your full report link as soon as it's ready.
              </p>
            </td></tr>
          </table>
          ${strategyNote}
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#8e8ea0;line-height:1.5;">
            Questions? Reply to this email or reach us at support@brightwill.ai
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ─── Report ready email ────────────────────────────────────────────────────────

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

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const reportUrl = `${appUrl}/report/${params.shareToken}`;
  const probPct = Math.round(params.recommendationProbability * 100);

  await resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: `Your GEO report for ${params.businessName} is ready`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3efe8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f3efe8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:32px;text-align:center;">
          <span style="font-size:20px;font-weight:600;color:#171717;letter-spacing:-0.02em;">BrightWill</span>
        </td></tr>
        <tr><td style="background-color:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:40px 32px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#171717;line-height:1.3;">
            Your GEO report is ready
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#6e6e80;line-height:1.5;">
            We analyzed <strong style="color:#171717;">${params.businessName}</strong> across ChatGPT, Claude, and Gemini with 40+ queries.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
            <tr><td style="background-color:#f7f7f8;border-radius:8px;padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:#8e8ea0;">
                AI Recommendation Probability
              </p>
              <p style="margin:0;font-size:32px;font-weight:700;color:${probPct >= 60 ? "#16a34a" : probPct >= 30 ? "#d97706" : "#dc2626"};">
                ${probPct}%
              </p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr><td align="center">
              <a href="${reportUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#171717;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                View Your Report
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:#8e8ea0;text-align:center;line-height:1.5;">
            This report link is unique to your analysis and expires in 72 hours.
          </p>
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#8e8ea0;line-height:1.5;">
            Questions? Reply to this email or reach us at support@brightwill.ai
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
