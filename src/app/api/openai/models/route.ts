import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Return list of supported models in OpenAI format
  const models = {
    object: "list",
    data: [
      {
        id: "gpt-5.4",
        object: "model",
        created: 1700000000,
        owned_by: "clawlite",
      },
      {
        id: "gpt-4o",
        object: "model",
        created: 1700000000,
        owned_by: "clawlite",
      },
      {
        id: "gpt-4o-mini",
        object: "model",
        created: 1700000000,
        owned_by: "clawlite",
      },
      {
        id: "claude-sonnet-4-20250514",
        object: "model",
        created: 1700000000,
        owned_by: "clawlite",
      },
    ],
  };

  return NextResponse.json(models);
}
