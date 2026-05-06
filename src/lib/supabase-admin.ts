import { createClient } from '@supabase/supabase-js';

// Use the global `fetch` (Next.js's patched version that respects cache options like 'no-store')
// NOT globalThis.fetch (native fetch that ignores Next.js cache options)
type FetchImpl = (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>;

let _adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdminClient() {
  if (_adminClient) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin operations.'
    );
  }

  // Use the global `fetch` that Next.js patches (not globalThis.fetch which is the native fetch)
  // This ensures cache: 'no-store' is actually respected by Next.js's Data Cache layer
  const fetchImpl: FetchImpl = (input, init) =>
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    fetch(input, { ...init, cache: 'no-store' });

  _adminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: fetchImpl,
    },
  });

  return _adminClient;
}
