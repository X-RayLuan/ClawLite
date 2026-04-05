import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function getAuthenticatedClawRouterUser(accessToken?: string | null) {
  if (!accessToken) {
    throw new Error("missing_access_token");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new Error(error?.message || "invalid_access_token");
  }

  return {
    userId: data.user.id,
    email: data.user.email || null,
  };
}
