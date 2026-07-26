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

    const sub = await db
      .prepare("SELECT stripe_customer_id FROM subscriptions WHERE user_scope = ? AND stripe_customer_id IS NOT NULL")
      .bind(auth.user.id)
      .first<{ stripe_customer_id: string }>();

    if (!sub?.stripe_customer_id) {
      return { ok: false as const, error: "no_subscription" as const };
    }

    const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: sub.stripe_customer_id,
        return_url: `https://orgasmo.higgsfield.app/billing`,
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

    const userScope = auth.user.id;

    // Get subscription
    const sub = await db
      .prepare(
        "SELECT plan_id, status, credits_remaining, credits_total FROM subscriptions WHERE user_scope = ?",
      )
      .bind(userScope)
      .first<{
        plan_id: string;
        status: string;
        credits_remaining: number;
        credits_total: number;
      }>();

    // Get all scopes this user owns or is a member of
    const teamMembers = await db
      .prepare(
        `SELECT member_scope, member_name, member_role FROM team_members
         WHERE team_owner_scope = ? AND status = 'active'
         ORDER BY member_name ASC`,
      )
      .bind(userScope)
      .all() as unknown as { results: { member_scope: string; member_name: string; member_role: string }[] };

    // Build the list of scopes to query (owner + team members)
    const scopes = [userScope, ...teamMembers.results.map((m) => m.member_scope)];

    // Total usage across all scopes
    const placeholders = scopes.map(() => "?").join(",");
    const totalUsed = await db
      .prepare(`SELECT COUNT(*) as count FROM usage_ledger WHERE user_scope IN (${placeholders})`)
      .bind(...scopes)
      .first<{ count: number }>();

    const usageByDay = await db
      .prepare(
        `SELECT DATE(created_at) as day, COUNT(*) as count
         FROM usage_ledger
         WHERE user_scope IN (${placeholders}) AND created_at >= datetime('now', '-30 days')
         GROUP BY DATE(created_at)
         ORDER BY day DESC`,
      )
      .bind(...scopes)
      .all() as unknown as { results: { day: string; count: number }[] };

    const usageByModel = await db
      .prepare(
        `SELECT model, COUNT(*) as count
         FROM usage_ledger
         WHERE user_scope IN (${placeholders})
         GROUP BY model
         ORDER BY count DESC`,
      )
      .bind(...scopes)
      .all() as unknown as { results: { model: string; count: number }[] };

    // Per-member usage breakdown
    const memberUsage = await db
      .prepare(
        `SELECT ul.user_scope, COUNT(*) as count, MAX(ul.member_name) as member_name
         FROM usage_ledger ul
         WHERE ul.user_scope IN (${placeholders})
         GROUP BY ul.user_scope
         ORDER BY count DESC`,
      )
      .bind(...scopes)
      .all() as unknown as {
      results: { user_scope: string; count: number; member_name: string | null }[];
    };

    // Build member breakdown
    const memberBreakdown = [
      {
        userScope: userScope,
        memberName: "You (Owner)",
        count: memberUsage.results.find((m) => m.user_scope === userScope)?.count ?? 0,
        role: "owner",
      },
      ...teamMembers.results.map((m) => ({
        userScope: m.member_scope,
        memberName: m.member_name ?? m.member_scope.slice(0, 8),
        count: memberUsage.results.find((mu) => mu.user_scope === m.member_scope)?.count ?? 0,
        role: m.member_role,
      })),
    ];

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
        memberBreakdown,
        teamMemberCount: teamMembers.results.length,
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
      memberName: z.string().optional(),
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

      // Record usage with optional member attribution
      await db
        .prepare(
          `INSERT INTO usage_ledger (user_scope, generation_id, credits_consumed, model, member_name)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(
          auth.user.id,
          data.generationId ?? null,
          data.credits,
          data.model,
          data.memberName ?? null,
        )
        .run();

      // Decrement credits from subscription
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

export const inviteTeamMemberFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      memberScope: z.string().min(1),
      memberName: z.string().min(1).max(80),
      memberRole: z.enum(["member", "admin"]).default("member"),
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

      // Check if already a member
      const existing = await db
        .prepare(
          "SELECT id FROM team_members WHERE team_owner_scope = ? AND member_scope = ?",
        )
        .bind(auth.user.id, data.memberScope)
        .first();

      if (existing) {
        return { ok: false as const, error: "already_member" as const };
      }

      await db
        .prepare(
          `INSERT INTO team_members (team_owner_scope, member_scope, member_name, member_role, status)
           VALUES (?, ?, ?, ?, 'active')`,
        )
        .bind(auth.user.id, data.memberScope, data.memberName, data.memberRole)
        .run();

      return { ok: true as const };
    } catch (error) {
      console.error("Invite team member error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });

export const removeTeamMemberFn = createServerFn({ method: "POST" })
  .validator(z.object({ memberScope: z.string().min(1) }))
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
          "DELETE FROM team_members WHERE team_owner_scope = ? AND member_scope = ?",
        )
        .bind(auth.user.id, data.memberScope)
        .run();

      return { ok: true as const };
    } catch (error) {
      console.error("Remove team member error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });