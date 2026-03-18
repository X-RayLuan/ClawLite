create table if not exists public.waitlist_conversions (
  email text primary key,
  user_id uuid,
  converted_to_user boolean not null default false,
  converted_at timestamptz,
  first_confirmed_at timestamptz,
  first_sign_in_at timestamptz,
  source text not null default 'auth_callback',
  notes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists waitlist_conversions_user_id_idx on public.waitlist_conversions (user_id);
create index if not exists waitlist_conversions_converted_idx on public.waitlist_conversions (converted_to_user);

create or replace function public.set_waitlist_conversions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_waitlist_conversions_updated_at on public.waitlist_conversions;
create trigger trg_waitlist_conversions_updated_at
before update on public.waitlist_conversions
for each row execute function public.set_waitlist_conversions_updated_at();

create or replace function public.mark_waitlist_customer_converted(
  p_email text,
  p_user_id uuid,
  p_confirmed_at timestamptz default null,
  p_last_sign_in_at timestamptz default null,
  p_source text default 'auth_callback'
)
returns public.waitlist_conversions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_row public.waitlist_conversions;
begin
  v_email := lower(trim(coalesce(p_email, '')));

  if v_email = '' then
    raise exception 'email is required';
  end if;

  insert into public.waitlist_conversions (
    email,
    user_id,
    converted_to_user,
    converted_at,
    first_confirmed_at,
    first_sign_in_at,
    source,
    notes
  )
  values (
    v_email,
    p_user_id,
    true,
    coalesce(p_last_sign_in_at, p_confirmed_at, now()),
    p_confirmed_at,
    p_last_sign_in_at,
    coalesce(nullif(trim(coalesce(p_source, '')), ''), 'auth_callback'),
    jsonb_build_object('linked_via', 'auth_callback')
  )
  on conflict (email) do update
  set user_id = excluded.user_id,
      converted_to_user = true,
      converted_at = coalesce(public.waitlist_conversions.converted_at, excluded.converted_at),
      first_confirmed_at = coalesce(public.waitlist_conversions.first_confirmed_at, excluded.first_confirmed_at),
      first_sign_in_at = coalesce(public.waitlist_conversions.first_sign_in_at, excluded.first_sign_in_at),
      source = excluded.source,
      notes = public.waitlist_conversions.notes || excluded.notes,
      updated_at = now()
  returning * into v_row;

  update public.user_profiles
  set last_sign_in_at = coalesce(p_last_sign_in_at, last_sign_in_at),
      email_confirmed_at = coalesce(p_confirmed_at, email_confirmed_at),
      lifecycle_stage = case
        when coalesce(p_last_sign_in_at, last_sign_in_at) is not null and activated_at is null then 'signed_in_not_activated'
        when coalesce(p_confirmed_at, email_confirmed_at) is not null and coalesce(p_last_sign_in_at, last_sign_in_at) is null then 'confirmed_not_signed_in'
        else lifecycle_stage
      end
  where lower(email) = v_email;

  return v_row;
end;
$$;

grant execute on function public.mark_waitlist_customer_converted(text, uuid, timestamptz, timestamptz, text) to anon, authenticated;
