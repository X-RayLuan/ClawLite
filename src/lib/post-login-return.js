export function consumePendingPostLoginReturnTo(currentUrl, pendingReturnTo) {
  if (!pendingReturnTo || !pendingReturnTo.startsWith('/')) {
    return null;
  }

  const url = new URL(currentUrl);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  const hasAuthPayload =
    url.searchParams.has('code') ||
    url.searchParams.has('error') ||
    hash.has('access_token') ||
    hash.has('refresh_token') ||
    hash.has('error');

  if (!hasAuthPayload) {
    return null;
  }

  return pendingReturnTo;
}
