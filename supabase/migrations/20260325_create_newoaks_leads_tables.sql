create extension if not exists pgcrypto;

create table if not exists public.chatbot_leads_raw (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  external_lead_id bigint not null,
  session_id bigint,
  lead_type text,
  lead_status text,
  first_name text,
  last_name text,
  email text,
  phone_number text,
  content text,
  source_uri text,
  source_channel text,
  create_time timestamptz,
  appointment_time timestamptz,
  payload jsonb not null default '{}'::jsonb,
  ingested_at timestamptz not null default now(),
  ingest_date date not null default current_date,
  dedupe_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chatbot_leads_raw_source_external_unique unique (source_system, external_lead_id)
);

create index if not exists idx_chatbot_leads_raw_email on public.chatbot_leads_raw (email);
create index if not exists idx_chatbot_leads_raw_phone on public.chatbot_leads_raw (phone_number);
create index if not exists idx_chatbot_leads_raw_create_time on public.chatbot_leads_raw (create_time desc);
create index if not exists idx_chatbot_leads_raw_source_system on public.chatbot_leads_raw (source_system);
create index if not exists idx_chatbot_leads_raw_payload_gin on public.chatbot_leads_raw using gin (payload);

create table if not exists public.lead_followups (
  id uuid primary key default gen_random_uuid(),
  lead_raw_id uuid references public.chatbot_leads_raw(id) on delete cascade,
  source_system text not null,
  external_lead_id bigint not null,
  email text,
  phone_number text,
  display_name text,
  lead_summary text,
  lead_intent text,
  priority text not null default 'medium',
  owner text not null default 'jenny',
  followup_status text not null default 'new',
  next_action text,
  next_action_at timestamptz,
  last_contacted_at timestamptz,
  last_contact_channel text,
  notes text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_followups_source_external_unique unique (source_system, external_lead_id)
);

create index if not exists idx_lead_followups_owner_status on public.lead_followups (owner, followup_status);
create index if not exists idx_lead_followups_priority on public.lead_followups (priority);
create index if not exists idx_lead_followups_next_action_at on public.lead_followups (next_action_at);
create index if not exists idx_lead_followups_last_seen_at on public.lead_followups (last_seen_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_chatbot_leads_raw_updated_at on public.chatbot_leads_raw;
create trigger trg_chatbot_leads_raw_updated_at
before update on public.chatbot_leads_raw
for each row
execute function public.set_updated_at();

drop trigger if exists trg_lead_followups_updated_at on public.lead_followups;
create trigger trg_lead_followups_updated_at
before update on public.lead_followups
for each row
execute function public.set_updated_at();
