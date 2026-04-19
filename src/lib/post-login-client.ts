import { getPartnerCouponConfig, getPartnerFromCookieString, PARTNER_REFERRAL_COOKIE } from "@/lib/partner-referral";

type BrowserSupabaseClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
};

type BrowserUser = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
};

export async function syncPostLoginClientState(input: {
  supabase: BrowserSupabaseClient;
  user: BrowserUser;
  returnTo?: string | null;
}) {
  try {
    window.localStorage.removeItem("clawlite-post-login-returnTo");
  } catch {
    // ignore storage failures
  }

  try {
    await input.supabase.rpc("sync_auth_user_to_profile", {
      p_user_id: input.user.id,
    });
  } catch (profileSyncError) {
    console.error("user profile sync failed", profileSyncError);
  }

  try {
    await input.supabase.rpc("mark_waitlist_customer_converted", {
      p_email: input.user.email || null,
      p_user_id: input.user.id,
      p_confirmed_at: input.user.email_confirmed_at ?? null,
      p_last_sign_in_at: input.user.last_sign_in_at ?? null,
      p_source: "auth_callback",
    });
  } catch (conversionError) {
    console.error("waitlist conversion sync failed", conversionError);
  }

  try {
    const returnToUrl = input.returnTo ? new URL(input.returnTo, window.location.origin) : null;
    const returnToPartnerSlug = returnToUrl?.searchParams.get("partner") || null;
    const partnerSlug = getPartnerFromCookieString(document.cookie) || returnToPartnerSlug;
    const partner = getPartnerCouponConfig(partnerSlug);
    if (!partner) return;

    await input.supabase.rpc("apply_partner_referral", {
      p_user_id: input.user.id,
      p_partner_slug: partner.slug,
      p_partner_coupon_code: partner.couponCode,
    });
    document.cookie = `${PARTNER_REFERRAL_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } catch (partnerReferralError) {
    console.error("partner referral sync failed", partnerReferralError);
  }
}
