/**
 * Inline SVG logos for LLM providers (ChatGPT, Claude, Gemini).
 * Replaces generic colored dots with recognizable brand marks.
 */

interface ProviderLogoProps {
  provider: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const PROVIDER_COLORS: Record<string, string> = {
  chatgpt: "#10a37f",
  claude: "#c084fc",
  gemini: "#4285f4",
};

export function ProviderLogo({ provider, size = 16, color, style }: ProviderLogoProps) {
  const fill = color ?? PROVIDER_COLORS[provider] ?? "rgba(255,255,255,0.4)";

  const svgProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: { display: "block", flexShrink: 0, ...style },
  };

  switch (provider) {
    case "chatgpt":
      // OpenAI hexagonal knot logo
      return (
        <svg {...svgProps}>
          <path
            d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A6.04 6.04 0 0 0 13.32 24a6.044 6.044 0 0 0 5.7-4.177 5.985 5.985 0 0 0 3.998-2.9 6.046 6.046 0 0 0-.738-7.097zM13.32 22.444a4.514 4.514 0 0 1-2.907-1.06l.144-.084 4.83-2.787a.788.788 0 0 0 .396-.68v-6.8l2.042 1.178a.073.073 0 0 1 .04.057v5.636a4.532 4.532 0 0 1-4.546 4.54zM3.635 18.316a4.51 4.51 0 0 1-.54-3.037l.144.086 4.83 2.787a.781.781 0 0 0 .788 0l5.896-3.404v2.356a.073.073 0 0 1-.03.062l-4.882 2.819a4.531 4.531 0 0 1-6.206-1.67zM2.398 7.87a4.512 4.512 0 0 1 2.364-1.983V11.7a.78.78 0 0 0 .392.68l5.896 3.404-2.042 1.178a.073.073 0 0 1-.07.006L4.056 14.15a4.533 4.533 0 0 1-1.658-6.28zM19.244 12.3l-5.896-3.405 2.042-1.178a.073.073 0 0 1 .07-.006l4.882 2.819a4.53 4.53 0 0 1-.702 8.164v-5.812a.786.786 0 0 0-.396-.681zm2.032-3.048l-.144-.086-4.83-2.787a.781.781 0 0 0-.788 0L9.618 9.783V7.427a.073.073 0 0 1 .03-.062l4.882-2.818a4.533 4.533 0 0 1 6.746 4.705zM8.471 13.61l-2.042-1.178a.073.073 0 0 1-.04-.057V6.739a4.532 4.532 0 0 1 7.453-3.48l-.144.085-4.83 2.787a.788.788 0 0 0-.397.68zm1.108-2.39L12 9.602l2.42 1.397v2.794L12 15.19l-2.42-1.397z"
            fill={fill}
          />
        </svg>
      );

    case "claude":
      // Anthropic stylized "A" logo
      return (
        <svg {...svgProps}>
          <path
            d="M13.827 3.52h3.603L24 20.48h-3.603l-1.477-4.166H13.19l-1.478 4.166H8.11l5.717-16.96zm2.294 10.14l-2.568-7.39-2.569 7.39h5.137zM5.986 3.52H9.59L3.604 20.48H0L5.986 3.52z"
            fill={fill}
          />
        </svg>
      );

    case "gemini":
      // Google Gemini sparkle
      return (
        <svg {...svgProps}>
          <path
            d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12Z"
            fill={fill}
          />
        </svg>
      );

    default:
      // Fallback: colored circle
      return (
        <span
          style={{
            display: "inline-block",
            width: size,
            height: size,
            borderRadius: "50%",
            background: fill,
            flexShrink: 0,
            ...style,
          }}
        />
      );
  }
}
