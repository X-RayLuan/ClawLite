import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  resolveInstallerActivationState,
  getActiveEntitlementForAccount,
  settleCheckoutSessionRecord,
} from "@/lib/clawrouter-checkout";
import { listDeliveredKeysForAccount } from "@/lib/clawrouter-delivery";
import { retrieveStripeCheckoutSessionViaFetch } from "@/lib/stripe-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAccountActive(supabase: any, accountId: string): Promise<boolean> {
  const entitlement = await getActiveEntitlementForAccount(supabase, accountId);
  if (entitlement) return true;

  const deliveredKeys = await listDeliveredKeysForAccount(supabase, accountId);
  if (deliveredKeys.some((k: any) => k.status === "active" && k.plaintextKey)) return true;

  const account = await supabase
    .from("accounts")
    .select("credit_balance_usd")
    .eq("id", accountId)
    .maybeSingle();
  if (account?.data && Number(account.data.credit_balance_usd || 0) > 0) return true;

  return false;
}

async function reconcilePaidStripeCheckout(input: {
  supabase: any;
  localSession: {
    id: string;
    accountId: string;
    provider: string | null;
    externalSessionId: string | null;
  } | null;
}) {
  if (!input.localSession?.externalSessionId) return false;
  if (input.localSession.provider !== "stripe") return false;
  if (!process.env.STRIPE_SECRET_KEY) return false;

  const stripeSession = await retrieveStripeCheckoutSessionViaFetch({
    secretKey: process.env.STRIPE_SECRET_KEY,
    sessionId: input.localSession.externalSessionId,
  });

  const paid = stripeSession?.payment_status === "paid" || stripeSession?.status === "complete";
  if (!paid) return false;

  await settleCheckoutSessionRecord({
    supabase: input.supabase,
    sessionId: input.localSession.id,
    status: "completed",
    provider: "stripe",
    externalSessionId: stripeSession.id,
    settlement: {
      source: "installer_purchase_state_reconcile",
      stripe_session_id: stripeSession.id,
      stripe_payment_status: stripeSession.payment_status || null,
      stripe_status: stripeSession.status || null,
      stripe_customer_email: stripeSession.customer_details?.email || stripeSession.customer_email || null,
      settled_at: new Date().toISOString(),
    },
  });

  return true;
}

export async function GET(request: NextRequest) {
  try {
    const setupToken = request.nextUrl.searchParams.get("setupToken");
    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!setupToken) {
      return NextResponse.json({ error: "setupToken query param is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    if (accountId) {
      const active = await isAccountActive(supabase, accountId);
      if (active) {
        return NextResponse.json({ purchaseState: "completed" });
      }
    }

    const activation = await resolveInstallerActivationState(supabase, setupToken);

    if (activation.account.accountId) {
      const active = await isAccountActive(supabase, activation.account.accountId);
      if (active) {
        return NextResponse.json({ purchaseState: "completed" });
      }
    }

    if (await reconcilePaidStripeCheckout({
      supabase,
      localSession: activation.latestCheckoutSession,
    })) {
      return NextResponse.json({ purchaseState: "completed", reconciled: true });
    }

    const purchaseState = activation.latestCheckoutSession?.purchaseState || "not_started";
    return NextResponse.json({
      purchaseState,
      checkoutSessionId: activation.latestCheckoutSession?.id || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "purchase_state_failed" },
      { status: 500 },
    );
  }
}
