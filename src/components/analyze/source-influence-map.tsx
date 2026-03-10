"use client";

import { motion } from "framer-motion";
import type { SourceInfluenceEntry, SourceCitation, LLMProvider } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import { ProviderLogo } from "@/components/ui/provider-logo";


interface SourceInfluenceMapProps {
  /** Cross-platform source influences (comprehensive report) */
  sourceInfluences?: SourceInfluenceEntry[];
  /** Per-provider sources (for free/single-provider view) */
  sources?: SourceCitation[];
  providerName?: string;
  blurred?: boolean;
}

const sourceTypeLabels: Record<string, string> = {
  review_platform: "Reviews",
  directory: "Directory",
  news: "News",
  social_media: "Social",
  official_site: "Website",
  other: "Other",
};

const sourceTypeColors: Record<string, string> = {
  review_platform: "#d97706",
  directory: "#4285f4",
  news: "#16a34a",
  social_media: "#c084fc",
  official_site: "#10a37f",
  other: "rgba(255,255,255,0.4)",
};

export function SourceInfluenceMap({ sourceInfluences, sources, blurred }: SourceInfluenceMapProps) {
  // Normalize to a common shape
  const items = sourceInfluences
    ? sourceInfluences.map((si) => ({
        name: si.source,
        type: si.sourceType,
        count: si.citationCount,
        influence: si.influence,
        providers: si.citedBy,
        url: si.url,
      }))
    : (sources ?? []).map((s) => ({
        name: s.name,
        type: s.sourceType,
        count: s.count,
        influence: (s.count >= 4 ? "high" : s.count >= 2 ? "medium" : "low") as "high" | "medium" | "low",
        providers: [] as LLMProvider[],
        url: s.url,
      }));

  if (items.length === 0) return null;

  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#14151a",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "1.5rem",
        ...(blurred ? { filter: "blur(6px)", userSelect: "none" as const, pointerEvents: "none" as const } : {}),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>Source Influence</div>
        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>
          {items.length} sources identified
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => {
          const pct = (item.count / maxCount) * 100;
          const influenceColor =
            item.influence === "high" ? "#16a34a"
            : item.influence === "medium" ? "#d97706"
            : "rgba(255,255,255,0.4)";

          return (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Source name + type */}
              <div style={{ width: 140, flexShrink: 0 }}>
                <div style={{ fontSize: "0.8rem", color: "#ffffff", fontWeight: 500, lineHeight: 1.2 }}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#ffffff",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "color 0.15s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.color = sourceTypeColors[item.type] ?? "#4285f4")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
                    >
                      {item.name}
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
                        <path d="M3.5 1.5H10.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  ) : (
                    item.name
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: sourceTypeColors[item.type] ?? "rgba(255,255,255,0.3)",
                    }}
                  />
                  <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
                    {sourceTypeLabels[item.type] ?? item.type}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${sourceTypeColors[item.type] ?? "#ffffff"}88, ${sourceTypeColors[item.type] ?? "#ffffff"})`,
                    transition: "width 0.8s ease-out",
                  }}
                />
              </div>

              {/* Provider dots (comprehensive only) */}
              {item.providers.length > 0 && (
                <div style={{ display: "flex", gap: 3, flexShrink: 0, alignItems: "center" }}>
                  {LLM_PROVIDERS.map((p) => (
                    <ProviderLogo
                      key={p.id}
                      provider={p.id}
                      size={10}
                      style={{
                        opacity: item.providers.includes(p.id) ? 1 : 0.2,
                        transition: "opacity 0.2s",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Influence badge */}
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: `${influenceColor}20`,
                  color: influenceColor,
                  flexShrink: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  width: 52,
                  textAlign: "center",
                }}
              >
                {item.influence}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend for provider dots */}
      {sourceInfluences && sourceInfluences.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {LLM_PROVIDERS.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <ProviderLogo provider={p.id} size={12} />
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
