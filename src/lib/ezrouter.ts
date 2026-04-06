import { execFileSync } from "node:child_process";

type EzRouterListItem = {
  id: number;
  name: string;
  keyPrefix?: string;
  isActive: boolean;
  lastUsedTime?: string;
  createTime?: string;
  totalRequests?: number;
  totalCost?: number;
};

type EzRouterUsageStats = {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  totalOriginalCost: number;
  avgDuration: number;
};

function readKeychainSecret(service: string) {
  if (process.platform !== "darwin") return null;
  try {
    return execFileSync("security", ["find-generic-password", "-a", "openclaw", "-s", service, "-w"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function getEzRouterBaseUrl() {
  return (process.env.EZROUTER_BASE_URL || "https://openrouter.ezsite.ai").replace(/\/$/, "");
}

async function loginEzRouter() {
  const baseUrl = getEzRouterBaseUrl();
  const email = process.env.EZROUTER_EMAIL || readKeychainSecret("EZROUTER_EMAIL");
  const password = process.env.EZROUTER_PASSWORD || readKeychainSecret("EZROUTER_PASSWORD");

  if (!email || !password) {
    throw new Error("missing_ezrouter_login_credentials");
  }

  const url = new URL(`${baseUrl}/api/user/login`);
  url.searchParams.set("email", email);
  url.searchParams.set("password", password);

  const response = await fetch(url.toString(), {
    headers: {
      Referer: `${baseUrl}/`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  const authToken = payload?.Data?.authToken;

  if (!response.ok || !payload?.Success || !authToken) {
    throw new Error(payload?.Message || payload?.HttpError || `ezrouter_login_failed:${response.status}`);
  }

  return authToken as string;
}

async function getEzRouterConfig() {
  const baseUrl = getEzRouterBaseUrl();
  const authToken = process.env.EZROUTER_AUTH_TOKEN || (await loginEzRouter());

  return {
    baseUrl,
    authToken,
  };
}

async function ezrouterFetch(path: string) {
  const { baseUrl, authToken } = await getEzRouterConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: authToken,
      Referer: `${baseUrl}/`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.Success) {
    throw new Error(payload?.Message || payload?.HttpError || `ezrouter_request_failed:${response.status}`);
  }

  return payload.Data;
}

function normalizeListItem(item: any): EzRouterListItem {
  return {
    id: Number(item?.id || 0),
    name: String(item?.name || ""),
    keyPrefix: item?.keyPrefix || undefined,
    isActive: Boolean(item?.isActive),
    lastUsedTime: item?.lastUsedTime || undefined,
    createTime: item?.createTime || undefined,
    totalRequests: Number(item?.totalRequests || 0),
    totalCost: Number(item?.totalCost || 0),
  };
}

export async function listEzRouterApiKeys({ page = 1, size = 100 }: { page?: number; size?: number } = {}) {
  const data = await ezrouterFetch(`/api/apikey/list?page=${page}&size=${size}`);
  const items = Array.isArray(data?.list) ? data.list.map(normalizeListItem) : [];
  return {
    items,
    total: Number(data?.total || items.length || 0),
  };
}

export async function findEzRouterApiKeyByName(name: string) {
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    throw new Error("missing_key_name");
  }

  const exact = trimmed.toLowerCase();
  let page = 1;
  const size = 100;

  while (page <= 20) {
    const { items, total } = await listEzRouterApiKeys({ page, size });
    const match = items.find((item: EzRouterListItem) => item.name.toLowerCase() === exact);
    if (match) return match;
    if (!items.length || page * size >= total) break;
    page += 1;
  }

  return null;
}

export async function getEzRouterUsageStats(apiKeyId: number): Promise<EzRouterUsageStats> {
  if (!apiKeyId) {
    throw new Error("missing_api_key_id");
  }

  const data = await ezrouterFetch(`/api/credit/usageStats?page=1&size=10&apiKeyId=${apiKeyId}`);
  return {
    totalRequests: Number(data?.totalRequests || 0),
    totalInputTokens: Number(data?.totalInputTokens || 0),
    totalOutputTokens: Number(data?.totalOutputTokens || 0),
    totalCost: Number(data?.totalCost || 0),
    totalOriginalCost: Number(data?.totalOriginalCost || 0),
    avgDuration: Number(data?.avgDuration || 0),
  };
}
