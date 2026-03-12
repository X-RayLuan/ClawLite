export type UserProfileSource =
  | 'clawlite_waitlist'
  | 'ezsite_import'
  | 'manual_import'
  | 'installer_download'
  | 'test'
  | 'unknown';

export type UserLifecycleStage =
  | 'confirmed_not_signed_in'
  | 'signed_in_not_activated'
  | 'activated'
  | 'inactive'
  | 'unknown';

export type AuthAdminUser = {
  id: string;
  email?: string;
  created_at: string;
  updated_at?: string;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export type UserProfileRow = {
  user_id: string;
  email: string;
  source: UserProfileSource;
  source_detail: string | null;
  lifecycle_stage: UserLifecycleStage;
  tags: string[];
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
};

const SOURCE_MAP: Record<string, UserProfileSource> = {
  google_sheets_waitlist: 'clawlite_waitlist',
  obsidian_users_txt: 'ezsite_import',
};

function normalizeSourceDetail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function deriveLifecycleStage(user: AuthAdminUser): UserLifecycleStage {
  if (user.last_sign_in_at) return 'signed_in_not_activated';
  if (user.email_confirmed_at) return 'confirmed_not_signed_in';
  return 'unknown';
}

export function deriveSource(user: AuthAdminUser): {
  source: UserProfileSource;
  sourceDetail: string | null;
} {
  const sourceDetail = normalizeSourceDetail(user.user_metadata?.imported_from);
  const source = sourceDetail ? SOURCE_MAP[sourceDetail] ?? 'unknown' : 'unknown';
  return { source, sourceDetail };
}

export function deriveTags(user: AuthAdminUser): string[] {
  const tags = new Set<string>();
  const importedFrom = normalizeSourceDetail(user.user_metadata?.imported_from);

  if (importedFrom) tags.add(`import:${importedFrom}`);
  if (user.email_confirmed_at) tags.add('email_confirmed');
  if (!user.last_sign_in_at) tags.add('never_signed_in');
  if (user.last_sign_in_at) tags.add('signed_in');
  if ((user.email || '').includes('+')) tags.add('plus_address');

  return [...tags];
}

export function toUserProfileRow(user: AuthAdminUser): UserProfileRow | null {
  if (!user.email) return null;

  const { source, sourceDetail } = deriveSource(user);

  return {
    user_id: user.id,
    email: user.email,
    source,
    source_detail: sourceDetail,
    lifecycle_stage: deriveLifecycleStage(user),
    tags: deriveTags(user),
    email_confirmed_at: user.email_confirmed_at ?? null,
    last_sign_in_at: user.last_sign_in_at ?? null,
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  };
}
