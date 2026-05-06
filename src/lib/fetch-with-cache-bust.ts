/**
 * Cache-busting utilities to prevent Next.js from caching dynamic API responses.
 */

/**
 * Adds a cache-busting query parameter to a URL.
 * Use for fetch calls to dynamic APIs that should never be cached.
 */
export function addCacheBust(url: string): string {
  const bust = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_cb=${bust}`;
}

/**
 * Options for a dynamic fetch call that bypasses all caches.
 * Add these to any fetch() call for dynamic data.
 */
export const NO_CACHE_OPTIONS: RequestInit = {
  cache: "no-store",
  headers: {
    ...{},
    // Caller should spread additional headers on top of this
  },
};
