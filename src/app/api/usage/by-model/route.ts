import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);
    const supabase = getSupabaseAdminClient();

    const searchParams = request.nextUrl.searchParams;
    const keyName = searchParams.get("keyName")?.trim() || null;
    const periodDays = Math.min(Number(searchParams.get("days")) || 30, 365);
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from("usage_events")
      .select("model, tokens_in, tokens_out, cost, created_at", { count: "exact" })
      .eq("account_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (keyName) {
      query = query.eq("key_name", keyName);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) throw new Error(eventsError.message || "failed_to_load_usage_by_model");

    // Aggregate by model
    const modelMap = new Map<
      string,
      {
        model: string;
        totalRequests: number;
        totalTokensIn: number;
        totalTokensOut: number;
        totalCost: number;
        lastUsedAt: string | null;
      }
    >();

    for (const event of events || []) {
      const model = String(event.model || "unknown");
      const existing = modelMap.get(model) || {
        model,
        totalRequests: 0,
        totalTokensIn: 0,
        totalTokensOut: 0,
        totalCost: 0,
        lastUsedAt: null,
      };

      existing.totalRequests += 1;
      existing.totalTokensIn += Number(event.tokens_in || 0);
      existing.totalTokensOut += Number(event.tokens_out || 0);
      existing.totalCost += Number(event.cost || 0);
      if (!existing.lastUsedAt || event.created_at > existing.lastUsedAt) {
        existing.lastUsedAt = event.created_at;
      }

      modelMap.set(model, existing);
    }

    const byModel = Array.from(modelMap.values()).sort(
      (a, b) => b.totalCost - a.totalCost,
    );

    return NextResponse.json(
      {
        ok: true,
        byModel,
        periodDays,
        keyName: keyName || null,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error: any) {
    const errorMessage = error?.message || "failed_to_load_usage_by_model";
    if (
      errorMessage === "missing_access_token" ||
      errorMessage === "invalid_access_token" ||
      errorMessage.includes("JWT")
    ) {
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 400 },
    );
  }
}
