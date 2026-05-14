/**
 * ClawLite model configuration.
 * Dynamically fetched from ezrouter /api/model/list on startup, cached for 5 min.
 * Single source of truth for supported models, providers, and pricing.
 *
 * Users pay 80% of the official provider price (20% discount).
 */

function getEzRouterBaseUrl() {
  return (process.env.EZROUTER_BASE_URL || "https://openrouter.ezsite.ai").replace(/\/$/, "")
}

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
  inputPer1M: number    // official price per 1M input tokens
  outputPer1M: number   // official price per 1M output tokens
  status: "active" | "beta" | "deprecated"
}

type EzrouterModel = {
  Id: string
  Name: string
  Provider: string
  Description?: string
  ContextLength: number
  Aliases?: string[]
  Pricing: {
    Kind: number
    InputPerMillion: number
    OutputPerMillion: number
    CacheWritePerMillion?: number
    CacheReadPerMillion?: number
    [key: string]: unknown
  }
}

type ConfigCache = {
  providers: Record<string, Provider>
  models: Record<string, Model>
  fetchedAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000
const DISCOUNT = 0.8

// ─── Provider mapping ─────────────────────────────────────────────────────────

// Map ezrouter Provider name → ClawLite canonical provider id
const PROVIDER_MAP: Record<string, { id: string; name: string; baseUrl: string; authFormat: "bearer" | "api-key" }> = {
  openai:  { id: "openai",   name: "OpenAI",    baseUrl: "https://api.openai.com",     authFormat: "bearer" },
  claude:  { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com",  authFormat: "api-key" },
  gemini:  { id: "gemini",   name: "Google",     baseUrl: "https://generativelanguage.googleapis.com", authFormat: "bearer" },
  deepseek: { id: "deepseek", name: "DeepSeek",  baseUrl: "https://api.deepseek.com",   authFormat: "bearer" },
}

function getCanonicalProviderId(ezrouterProvider: string): string {
  return PROVIDER_MAP[ezrouterProvider]?.id ?? ezrouterProvider
}

// ─── Default providers ────────────────────────────────────────────────────────

const DEFAULT_PROVIDERS: Record<string, Provider> = {
  openai:   { id: "openai",   name: "OpenAI",    baseUrl: "https://api.openai.com",      authFormat: "bearer" },
  anthropic: { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com",  authFormat: "api-key" },
  gemini:   { id: "gemini",   name: "Google",     baseUrl: "https://generativelanguage.googleapis.com", authFormat: "bearer" },
  deepseek: { id: "deepseek", name: "DeepSeek",   baseUrl: "https://api.deepseek.com",    authFormat: "bearer" },
}

// ─── Config cache ─────────────────────────────────────────────────────────────

let configCache: ConfigCache | null = null

async function fetchFromEzRouter(): Promise<ConfigCache> {
  const baseUrl = getEzRouterBaseUrl()
  const authToken = process.env.EZROUTER_AUTH_TOKEN

  let ezModels: EzrouterModel[] = []

  try {
    const res = await fetch(`${baseUrl}/api/model/list`, {
      headers: {
        Authorization: authToken || "",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (res.ok) {
      const data = await res.json()
      ezModels = data?.Data ?? []
    } else {
      console.warn(`[model-config] ezrouter returned ${res.status}`)
    }
  } catch (err) {
    console.warn("[model-config] failed to fetch from ezrouter:", err)
  }

  // Build providers map from what ezrouter returned
  const providers: Record<string, Provider> = {}
  for (const m of ezModels) {
    const pid = getCanonicalProviderId(m.Provider)
    if (!providers[pid]) {
      const meta = PROVIDER_MAP[m.Provider]
      providers[pid] = meta
        ? { id: meta.id, name: meta.name, baseUrl: meta.baseUrl, authFormat: meta.authFormat }
        : { id: pid, name: m.Provider, baseUrl: baseUrl, authFormat: "bearer" }
    }
  }
  // Fill in defaults for any provider we didn't see
  for (const [id, p] of Object.entries(DEFAULT_PROVIDERS)) {
    if (!providers[id]) providers[id] = p
  }

  // Build models map
  const models: Record<string, Model> = {}
  for (const m of ezModels) {
    // Skip models with zero pricing (e.g. image generation models)
    const p = m.Pricing
    if (p.InputPerMillion === 0 && p.OutputPerMillion === 0) continue

    // Skip image-only models
    const id = m.Id.toLowerCase()
    if (id.includes("image-") && !id.includes("codex")) continue

    const providerId = getCanonicalProviderId(m.Provider)
    models[m.Id] = {
      id: m.Id,
      providerId,
      name: m.Name,
      description: m.Description,
      contextWindow: m.ContextLength,
      inputPer1M: p.InputPerMillion,
      outputPer1M: p.OutputPerMillion,
      status: "active",
    }
  }

  return { providers, models, fetchedAt: Date.now() }
}

async function getConfig(): Promise<ConfigCache> {
  if (configCache && Date.now() - configCache.fetchedAt < CACHE_TTL_MS) {
    return configCache
  }

  configCache = await fetchFromEzRouter()
  const modelCount = Object.keys(configCache.models).length
  console.log(`[model-config] loaded ${modelCount} models from ezrouter`)
  return configCache
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all active providers.
 */
export async function getProviders(): Promise<Record<string, Provider>> {
  const { providers } = await getConfig()
  return providers
}

/**
 * Returns all active models keyed by id.
 */
export async function getModels(): Promise<Record<string, Model>> {
  const { models } = await getConfig()
  return models
}

/**
 * Returns a single model by id, or null if not found.
 */
export async function getModel(id: string): Promise<Model | null> {
  const { models } = await getConfig()
  return models[id] ?? null
}

/**
 * Returns all models for a given provider.
 */
export async function getModelsByProvider(providerId: string): Promise<Model[]> {
  const { models } = await getConfig()
  return Object.values(models).filter((m) => m.providerId === providerId)
}

/**
 * Returns pricing for a model (after 20% discount).
 * Falls back to default pricing for unknown models.
 */
export async function getModelPricing(
  modelId: string
): Promise<{ inputPer1M: number; outputPer1M: number }> {
  const { models } = await getConfig()
  const model = models[modelId]

  if (model) {
    return {
      inputPer1M:  Math.round(model.inputPer1M  * DISCOUNT * 1000) / 1000,
      outputPer1M: Math.round(model.outputPer1M * DISCOUNT * 1000) / 1000,
    }
  }

  // Unknown model – use sensible defaults
  return { inputPer1M: 2.0, outputPer1M: 8.0 }
}

/**
 * Returns all model ids.
 */
export async function getModelIds(): Promise<string[]> {
  const { models } = await getConfig()
  return Object.keys(models)
}
