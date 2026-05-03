function encodeStripeForm(data: Record<string, string | number | boolean | null | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }

  return params;
}

function makeStripeAuthHeader(secretKey: string) {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

async function readStripeJson(response: Response) {
  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text };
  }
  return parsed;
}

export async function listStripeCheckoutSessionsViaFetch({
  secretKey,
  limit = 20,
}: {
  secretKey: string;
  limit?: number;
}) {
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
    cache: "no-store",
  });

  const parsed = await readStripeJson(response);

  if (!response.ok) {
    const error = new Error(parsed?.error?.message || parsed?.raw || "stripe_fetch_list_checkout_sessions_failed") as Error & {
      type?: string | null;
      code?: string | null;
      statusCode?: number;
      requestId?: string | null;
      raw?: any;
    };
    error.type = parsed?.error?.type || null;
    error.code = parsed?.error?.code || null;
    error.statusCode = response.status;
    error.requestId = response.headers.get("request-id");
    error.raw = parsed?.error || parsed;
    throw error;
  }

  return parsed?.data || [];
}

export async function createStripeCheckoutSessionViaFetch({
  secretKey,
  fields,
}: {
  secretKey: string;
  fields: Record<string, string | number | boolean | null | undefined>;
}) {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: makeStripeAuthHeader(secretKey),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeStripeForm(fields).toString(),
    cache: "no-store",
  });

  const parsed = await readStripeJson(response);

  if (!response.ok) {
    const error = new Error(parsed?.error?.message || parsed?.raw || "stripe_fetch_create_checkout_failed") as Error & {
      type?: string | null;
      code?: string | null;
      statusCode?: number;
      requestId?: string | null;
      raw?: any;
    };
    error.type = parsed?.error?.type || null;
    error.code = parsed?.error?.code || null;
    error.statusCode = response.status;
    error.requestId = response.headers.get("request-id");
    error.raw = parsed?.error || parsed;
    throw error;
  }

  return {
    id: parsed.id as string,
    url: parsed.url as string | null,
    raw: parsed,
  };
}

export async function retrieveStripeCheckoutSessionViaFetch({
  secretKey,
  sessionId,
}: {
  secretKey: string;
  sessionId: string;
}) {
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
    cache: "no-store",
  });

  const parsed = await readStripeJson(response);

  if (!response.ok) {
    const error = new Error(parsed?.error?.message || parsed?.raw || "stripe_fetch_checkout_session_failed") as Error & {
      type?: string | null;
      code?: string | null;
      statusCode?: number;
      requestId?: string | null;
      raw?: any;
    };
    error.type = parsed?.error?.type || null;
    error.code = parsed?.error?.code || null;
    error.statusCode = response.status;
    error.requestId = response.headers.get("request-id");
    error.raw = parsed?.error || parsed;
    throw error;
  }

  return parsed;
}
