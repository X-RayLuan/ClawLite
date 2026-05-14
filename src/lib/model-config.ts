/**
 * ClawLite model configuration.
 * Dynamically fetched from openrouter.ai public API on startup, cached for 5 min.
 * Single source of truth for supported models, providers, and pricing.
 *
 * Pricing source: https://openrouter.ai/api/v1/models (public, no API key required)
 * Users pay 80% of the openrouter.ai benchmark price (20% discount).
 */



// ─── Types ────────────────────────────────────────────────────────────────────

export type Provider = {
  id: string
  name: string
  logo?: string
  baseUrl: string
  authFormat: "bearer" | "api-key"
}

export type ModelPricing = {
  inputPer1M: number
  outputPer1M: number
}

export type Model = {
  id: string
  providerId: string
  name: string
  description?: string
  contextWindow: number
  inputPerM: number    // openrouter.ai benchmark price per 1M input tokens
  outputPerM: number   // openrouter.ai benchmark price per 1M output tokens
  status: "active" | "beta" | "deprecated"
}

type OpenRouterModel = {
  id: string
  name: string
  description?: string
  context_length: number
  pricing?: {
    prompt?: string | number
    completion?: string | number
    [key: string]: unknown
  }
  [key: string]: unknown
}

type ConfigCache = {
  providers: Record<string, Provider>
  models: Record<string, Model>
  fetchedAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000
const DISCOUNT = 0.8

// ─── ClawLite supported model list ────────────────────────────────────────────
// We only expose a curated subset of openrouter.ai models.
// Format: openrouter_model_id → canonical id

const SUPPORTED_MODEL_IDS: Record<string, string> = {
  // OpenAI
  "openai/gpt-5.4":              "gpt-5.4",
  "openai/gpt-5.4-mini":        "gpt-5.4-mini",
  "openai/gpt-5.4-pro":          "gpt-5.4-pro",
  "openai/gpt-4o":              "gpt-4o",
  "openai/gpt-4o-mini":         "gpt-4o-mini",
  // Anthropic
  "anthropic/claude-opus-4.7":  "claude-opus-4-7",
  "anthropic/claude-opus-4.6":  "claude-opus-4-6",
  "anthropic/claude-sonnet-4.6": "claude-sonnet-4-6",
  "anthropic/claude-opus-4.5":  "claude-opus-4-5",
  "anthropic/claude-sonnet-4.5": "claude-sonnet-4-5",
  "anthropic/claude-haiku-4.5": "claude-haiku-4-5",
  // Google
  "google/gemini-2.5-flash":     "gemini-2.5-flash",
  "google/gemini-2.5-pro":      "gemini-2.5-pro",
  // DeepSeek
  "deepseek/deepseek-chat-v3-0324": "deepseek-chat",
  "deepseek/deepseek-reasoner":    "deepseek-reasoner",
}

const SUPPORTED_CANONICAL_IDS = new Set(Object.values(SUPPORTED_MODEL_IDS))

// Provider mapping: openrouter provider name → ClawLite canonical provider
const PROVIDER_MAP: Record<string, { id: string; name: string; baseUrl: string; authFormat: "bearer" | "api-key" }> = {
  openai:    { id: "openai",    name: "OpenAI",    baseUrl: "https://api.openai.com",           authFormat: "bearer" },
  anthropic: { id: "anthropic",  name: "Anthropic", baseUrl: "https://api.anthropic.com",         authFormat: "api-key" },
  google:    { id: "gemini",    name: "Google",    baseUrl: "https://generativelanguage.googleapis.com", authFormat: "bearer" },
  deepseek:  { id: "deepseek",  name: "DeepSeek",  baseUrl: "https://api.deepseek.com",          authFormat: "bearer" },
}

const DEFAULT_PROVIDERS: Record<string, Provider> = {
  openai:    { id: "openai",    name: "OpenAI",    baseUrl: "https://api.openai.com",           authFormat: "bearer" },
  anthropic: { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com",         authFormat: "api-key" },
  gemini:    { id: "gemini",    name: "Google",    baseUrl: "https://generativelanguage.googleapis.com", authFormat: "bearer" },
  deepseek:  { id: "deepseek",  name: "DeepSeek",  baseUrl: "https://api.deepseek.com",          authFormat: "bearer" },
}

// ─── Config cache ─────────────────────────────────────────────────────────────

let configCache: ConfigCache | null = null

async function fetchFromOpenRouter(): Promise<ConfigCache> {
  let orModels: OpenRouterModel[] = []

  try {
    // Public endpoint – no API key required
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (res.ok) {
      const data = await res.json()
      orModels = data?.data ?? []
    } else {
      console.warn(`[model-config] openrouter returned ${res.status}`)
    }
  } catch (err) {
    console.warn("[model-config] failed to fetch from openrouter.ai:", err)
  }

  // Build providers
  const providers: Record<string, Provider> = { ...DEFAULT_PROVIDERS }

  // Build models
  const models: Record<string, Model> = {}

  for (const m of orModels) {
    const canonicalId = SUPPORTED_MODEL_IDS[m.id]
    if (!canonicalId) continue

    const pricing = m.pricing
    if (!pricing) continue

    const inputRaw = typeof pricing.prompt === "string" ? parseFloat(pricing.prompt) : (pricing.prompt ?? 0)
    const outputRaw = typeof pricing.completion === "string" ? parseFloat(pricing.completion) : (pricing.completion ?? 0)

    // Skip zero-priced or invalid models
    if (inputRaw === 0 && outputRaw === 0) continue

    // Derive provider id from openrouter model id prefix
    const orProvider = m.id.includes("/") ? m.id.split("/")[0] : "openai"
    const providerMeta = PROVIDER_MAP[orProvider]
    const providerId = providerMeta?.id ?? orProvider

    // Ensure provider exists
    if (!providers[providerId] && providerMeta) {
      providers[providerId] = { id: providerMeta.id, name: providerMeta.name, baseUrl: providerMeta.baseUrl, authFormat: providerMeta.authFormat }
    }

    models[canonicalId] = {
      id: canonicalId,
      providerId,
      name: m.name.replace(/^[a-zA-Z]+:\s*/, ""), // strip "OpenAI: " prefix
      description: m.description,
      contextWindow: m.context_length ?? 128000,
      inputPerM: Math.round(inputRaw * 1e6 * 1000) / 1000,  // per 1M tokens
      outputPerM: Math.round(outputRaw * 1e6 * 1000) / 1000,
      status: "active",
    }
  }

  console.log(`[model-config] loaded ${Object.keys(models).length} models from openrouter.ai`)

  return { providers, models, fetchedAt: Date.now() }
}

async function getConfig(): Promise<ConfigCache> {
  if (configCache && Date.now() - configCache.fetchedAt < CACHE_TTL_MS) {
    return configCache
  }

  configCache = await fetchFromOpenRouter()
  return configCache
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProviders(): Promise<Record<string, Provider>> {
  const { providers } = await getConfig()
  return providers
}

export async function getModels(): Promise<Record<string, Model>> {
  const { models } = await getConfig()
  return models
}

export async function getModel(id: string): Promise<Model | null> {
  const { models } = await getConfig()
  return models[id] ?? null
}

export async function getModelsByProvider(providerId: string): Promise<Model[]> {
  const { models } = await getConfig()
  return Object.values(models).filter((m) => m.providerId === providerId)
}

/**
 * Returns pricing after 20% discount (users pay 80% of openrouter.ai benchmark).
 */
export async function getModelPricing(
  modelId: string
): Promise<ModelPricing> {
  const { models } = await getConfig()
  const model = models[modelId]

  if (model) {
    return {
      inputPer1M:  Math.round(model.inputPerM  * DISCOUNT * 1000) / 1000,
      outputPer1M: Math.round(model.outputPerM * DISCOUNT * 1000) / 1000,
    }
  }

  return { inputPer1M: 2.0, outputPer1M: 8.0 }
}

export async function getModelIds(): Promise<string[]> {
  const { models } = await getConfig()
  return Object.keys(models)
}
