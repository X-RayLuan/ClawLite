import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkBalance } from "@/lib/balance";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = "d8ec4f98-f826-4646-8d9e-828f4371d5bd";

  // Method 1: Direct query
  const supabase = getSupabaseAdminClient();
  const { data: account } = await supabase
    .from("accounts")
    .select("id, credit_balance_usd")
    .eq("id", userId)
    .single();

  // Method 2: checkBalance
  let checkBalanceResult = null;
  let checkBalanceError = null;
  try {
    checkBalanceResult = await checkBalance(userId);
  } catch (e: any) {
    checkBalanceError = e.message;
  }

  return NextResponse.json({
    userId,
    directQuery: account,
    checkBalance: checkBalanceResult,
    checkBalanceError,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + "...",
  });
}
