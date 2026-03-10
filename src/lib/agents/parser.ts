import { z } from "zod";
import { getOpenAIClient, MODEL_CONFIG } from "./clients";
import { getParserSystemPrompt } from "./prompts";

// Zod schema for parsed LLM response
export const ParsedResponseSchema = z.object({
  businessMentioned: z.boolean(),
  mentionType: z.enum(["primary_recommendation", "passing_mention", "not_mentioned"]),
  rankPosition: z.number().nullable(),
  totalInList: z.number().nullable(),
  sentimentTowardBusiness: z.enum(["positive", "neutral", "negative"]).nullable(),
  sentimentPhrases: z.array(
    z.object({
      text: z.string(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
    })
  ),
  competitorsMentioned: z.array(
    z.object({
      name: z.string(),
      context: z.string(),
    })
  ),
  factualClaims: z.array(
    z.object({
      field: z.string(),
      value: z.string(),
    })
  ),
  topicsAssociated: z.array(z.string()),
  categoryInferred: z.string().nullable(),
  sourcesCited: z.array(
    z.object({
      name: z.string(),
      sourceType: z.enum(["review_platform", "directory", "news", "social_media", "official_site", "other"]),
      url: z.string().nullable().optional(),
    })
  ).default([]),
});

export type ParsedResponse = z.infer<typeof ParsedResponseSchema>;

/**
 * Phase 2 parsing: send raw LLM response to GPT-4o-mini for structured extraction.
 */
export async function parseResponse(
  rawResponse: string,
  businessName: string
): Promise<ParsedResponse> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: MODEL_CONFIG.parser,
    messages: [
      { role: "system", content: getParserSystemPrompt(businessName) },
      { role: "user", content: rawResponse },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  }, { timeout: 15000 });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Parser returned empty response");
  }

  const json = JSON.parse(content);
  const result = ParsedResponseSchema.parse(json);
  return result;
}

/**
 * Parse multiple responses and return all results (skipping failures).
 */
export async function parseAllResponses(
  responses: string[],
  businessName: string
): Promise<ParsedResponse[]> {
  const results = await Promise.allSettled(
    responses.map((r) => parseResponse(r, businessName))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ParsedResponse> => r.status === "fulfilled")
    .map((r) => r.value);
}
