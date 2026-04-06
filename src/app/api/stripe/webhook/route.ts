import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { settleCheckoutSessionRecord } from "@/lib/clawrouter-checkout";
import { ensureClawRouterApiKey } from "@/lib/clawrouter-keys";
import { settleTopupCheckoutSession } from "@/lib/clawrouter-topups";
import { assignInventoryKeyToAccount } from "@/lib/clawrouter-delivery";

export const runtime = "nodejs";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ ok: false, error: "missing_stripe_secret_key" }, { status: 500 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false, error: "missing_stripe_webhook_secret" }, { status: 500 });
    }

    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ ok: false, error: "missing_stripe_signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const supabase = getSupabaseAdminClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const kind = session.metadata?.kind;
        const localSessionId = session.metadata?.checkout_session_id;

        if (kind === "clawrouter_topup") {
          const accountId = session.metadata?.account_id;
          const amountUsd = Number(session.metadata?.amount_usd || 0);
          const promoCode = session.metadata?.promo_code || null;

          if (!accountId || !Number.isFinite(amountUsd) || amountUsd <= 0) {
            throw new Error("invalid_topup_metadata");
          }

          await settleTopupCheckoutSession({
            supabase,
            accountId,
            stripeSessionId: session.id,
            stripeEventId: event.id,
            amountUsd,
            promoCode,
            metadata: {
              stripe_payment_status: session.payment_status,
              stripe_customer_email: session.customer_details?.email ?? null,
              stripe_status: session.status,
              settled_at: new Date().toISOString(),
            },
          });

          await ensureClawRouterApiKey(supabase, accountId);
          break;
        }

        if (localSessionId) {
          const settled = await settleCheckoutSessionRecord({
            supabase,
            sessionId: localSessionId,
            status: "completed",
            provider: "stripe",
            externalSessionId: session.id,
            settlement: {
              stripe_event_id: event.id,
              stripe_session_id: session.id,
              stripe_payment_status: session.payment_status,
              stripe_customer_email: session.customer_details?.email ?? null,
              stripe_status: session.status,
              settled_at: new Date().toISOString(),
            },
          });

          const deliveryMode = session.metadata?.delivery_mode || "inventory_key";
          if (deliveryMode === "inventory_key") {
            const assignment = await assignInventoryKeyToAccount({
              supabase,
              accountId: settled.accountId,
            });
            if (assignment.soldOut) {
              throw new Error("inventory_key_sold_out");
            }
          } else {
            await ensureClawRouterApiKey(supabase, settled.accountId);
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const localSessionId = session.metadata?.checkout_session_id;

        if (localSessionId) {
          await settleCheckoutSessionRecord({
            supabase,
            sessionId: localSessionId,
            status: "expired",
            provider: "stripe",
            externalSessionId: session.id,
            settlement: {
              stripe_event_id: event.id,
              stripe_session_id: session.id,
              stripe_status: session.status,
            },
          });
        }
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const localSessionId = session.metadata?.checkout_session_id;

        if (localSessionId) {
          await settleCheckoutSessionRecord({
            supabase,
            sessionId: localSessionId,
            status: "failed",
            provider: "stripe",
            externalSessionId: session.id,
            settlement: {
              stripe_event_id: event.id,
              stripe_session_id: session.id,
              stripe_status: session.status,
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "stripe_webhook_failed" },
      { status: 400 },
    );
  }
}
