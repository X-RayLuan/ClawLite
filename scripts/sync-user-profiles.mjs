import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SOURCE_MAP = {
  google_sheets_waitlist: 'clawlite_waitlist',
  obsidian_users_txt: 'ezsite_import',
};

function normalizeSourceDetail(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function deriveLifecycleStage(user) {
  if (user.last_sign_in_at) return 'signed_in_not_activated';
  if (user.email_confirmed_at) return 'confirmed_not_signed_in';
  return 'unknown';
}

function deriveTags(user) {
  const tags = new Set();
  const importedFrom = normalizeSourceDetail(user.user_metadata?.imported_from);
  if (importedFrom) tags.add(`import:${importedFrom}`);
  if (user.email_confirmed_at) tags.add('email_confirmed');
  if (!user.last_sign_in_at) tags.add('never_signed_in');
  if (user.last_sign_in_at) tags.add('signed_in');
  if ((user.email || '').includes('+')) tags.add('plus_address');
  return [...tags];
}

function toProfile(user) {
  if (!user.email) return null;
  const sourceDetail = normalizeSourceDetail(user.user_metadata?.imported_from);
  return {
    user_id: user.id,
    email: user.email,
    source: sourceDetail ? SOURCE_MAP[sourceDetail] ?? 'unknown' : 'unknown',
    source_detail: sourceDetail,
    lifecycle_stage: deriveLifecycleStage(user),
    tags: deriveTags(user),
    email_confirmed_at: user.email_confirmed_at ?? null,
    last_sign_in_at: user.last_sign_in_at ?? null,
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  };
}

async function listAllAuthUsers() {
  const users = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const batch = data?.users ?? [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }
  return users;
}

async function main() {
  const users = await listAllAuthUsers();
  const profiles = users.map(toProfile).filter(Boolean);

  const { error } = await supabase
    .from('user_profiles')
    .upsert(profiles, { onConflict: 'user_id' });

  if (error) throw error;

  const summary = profiles.reduce((acc, row) => {
    acc.total += 1;
    acc.sources[row.source] = (acc.sources[row.source] || 0) + 1;
    acc.lifecycle[row.lifecycle_stage] = (acc.lifecycle[row.lifecycle_stage] || 0) + 1;
    return acc;
  }, { total: 0, sources: {}, lifecycle: {} });

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
