// ─── Shared email HTML components ──────────────────────────────────────────────
// Professional branded email templates matching BrightWill's warm beige design system.
// All components return HTML strings for use with Resend's html parameter.

function getAppUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

// ─── Brand constants ──────────────────────────────────────────────────────────

const COLORS = {
  pageBg: "#f3efe8",
  cardBg: "#ffffff",
  elevatedBg: "#f7f7f8",
  border: "#e5e5e5",
  textPrimary: "#171717",
  textSecondary: "#6e6e80",
  textMuted: "#8e8ea0",
  buttonBg: "#171717",
  buttonText: "#ffffff",
  accentGreen: "#16a34a",
  accentAmber: "#d97706",
  accentRed: "#dc2626",
  chatgpt: "#10a37f",
  claude: "#c084fc",
  gemini: "#4285f4",
  blushStart: "#f0a070",
  blushEnd: "#f490b0",
} as const;

const FONT_STACK = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;

// ─── Core layout ──────────────────────────────────────────────────────────────

export function emailDocument(content: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>BrightWill</title>
  <!--[if mso]>
  <style>table,td,div,p,a,span{font-family:Arial,Helvetica,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLORS.pageBg};font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  ${content}
</body>
</html>`;
}

export function emailWrapper(content: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${COLORS.pageBg};">
    <tr><td align="center" style="padding:0 20px;">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
        ${content}
      </table>
    </td></tr>
  </table>`;
}

// ─── Header with accent bar + logo ────────────────────────────────────────────

export function emailHeader(): string {
  const logoUrl = `${getAppUrl()}/logo.png`;
  return `
    <!-- Accent bar -->
    <tr><td style="height:4px;background:linear-gradient(90deg, ${COLORS.blushStart}, ${COLORS.blushEnd});border-radius:4px 4px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
    <!-- Spacer -->
    <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
    <!-- Logo -->
    <tr><td align="center" style="padding-bottom:32px;">
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding-right:10px;vertical-align:middle;">
            <img src="${logoUrl}" alt="BrightWill" width="32" height="32" style="display:block;border:0;outline:none;border-radius:6px;" />
          </td>
          <td style="vertical-align:middle;">
            <span style="font-size:20px;font-weight:600;color:${COLORS.textPrimary};letter-spacing:-0.02em;text-decoration:none;">BrightWill</span>
          </td>
        </tr>
      </table>
    </td></tr>`;
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export function emailFooter(options?: { unsubscribeUrl?: string }): string {
  const appUrl = getAppUrl();
  return `
    <tr><td style="padding:32px 0 8px;">
      <!-- Divider -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr><td style="height:1px;background-color:${COLORS.border};font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:16px 0 40px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:500;color:${COLORS.textSecondary};letter-spacing:-0.01em;">BrightWill</p>
      <p style="margin:0 0 12px;font-size:12px;color:${COLORS.textMuted};line-height:1.5;">
        Get found by AI &mdash; Audit your visibility on ChatGPT, Claude &amp; Gemini
      </p>
      <p style="margin:0;font-size:12px;color:${COLORS.textMuted};line-height:1.5;">
        <a href="${appUrl}" style="color:${COLORS.textMuted};text-decoration:underline;">brightwill.ai</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:support@brightwill.ai" style="color:${COLORS.textMuted};text-decoration:underline;">Support</a>
        ${options?.unsubscribeUrl ? `&nbsp;&middot;&nbsp;<a href="${options.unsubscribeUrl}" style="color:${COLORS.textMuted};text-decoration:underline;">Unsubscribe</a>` : ""}
      </p>
    </td></tr>`;
}

// ─── White card container ─────────────────────────────────────────────────────

export function emailCard(content: string): string {
  return `<tr><td style="background-color:${COLORS.cardBg};border:1px solid ${COLORS.border};border-radius:12px;padding:40px 32px;">
    ${content}
  </td></tr>`;
}

// ─── Elevated highlight box (gray bg) ─────────────────────────────────────────

export function emailHighlightBox(content: string, options?: { borderLeft?: string }): string {
  const borderLeftStyle = options?.borderLeft ? `border-left:3px solid ${options.borderLeft};` : "";
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
    <tr><td style="background-color:${COLORS.elevatedBg};border-radius:8px;padding:20px 24px;${borderLeftStyle}">
      ${content}
    </td></tr>
  </table>`;
}

// ─── CTA Button ───────────────────────────────────────────────────────────────

export function emailButton(text: string, url: string, options?: { color?: string; fullWidth?: boolean }): string {
  const bgColor = options?.color || COLORS.buttonBg;
  const widthStyle = options?.fullWidth ? "display:block;text-align:center;" : "display:inline-block;";
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
    <tr><td align="center">
      <a href="${url}" target="_blank" style="${widthStyle}padding:14px 32px;background-color:${bgColor};color:${COLORS.buttonText};font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
        ${text}
      </a>
    </td></tr>
  </table>`;
}

// ─── Secondary button (outline) ───────────────────────────────────────────────

export function emailButtonOutline(text: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
    <tr><td align="center">
      <a href="${url}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:${COLORS.cardBg};color:${COLORS.textPrimary};font-size:13px;font-weight:500;text-decoration:none;border-radius:8px;border:1px solid ${COLORS.border};">
        ${text}
      </a>
    </td></tr>
  </table>`;
}

// ─── Heading ──────────────────────────────────────────────────────────────────

export function emailHeading(text: string, options?: { size?: "lg" | "md" | "sm" }): string {
  const sizes = { lg: "24px", md: "20px", sm: "16px" };
  const fontSize = sizes[options?.size || "lg"];
  return `<p style="margin:0 0 8px;font-size:${fontSize};font-weight:600;color:${COLORS.textPrimary};line-height:1.3;letter-spacing:-0.02em;">${text}</p>`;
}

// ─── Body text ────────────────────────────────────────────────────────────────

export function emailText(text: string, options?: { muted?: boolean; small?: boolean; center?: boolean }): string {
  const color = options?.muted ? COLORS.textMuted : COLORS.textSecondary;
  const fontSize = options?.small ? "12px" : "14px";
  const align = options?.center ? "text-align:center;" : "";
  return `<p style="margin:0 0 16px;font-size:${fontSize};color:${color};line-height:1.6;${align}">${text}</p>`;
}

// ─── Bold inline text helper ──────────────────────────────────────────────────

export function emailBold(text: string): string {
  return `<strong style="color:${COLORS.textPrimary};">${text}</strong>`;
}

// ─── AI Visibility Score display ──────────────────────────────────────────────

export function emailScoreDisplay(score: number, label?: string): string {
  const color = score >= 60 ? COLORS.accentGreen : score >= 30 ? COLORS.accentAmber : COLORS.accentRed;
  return emailHighlightBox(`
    <p style="margin:0 0 4px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.textMuted};">
      ${label || "AI Visibility Score"}
    </p>
    <p style="margin:0;font-size:36px;font-weight:700;color:${color};line-height:1.2;">
      ${score}%
    </p>
  `);
}

// ─── Provider badges row ──────────────────────────────────────────────────────

export function emailProviderBadges(options?: { active?: ("chatgpt" | "claude" | "gemini")[] }): string {
  const providers = [
    { key: "chatgpt", label: "ChatGPT", color: COLORS.chatgpt },
    { key: "claude", label: "Claude", color: COLORS.claude },
    { key: "gemini", label: "Gemini", color: COLORS.gemini },
  ];

  const badges = providers.map((p) => {
    const isActive = !options?.active || options.active.includes(p.key as "chatgpt" | "claude" | "gemini");
    const opacity = isActive ? "1" : "0.4";
    return `<td style="padding:0 4px;">
      <span style="display:inline-block;padding:4px 12px;background-color:${p.color};opacity:${opacity};color:#ffffff;font-size:11px;font-weight:600;border-radius:999px;letter-spacing:0.02em;">
        ${p.label}
      </span>
    </td>`;
  }).join("");

  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
    <tr>${badges}</tr>
  </table>`;
}

// ─── Feature / checklist ──────────────────────────────────────────────────────

export function emailFeatureList(items: string[]): string {
  const rows = items.map((item) => `
    <tr>
      <td style="padding:6px 0;vertical-align:top;width:24px;">
        <span style="display:inline-block;width:18px;height:18px;background-color:${COLORS.accentGreen};border-radius:50%;text-align:center;line-height:18px;font-size:11px;color:#ffffff;">&#10003;</span>
      </td>
      <td style="padding:6px 0 6px 8px;font-size:14px;color:${COLORS.textPrimary};line-height:1.5;">
        ${item}
      </td>
    </tr>
  `).join("");

  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;width:100%;">
    ${rows}
  </table>`;
}

// ─── Numbered list ────────────────────────────────────────────────────────────

export function emailNumberedList(items: string[]): string {
  const rows = items.map((item, i) => `
    <tr>
      <td style="padding:8px 0;vertical-align:top;width:28px;">
        <span style="display:inline-block;width:22px;height:22px;background-color:${COLORS.elevatedBg};border:1px solid ${COLORS.border};border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:600;color:${COLORS.textPrimary};">${i + 1}</span>
      </td>
      <td style="padding:8px 0 8px 10px;font-size:14px;color:${COLORS.textSecondary};line-height:1.6;">
        ${item}
      </td>
    </tr>
  `).join("");

  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;width:100%;">
    ${rows}
  </table>`;
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function emailDivider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
    <tr><td style="height:1px;background-color:${COLORS.border};font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;
}

// ─── Spacer ───────────────────────────────────────────────────────────────────

export function emailSpacer(height: number = 16): string {
  return `<tr><td style="height:${height}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

// ─── Competitor comparison card ───────────────────────────────────────────────

export function emailCompetitorCard(yourBusiness: string, competitor: string, yourScore: number, competitorMentions: number): string {
  const yourColor = yourScore >= 60 ? COLORS.accentGreen : yourScore >= 30 ? COLORS.accentAmber : COLORS.accentRed;
  return emailHighlightBox(`
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td width="48%" style="vertical-align:top;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.textMuted};">Your business</p>
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${COLORS.textPrimary};line-height:1.3;">${yourBusiness}</p>
          <p style="margin:0;font-size:24px;font-weight:700;color:${yourColor};">${yourScore}%</p>
        </td>
        <td width="4%" style="vertical-align:middle;text-align:center;">
          <span style="font-size:16px;color:${COLORS.textMuted};">vs</span>
        </td>
        <td width="48%" style="vertical-align:top;text-align:right;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.textMuted};">Top competitor</p>
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${COLORS.textPrimary};line-height:1.3;">${competitor}</p>
          <p style="margin:0;font-size:14px;color:${COLORS.textSecondary};">Mentioned ${competitorMentions}x more</p>
        </td>
      </tr>
    </table>
  `);
}

// ─── Quote / verbatim AI response ─────────────────────────────────────────────

export function emailQuote(text: string, attribution?: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
    <tr><td style="border-left:3px solid ${COLORS.border};padding:12px 20px;background-color:${COLORS.elevatedBg};border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:13px;color:${COLORS.textSecondary};line-height:1.6;font-style:italic;">
        "${text}"
      </p>
      ${attribution ? `<p style="margin:8px 0 0;font-size:12px;color:${COLORS.textMuted};">— ${attribution}</p>` : ""}
    </td></tr>
  </table>`;
}

// ─── Warning / alert box ──────────────────────────────────────────────────────

export function emailAlert(text: string, type: "warning" | "info" | "success" = "warning"): string {
  const colors = {
    warning: { bg: "#fffbeb", border: COLORS.accentAmber, icon: "&#9888;" },
    info: { bg: "#eff6ff", border: COLORS.gemini, icon: "&#8505;" },
    success: { bg: "#f0fdf4", border: COLORS.accentGreen, icon: "&#10003;" },
  };
  const c = colors[type];
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
    <tr><td style="background-color:${c.bg};border-left:3px solid ${c.border};border-radius:0 8px 8px 0;padding:14px 20px;">
      <p style="margin:0;font-size:13px;color:${COLORS.textPrimary};line-height:1.6;">
        <span style="margin-right:6px;">${c.icon}</span> ${text}
      </p>
    </td></tr>
  </table>`;
}

// ─── Two-column stat row ──────────────────────────────────────────────────────

export function emailStatRow(stats: { label: string; value: string; color?: string }[]): string {
  const cols = stats.map((s) => `
    <td style="padding:12px 16px;text-align:center;vertical-align:top;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.textMuted};">${s.label}</p>
      <p style="margin:0;font-size:20px;font-weight:700;color:${s.color || COLORS.textPrimary};">${s.value}</p>
    </td>
  `).join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;background-color:${COLORS.elevatedBg};border-radius:8px;">
    <tr>${cols}</tr>
  </table>`;
}

// ─── Image with caption ───────────────────────────────────────────────────────

export function emailImage(src: string, alt: string, options?: { width?: number; caption?: string; rounded?: boolean }): string {
  const width = options?.width || 520;
  const borderRadius = options?.rounded ? "border-radius:8px;" : "";
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
    <tr><td align="center">
      <img src="${src}" alt="${alt}" width="${width}" style="display:block;max-width:100%;height:auto;border:0;outline:none;${borderRadius}" />
      ${options?.caption ? `<p style="margin:8px 0 0;font-size:12px;color:${COLORS.textMuted};text-align:center;">${options.caption}</p>` : ""}
    </td></tr>
  </table>`;
}

// ─── Pre-composed full email builder ──────────────────────────────────────────

export function buildEmail(options: {
  cardContent: string;
  unsubscribeUrl?: string;
}): string {
  return emailDocument(
    emailWrapper(`
      ${emailHeader()}
      ${emailCard(options.cardContent)}
      ${emailFooter({ unsubscribeUrl: options.unsubscribeUrl })}
    `)
  );
}
