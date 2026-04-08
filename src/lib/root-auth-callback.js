const DOWNLOAD_RETURN_TO = '/downloads';

function getSafeReturnTo(value) {
  if (!value || !value.startsWith('/')) return DOWNLOAD_RETURN_TO;
  if (value.startsWith('//')) return DOWNLOAD_RETURN_TO;
  return value;
}

function hasAuthPayload(url) {
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  return (
    url.searchParams.has('code') ||
    url.searchParams.has('error') ||
    hash.has('access_token') ||
    hash.has('refresh_token') ||
    hash.has('error')
  );
}

export function buildRootAuthCallbackRedirect(currentUrl) {
  const url = new URL(currentUrl);
  if (url.pathname !== '/') return null;
  if (!hasAuthPayload(url)) return null;

  const params = new URLSearchParams(url.search);
  params.set('returnTo', getSafeReturnTo(params.get('returnTo')));

  const query = params.toString();
  const hash = url.hash || '';
  return `/auth/callback?${query}${hash}`;
}
