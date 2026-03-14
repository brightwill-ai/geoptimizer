import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "BrightWill AI Visibility Report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Fetch analysis data
  const analysis = await prisma.analysis.findUnique({
    where: { shareToken: token },
    select: {
      businessName: true,
      recommendationProbability: true,
      status: true,
    },
  });

  const businessName = analysis?.businessName ?? "Business";
  const score = analysis?.recommendationProbability
    ? Math.round(analysis.recommendationProbability * 100)
    : null;

  // Score color
  const scoreColor =
    score === null
      ? "#8e8ea0"
      : score >= 60
        ? "#16a34a"
        : score >= 30
          ? "#d97706"
          : "#dc2626";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#f3efe8",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #10a37f, #c084fc, #4285f4)",
          }}
        />

        {/* Logo / brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#171717",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, color: "#171717" }}>
            BrightWill
          </span>
        </div>

        {/* Business name */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#171717",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.15,
            marginBottom: 32,
          }}
        >
          {businessName.length > 40
            ? businessName.slice(0, 40) + "..."
            : businessName}
        </div>

        {/* Score */}
        {score !== null ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {score}%
            </div>
            <div style={{ fontSize: 22, color: "#6e6e80", fontWeight: 500 }}>
              AI Visibility Score
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 22, color: "#6e6e80", fontWeight: 500 }}>
            AI Visibility Report
          </div>
        )}

        {/* Provider badges */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {[
            { name: "ChatGPT", color: "#10a37f" },
            { name: "Claude", color: "#c084fc" },
            { name: "Gemini", color: "#4285f4" },
          ].map((p) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 999,
                background: "#ffffff",
                border: `1px solid ${p.color}40`,
                fontSize: 16,
                fontWeight: 500,
                color: "#171717",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: p.color,
                }}
              />
              {p.name}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            fontSize: 16,
            color: "#8e8ea0",
          }}
        >
          Audited across ChatGPT, Claude & Gemini — brightwill.ai
        </div>
      </div>
    ),
    { ...size }
  );
}
