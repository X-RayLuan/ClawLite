/**
 * Model pricing utilities.
 * All pricing data comes from src/lib/model-config.ts (single source of truth).
 *
 * Discount: users pay 80% of official provider price.
 */

import { getModelPricing as getConfiguredPricing, MODELS } from "@/lib/model-config"

export type { ModelPricing } from "@/lib/model-config"

/**
 * Returns pricing for a given model id (after 20% discount).
 * Uses the canonical model config; returns default pricing for unknown models.
 */
export async function getModelPricing(
  modelId: string
): Promise<{ inputPer1M: number; outputPer1M: number }> {
  // Strip provider prefix if present (e.g. "openai/gpt-5.4" → "gpt-5.4")
  const stripped = modelId.includes("/") ? modelId.split("/")[1] : modelId
  return getConfiguredPricing(stripped)
}

/**
 * Returns all supported model ids (stripped, no provider prefix).
 */
export function getSupportedModelIds(): string[] {
  return Object.keys(MODELS)
}
