import { prisma } from "@/lib/prisma";
import type { LLMProvider, LLMReport } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import {
  getOpenAIClient,
  getAnthropicClient,
  getGoogleClient,
  MODEL_CONFIG,
} from "./clients";
import { getPromptsForTier } from "./prompts";
import { parseAllResponses } from "./parser";
import { aggregateToLLMReport, assembleGEOAnalysis } from "./aggregator";

const LLM_TIMEOUT = 30_000; // 30s per LLM call
const RETRY_DELAY = 2_000;

/**
 * Query a single LLM provider with a prompt. Returns the text response.
 */
async function queryLLM(
  provider: LLMProvider,
  prompt: string,
  tier: "fast" | "comprehensive"
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT);

  try {
    switch (provider) {
      case "chatgpt": {
        const client = getOpenAIClient();
        const model = MODEL_CONFIG.chatgpt[tier];
        // Use Responses API with web search for real-time data
        const response = await client.responses.create(
          {
            model,
            tools: [{ type: "web_search_preview" }],
            input: prompt,
          },
          { signal: controller.signal }
        );
        // Extract text from response output items
        let text = "";
        for (const item of response.output) {
          if (item.type === "message") {
            for (const c of item.content) {
              if (c.type === "output_text") {
                text += c.text + "\n";
              }
            }
          }
        }
        return text.trim();
      }

      case "claude": {
        const client = getAnthropicClient();
        const model = MODEL_CONFIG.claude[tier];
        const message = await client.messages.create({
          model,
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        });
        const block = message.content[0];
        return block.type === "text" ? block.text : "";
      }

      case "gemini": {
        const client = getGoogleClient();
        const model = MODEL_CONFIG.gemini[tier];
        // Enable Google Search grounding for real-time data
        const response = await client.models.generateContent({
          model,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        return response.text || "";
      }

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Query a provider with retry (1 retry with backoff).
 */
async function queryWithRetry(
  provider: LLMProvider,
  prompt: string,
  tier: "fast" | "comprehensive"
): Promise<string> {
  try {
    return await queryLLM(provider, prompt, tier);
  } catch (err) {
    console.warn(`[${provider}] First attempt failed, retrying in ${RETRY_DELAY}ms:`, err);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    return await queryLLM(provider, prompt, tier);
  }
}

/**
 * Run all prompts for a single LLM provider and return the parsed LLMReport.
 */
async function runProviderAnalysis(
  provider: LLMProvider,
  businessName: string,
  location: string,
  tier: "fast" | "comprehensive",
  jobId: string
): Promise<LLMReport> {
  const providerInfo = LLM_PROVIDERS.find((p) => p.id === provider)!;
  const prompts = getPromptsForTier(tier);

  // Update job status
  await prisma.lLMJob.update({
    where: { id: jobId },
    data: { status: "running", startedAt: new Date() },
  });

  try {
    // Send all prompts to this provider
    const rawResponses: string[] = [];
    for (const promptTemplate of prompts) {
      const prompt = promptTemplate.generate(businessName, location);
      const response = await queryWithRetry(provider, prompt, tier);
      rawResponses.push(response);
    }

    // Parse all responses using GPT-4o-mini
    const parsedResponses = await parseAllResponses(rawResponses, businessName);

    // Aggregate into an LLMReport
    const report = aggregateToLLMReport(providerInfo, parsedResponses, businessName);

    // Update job with results
    await prisma.lLMJob.update({
      where: { id: jobId },
      data: {
        status: "complete",
        promptsSent: prompts.length,
        rawResponse: JSON.stringify(rawResponses),
        parsedJson: JSON.stringify(report),
        completedAt: new Date(),
      },
    });

    return report;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[${provider}] Analysis failed:`, errorMsg);

    await prisma.lLMJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage: errorMsg,
        completedAt: new Date(),
      },
    });

    // Return empty report for this provider
    return aggregateToLLMReport(providerInfo, [], businessName);
  }
}

/**
 * Main orchestration: run analysis across all 4 LLM providers in parallel.
 */
export async function runAnalysis(
  analysisId: string,
  businessName: string,
  location: string,
  tier: "fast" | "comprehensive"
): Promise<void> {
  console.log(`[Analysis ${analysisId}] Starting ${tier} analysis for "${businessName}" in "${location}"`);

  // Update status
  await prisma.analysis.update({
    where: { id: analysisId },
    data: { status: "running" },
  });

  // Get LLM jobs
  const jobs = await prisma.lLMJob.findMany({
    where: { analysisId },
  });

  // Run all providers in parallel
  const results = await Promise.allSettled(
    LLM_PROVIDERS.map((provider) => {
      const job = jobs.find((j) => j.provider === provider.id);
      if (!job) {
        console.warn(`No job found for provider ${provider.id}`);
        return Promise.resolve(aggregateToLLMReport(provider, [], businessName));
      }
      return runProviderAnalysis(provider.id, businessName, location, tier, job.id);
    })
  );

  // Collect reports
  const reports = {} as Record<LLMProvider, LLMReport>;
  LLM_PROVIDERS.forEach((provider, i) => {
    const result = results[i];
    if (result.status === "fulfilled") {
      reports[provider.id] = result.value;
    } else {
      reports[provider.id] = aggregateToLLMReport(provider, [], businessName);
    }
  });

  // Assemble final analysis
  const geoAnalysis = assembleGEOAnalysis(reports, businessName);

  // Store result
  await prisma.analysis.update({
    where: { id: analysisId },
    data: {
      status: "complete",
      resultJson: JSON.stringify(geoAnalysis),
      completedAt: new Date(),
    },
  });

  console.log(`[Analysis ${analysisId}] Complete. Score: ${geoAnalysis.summary.averageScore}`);
}
