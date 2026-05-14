import { NextResponse } from "next/server";
import { getModels } from "@/lib/model-config";

// Public endpoint for installer Model Choose — no auth required.
// Returns supported model list from model-config (backed by ezrouter).
export const runtime = "nodejs";

export async function GET() {
  try {
    const models = await getModels();

    const data = Object.values(models).map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.providerId,
      contextWindow: m.contextWindow,
      inputPer1M: m.inputPerM,
      outputPer1M: m.outputPerM,
    }));

    return NextResponse.json({ ok: true, models: data }, {
      headers: { "Cache-Control": "max-age=300" },
    });
  } catch (err) {
    console.error("[api/models] failed:", err);
    return NextResponse.json({ ok: false, models: [], error: "internal_error" }, { status: 500 });
  }
}
