import { Resend } from "resend";

let _resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

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

  const fromAddress = process.env.RESEND_FROM_EMAIL || "BrightWill <onboarding@resend.dev>";

  await resend.emails.send({
    from: fromAddress,
    to: params.to,
    subject: `Your GEO report for ${params.businessName} is ready`,
    html: buildEmailHtml({
      businessName: params.businessName,
      reportUrl,
      probPct,
    }),
  });
}

function buildEmailHtml(params: {
  businessName: string;
  reportUrl: string;
  probPct: number;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0c0d10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0c0d10;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">BrightWill</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#14151a;border:1px solid #22232a;border-radius:12px;padding:40px 32px;">

              <!-- Title -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3;">
                Your GEO report is ready
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.5;">
                We analyzed <strong style="color:#ffffff;">${params.businessName}</strong> across ChatGPT, Claude, and Gemini with 100+ queries.
              </p>

              <!-- Stat -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.04);border-radius:8px;padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);">
                      AI Recommendation Probability
                    </p>
                    <p style="margin:0;font-size:32px;font-weight:700;color:${params.probPct >= 60 ? "#16a34a" : params.probPct >= 30 ? "#d97706" : "#dc2626"};">
                      ${params.probPct}%
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <a href="${params.reportUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#ffffff;color:#0c0d10;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                      View Your Report
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.3);text-align:center;line-height:1.5;">
                This report link is unique to your analysis and expires in 72 hours.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.5;">
                Questions? Reply to this email or reach us at hello@brightwill.ai
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
