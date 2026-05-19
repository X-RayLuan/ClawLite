/**
 * ClawLite model configuration.
 * Source: ezrouter /api/model/list (openai + anthropic only)
 * Cache: written to data/model-cache.json, refreshed every 7 days.
 *
 * Users pay 80% of the ezrouter benchmark price (20% discount).
 */

import { promises as fs } from "node:fs"
import path from "node:path"

// ─── Paths ────────────────────────────────────────────────────────────────────

const CACHE_FILE = path.join(process.cwd(), "data", "model-cache.json")

// ─── Types ────────────────────────────────────────────────────────────────────

export type Provider = {
  id: string
  name: string
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
  inputPerM: number    // ezrouter benchmark price per 1M input tokens
  outputPerM: number  // ezrouter benchmark price per 1M output tokens
  status: "active" | "beta" | "deprecated"
}

type ModelCache = {
  version: number
  fetchedAt: string   // ISO timestamp
  providers: Record<string, Provider>
  models: Record<string, Model>
}

type EzrouterModel = {
  Id: string
  Name: string
  Provider: string
  Description?: string
  ContextLength: number
  Pricing: {
    InputPerMillion: number
    OutputPerMillion: number
    [key: string]: unknown
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000   // 7 days
const DISCOUNT = 0.8

const TARGET_PROVIDERS = new Set(["openai", "anthropic", "minimax"])

// ─── Cache I/O ────────────────────────────────────────────────────────────────

async function readCache(): Promise<ModelCache | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8")
    return JSON.parse(raw) as ModelCache
  } catch {
    return null
  }
}

async function writeCache(cache: ModelCache): Promise<void> {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true })
  } catch { /* dir may already exist */ }
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8")
}

// ─── Fetch from ezrouter ──────────────────────────────────────────────────────

async function fetchFromEzRouter(): Promise<{ providers: Record<string, Provider>; models: Record<string, Model> }> {
  const baseUrl = (process.env.EZROUTER_BASE_URL || "https://openrouter.ezsite.ai").replace(/\/$/, "")
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
    console.warn("[model-config] ezrouter fetch failed:", err)
  }

  // Build canonical provider map
  const providers: Record<string, Provider> = {
    openai:    { id: "openai",    name: "OpenAI",    baseUrl: "https://api.openai.com",      authFormat: "bearer" },
    anthropic: { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com",  authFormat: "api-key" },
    minimax:   { id: "minimax",   name: "MiniMax",   baseUrl: "https://api.minimax.chat/v1", authFormat: "bearer" },
  }

  // Map ezrouter provider "claude" → "anthropic"
  const PROVIDER_MAP: Record<string, string> = {
    openai: "openai",
    claude: "anthropic",
    minimax: "minimax",
  }

  const models: Record<string, Model> = {}

  for (const m of ezModels) {
    const ezProvider = m.Provider
    const canonicalProvider = PROVIDER_MAP[ezProvider]

    // Only include openai and anthropic
    if (!canonicalProvider || !TARGET_PROVIDERS.has(canonicalProvider)) continue

    const p = m.Pricing
    const inputPerM = p.InputPerMillion
    const outputPerM = p.OutputPerMillion

    // Skip zero-priced models (e.g. gpt-image-*)
    if (inputPerM === 0 && outputPerM === 0) continue

    models[m.Id] = {
      id: m.Id,
      providerId: canonicalProvider,
      name: m.Name,
      description: m.Description,
      contextWindow: m.ContextLength,
      inputPerM,
      outputPerM,
      status: "active",
    }
  }

  // Add MiniMax models (static, not from ezrouter)
  models["MiniMax-Text-01"] = {
    id: "MiniMax-Text-01",
    providerId: "minimax",
    name: "MiniMax Text",
    description: "MiniMax Text Model with 1M context",
    contextWindow: 1024000,
    inputPerM: 0.01,
    outputPerM: 0.10,
    status: "active",
  }
  models["MiniMax-Text-01-Vision"] = {
    id: "MiniMax-Text-01-Vision",
    providerId: "minimax",
    name: "MiniMax Text + Vision",
    description: "MiniMax Text + Vision Model",
    contextWindow: 1024000,
    inputPerM: 0.01,
    outputPerM: 0.10,
    status: "active",
  }
  models["abab6.5s-chat"] = {
    id: "abab6.5s-chat",
    providerId: "minimax",
    name: "ABAB 6.5S Chat",
    description: "MiniMax ABAB 6.5S Chat",
    contextWindow: 245760,
    inputPerM: 0.005,
    outputPerM: 0.05,
    status: "active",
  }
  models["abab6.5g-chat"] = {
    id: "abab6.5g-chat",
    providerId: "minimax",
    name: "ABAB 6.5G Chat",
    description: "MiniMax ABAB 6.5G Chat",
    contextWindow: 245760,
    inputPerM: 0.01,
    outputPerM: 0.10,
    status: "active",
  }

  return { providers, models }
}

// ─── Lazy refresh ──────────────────────────────────────────────────────────────
// Starts a background refresh if cache is stale. Does not block.

let refreshPromise: Promise<void> | null = null

async function refreshCacheIfStale(): Promise<ModelCache> {
  const cache = await readCache()
  const now = Date.now()

  if (cache && now - new Date(cache.fetchedAt).getTime() < CACHE_TTL_MS) {
    return cache
  }

  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    await refreshPromise
    const updated = await readCache()
    if (updated) return updated
  }

  refreshPromise = (async () => {
    console.log("[model-config] cache stale, refreshing from ezrouter...")
    const { providers, models } = await fetchFromEzRouter()
    const newCache: ModelCache = {
      version: 1,
      fetchedAt: new Date().toISOString(),
      providers,
      models,
    }
    await writeCache(newCache)
    console.log(`[model-config] cached ${Object.keys(models).length} models`)
    refreshPromise = null
  })()

  await refreshPromise

  const updated = await readCache()
  return updated!
}

// ─── Init (call once at cold start) ─────────────────────────────────────────

let initPromise: Promise<ModelCache> | null = null

export async function initModelConfig(): Promise<ModelCache> {
  if (initPromise) return initPromise
  initPromise = refreshCacheIfStale()
  return initPromise
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProviders(): Promise<Record<string, Provider>> {
  const cache = await initModelConfig()
  return cache.providers
}

// Fallback static models used when cache is unavailable
const FALLBACK_MODELS: Record<string, Model> = {
  "MiniMax-Text-01": {
    id: "MiniMax-Text-01",
    providerId: "minimax",
    name: "MiniMax Text",
    description: "MiniMax Text Model with 1M context",
    contextWindow: 1024000,
    inputPerM: 0.01,
    outputPerM: 0.10,
    status: "active",
  },
  "MiniMax-Text-01-Vision": {
    id: "MiniMax-Text-01-Vision",
    providerId: "minimax",
    name: "MiniMax Text + Vision",
    description: "MiniMax Text + Vision Model",
    contextWindow: 1024000,
    inputPerM: 0.01,
    outputPerM: 0.10,
    status: "active",
  },
  "abab6.5s-chat": {
    id: "abab6.5s-chat",
    providerId: "minimax",
    name: "ABAB 6.5S Chat",
    description: "MiniMax ABAB 6.5S Chat",
    contextWindow: 245760,
    inputPerM: 0.005,
    outputPerM: 0.05,
    status: "active",
  },
  "abab6.5g-chat": {
    id: "abab6.5g-chat",
    providerId: "minimax",
    name: "ABAB 6.5G Chat",
    description: "MiniMax ABAB 6.5G Chat",
    contextWindow: 245760,
    inputPerM: 0.01,
    outputPerM: 0.10,
    status: "active",
  },
}

const FALLBACK_PROVIDERS: Record<string, Provider> = {
  minimax: { id: "minimax", name: "MiniMax", baseUrl: "https://api.minimax.chat/v1", authFormat: "bearer" },
}

export async function getModels(): Promise<Record<string, Model>> {
  try {
    const cache = await initModelConfig()
    return cache.models
  } catch (err) {
    console.warn("[model-config] getModels failed, using fallback:", err)
    return FALLBACK_MODELS
  }
}

export async function getModel(id: string): Promise<Model | null> {
  const models: Record<string, Model> = await getModels()
  return models[id] ?? null
}

export async function getModelsByProvider(providerId: string): Promise<Model[]> {
  const models: Record<string, Model> = await getModels()
  return (Object.values(models) as Model[]).filter((m) => m.providerId === providerId)
}

/**
 * Returns pricing after 20% discount (users pay 80% of ezrouter benchmark).
 */
export async function getModelPricing(modelId: string): Promise<ModelPricing> {
  const models: Record<string, Model> = await getModels()
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
  const { models } = await getModels()
  return Object.keys(models)
}
