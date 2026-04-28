import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLAWLITE_BASE_URL = "https://clawlite.ai/api/openai";

function isValidApiKey(key: string): boolean {
  // PRD format: cls_<48 hex chars> = 4 + 48 = 52 chars
  return /^cls_[a-f0-9]{48}$/.test(key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "invalid_request_body" }, { status: 400 });
    }

    const { api_key, base_url } = body as { api_key?: string; base_url?: string };

    // Validate api_key format
    if (!api_key || typeof api_key !== "string" || !isValidApiKey(api_key)) {
      return NextResponse.json({ ok: false, error: "invalid_api_key_format" }, { status: 400 });
    }

    // Validate base_url (use default if not provided)
    const baseUrl = typeof base_url === "string" && base_url.trim() !== ""
      ? base_url.trim()
      : CLAWLITE_BASE_URL;

    // Build the config object per PRD spec
    const config = {
      agents: {
        default: {
          provider: "clawlite",
          baseUrl,
          apiKey: api_key,
        },
      },
    };

    return NextResponse.json({
      ok: true,
      config,
      targetPath: "~/.openclaw/openclaw.json",
    });
  } catch (error: any) {
    console.error("[api/claude/config/write] unexpected error:", error);
    return NextResponse.json({ ok: false, error: error?.message || "internal_error" }, { status: 500 });
  }
}
