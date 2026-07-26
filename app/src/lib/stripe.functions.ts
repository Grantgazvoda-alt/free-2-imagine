import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PLANS: Record<string, { priceId: string; credits: number; name: string }> = {
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO ?? "price_pro_monthly",
    credits: 100,
    name: "Pro",
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE ?? "price_enterprise_monthly",
    credits: 500,
    name: "Enterprise",
  },
};

export const createCheckoutSessionFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      planId: z.enum(["pro", "enterprise"]),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      // Require auth
      const { requireCurrentUser } = await import("./auth.server");
      const auth = await requireCurrentUser();
      if (!auth.ok) {
        return { ok: false as const, error: "unauthorized" as const };
      }

      const plan = PLANS[data.planId];
      if (!plan) {
        return { ok: false as const, error: "invalid_plan" as const };
      }

      const { bindings } = await import("./bindings.server");
      const env = bindings();
      const stripeKey = (env as any).STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return { ok: false as const, error: "stripe_not_configured" as const };
      }

      // Create Stripe checkout session
      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "mode": "subscription",
          "line_items[0][price]": plan.priceId,
          "line_items[0][quantity]": "1",
          "success_url": data.successUrl,
          "cancel_url": data.cancelUrl,
          "client_reference_id": auth.user.id,
          "metadata[plan_id]": data.planId,
          "metadata[user_scope]": auth.user.id,
          "subscription_data[metadata][plan_id]": data.planId,
          "subscription_data[metadata][user_scope]": auth.user.id,
        }).toString(),
      });

      const session = await stripeRes.json();
      if (!stripeRes.ok) {
        console.error("Stripe checkout error:", session);
        return { ok: false as const, error: "stripe_error" as const };
      }

      return {
        ok: true as const,
        url: session.url as string,
        sessionId: session.id as string,
      };
    } catch (error) {
      console.error("Checkout session error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });

export const getSubscriptionStatusFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { requireCurrentUser } = await import("./auth.server");
    const auth = await requireCurrentUser();
    if (!auth.ok) {
      return { ok: false as const, error: "unauthorized" as const, subscription: null };
    }

    const { bindings } = await import("./bindings.server");
    const db = bindings().DB;
    if (!db) {
      return { ok: false as const, error: "db_unavailable" as const, subscription: null };
    }

    const sub = await db
      .prepare(
        "SELECT plan_id, status, credits_remaining, credits_total, current_period_end FROM subscriptions WHERE user_scope = ?",
      )
      .bind(auth.user.id)
      .first<{
        plan_id: string;
        status: string;
        credits_remaining: number;
        credits_total: number;
        current_period_end: string;
      }>();

    if (!sub) {
      return {
        ok: true as const,
        subscription: {
          plan: "free",
          creditsRemaining: 10,
          creditsTotal: 10,
          status: "active",
        },
      };
    }

    return {
      ok: true as const,
      subscription: {
        plan: sub.plan_id,
        status: sub.status,
        creditsRemaining: sub.credits_remaining,
        creditsTotal: sub.credits_total,
        currentPeriodEnd: sub.current_period_end,
      },
    };
  } catch (error) {
    console.error("Subscription status error:", error);
    return { ok: false as const, error: "internal_error" as const, subscription: null };
  }
});