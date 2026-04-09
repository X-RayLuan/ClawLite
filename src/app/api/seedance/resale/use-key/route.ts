import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClawRouterUser } from "@/lib/clawrouter-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { validateSeedanceLicense } from "@/lib/seedance-resale";

export const runtime = "nodejs";

const ARK_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks";
const ALLOWED_MODELS = new Set([
  "doubao-seedance-2-0-260128",
  "doubao-seedance-2-0-fast-260128",
]);

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient();

  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const { userId } = await getAuthenticatedClawRouterUser(accessToken);

    const body = await request.json().catch(() => ({}));
    const seedanceLicense = typeof body.seedanceLicense === "string" ? body.seedanceLicense : "";
    const model = typeof body.model === "string" ? body.model : "doubao-seedance-2-0-260128";
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const ratio = typeof body.ratio === "string" ? body.ratio : "16:9";
    const resolution = typeof body.resolution === "string" ? body.resolution : "720p";
    const duration = Number.isFinite(Number(body.duration)) ? Number(body.duration) : 5;
    const videoInput = body.video || body.videoUrl || body.inputVideo || null;

    if (!seedanceLicense) {
      return NextResponse.json({ ok: false, error: "missing_seedance_license" }, { status: 400 });
    }
    if (!prompt) {
      return NextResponse.json({ ok: false, error: "missing_prompt" }, { status: 400 });
    }
    if (!ALLOWED_MODELS.has(model)) {
      return NextResponse.json({ ok: false, error: "model_not_allowed" }, { status: 400 });
    }
    if (resolution !== "720p") {
      return NextResponse.json({ ok: false, error: "only_720p_supported" }, { status: 400 });
    }
    if (videoInput) {
      return NextResponse.json({ ok: false, error: "video_input_not_supported" }, { status: 400 });
    }
    if (duration <= 0) {
      return NextResponse.json({ ok: false, error: "invalid_duration" }, { status: 400 });
    }

    const validation = await validateSeedanceLicense(supabase, {
      userId,
      seedanceLicense,
      taskEstimateUnits: duration,
    });

    const arkApiKey = process.env.ARK_API_KEY;
    if (!arkApiKey) {
      throw new Error("missing_ark_api_key");
    }

    const arkPayload = {
      model,
      content: [{ type: "text", text: prompt }],
      video_generation_config: {
        duration,
        aspect_ratio: ratio,
        resolution,
      },
      content_generation_request_id: `clawlite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    const arkResp = await fetch(ARK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${arkApiKey}`,
      },
      body: JSON.stringify(arkPayload),
    });

    const arkJson = await arkResp.json().catch(() => ({}));
    if (!arkResp.ok) {
      await supabase
        .from("seedance_usage_log")
        .update({
          status: "failed",
          meta_json: {
            arkError: arkJson,
            model,
            resolution,
            ratio,
            duration,
          },
        })
        .eq("id", validation.usageId);

      return NextResponse.json(
        { ok: false, error: "ark_request_failed", details: arkJson },
        { status: 400 },
      );
    }

    await supabase
      .from("seedance_usage_log")
      .update({
        status: "completed",
        external_task_id: arkJson.id ?? null,
        meta_json: {
          model,
          resolution,
          ratio,
          duration,
          arkTask: arkJson,
        },
      })
      .eq("id", validation.usageId);

    return NextResponse.json(
      {
        ok: true,
        validation,
        task: arkJson,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "failed_to_use_seedance_license" },
      { status: 400 },
    );
  }
}
