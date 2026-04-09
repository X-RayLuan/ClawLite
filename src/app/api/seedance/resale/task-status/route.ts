import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    await getAuthenticatedClawRouterUser(accessToken);

    const taskId = request.nextUrl.searchParams.get("taskId");
    if (!taskId) {
      return NextResponse.json({ ok: false, error: "missing_task_id" }, { status: 400 });
    }

    const arkApiKey = process.env.ARK_API_KEY;
    if (!arkApiKey) {
      throw new Error("missing_ark_api_key");
    }

    const resp = await fetch(`https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${arkApiKey}`,
      },
    });

    const json = await resp.json().catch(() => ({}));
    return NextResponse.json({ ok: resp.ok, task: json }, { status: resp.status });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "failed_to_fetch_task_status" },
      { status: 400 },
    );
  }
}
