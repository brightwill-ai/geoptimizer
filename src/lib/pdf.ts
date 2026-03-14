import { jsPDF } from "jspdf";
import type { GEOAnalysis, ActionPlan } from "./mock-data";
import {
  getAnalysisSnapshot,
  getReportSnapshot,
  getQueryTypeStats,
  type AnalysisSnapshot,
} from "./report-insights";

// ── Colors ──
type RGB = [number, number, number];

const C = {
  black: [20, 21, 26] as RGB,
  text: [40, 42, 48] as RGB,
  sub: [100, 102, 110] as RGB,
  muted: [150, 152, 158] as RGB,
  border: [215, 217, 222] as RGB,
  bgLight: [245, 246, 248] as RGB,
  bgRow: [250, 250, 252] as RGB,
  bgHeader: [235, 237, 240] as RGB,
  green: [22, 163, 74] as RGB,
  greenBg: [232, 248, 238] as RGB,
  amber: [180, 100, 6] as RGB,
  amberBg: [254, 243, 224] as RGB,
  red: [200, 38, 38] as RGB,
  redBg: [254, 230, 230] as RGB,
};

const PROV_COLOR: Record<string, RGB> = {
  chatgpt: [16, 140, 110],
  claude: [140, 80, 220],
  gemini: [50, 110, 220],
};

const PROV_BG: Record<string, RGB> = {
  chatgpt: [225, 245, 238],
  claude: [240, 228, 252],
  gemini: [225, 237, 253],
};

function toneColor(tone: string): RGB {
  if (tone === "positive") return C.green;
  if (tone === "negative") return C.red;
  return C.amber;
}

// ── Public API ──

export async function generateReportPDF(
  analysis: GEOAnalysis,
  actionPlan?: ActionPlan | null
): Promise<void> {
  const builder = new PDFBuilder(analysis, actionPlan ?? null);
  builder.build();
}

// ── PDF Builder ──

class PDFBuilder {
  private doc: jsPDF;
  private y = 0;
  private readonly W = 210;
  private readonly H = 297;
  private readonly M = 20;
  private readonly CW = 170; // W - 2*M
  private readonly snap: AnalysisSnapshot;

  constructor(
    private analysis: GEOAnalysis,
    private actionPlan: ActionPlan | null,
  ) {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.snap = getAnalysisSnapshot(analysis);
  }

  // ── Utility ──

  private ensureSpace(needed: number) {
    if (this.y + needed > this.H - 20) {
      this.doc.addPage();
      this.pageHeader();
      this.y = 35;
    }
  }

  private pageHeader() {
    this.doc.setFillColor(...C.green);
    this.doc.rect(0, 0, this.W, 1.2, "F");

    this.doc.setFontSize(7);
    this.doc.setTextColor(...C.muted);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("BRIGHTWILL", this.M, 9);
    this.doc.text(
      `GEO Analysis  --  ${this.analysis.businessName}`,
      this.W - this.M, 9, { align: "right" }
    );

    this.doc.setDrawColor(...C.border);
    this.doc.setLineWidth(0.25);
    this.doc.line(this.M, 13, this.W - this.M, 13);
  }

  private addFooters() {
    const total = this.doc.getNumberOfPages();
    for (let i = 2; i <= total; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(7);
      this.doc.setTextColor(...C.muted);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `Page ${i - 1} of ${total - 1}`,
        this.W / 2,
        this.H - 10,
        { align: "center" }
      );
    }
  }

  private fit(text: string, colWidth: number): string {
    const maxChars = Math.floor((colWidth - 6) / 1.7);
    if (text.length <= maxChars) return text;
    return text.substring(0, Math.max(maxChars - 3, 4)) + "...";
  }

  // Accurate fit using jsPDF text measurement — call only after setting font+size
  private fitText(text: string, maxWidth: number): string {
    if (this.doc.getTextWidth(text) <= maxWidth) return text;
    let t = text;
    while (t.length > 4 && this.doc.getTextWidth(t + "...") > maxWidth) {
      t = t.slice(0, -1);
    }
    return t + "...";
  }

  // ── Drawing primitives ──

  private sectionTitle(text: string) {
    this.ensureSpace(24);
    this.y += 8;
    this.doc.setFontSize(7);
    this.doc.setTextColor(...C.muted);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(text.toUpperCase(), this.M, this.y);
    this.y += 2.5;
    this.doc.setDrawColor(...C.border);
    this.doc.setLineWidth(0.25);
    this.doc.line(this.M, this.y, this.W - this.M, this.y);
    this.y += 8;
  }

  private h2(text: string, size = 12) {
    this.ensureSpace(10);
    this.doc.setFontSize(size);
    this.doc.setTextColor(...C.black);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(text, this.M, this.y);
    this.y += size * 0.45 + 3;
  }

  private para(text: string, x: number, maxWidth: number, fontSize: number, color: RGB = C.text, fontStyle: string = "normal", maxLines?: number) {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...color);
    this.doc.setFont("helvetica", fontStyle);
    let lines = this.doc.splitTextToSize(text, maxWidth);
    if (maxLines && maxLines > 0) {
      lines = lines.slice(0, maxLines);
    }
    for (const line of lines) {
      this.ensureSpace(fontSize * 0.35 + 2);
      this.doc.text(line as string, x, this.y);
      this.y += (fontSize * 0.35 + 1.2);
    }
  }

  private body(text: string, indent = 0) {
    this.para(text, this.M + indent, this.CW - indent, 9, C.text, "normal");
    this.y += 2;
  }

  private statRow(items: { label: string; value: string; color?: RGB }[]) {
    if (items.length === 0) return;
    const gap = 4;
    const boxW = (this.CW - gap * (items.length - 1)) / items.length;
    const boxH = 18;

    this.ensureSpace(boxH + 4);

    for (let i = 0; i < items.length; i++) {
      const x = this.M + i * (boxW + gap);
      const item = items[i];

      const bg = item.color
        ? (PROV_BG[item.label.toLowerCase()] ?? C.bgLight)
        : C.bgLight;
      this.doc.setFillColor(...bg);
      this.doc.roundedRect(x, this.y, boxW, boxH, 2, 2, "F");

      if (item.color) {
        this.doc.setFillColor(...item.color);
        this.doc.rect(x, this.y + 2, 2.5, boxH - 4, "F");
      }

      const textX = x + (item.color ? 8 : 6);
      const textMaxW = boxW - (item.color ? 11 : 8);

      this.doc.setFontSize(7);
      this.doc.setTextColor(...C.sub);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(this.fitText(item.label, textMaxW), textX, this.y + 7);

      this.doc.setFontSize(13);
      this.doc.setTextColor(...(item.color ?? C.black));
      this.doc.setFont("helvetica", "bold");
      this.doc.text(this.fitText(item.value, textMaxW), textX, this.y + 14.5);
    }

    this.y += boxH + 6;
  }

  private table(headers: string[], rows: string[][], widths: number[]) {
    const rh = 7.5;
    const pad = 3;

    this.ensureSpace(rh * 2);

    // Header row
    this.doc.setFillColor(...C.bgHeader);
    this.doc.rect(this.M, this.y, this.CW, rh, "F");

    this.doc.setFontSize(7);
    this.doc.setTextColor(...C.sub);
    this.doc.setFont("helvetica", "bold");

    let xPos = this.M + pad;
    for (let i = 0; i < headers.length; i++) {
      const cellText = this.fit(headers[i], widths[i]);
      this.doc.text(cellText, xPos, this.y + 5);
      xPos += widths[i];
    }
    this.y += rh;

    // Data rows
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);

    for (let r = 0; r < rows.length; r++) {
      this.ensureSpace(rh);

      if (r % 2 === 1) {
        this.doc.setFillColor(...C.bgRow);
        this.doc.rect(this.M, this.y, this.CW, rh, "F");
      }

      this.doc.setDrawColor(235, 237, 240);
      this.doc.setLineWidth(0.15);
      this.doc.line(this.M, this.y + rh, this.M + this.CW, this.y + rh);

      this.doc.setTextColor(...C.text);
      xPos = this.M + pad;
      for (let i = 0; i < rows[r].length; i++) {
        const cellText = this.fit(rows[r][i], widths[i]);
        this.doc.text(cellText, xPos, this.y + 5);
        xPos += widths[i];
      }
      this.y += rh;
    }
    this.y += 5;
  }

  private bullet(title: string, detail: string, color: RGB) {
    this.ensureSpace(14);

    this.doc.setFillColor(...color);
    this.doc.circle(this.M + 2, this.y - 1, 1.2, "F");

    this.para(title, this.M + 7, this.CW - 10, 8.5, C.black, "bold");
    this.y -= 0.2; // Adjust spacing slightly between title and detail
    this.para(detail, this.M + 7, this.CW - 10, 7.5, C.sub, "normal");
    this.y += 3;
  }

  // ── Sections ──

  private cover() {
    // Top accent bar
    this.doc.setFillColor(...C.green);
    this.doc.rect(0, 0, this.W, 3.5, "F");

    // Brand
    this.doc.setFontSize(10);
    this.doc.setTextColor(...C.green);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("BRIGHTWILL", this.M, 26);

    // Business name
    this.y = 56;
    this.para(this.analysis.businessName, this.M, this.CW, 28, C.black, "bold");
    this.y += 2;

    // Subtitle
    this.y += 1;
    this.doc.setFontSize(15);
    this.doc.setTextColor(...C.sub);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("GEO Analysis Report", this.M, this.y);
    this.y += 10;

    // Green accent line
    this.doc.setFillColor(...C.green);
    this.doc.rect(this.M, this.y, 36, 1, "F");
    this.y += 14;

    // Metadata
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const providers = this.analysis.methodology.providers
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(", ");

    const meta: [string, string][] = [
      ["Generated", date],
      ["AI Providers", providers],
      ["Total Queries", String(this.analysis.methodology.totalQueries)],
      ["Query Types", String(this.analysis.methodology.queryTypes.length)],
      ["Visibility", `${Math.round(this.snap.averageProbability * 100)}% average AI visibility score`],
    ];

    this.doc.setFontSize(9);
    for (const [label, value] of meta) {
      this.doc.setTextColor(...C.sub);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(label, this.M, this.y);
      this.doc.setTextColor(...C.text);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(value, this.M + 38, this.y);
      this.y += 7;
    }

    // Bottom disclaimer
    if (this.analysis.methodology.disclaimer) {
      this.para(this.analysis.methodology.disclaimer, this.M, this.CW, 7, C.muted, "italic");
    }

    this.doc.setFontSize(7);
    this.doc.setTextColor(...C.muted);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("brightwill.com", this.M, this.H - 14);
  }

  private summary() {
    this.doc.addPage();
    this.pageHeader();
    this.y = 28;

    this.sectionTitle("Executive Summary");

    const snap = this.snap;
    const prob = Math.round(snap.averageProbability * 100);
    const vis = snap.visibility;
    const visColor = vis.label === "Strong" ? C.green
      : vis.label === "Mixed" ? C.amber : C.red;
    const visBg = vis.label === "Strong" ? C.greenBg
      : vis.label === "Mixed" ? C.amberBg : C.redBg;

    // Big stat block
    this.ensureSpace(28);
    this.doc.setFillColor(...visBg);
    this.doc.roundedRect(this.M, this.y, this.CW, 26, 3, 3, "F");

    // Left accent
    this.doc.setFillColor(...visColor);
    this.doc.rect(this.M, this.y + 3, 3, 20, "F");

    // Probability number
    this.doc.setFontSize(24);
    this.doc.setTextColor(...visColor);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${prob}%`, this.M + 10, this.y + 17);

    // Labels
    this.doc.setFontSize(10);
    this.doc.setTextColor(...C.text);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Average AI Visibility Score", this.M + 36, this.y + 11);

    this.doc.setFontSize(8);
    this.doc.setTextColor(...C.sub);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `${vis.label} visibility -- ${vis.description}`,
      this.M + 36, this.y + 18
    );

    this.y += 34;

    // Provider stat cards
    if (snap.providerSnapshots.length > 0) {
      this.statRow(
        snap.providerSnapshots.map(p => ({
          label: p.name,
          value: `${Math.round(p.probability * 100)}%`,
          color: PROV_COLOR[p.id],
        }))
      );
    }

    // Provider comparison table
    this.h2("Provider Comparison", 10);

    const provHeaders = ["Provider", "Probability", "Mentions", "Primary Recs", "Top Competitor"];
    const provRows = snap.providerSnapshots.map(p => {
      const report = this.analysis.reports[p.id];
      return [
        p.name,
        `${Math.round(p.probability * 100)}%`,
        `${p.mentionCount}/${p.totalQueries}`,
        String(report?.recommendations.primaryRecommendationCount ?? 0),
        p.topCompetitor ?? "--",
      ];
    });
    this.table(provHeaders, provRows, [36, 28, 28, 28, 50]);

    // Priority findings
    if (snap.findings.length > 0) {
      this.h2("Priority Findings", 10);
      for (const f of snap.findings) {
        this.bullet(f.title, f.detail, toneColor(f.tone));
      }
    }

    // Strengths
    if (snap.wins.length > 0) {
      this.h2("Current Strengths", 10);
      for (const w of snap.wins) {
        this.bullet(w.title, w.detail, toneColor(w.tone));
      }
    }
  }

  private providers() {
    const reports = Object.values(this.analysis.reports);

    for (const report of reports) {
      this.doc.addPage();
      this.pageHeader();
      this.y = 28;

      const reportSnap = getReportSnapshot(report);
      const color = PROV_COLOR[report.provider.id] ?? C.green;
      const bg = PROV_BG[report.provider.id] ?? C.bgLight;
      const prob = Math.round(report.recommendations.recommendationProbability * 100);

      this.sectionTitle(`${report.provider.name} -- Deep Dive`);

      // Hero stat
      this.ensureSpace(24);
      this.doc.setFillColor(...bg);
      this.doc.roundedRect(this.M, this.y, this.CW, 22, 3, 3, "F");
      this.doc.setFillColor(...color);
      this.doc.rect(this.M, this.y + 3, 2.5, 16, "F");

      this.doc.setFontSize(20);
      this.doc.setTextColor(...color);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${prob}%`, this.M + 10, this.y + 14);

      this.doc.setFontSize(9);
      this.doc.setTextColor(...C.text);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `AI visibility score -- ${reportSnap.visibility.label} visibility`,
        this.M + 34, this.y + 10
      );
      this.doc.text(
        `${report.recommendations.mentionCount} of ${report.recommendations.totalQueries} prompts mentioned the business`,
        this.M + 34, this.y + 17
      );

      this.y += 30;

      // Metrics row
      this.statRow([
        { label: "Mentions", value: `${report.recommendations.mentionCount}/${report.recommendations.totalQueries}` },
        { label: "Primary Recs", value: String(report.recommendations.primaryRecommendationCount) },
        { label: "Sentiment", value: reportSnap.sentimentLabel.charAt(0).toUpperCase() + reportSnap.sentimentLabel.slice(1) },
        { label: "Top Competitor", value: reportSnap.topCompetitor ?? "None" },
      ]);

      // Query type breakdown
      const queryStats = getQueryTypeStats(report.queryResults);
      if (queryStats.length > 0) {
        this.h2("Query Type Breakdown", 10);
        this.table(
          ["Query Type", "Total", "Mentioned", "Mention Rate", "Primary Rate"],
          queryStats.map(qt => [
            qt.label,
            String(qt.total),
            String(qt.mentioned),
            `${Math.round(qt.mentionRate * 100)}%`,
            `${Math.round(qt.primaryRate * 100)}%`,
          ]),
          [44, 24, 28, 37, 37]
        );
      }

      // Competitors
      if (report.competitors.length > 0) {
        this.h2("Competitor Ranking", 10);
        this.table(
          ["Rank", "Business", "Mentions"],
          report.competitors.slice(0, 8).map(c => [
            `#${c.rank}`,
            c.name + (c.isSubject ? " (You)" : ""),
            String(c.mentionCount),
          ]),
          [24, 106, 40]
        );
      }

      // Blockers
      if (reportSnap.blockers.length > 0) {
        this.h2("Blockers", 10);
        for (const b of reportSnap.blockers) {
          this.bullet(b.title, b.detail, toneColor(b.tone));
        }
      }

      // Strengths
      if (reportSnap.wins.length > 0) {
        this.h2("Strengths", 10);
        for (const w of reportSnap.wins) {
          this.bullet(w.title, w.detail, toneColor(w.tone));
        }
      }

      // Sources
      if (report.sources.length > 0) {
        this.h2("Source Citations", 10);
        this.table(
          ["Source", "Type", "Citations"],
          report.sources.slice(0, 8).map(s => [
            s.name,
            s.sourceType.replace(/_/g, " "),
            String(s.count),
          ]),
          [70, 56, 44]
        );
      }

      // Accuracy issues
      if (reportSnap.accuracyIssues.length > 0) {
        this.h2("Accuracy Issues", 10);
        this.table(
          ["Field", "Status", "LLM Value"],
          reportSnap.accuracyIssues.slice(0, 6).map(a => [
            a.field,
            a.status,
            a.llmValue,
          ]),
          [40, 32, 98]
        );
      }
    }
  }

  private sources() {
    if (this.analysis.sourceInfluences.length === 0) return;

    this.doc.addPage();
    this.pageHeader();
    this.y = 28;

    this.sectionTitle("Cross-Platform Source Influence");

    this.body(
      "These sources are the most frequently cited by AI providers when forming recommendations. " +
      "Strengthening your presence on high-influence sources is one of the most effective ways to improve AI visibility score."
    );

    const sorted = [...this.analysis.sourceInfluences]
      .sort((a, b) => b.citationCount - a.citationCount)
      .slice(0, 15);

    this.table(
      ["Source", "Type", "Cited By", "Citations", "Influence"],
      sorted.map(s => [
        s.source,
        s.sourceType.replace(/_/g, " "),
        s.citedBy.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", "),
        String(s.citationCount),
        s.influence.charAt(0).toUpperCase() + s.influence.slice(1),
      ]),
      [46, 30, 40, 26, 28]
    );
  }

  private evidence() {
    this.doc.addPage();
    this.pageHeader();
    this.y = 28;

    this.sectionTitle("Query Evidence");

    this.body(
      "Every query sent to each AI provider, along with the outcome. " +
      "This is the raw data behind all AI visibility scores."
    );

    const allReports = Object.values(this.analysis.reports);

    for (const report of allReports) {
      this.ensureSpace(16);
      this.h2(`${report.provider.name} (${report.queryResults.length} queries)`, 10);

      this.table(
        ["Query", "Result", "Type", "Sentiment"],
        report.queryResults.map(q => [
          q.queryText,
          q.businessMentioned
            ? (q.mentionType === "primary_recommendation" ? "Primary" : "Passing")
            : "Not mentioned",
          q.queryType.replace(/_/g, " "),
          q.sentiment ?? "--",
        ]),
        [78, 32, 32, 28]
      );

      this.y += 4;
    }
  }

  private actions() {
    if (!this.actionPlan || this.actionPlan.categories.length === 0) return;

    this.doc.addPage();
    this.pageHeader();
    this.y = 28;

    this.sectionTitle("Action Plan");

    this.body(
      `${this.actionPlan.totalItems} action items across ${this.actionPlan.categories.length} categories. ` +
      `Estimated total effort: ${this.actionPlan.estimatedTotalEffort}. ` +
      `Items are ordered by priority within each category.`
    );

    for (const cat of this.actionPlan.categories) {
      this.ensureSpace(18);

      // Category heading
      const pColor = cat.priority === "critical" ? C.red
        : cat.priority === "high" ? C.amber : C.green;

      this.doc.setFontSize(10);
      this.doc.setTextColor(...C.black);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(cat.label, this.M, this.y);

      // Priority badge
      const labelW = this.doc.getTextWidth(cat.label);
      this.doc.setFontSize(6.5);
      this.doc.setTextColor(...pColor);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(cat.priority.toUpperCase(), this.M + labelW + 5, this.y);

      this.y += 4;
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...C.sub);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `${cat.items.length} items -- ${cat.estimatedEffort}`,
        this.M, this.y
      );
      this.y += 6;

      // Items
      for (const item of cat.items) {
        this.ensureSpace(16);

        // Checkbox
        this.doc.setDrawColor(...C.border);
        this.doc.setLineWidth(0.4);
        this.doc.rect(this.M + 2, this.y - 3, 3, 3);
        if (item.completed) {
          this.doc.setFillColor(...C.green);
          this.doc.rect(this.M + 2.4, this.y - 2.6, 2.2, 2.2, "F");
        }

        // Title
        this.para(item.title, this.M + 8, this.CW - 12, 8, C.black, "bold");

        // Priority + effort
        this.para(`${item.priority} | ${item.effort.replace(/_/g, " ")}`, this.M + 8, this.CW - 12, 6.5, C.muted, "normal");

        // Description (max 2 lines)
        if (item.description) {
          this.para(item.description, this.M + 8, this.CW - 12, 7.5, C.sub, "normal", 2);
        }

        this.y += 3;
      }

      this.y += 6;
    }
  }

  // ── Orchestrator ──

  build() {
    this.cover();
    this.summary();
    this.providers();
    this.sources();
    this.evidence();
    this.actions();
    this.addFooters();

    const date = new Date().toISOString().split("T")[0];
    const safeName = this.analysis.businessName.replace(/[^a-zA-Z0-9]/g, "-");
    this.doc.save(`${safeName}-GEO-Report-${date}.pdf`);
  }
}
