alter table if exists public.user_profiles
add column if not exists last_campaign_id text;

create index if not exists user_profiles_last_campaign_id_idx
  on public.user_profiles (last_campaign_id);
