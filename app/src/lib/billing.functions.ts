import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getBillingPortalUrlFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { requireCurrentUser } = await import("./auth.server");
    const auth = await requireCurrentUser();
    if (!auth.ok) {
      return { ok: false as const, error: "unauthorized" as const };
    }

    const { bindings } = await import("./bindings.server");
    const env = bindings();
    const stripeKey = (env as any).STRIPE_SECRET_KEY;
    const db = env.DB;

    if (!stripeKey || !db) {
      return { ok: false as const, error: "stripe_not_configured" as const };
    }

    // Get the customer ID from the subscription
    const sub = await db
      .prepare("SELECT stripe_customer_id FROM subscriptions WHERE user_scope = ? AND stripe_customer_id IS NOT NULL")
      .bind(auth.user.id)
      .first<{ stripe_customer_id: string }>();

    if (!sub?.stripe_customer_id) {
      return { ok: false as const, error: "no_subscription" as const };
    }

    // Create Stripe billing portal session
    const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: sub.stripe_customer_id,
        return_url: `${(await import("./bindings.server")).bindings().APP_SLUG ? `https://orgasmo.higgsfield.app/billing` : `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://orgasmo.higgsfield.app"}/billing`}`,
      }).toString(),
    });

    const session = await res.json();
    if (!res.ok) {
      return { ok: false as const, error: "stripe_error" as const };
    }

    return { ok: true as const, url: session.url as string };
  } catch (error) {
    console.error("Billing portal error:", error);
    return { ok: false as const, error: "internal_error" as const };
  }
});

export const getUsageStatsFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { requireCurrentUser } = await import("./auth.server");
    const auth = await requireCurrentUser();
    if (!auth.ok) {
      return { ok: false as const, error: "unauthorized" as const, usage: null };
    }

    const { bindings } = await import("./bindings.server");
    const db = bindings().DB;

    if (!db) {
      return { ok: false as const, error: "db_unavailable" as const, usage: null };
    }

    // Get subscription
    const sub = await db
      .prepare(
        "SELECT plan_id, status, credits_remaining, credits_total FROM subscriptions WHERE user_scope = ?",
      )
      .bind(auth.user.id)
      .first<{
        plan_id: string;
        status: string;
        credits_remaining: number;
        credits_total: number;
      }>();

    // Get usage stats
    const totalUsed = await db
      .prepare("SELECT COUNT(*) as count FROM usage_ledger WHERE user_scope = ?")
      .bind(auth.user.id)
      .first<{ count: number }>();

    const usageByDay = await db
      .prepare(
        `SELECT DATE(created_at) as day, COUNT(*) as count
         FROM usage_ledger
         WHERE user_scope = ? AND created_at >= datetime('now', '-30 days')
         GROUP BY DATE(created_at)
         ORDER BY day DESC`,
      )
      .bind(auth.user.id)
      .all() as unknown as { results: { day: string; count: number }[] };

    const usageByModel = await db
      .prepare(
        `SELECT model, COUNT(*) as count
         FROM usage_ledger
         WHERE user_scope = ?
         GROUP BY model
         ORDER BY count DESC`,
      )
      .bind(auth.user.id)
      .all() as unknown as { results: { model: string; count: number }[] };

    const plan = sub?.plan_id ?? "free";
    const planLimits: Record<string, number> = { free: 10, pro: 100, enterprise: 500 };
    const limit = planLimits[plan] ?? 10;
    const used = totalUsed?.count ?? 0;
    const remaining = Math.max(0, limit - used);

    return {
      ok: true as const,
      usage: {
        plan,
        status: sub?.status ?? "active",
        totalUsed: used,
        monthlyLimit: limit,
        remaining,
        creditsRemaining: sub?.credits_remaining ?? remaining,
        creditsTotal: sub?.credits_total ?? limit,
        usageByDay: usageByDay.results ?? [],
        usageByModel: usageByModel.results ?? [],
      },
    };
  } catch (error) {
    console.error("Usage stats error:", error);
    return { ok: false as const, error: "internal_error" as const, usage: null };
  }
});

export const recordUsageFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      generationId: z.string().optional(),
      credits: z.number().int().min(1).default(1),
      model: z.string().default("gpt_image_2"),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { requireCurrentUser } = await import("./auth.server");
      const auth = await requireCurrentUser();
      if (!auth.ok) {
        return { ok: false as const, error: "unauthorized" as const };
      }

      const { bindings } = await import("./bindings.server");
      const db = bindings().DB;
      if (!db) {
        return { ok: false as const, error: "db_unavailable" as const };
      }

      await db
        .prepare(
          `INSERT INTO usage_ledger (user_scope, generation_id, credits_consumed, model)
           VALUES (?, ?, ?, ?)`,
        )
        .bind(auth.user.id, data.generationId ?? null, data.credits, data.model)
        .run();

      // Decrement credits in subscription if it exists
      await db
        .prepare(
          `UPDATE subscriptions SET credits_remaining = MAX(0, credits_remaining - ?), updated_at = datetime('now')
           WHERE user_scope = ? AND credits_remaining > 0`,
        )
        .bind(data.credits, auth.user.id)
        .run();

      return { ok: true as const };
    } catch (error) {
      console.error("Record usage error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });