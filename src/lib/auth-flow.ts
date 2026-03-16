import { isAllowedExternalAuthTarget } from "@/lib/pricing";

export const DOWNLOAD_RETURN_TO = "/downloads";
export const DOWNLOAD_LOGIN_HREF = `/login?returnTo=${encodeURIComponent(DOWNLOAD_RETURN_TO)}`;

export function getSafeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/")) return DOWNLOAD_RETURN_TO;
  if (value.startsWith("//")) return DOWNLOAD_RETURN_TO;
  return value;
}

export function getSafeExternal(value: string | null) {
  if (!value) return null;
  return isAllowedExternalAuthTarget(value) ? value : null;
}

export function buildLoginHref({
  returnTo,
  external,
  authError,
  authErrorDescription,
}: {
  returnTo?: string | null;
  external?: string | null;
  authError?: string | null;
  authErrorDescription?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("returnTo", getSafeReturnTo(returnTo ?? null));

  const safeExternal = getSafeExternal(external ?? null);
  if (safeExternal) {
    params.set("external", safeExternal);
  }

  if (authError) {
    params.set("authError", authError);
  }

  if (authErrorDescription) {
    params.set("authErrorDescription", authErrorDescription);
  }

  return `/login?${params.toString()}`;
}
