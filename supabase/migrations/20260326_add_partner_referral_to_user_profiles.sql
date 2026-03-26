alter table if exists public.user_profiles
add column if not exists partner_slug text,
add column if not exists partner_coupon_code text,
add column if not exists partner_attributed_at timestamptz;

create index if not exists user_profiles_partner_slug_idx
  on public.user_profiles (partner_slug);

create or replace function public.apply_partner_referral(
  p_user_id uuid,
  p_partner_slug text,
  p_partner_coupon_code text default null
)
returns public.user_profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_profile public.user_profiles;
  v_partner_slug text;
  v_coupon_code text;
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  if auth.uid() is distinct from p_user_id then
    raise exception 'forbidden';
  end if;

  v_partner_slug := nullif(lower(trim(coalesce(p_partner_slug, ''))), '');
  v_coupon_code := nullif(trim(coalesce(p_partner_coupon_code, '')), '');

  if v_partner_slug is null then
    raise exception 'partner_slug is required';
  end if;

  update public.user_profiles
  set partner_slug = coalesce(public.user_profiles.partner_slug, v_partner_slug),
      partner_coupon_code = coalesce(public.user_profiles.partner_coupon_code, v_coupon_code),
      partner_attributed_at = coalesce(public.user_profiles.partner_attributed_at, now()),
      tags = case
        when public.user_profiles.tags @> jsonb_build_array('partner:' || v_partner_slug)
          then public.user_profiles.tags
        else public.user_profiles.tags || jsonb_build_array('partner:' || v_partner_slug)
      end,
      updated_at = now()
  where user_id = p_user_id
  returning * into v_profile;

  if not found then
    raise exception 'user_profile not found for %', p_user_id;
  end if;

  return v_profile;
end;
$$;

grant execute on function public.apply_partner_referral(uuid, text, text) to authenticated;
