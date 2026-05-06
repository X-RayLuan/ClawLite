import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const expectedToken = process.env.ADMIN_JWT_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  // Check if otp_codes table exists
  const { error: checkError } = await supabase
    .from("otp_codes")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!checkError) {
    return NextResponse.json({ ok: true, note: "otp_codes table already exists" });
  }

  const errCode = (checkError as any)?.code;
  return NextResponse.json({
    ok: false,
    error: `otp_codes table does not exist. error: ${errCode}`,
  }, { status: 400 });
}
