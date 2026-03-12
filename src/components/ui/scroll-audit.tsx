"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
  );
}
function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
  );
}
function IconLoader2({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-6.22-8.56" /></svg>
  );
}
function IconSearch({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
  );
}
function IconArrowUpRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
  );
}
function IconArrowDownRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7l10 10" /><path d="M17 7v10H7" /></svg>
  );
}
function IconChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
  );
}
const BUSINESS_NAME = "Hana Sushi Miami";

const QUERIES = [
  { text: "Best sushi restaurants in Miami", chatgpt: true, claude: true, gemini: true },
  { text: "Romantic dinner spots Brickell area", chatgpt: true, claude: true, gemini: false },
  { text: "Where to get omakase in Miami", chatgpt: true, claude: false, gemini: true },
  { text: "Top Japanese restaurants downtown", chatgpt: true, claude: true, gemini: false },
  { text: "Affordable sushi near Brickell", chatgpt: false, claude: false, gemini: false },
];

const COMPETITORS = [
  { name: "Zuma Miami", score: 87 },
  { name: "Naoe", score: 74 },
  { name: BUSINESS_NAME, score: 60, isYou: true },
  { name: "Sushi Garage", score: 45 },
  { name: "Osaka Miami", score: 32 },
];

const MODELS = [
  { key: "chatgpt" as const, name: "ChatGPT", score: 80, change: 12, color: "#10a37f" },
  { key: "claude" as const, name: "Claude", score: 60, change: 5, color: "#c084fc" },
  { key: "gemini" as const, name: "Gemini", score: 40, change: -8, color: "#4285f4" },
];

function useScrollPhase(ref: React.RefObject<HTMLDivElement | null>) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const scrollH = el.scrollHeight - viewH;
      if (scrollH <= 0) return;
      const rawProgress = Math.max(0, Math.min(1, -rect.top / scrollH));
      setProgress(rawProgress);
      if (rawProgress < 0.05) setPhase(0);
      else if (rawProgress < 0.18) setPhase(1);
      else if (rawProgress < 0.38) setPhase(2);
      else if (rawProgress < 0.7) setPhase(3);
      else setPhase(4);
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, [ref]);

  return { phase, progress };
}

function ModelBadge({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "3px 8px",
        borderRadius: 999,
        border: active ? "1px solid rgba(0,0,0,0.15)" : "1px solid rgba(0,0,0,0.06)",
        background: active ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.02)",
        color: active ? "#3f3f46" : "#a1a1aa",
        fontSize: 10,
        fontWeight: 500,
        transition: "all 0.5s",
      }}
    >
      {children}
    </span>
  );
}

function BarFill({ pct, highlight }: { pct: number; highlight?: boolean }) {
  return (
    <div
      style={{
        height: 6,
        borderRadius: 999,
        background: "rgba(0,0,0,0.06)",
        flex: 1,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 999,
          background: highlight ? "#18181b" : "#d4d4d8",
          width: `${pct}%`,
          transition: "width 1.1s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}

const STEP_LABELS: Record<number, { label: string; sub: string }> = {
  0: {
    label: "Watch the audit in action",
    sub: "Scroll down to see how BrightWill analyzes your AI visibility",
  },
  1: {
    label: "Entering your business…",
    sub: "We identify your business and prepare targeted AI queries",
  },
  2: {
    label: "Querying AI models…",
    sub: "Sending real customer questions to ChatGPT, Claude & Gemini",
  },
  3: {
    label: "Audit complete",
    sub: "Here's how often AI recommends your business",
  },
  4: {
    label: "Competitive landscape",
    sub: "See exactly where you rank against local competitors",
  },
};

export function ScrollAudit() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { phase, progress } = useScrollPhase(wrapRef);

  const typedLen =
    phase >= 2
      ? BUSINESS_NAME.length
      : phase >= 1
        ? Math.min(
            BUSINESS_NAME.length,
            Math.round(((progress - 0.05) / 0.13) * BUSINESS_NAME.length)
          )
        : 0;
  const typed = BUSINESS_NAME.slice(0, Math.max(0, typedLen));

  const queriesVisible =
    phase >= 3
      ? QUERIES.length
      : phase >= 2
        ? Math.min(QUERIES.length, Math.ceil(((progress - 0.18) / 0.2) * QUERIES.length))
        : 0;

  const overallScore = phase >= 3 ? 60 : 0;
  const step = STEP_LABELS[phase] ?? STEP_LABELS[0];
  const loadingPct =
    phase === 2 ? Math.round(((progress - 0.18) / 0.2) * 100) : phase >= 3 ? 100 : 0;

  return (
    <div ref={wrapRef} style={{ position: "relative", height: "420vh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Step indicator */}
        <div
          style={{
            flexShrink: 0,
            paddingTop: 40,
            paddingBottom: 10,
            paddingLeft: 24,
            paddingRight: 24,
            textAlign: "center",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p
                style={{
                  color: "#18181b",
                  marginBottom: 2,
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                }}
              >
                {step.label}
              </p>
              <p style={{ color: "#a1a1aa", fontSize: 11 }}>{step.sub}</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            gap: 6,
            marginTop: 8,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 4,
                  borderRadius: 999,
                  width: i <= phase ? 24 : 12,
                  background: i <= phase ? "#18181b" : "rgba(0,0,0,0.08)",
                  transition: "all 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Dashboard card */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: "0 12px 12px",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#fafafa",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Browser chrome */}
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 14px",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                background: "rgba(0,0,0,0.015)",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#f87171",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#fbbf24",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#4ade80",
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    padding: "3px 12px",
                    borderRadius: 6,
                    background: "rgba(0,0,0,0.03)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <span style={{ color: "#a1a1aa", fontSize: 10 }}>
                    brightwill.ai/audit
                  </span>
                </div>
              </div>
              <div style={{ width: 56 }} />
            </div>

            {/* Body */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                padding: 12,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Search bar */}
              <div style={{ flexShrink: 0, marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    border:
                      phase >= 1
                        ? "1px solid rgba(0,0,0,0.12)"
                        : "1px solid rgba(0,0,0,0.07)",
                    background: "#ffffff",
                    transition: "all 0.5s",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      color: phase >= 1 ? "#52525b" : "#d4d4d8",
                      transition: "color 0.5s",
                      display: "inline-flex",
                    }}
                  >
                    <IconSearch size={15} />
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: typed ? "#18181b" : "#a1a1aa",
                      transition: "color 0.5s",
                    }}
                  >
                    {typed || "Enter your business name…"}
                    {phase === 1 && (
                      <span
                        className="bw-typing-caret"
                        style={{
                          display: "inline-block",
                          width: 2,
                          height: 14,
                          background: "#18181b",
                          marginLeft: 2,
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                  </span>
                  <button
                    style={{
                      padding: "6px 16px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 500,
                      flexShrink: 0,
                      background: phase >= 2 ? "#18181b" : "rgba(0,0,0,0.04)",
                      color: phase >= 2 ? "#ffffff" : "#a1a1aa",
                      border: "none",
                      cursor: "default",
                      transition: "all 0.5s",
                    }}
                  >
                    Audit
                  </button>
                </div>

                {/* Loading bar */}
                <AnimatePresence>
                  {phase === 2 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{ marginTop: 8, paddingLeft: 4, paddingRight: 4 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ color: "#a1a1aa", fontSize: 11 }}>
                          Querying {Math.min(queriesVisible + 1, QUERIES.length)} of{" "}
                          {QUERIES.length} prompts…
                        </span>
                        <span style={{ color: "#71717a", fontSize: 11 }}>
                          {Math.min(loadingPct, 100)}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 999,
                          background: "rgba(0,0,0,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 999,
                            background: "#18181b",
                            width: `${Math.min(loadingPct, 100)}%`,
                            transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content area */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <AnimatePresence mode="wait">
                  {phase < 2 && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "64px 16px",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 16,
                          background: "rgba(0,0,0,0.03)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ color: "#d4d4d8", display: "inline-flex" }}><IconSearch size={20} /></span>
                      </div>
                      <p style={{ color: "#a1a1aa", fontSize: 14 }}>
                        Enter a business to start the audit
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "#d4d4d8",
                          marginTop: 8,
                          animation: "bounce 1s ease-in-out infinite",
                        }}
                      >
                        <IconChevronDown size={14} />
                        <span style={{ fontSize: 11 }}>Scroll to watch the demo</span>
                      </div>
                    </motion.div>
                  )}

                  {phase === 2 && queriesVisible === 0 && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "64px 16px",
                        gap: 16,
                      }}
                    >
                      <span style={{ color: "#a1a1aa", animation: "spin 1s linear infinite", display: "inline-flex" }}>
                        <IconLoader2 size={26} />
                      </span>
                      <p style={{ color: "#a1a1aa", fontSize: 13 }}>
                        Sending queries to ChatGPT, Claude, Gemini…
                      </p>
                    </motion.div>
                  )}

                  {phase >= 2 && queriesVisible > 0 && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        flex: 1,
                        minHeight: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          maxHeight: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          transform: "scale(0.94)",
                          transformOrigin: "top center",
                        }}
                        className="scroll-audit-results-grid"
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                            gap: 14,
                            width: "100%",
                            maxWidth: "100%",
                            height: "fit-content",
                            maxHeight: "100%",
                            alignContent: "start",
                          }}
                        >
                      {/* Left column: Overall Visibility + Query Results */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: "#ffffff",
                            border: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <p
                            style={{
                              color: "#a1a1aa",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: 10,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            Overall Visibility
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                position: "relative",
                                width: 56,
                                height: 56,
                                flexShrink: 0,
                              }}
                            >
                              <svg
                                width={56}
                                height={56}
                                viewBox="0 0 64 64"
                                style={{
                                  display: "block",
                                  transform: "rotate(-90deg)",
                                  width: 56,
                                  height: 56,
                                }}
                              >
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="26"
                                  fill="none"
                                  stroke="rgba(0,0,0,0.05)"
                                  strokeWidth="4"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="26"
                                  fill="none"
                                  stroke="#18181b"
                                  strokeWidth="4"
                                  strokeDasharray={`${
                                    (overallScore / 100) * 2 * Math.PI * 26
                                  } ${2 * Math.PI * 26}`}
                                  strokeLinecap="round"
                                  style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
                                />
                              </svg>
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <span
                                  style={{
                                    color: "#18181b",
                                    fontSize: 14,
                                    fontWeight: 600,
                                  }}
                                >
                                  {overallScore}%
                                </span>
                              </div>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  color: "#18181b",
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                {BUSINESS_NAME}
                              </p>
                              <p
                                style={{
                                  color: "#a1a1aa",
                                  fontSize: 11,
                                }}
                              >
                                Japanese • Brickell, Miami
                              </p>
                            </div>
                          </div>
                        </div>

                        <div style={{ minWidth: 0, flex: 1, minHeight: 0 }}>
                          <p
                            style={{
                              color: "#a1a1aa",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: 8,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            Query Results
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {QUERIES.slice(0, queriesVisible).map((q, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.35,
                                  delay: i * 0.05,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "7px 10px",
                                  borderRadius: 8,
                                  background: "#ffffff",
                                  border: "1px solid rgba(0,0,0,0.05)",
                                }}
                              >
                                <span
                                  style={{
                                    color: "#52525b",
                                    fontSize: 11,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    marginRight: 10,
                                  }}
                                >
                                  &ldquo;{q.text}&rdquo;
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    flexShrink: 0,
                                  }}
                                >
                                  {(
                                    [
                                      { label: "GPT", val: q.chatgpt },
                                      { label: "Claude", val: q.claude },
                                      { label: "Gemini", val: q.gemini },
                                    ] as const
                                  ).map((m) => (
                                    <ModelBadge key={m.label} active={m.val}>
                                      {m.val ? (
                                        <IconCheck size={8} />
                                      ) : (
                                        <IconX size={8} />
                                      )}
                                      {m.label}
                                    </ModelBadge>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right column: Score by Model + Competitor Ranking */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: "#ffffff",
                            border: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <p
                            style={{
                              color: "#a1a1aa",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: 10,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            Score by Model
                          </p>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            {MODELS.map((m) => (
                              <div key={m.key}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 4,
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#52525b",
                                      fontSize: 11,
                                      fontWeight: 500,
                                    }}
                                  >
                                    {m.name}
                                  </span>
                                  <span
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      fontSize: 9,
                                      fontWeight: 600,
                                      color:
                                        m.change > 0 ? "#059669" : "#ef4444",
                                    }}
                                  >
                                    {m.change > 0 ? (
                                      <IconArrowUpRight size={9} />
                                    ) : (
                                      <IconArrowDownRight size={9} />
                                    )}
                                    {Math.abs(m.change)}%
                                  </span>
                                </div>
                                <p
                                  style={{
                                    color: "#18181b",
                                    marginBottom: 6,
                                    fontSize: 18,
                                    fontWeight: 600,
                                    letterSpacing: "-0.02em",
                                  }}
                                >
                                  {phase >= 3 ? m.score : "—"}%
                                </p>
                                <div
                                  style={{
                                    height: 6,
                                    borderRadius: 999,
                                    background: "rgba(0,0,0,0.06)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      borderRadius: 999,
                                      background: m.color,
                                      width: `${phase >= 3 ? m.score : 0}%`,
                                      transition: "width 1.1s cubic-bezier(0.16, 1, 0.3, 1)",
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ minWidth: 0, flex: 1, minHeight: 0 }}>
                          <p
                            style={{
                              color: "#a1a1aa",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: 8,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            Competitor Ranking
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {COMPETITORS.map((c, i) => (
                              <motion.div
                                key={c.name}
                                initial={{ opacity: 0, x: 6 }}
                                animate={{
                                  opacity:
                                    phase >= 4 ? 1 : c.isYou || phase >= 3 ? 1 : 0.25,
                                  x: 0,
                                }}
                                transition={{
                                  duration: 0.4,
                                  delay: i * 0.06,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "7px 10px",
                                  borderRadius: 8,
                                  border: "1px solid transparent",
                                  background: c.isYou
                                    ? "rgba(0,0,0,0.04)"
                                    : "#ffffff",
                                  borderColor: c.isYou
                                    ? "rgba(0,0,0,0.12)"
                                    : "rgba(0,0,0,0.05)",
                                  transition: "all 0.5s",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#a1a1aa",
                                      width: 16,
                                      fontSize: 10,
                                      fontWeight: 500,
                                    }}
                                  >
                                    #{i + 1}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: c.isYou ? 600 : 400,
                                      color: c.isYou ? "#18181b" : "#71717a",
                                    }}
                                  >
                                    {c.name}
                                    {c.isYou && (
                                      <span
                                        style={{
                                          color: "#a1a1aa",
                                          marginLeft: 4,
                                          fontSize: 9,
                                        }}
                                      >
                                        (You)
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <div style={{ width: 52, minWidth: 52 }}>
                                    <BarFill
                                      pct={phase >= 4 ? c.score : c.isYou ? c.score : 0}
                                      highlight={c.isYou}
                                    />
                                  </div>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 500,
                                      color: c.isYou ? "#18181b" : "#a1a1aa",
                                    }}
                                  >
                                    {phase >= 4 || c.isYou
                                      ? `${c.score}%`
                                      : "—"}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: phase >= 4 ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                              marginTop: 8,
                              padding: 10,
                              borderRadius: 8,
                              background: "#ffffff",
                              border: "1px solid rgba(0,0,0,0.05)",
                            }}
                          >
                            <p
                              style={{
                                color: "#a1a1aa",
                                fontSize: 10,
                                lineHeight: 1.5,
                              }}
                            >
                              <span
                                style={{
                                  color: "#18181b",
                                  fontWeight: 500,
                                }}
                              >
                                Insight:{" "}
                              </span>
                              You rank #3 in your market. Improving your Google
                              Business Profile and review volume could increase
                              visibility by ~15–20%.
                            </p>
                          </motion.div>
                        </div>
                      </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
