import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

// Singleton clients — created lazily on first use

let _openai: OpenAI | null = null;
let _anthropic: Anthropic | null = null;
let _google: GoogleGenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }
  return _openai;
}

export function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

export function getGoogleClient(): GoogleGenAI {
  if (!_google) {
    _google = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
  }
  return _google;
}

export type LLMTier = "fast" | "comprehensive";

export const MODEL_CONFIG = {
  chatgpt: {
    fast: "gpt-4.1-mini",
    comprehensive: "gpt-4.1",
  },
  claude: {
    fast: "claude-haiku-4-5-20251001",
    comprehensive: "claude-sonnet-4-20250514",
  },
  gemini: {
    fast: "gemini-2.5-flash",
    comprehensive: "gemini-2.5-flash",
  },
  // Parser model (always cheap)
  parser: "gpt-4.1-mini",
} as const;
