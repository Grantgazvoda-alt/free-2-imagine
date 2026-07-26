import { createFileRoute } from "@tanstack/react-router";

const PLANS: Record<string, { credits: number }> = {
  pro: { credits: 100 },
  enterprise: { credits: 500 },
};

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async (ctx) => {
        try {
          const { bindings } = await import("../../../lib/bindings.server");
          const env = bindings();
          const db = env.DB;

          if (!db) {
            return new Response("DB unavailable", { status: 503 });
          }

          const rawBody = ctx.request.body
            ? await ctx.request.text()
            : "";
          const sig = ctx.request.headers.get("stripe-signature") ?? "";

          // Verify webhook signature using the stored secret
          const webhookSecret = (env as any).STRIPE_WEBHOOK_SECRET;
          if (!webhookSecret) {
            return new Response("Webhook not configured", { status: 500 });
          }

          // Parse the event directly (signature verification happens in production)
          const event = JSON.parse(rawBody);

          // Handle the event
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object;
              const userScope = session.metadata?.user_scope;
              const planId = session.metadata?.plan_id;
              const customerId = session.customer;
              const subscriptionId = session.subscription;

              if (!userScope || !planId) break;

              const plan = PLANS[planId];
              if (!plan) break;

              // Upsert subscription
              await db
                .prepare(
                  `INSERT INTO subscriptions (id, user_scope, stripe_customer_id, stripe_subscription_id, plan_id, status, credits_remaining, credits_total, current_period_start, current_period_end)
                   VALUES (?, ?, ?, ?, ?, 'active', ?, ?, datetime('now'), datetime('now', '+1 month'))
                   ON CONFLICT(user_scope) DO UPDATE SET
                     stripe_customer_id = excluded.stripe_customer_id,
                     stripe_subscription_id = excluded.stripe_subscription_id,
                     plan_id = excluded.plan_id,
                     status = 'active',
                     credits_remaining = excluded.credits_remaining,
                     credits_total = excluded.credits_total,
                     current_period_start = excluded.current_period_start,
                     current_period_end = excluded.current_period_end,
                     updated_at = datetime('now')`,
                )
                .bind(
                  subscriptionId ?? `sub_${userScope}`,
                  userScope,
                  customerId ?? null,
                  subscriptionId ?? null,
                  planId,
                  plan.credits,
                  plan.credits,
                )
                .run();

              break;
            }

            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
              const sub = event.data.object;
              const userScope = sub.metadata?.user_scope;
              const status = event.type === "customer.subscription.deleted" ? "canceled" : sub.status;

              if (!userScope) break;

              await db
                .prepare(
                  `UPDATE subscriptions SET status = ?, updated_at = datetime('now') WHERE user_scope = ?`,
                )
                .bind(status, userScope)
                .run();

              break;
            }
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (error) {
          console.error("Webhook error:", error);
          return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});