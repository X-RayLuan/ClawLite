/**
 * ClawLite supported providers, models, and pricing configuration.
 * Single source of truth for all model-related info across the codebase.
 *
 * Pricing source: OpenRouter API (https://openrouter.ai/api/v1/models)
 * which reflects official provider (OpenAI / Anthropic) prices.
 * Users pay 80% of official price (20% discount).
 */

export type Provider = {
  id: string
  name: string
  logo?: string
  baseUrl: string
  authFormat: "bearer" | "api-key"
  status: "active" | "deprecated"
}

export type ModelPricing = {
  inputPer1M: number   // USD per 1M input tokens (after 20% discount)
  outputPer1M: number   // USD per 1M output tokens (after 20% discount)
}

export type Model = {
  id: string                  // canonical short id, e.g. "gpt-5.4", "claude-sonnet-4-6"
  providerId: string          // references PROVIDERS[id]
  name: string                // display name
  contextWindow: number      // max context tokens
  inputPer1M: number          // official price per 1M input tokens (before discount)
  outputPer1M: number         // official price per 1M output tokens (before discount)
  supports: {
    streaming?: boolean
    tools?: boolean
    vision?: boolean
    reasoning?: boolean
  }
  status: "active" | "beta" | "deprecated"
}

// ─── PROVIDERS ────────────────────────────────────────────────────────────────

export const PROVIDERS: Record<string, Provider> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    logo: "https://openrouter.ai/providers/openai.svg",
    baseUrl: "https://api.openai.com",
    authFormat: "bearer",
    status: "active",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    logo: "https://openrouter.ai/providers/anthropic.svg",
    baseUrl: "https://api.anthropic.com",
    authFormat: "api-key",
    status: "active",
  },
}

// ─── DISCOUNT ────────────────────────────────────────────────────────────────

const DISCOUNT = 0.8  // users pay 80% of official price

function discounted(price: number): number {
  return Math.round(price * DISCOUNT * 1000) / 1000
}

// ─── MODELS ──────────────────────────────────────────────────────────────────

export const MODELS: Record<string, Model> = {

  // ── OpenAI ───────────────────────────────────────────────────────────────

  "gpt-5.4": {
    id: "gpt-5.4",
    providerId: "openai",
    name: "GPT-5.4",
    contextWindow: 1050000,
    inputPer1M: 2.5,
    outputPer1M: 15,
    supports: { streaming: true, tools: true, vision: true, reasoning: true },
    status: "active",
  },

  "gpt-5.4-mini": {
    id: "gpt-5.4-mini",
    providerId: "openai",
    name: "GPT-5.4 Mini",
    contextWindow: 400000,
    inputPer1M: 0.75,
    outputPer1M: 4.5,
    supports: { streaming: true, tools: true, vision: true },
    status: "active",
  },

  "gpt-5.4-pro": {
    id: "gpt-5.4-pro",
    providerId: "openai",
    name: "GPT-5.4 Pro",
    contextWindow: 1050000,
    inputPer1M: 30,
    outputPer1M: 180,
    supports: { streaming: true, tools: true, vision: true, reasoning: true },
    status: "active",
  },

  "gpt-4o": {
    id: "gpt-4o",
    providerId: "openai",
    name: "GPT-4o",
    contextWindow: 128000,
    inputPer1M: 2.5,
    outputPer1M: 10,
    supports: { streaming: true, tools: true, vision: true },
    status: "active",
  },

  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    providerId: "openai",
    name: "GPT-4o Mini",
    contextWindow: 128000,
    inputPer1M: 0.15,
    outputPer1M: 0.6,
    supports: { streaming: true, tools: true, vision: true },
    status: "active",
  },

  // ── Anthropic ───────────────────────────────────────────────────────────

  "claude-opus-4-7": {
    id: "claude-opus-4-7",
    providerId: "anthropic",
    name: "Claude Opus 4.7",
    contextWindow: 1000000,
    inputPer1M: 5,
    outputPer1M: 25,
    supports: { streaming: true, tools: true, vision: true },
    status: "active",
  },

  "claude-opus-4-6": {
    id: "claude-opus-4-6",
    providerId: "anthropic",
    name: "Claude Opus 4.6",
    contextWindow: 1000000,
    inputPer1M: 5,
    outputPer1M: 25,
    supports: { streaming: true, tools: true, vision: true },
    status: "active",
  },

  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    providerId: "anthropic",
    name: "Claude Sonnet 4.6",
    contextWindow: 1000000,
    inputPer1M: 3,
    outputPer1M: 15,
    supports: { streaming: true, tools: true, vision: true },
    status: "active",
  },

  "claude-opus-4-5": {
    id: "claude-opus-4-5",
    providerId: "anthropic",
    name: "Claude Opus 4.5",
    contextWindow: 1000000,
    inputPer1M: 5,
    outputPer1M: 25,
    supports: { streaming: true, tools: true, vision: true },
    status: "active",
  },

  "claude-haiku-4-5": {
    id: "claude-haiku-4-5",
    providerId: "anthropic",
    name: "Claude Haiku 4.5",
    contextWindow: 200000,
    inputPer1M: 1,
    outputPer1M: 5,
    supports: { streaming: true, tools: true, vision: true },
    status: "active",
  },

  "claude-3-5-haiku-20241022": {
    id: "claude-3-5-haiku-20241022",
    providerId: "anthropic",
    name: "Claude 3.5 Haiku",
    contextWindow: 200000,
    inputPer1M: 0.8,
    outputPer1M: 4,
    supports: { streaming: true, tools: true, vision: true },
    status: "active",
  },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Returns pricing for a model after 20% discount.
 */
export function getModelPricing(modelId: string): ModelPricing {
  const model = MODELS[modelId]
  if (!model) {
    // Unknown model – fall back to defaults
    return { inputPer1M: discounted(2.5), outputPer1M: discounted(10) }
  }
  return {
    inputPer1M: discounted(model.inputPer1M),
    outputPer1M: discounted(model.outputPer1M),
  }
}

/**
 * Returns the canonical model record, or null if unknown.
 */
export function getModel(modelId: string): Model | null {
  return MODELS[modelId] ?? null
}

/**
 * Returns all models for a given provider.
 */
export function getModelsByProvider(providerId: string): Model[] {
  return Object.values(MODELS).filter((m) => m.providerId === providerId)
}

/**
 * Returns all active models.
 */
export function getAllModels(): Model[] {
  return Object.values(MODELS).filter((m) => m.status !== "deprecated")
}
