import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import type { LLMProvider, LLMReport, QueryResult } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import {
  getOpenAIClient,
  getAnthropicClient,
  getGoogleClient,
  MODEL_CONFIG,
} from "./clients";
import { getPromptsForTier } from "./prompts";
import { parseAllResponses, parseResponse } from "./parser";
import { aggregateToLLMReport, assembleGEOAnalysis } from "./aggregator";
import { getQueriesForTier } from "./query-bank";
import { generateActionPlan } from "./action-plan-generator";

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
  category: string,
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
      const prompt = promptTemplate.generate(businessName, location, category);
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
 * Main orchestration: run analysis across all 3 LLM providers in parallel.
 */
export async function runAnalysis(
  analysisId: string,
  businessName: string,
  location: string,
  category: string,
  tier: "fast" | "comprehensive"
): Promise<void> {
  console.log(`[Analysis ${analysisId}] Starting ${tier} analysis for "${businessName}" (${category}) in "${location}"`);

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
      return runProviderAnalysis(provider.id, businessName, location, category, tier, job.id);
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

/**
 * Free tier audit: ChatGPT only, 5 queries from the query bank.
 * Stores individual QueryExecution records for transparency.
 * Target: 15-25 seconds.
 */
export async function runFreeAudit(
  analysisId: string,
  businessName: string,
  location: string,
  category: string
): Promise<void> {
  const provider: LLMProvider = "chatgpt";
  const providerInfo = LLM_PROVIDERS.find((p) => p.id === provider)!;
  const tier = "fast" as const;
  const modelVersion = MODEL_CONFIG.chatgpt[tier];

  console.log(`[FreeAudit ${analysisId}] Starting for "${businessName}" (${category}) in "${location}"`);

  await prisma.analysis.update({
    where: { id: analysisId },
    data: { status: "running" },
  });

  // Update the single LLM job
  const jobs = await prisma.lLMJob.findMany({ where: { analysisId } });
  const job = jobs.find((j: { provider: string }) => j.provider === provider);
  if (job) {
    await prisma.lLMJob.update({
      where: { id: job.id },
      data: { status: "running", startedAt: new Date() },
    });
  }

  try {
    // Load 5 free-tier queries from query bank
    const queries = await getQueriesForTier("free", category, businessName, location);
    const querySlice = queries.slice(0, 5);

    // Set queryCount upfront so polling API knows the total
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { queryCount: querySlice.length },
    });

    const queryResults: QueryResult[] = [];
    const rawResponses: string[] = [];

    // Run queries sequentially (faster than parallel for rate limits)
    for (let i = 0; i < querySlice.length; i++) {
      const q = querySlice[i];
      const startTime = Date.now();

      // Create QueryExecution record as pending
      const execution = await prisma.queryExecution.create({
        data: {
          analysisId,
          queryTemplateId: q.templateId,
          provider,
          promptSent: q.prompt,
          modelVersion,
          status: "pending",
        },
      });

      try {
        const response = await queryWithRetry(provider, q.prompt, tier);
        const elapsed = Date.now() - startTime;

        // Parse this single response
        const parsed = await parseResponse(response, businessName);

        // Update execution record
        await prisma.queryExecution.update({
          where: { id: execution.id },
          data: {
            rawResponse: response,
            parsedJson: JSON.stringify(parsed),
            modelVersion,
            responseTimeMs: elapsed,
            businessMentioned: parsed.businessMentioned,
            mentionType: parsed.mentionType,
            rankPosition: parsed.rankPosition,
            sentiment: parsed.sentimentTowardBusiness,
            status: "complete",
          },
        });

        rawResponses.push(response);
        queryResults.push({
          queryText: q.prompt,
          queryType: q.queryType,
          provider,
          businessMentioned: parsed.businessMentioned,
          mentionType: parsed.mentionType,
          rankPosition: parsed.rankPosition,
          sentiment: parsed.sentimentTowardBusiness,
          rawResponseExcerpt: response,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await prisma.queryExecution.update({
          where: { id: execution.id },
          data: { status: "failed", errorMessage: errorMsg },
        });
        console.warn(`[FreeAudit] Query ${i + 1} failed:`, errorMsg);
      }
    }

    // Parse all successful responses for aggregation
    const allParsed = rawResponses.length > 0
      ? await parseAllResponses(rawResponses, businessName)
      : [];

    // Build the LLM report
    const report = aggregateToLLMReport(providerInfo, allParsed, businessName);
    report.queryResults = queryResults;
    report.recommendations.totalQueries = querySlice.length;

    // For free tier, only chatgpt has a report
    const reports = { chatgpt: report } as Record<LLMProvider, LLMReport>;

    // Build analysis result
    const geoAnalysis = assembleGEOAnalysis(reports, businessName);
    geoAnalysis.methodology.totalQueries = querySlice.length;
    geoAnalysis.methodology.providers = [provider];

    // Update job
    if (job) {
      await prisma.lLMJob.update({
        where: { id: job.id },
        data: {
          status: "complete",
          promptsSent: querySlice.length,
          rawResponse: JSON.stringify(rawResponses),
          parsedJson: JSON.stringify(report),
          completedAt: new Date(),
        },
      });
    }

    // Store final result
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: "complete",
        queryCount: querySlice.length,
        recommendationProbability: report.recommendations.recommendationProbability,
        resultJson: JSON.stringify(geoAnalysis),
        completedAt: new Date(),
      },
    });

    console.log(`[FreeAudit ${analysisId}] Complete. Probability: ${(report.recommendations.recommendationProbability * 100).toFixed(0)}%`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[FreeAudit ${analysisId}] Failed:`, errorMsg);

    if (job) {
      await prisma.lLMJob.update({
        where: { id: job.id },
        data: { status: "failed", errorMessage: errorMsg, completedAt: new Date() },
      });
    }

    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: "failed", errorMessage: errorMsg, completedAt: new Date() },
    });
  }
}

/**
 * Comprehensive tier audit: All 3 providers, 35-40 queries each.
 * Stores individual QueryExecution records for full transparency.
 * Target: 5-15 minutes.
 */
export async function runComprehensiveAudit(
  analysisId: string,
  businessName: string,
  location: string,
  category: string
): Promise<void> {
  const tier = "comprehensive" as const;

  console.log(`[ComprehensiveAudit ${analysisId}] Starting for "${businessName}" (${category}) in "${location}"`);

  await prisma.analysis.update({
    where: { id: analysisId },
    data: { status: "running" },
  });

  const jobs = await prisma.lLMJob.findMany({ where: { analysisId } });

  // Load comprehensive queries
  const queries = await getQueriesForTier("comprehensive", category, businessName, location);

  // Set queryCount upfront so polling API knows the total
  await prisma.analysis.update({
    where: { id: analysisId },
    data: { queryCount: queries.length * LLM_PROVIDERS.length },
  });

  // Run all 3 providers in parallel
  const results = await Promise.allSettled(
    LLM_PROVIDERS.map(async (providerInfo) => {
      const job = jobs.find((j: { provider: string }) => j.provider === providerInfo.id);
      if (!job) return aggregateToLLMReport(providerInfo, [], businessName);

      await prisma.lLMJob.update({
        where: { id: job.id },
        data: { status: "running", startedAt: new Date() },
      });

      const providerConfig = MODEL_CONFIG[providerInfo.id as "chatgpt" | "claude" | "gemini"];
      const modelVersion = providerConfig[tier];
      const queryResults: QueryResult[] = [];
      const rawResponses: string[] = [];

      try {
        for (let i = 0; i < queries.length; i++) {
          const q = queries[i];
          const startTime = Date.now();

          const execution = await prisma.queryExecution.create({
            data: {
              analysisId,
              queryTemplateId: q.templateId,
              provider: providerInfo.id,
              promptSent: q.prompt,
              modelVersion,
              status: "pending",
            },
          });

          try {
            const response = await queryWithRetry(providerInfo.id, q.prompt, tier);
            const elapsed = Date.now() - startTime;
            const parsed = await parseResponse(response, businessName);

            await prisma.queryExecution.update({
              where: { id: execution.id },
              data: {
                rawResponse: response,
                parsedJson: JSON.stringify(parsed),
                modelVersion,
                responseTimeMs: elapsed,
                businessMentioned: parsed.businessMentioned,
                mentionType: parsed.mentionType,
                rankPosition: parsed.rankPosition,
                sentiment: parsed.sentimentTowardBusiness,
                status: "complete",
              },
            });

            rawResponses.push(response);
            queryResults.push({
              queryText: q.prompt,
              queryType: q.queryType,
              provider: providerInfo.id,
              businessMentioned: parsed.businessMentioned,
              mentionType: parsed.mentionType,
              rankPosition: parsed.rankPosition,
              sentiment: parsed.sentimentTowardBusiness,
              rawResponseExcerpt: response,
              timestamp: new Date().toISOString(),
            });
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            await prisma.queryExecution.update({
              where: { id: execution.id },
              data: { status: "failed", errorMessage: errorMsg },
            });
            console.warn(`[ComprehensiveAudit][${providerInfo.id}] Query ${i + 1} failed:`, errorMsg);
          }
        }

        const allParsed = rawResponses.length > 0
          ? await parseAllResponses(rawResponses, businessName)
          : [];

        const report = aggregateToLLMReport(providerInfo, allParsed, businessName);
        report.queryResults = queryResults;
        report.recommendations.totalQueries = queries.length;

        await prisma.lLMJob.update({
          where: { id: job.id },
          data: {
            status: "complete",
            promptsSent: queries.length,
            rawResponse: JSON.stringify(rawResponses),
            parsedJson: JSON.stringify(report),
            completedAt: new Date(),
          },
        });

        return report;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[ComprehensiveAudit][${providerInfo.id}] Failed:`, errorMsg);
        await prisma.lLMJob.update({
          where: { id: job.id },
          data: { status: "failed", errorMessage: errorMsg, completedAt: new Date() },
        });
        return aggregateToLLMReport(providerInfo, [], businessName);
      }
    })
  );

  // Collect reports
  const reports = {} as Record<LLMProvider, LLMReport>;
  LLM_PROVIDERS.forEach((provider, i) => {
    const result = results[i];
    reports[provider.id] = result.status === "fulfilled"
      ? result.value
      : aggregateToLLMReport(provider, [], businessName);
  });

  const geoAnalysis = assembleGEOAnalysis(reports, businessName);
  geoAnalysis.methodology.totalQueries = queries.length * LLM_PROVIDERS.length;
  geoAnalysis.methodology.providers = LLM_PROVIDERS.map((p) => p.id);

  // Generate action plan (non-blocking on failure)
  let actionPlanJson: string | null = null;
  try {
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { actionPlanStatus: "generating" },
    });

    console.log(`[ComprehensiveAudit ${analysisId}] Generating action plan...`);
    const actionPlan = await generateActionPlan(geoAnalysis, category, location);
    actionPlanJson = JSON.stringify(actionPlan);

    // Bulk-create individual items for progress tracking
    const itemRecords = actionPlan.categories.flatMap((cat, ci) =>
      cat.items.map((item, ii) => ({
        analysisId,
        categoryKey: cat.key,
        categoryLabel: cat.label,
        itemIndex: ci * 100 + ii,
        priority: item.priority,
        title: item.title,
        description: item.description,
        reasoning: item.reasoning,
        effort: item.effort,
        dataPoints: JSON.stringify(item.dataPoints),
      }))
    );
    await prisma.actionPlanItem.createMany({ data: itemRecords });

    console.log(`[ComprehensiveAudit ${analysisId}] Action plan generated: ${actionPlan.totalItems} items across ${actionPlan.categories.length} categories`);
  } catch (err) {
    console.warn(`[ComprehensiveAudit ${analysisId}] Action plan generation failed:`, err);
  }

  await prisma.analysis.update({
    where: { id: analysisId },
    data: {
      status: "complete",
      queryCount: queries.length * LLM_PROVIDERS.length,
      recommendationProbability: geoAnalysis.summary.averageProbability,
      shareToken: nanoid(12),
      resultJson: JSON.stringify(geoAnalysis),
      actionPlanJson,
      actionPlanStatus: actionPlanJson ? "complete" : "failed",
      completedAt: new Date(),
    },
  });

  console.log(`[ComprehensiveAudit ${analysisId}] Complete. Avg probability: ${(geoAnalysis.summary.averageProbability * 100).toFixed(0)}%`);
}
