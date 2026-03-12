create table if not exists public.user_profiles (
  user_id uuid primary key,
  email text not null,
  source text not null default 'unknown',
  source_detail text,
  lifecycle_stage text not null default 'unknown',
  tags jsonb not null default '[]'::jsonb,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  activated_at timestamptz,
  last_campaign_sent_at timestamptz,
  last_campaign_clicked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_source_idx on public.user_profiles (source);
create index if not exists user_profiles_lifecycle_idx on public.user_profiles (lifecycle_stage);
create index if not exists user_profiles_email_idx on public.user_profiles (email);

create or replace function public.set_user_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

 drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
 create trigger trg_user_profiles_updated_at
 before update on public.user_profiles
 for each row execute function public.set_user_profiles_updated_at();
