create or replace function public.sync_auth_user_to_profile(p_user_id uuid)
returns public.user_profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user auth.users%rowtype;
  v_source_detail text;
  v_source text;
  v_tags jsonb;
  v_profile public.user_profiles;
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  select * into v_user from auth.users where id = p_user_id;
  if not found then
    raise exception 'auth user not found for %', p_user_id;
  end if;

  if v_user.email is null then
    raise exception 'auth user email is null for %', p_user_id;
  end if;

  v_source_detail := nullif(trim(coalesce(v_user.raw_user_meta_data ->> 'imported_from', '')), '');
  v_source := case v_source_detail
    when 'google_sheets_waitlist' then 'clawlite_waitlist'
    when 'obsidian_users_txt' then 'ezsite_import'
    else 'unknown'
  end;

  v_tags := '[]'::jsonb;
  if v_source_detail is not null then
    v_tags := v_tags || jsonb_build_array('import:' || v_source_detail);
  end if;
  if v_user.email_confirmed_at is not null then
    v_tags := v_tags || jsonb_build_array('email_confirmed');
  end if;
  if v_user.last_sign_in_at is null then
    v_tags := v_tags || jsonb_build_array('never_signed_in');
  else
    v_tags := v_tags || jsonb_build_array('signed_in');
  end if;
  if position('+' in v_user.email) > 0 then
    v_tags := v_tags || jsonb_build_array('plus_address');
  end if;

  insert into public.user_profiles (
    user_id,
    email,
    source,
    source_detail,
    lifecycle_stage,
    tags,
    email_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    v_user.id,
    v_user.email,
    v_source,
    v_source_detail,
    case
      when v_user.last_sign_in_at is not null then 'signed_in_not_activated'
      when v_user.email_confirmed_at is not null then 'confirmed_not_signed_in'
      else 'unknown'
    end,
    v_tags,
    v_user.email_confirmed_at,
    v_user.last_sign_in_at,
    coalesce(v_user.created_at, now()),
    now()
  )
  on conflict (user_id) do update
  set email = excluded.email,
      source = case when public.user_profiles.source = 'unknown' then excluded.source else public.user_profiles.source end,
      source_detail = coalesce(public.user_profiles.source_detail, excluded.source_detail),
      lifecycle_stage = case
        when coalesce(excluded.last_sign_in_at, public.user_profiles.last_sign_in_at) is not null and public.user_profiles.activated_at is null then 'signed_in_not_activated'
        when coalesce(excluded.email_confirmed_at, public.user_profiles.email_confirmed_at) is not null and coalesce(excluded.last_sign_in_at, public.user_profiles.last_sign_in_at) is null then 'confirmed_not_signed_in'
        else public.user_profiles.lifecycle_stage
      end,
      tags = excluded.tags,
      email_confirmed_at = coalesce(excluded.email_confirmed_at, public.user_profiles.email_confirmed_at),
      last_sign_in_at = coalesce(excluded.last_sign_in_at, public.user_profiles.last_sign_in_at),
      updated_at = now()
  returning * into v_profile;

  return v_profile;
end;
$$;

grant execute on function public.sync_auth_user_to_profile(uuid) to anon, authenticated;
