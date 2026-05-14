/**
 * Fetches live model pricing from ezrouter and caches it.
 * Used by all API routes for accurate per-model billing.
 */

type EzrouterModelPricing = {
  Kind?: number
  InputPerMillion: number
  OutputPerMillion: number
  CacheWritePerMillion?: number
  CacheReadPerMillion?: number
  TextInputPerMillion: number
  TextCacheReadPerMillion?: number
  ImageInputPerMillion?: number
  ImageCacheReadPerMillion?: number
  TextOutputPerMillion: number
  ImageOutputPerMillion?: number
  PerImageTiers?: unknown
}

type EzrouterModel = {
  Id: string
  Name: string
  Provider: string
  Description?: string
  ContextLength?: number
  Aliases?: string[]
  Pricing: EzrouterModelPricing
}

type PricingCache = {
  models: Record<string, { inputPer1M: number; outputPer1M: number }>
  fetchedAt: number
}

// Cache for 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000
let pricingCache: PricingCache | null = null

function getEzRouterBaseUrl() {
  return (process.env.EZROUTER_BASE_URL || "https://openrouter.ezsite.ai").replace(/\/$/, "")
}

export async function fetchModelPricing(): Promise<
  Record<string, { inputPer1M: number; outputPer1M: number }>
> {
  // Return cached if still fresh
  if (pricingCache && Date.now() - pricingCache.fetchedAt < CACHE_TTL_MS) {
    return pricingCache.models
  }

  const baseUrl = getEzRouterBaseUrl()
  const authToken = process.env.EZROUTER_AUTH_TOKEN

  let models: EzrouterModel[] = []

  try {
    const res = await fetch(`${baseUrl}/api/model/list`, {
      headers: {
        Authorization: authToken || "",
        "Content-Type": "application/json",
      },
      // Only cache successful responses
      cache: "no-store",
    })

    if (res.ok) {
      const data = await res.json()
      models = data?.Data ?? []
    } else {
      console.warn(`[model-pricing] ezrouter returned ${res.status}, using hardcoded fallback`)
    }
  } catch (err) {
    console.warn("[model-pricing] failed to fetch from ezrouter:", err)
  }

  // Build lookup map: normalize id (ezrouter uses "gpt-5.4" not "openai/gpt-5.4")
  const lookup: Record<string, { inputPer1M: number; outputPer1M: number }> = {}

  for (const m of models) {
    // Use raw id (e.g. "gpt-5.4", "claude-opus-4-7")
    const id = m.Id
    if (!id) continue

    const p = m.Pricing
    if (!p) continue

    // Use TextInputPerMillion if available (structured pricing),
    // fallback to InputPerMillion
    const inputPer1M = p.TextInputPerMillion > 0 ? p.TextInputPerMillion : p.InputPerMillion
    const outputPer1M = p.TextOutputPerMillion > 0 ? p.TextOutputPerMillion : p.OutputPerMillion

    if (inputPer1M > 0 || outputPer1M > 0) {
      // Apply 20% discount: clawlite users pay 80% of official price
      lookup[id] = { inputPer1M: Math.round(inputPer1M * 0.8 * 1000) / 1000, outputPer1M: Math.round(outputPer1M * 0.8 * 1000) / 1000 }
    }
  }

  pricingCache = {
    models: lookup,
    fetchedAt: Date.now(),
  }

  console.log(`[model-pricing] fetched ${models.length} models from ezrouter, ${Object.keys(lookup).length} have pricing`)
  return lookup
}

/**
 * Returns pricing for a given model id.
 * Falls back to hardcoded DEFAULT_PRICING if not found in ezrouter.
 */
export async function getModelPricing(
  modelId: string
): Promise<{ inputPer1M: number; outputPer1M: number }> {
  // Strip provider prefix (e.g. "openai/gpt-5.4" -> "gpt-5.4")
  const stripped = modelId.includes("/") ? modelId.split("/")[1] : modelId

  const allPricing = await fetchModelPricing()

  // Try exact match first, then stripped
  if (allPricing[stripped]) {
    return allPricing[stripped]
  }

  // Try with provider prefix (some models use full id)
  if (allPricing[modelId]) {
    return allPricing[modelId]
  }

  // Fallback
  console.warn(`[model-pricing] no ezrouter pricing for "${modelId}", using default`)
  return { inputPer1M: 2.5, outputPer1M: 10 }
}
