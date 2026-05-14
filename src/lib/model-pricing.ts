/**
 * Model pricing utilities.
 * Delegates to src/lib/model-config.ts which fetches from ezrouter dynamically.
 */

import { getModelPricing as getConfiguredPricing } from "@/lib/model-config"

export type { Model, ModelPricing } from "@/lib/model-config"

/**
 * Returns pricing for a given model id (after 20% discount).
 */
export async function getModelPricing(
  modelId: string
): Promise<{ inputPer1M: number; outputPer1M: number }> {
  return getConfiguredPricing(modelId)
}
