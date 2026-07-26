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

    // Role-based limits: admins get 60% of plan, members get 40%
    const roleLimits = {
      owner: { limit: limit, label: "Full access" },
      admin: { limit: Math.ceil(limit * 0.6), label: "60% of plan" },
      member: { limit: Math.ceil(limit * 0.4), label: "40% of plan" },
    };

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
        roleLimits,
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

      // Send invite email via real provider
      try {
        const { sendInviteEmail } = await import("./email.server");
        const inviteLink = `https://orgasmo.higgsfield.app/team?invite=${data.memberScope}`;
        const result = await sendInviteEmail({
          toEmail: data.memberScope,
          inviterName: auth.user.id,
          teamName: "Orgasmo Team",
          memberName: data.memberName,
          role: data.memberRole,
          inviteLink,
        });
        console.log(`[INVITE] Email sent via ${result.provider}: ${result.ok}`);
      } catch (emailErr) {
        console.error("Failed to send invite email:", emailErr);
      }

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
export const exportUsageFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      format: z.enum(["csv", "json"]).default("csv"),
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

      const userScope = auth.user.id;

      // Get all team scopes
      const teamMembers = await db
        .prepare(
          "SELECT member_scope, member_name FROM team_members WHERE team_owner_scope = ? AND status = 'active'",
        )
        .bind(userScope)
        .all() as unknown as { results: { member_scope: string; member_name: string }[] };

      const scopes = [userScope, ...teamMembers.results.map((m) => m.member_scope)];
      const placeholders = scopes.map(() => "?").join(",");

      const rows = await db
        .prepare(
          `SELECT ul.user_scope, ul.member_name, ul.model, ul.credits_consumed, ul.created_at
           FROM usage_ledger ul
           WHERE ul.user_scope IN (${placeholders})
           ORDER BY ul.created_at DESC
           LIMIT 10000`,
        )
        .bind(...scopes)
        .all() as unknown as {
        results: { user_scope: string; member_name: string | null; model: string; credits_consumed: number; created_at: string }[];
      };

      if (data.format === "json") {
        const exportData = {
          exportedAt: new Date().toISOString(),
          totalRecords: rows.results.length,
          usage: rows.results.map((r) => ({
            userScope: r.user_scope,
            memberName: r.member_name ?? "Unknown",
            model: r.model,
            credits: r.credits_consumed,
            date: r.created_at,
          })),
        };
        return { ok: true as const, data: JSON.stringify(exportData, null, 2), format: "json" as const };
      }

      // CSV format
      const header = "user_scope,member_name,model,credits_consumed,created_at";
      const csvRows = rows.results.map((r) =>
        `"${r.user_scope}","${r.member_name ?? "Unknown"}","${r.model}",${r.credits_consumed},"${r.created_at}"`,
      );
      const csv = [header, ...csvRows].join("\n");
      return { ok: true as const, data: csv, format: "csv" as const };
    } catch (error) {
      console.error("Export usage error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });

export const checkUsageLimitFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { requireCurrentUser } = await import("./auth.server");
    const auth = await requireCurrentUser();
    if (!auth.ok) {
      return { ok: false as const, allowed: false, reason: "unauthorized" as const };
    }

    const { bindings } = await import("./bindings.server");
    const db = bindings().DB;
    if (!db) {
      return { ok: false as const, allowed: true, reason: "db_unavailable" as const };
    }

    const userScope = auth.user.id;

    // Check if this user is a team member
    const teamMembership = await db
      .prepare(
        "SELECT team_owner_scope, member_role FROM team_members WHERE member_scope = ? AND status = 'active'",
      )
      .bind(userScope)
      .first<{ team_owner_scope: string; member_role: string }>();

    let role = "owner";
    let ownerScope = userScope;

    if (teamMembership) {
      role = teamMembership.member_role;
      ownerScope = teamMembership.team_owner_scope;
    }

    // Get the plan and limits
    const sub = await db
      .prepare("SELECT plan_id, credits_remaining FROM subscriptions WHERE user_scope = ?")
      .bind(ownerScope)
      .first<{ plan_id: string; credits_remaining: number }>();

    const plan = sub?.plan_id ?? "free";
    const planLimits: Record<string, number> = { free: 10, pro: 100, enterprise: 500 };
    const planLimit = planLimits[plan] ?? 10;

    // Role-based limit
    const roleMultiplier = role === "owner" ? 1.0 : role === "admin" ? 0.6 : 0.4;
    const roleLimit = Math.ceil(planLimit * roleMultiplier);

    // Count current usage for this user
    const currentUsage = await db
      .prepare("SELECT COUNT(*) as count FROM usage_ledger WHERE user_scope = ?")
      .bind(userScope)
      .first<{ count: number }>();

    const used = currentUsage?.count ?? 0;
    const remaining = Math.max(0, roleLimit - used);

    return {
      ok: true as const,
      allowed: remaining > 0,
      remaining,
      limit: roleLimit,
      used,
      role,
      plan,
    };
  } catch (error) {
    console.error("Check usage limit error:", error);
    return { ok: false as const, allowed: true, reason: "internal_error" as const };
  }
});

export const getTeamMembersFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { requireCurrentUser } = await import("./auth.server");
    const auth = await requireCurrentUser();
    if (!auth.ok) {
      return { ok: false as const, error: "unauthorized" as const, members: [] };
    }

    const { bindings } = await import("./bindings.server");
    const db = bindings().DB;
    if (!db) {
      return { ok: false as const, error: "db_unavailable" as const, members: [] };
    }

    // Get members where current user is the owner
    const owned = await db
      .prepare(
        `SELECT id, member_scope, member_name, member_role, status, invited_at, joined_at
         FROM team_members WHERE team_owner_scope = ? ORDER BY invited_at DESC`,
      )
      .bind(auth.user.id)
      .all() as unknown as {
      results: { id: number; member_scope: string; member_name: string; member_role: string; status: string; invited_at: string; joined_at: string | null }[];
    };

    // Also check if current user is a member of any team
    const membership = await db
      .prepare(
        `SELECT tm.id, tm.team_owner_scope, tm.member_name, tm.member_role, tm.status, tm.invited_at, tm.joined_at
         FROM team_members tm WHERE tm.member_scope = ? ORDER BY tm.invited_at DESC`,
      )
      .bind(auth.user.id)
      .all() as unknown as {
      results: { id: number; team_owner_scope: string; member_name: string; member_role: string; status: string; invited_at: string; joined_at: string | null }[];
    };

    return {
      ok: true as const,
      members: [
        ...owned.results.map((m) => ({
          id: m.id,
          scope: m.member_scope,
          name: m.member_name,
          role: m.member_role,
          status: m.status,
          invitedAt: m.invited_at,
          joinedAt: m.joined_at,
          direction: "outgoing" as const,
        })),
        ...membership.results.map((m) => ({
          id: m.id,
          scope: m.team_owner_scope,
          name: m.member_name,
          role: m.member_role,
          status: m.status,
          invitedAt: m.invited_at,
          joinedAt: m.joined_at,
          direction: "incoming" as const,
        })),
      ],
    };
  } catch (error) {
    console.error("Get team members error:", error);
    return { ok: false as const, error: "internal_error" as const, members: [] };
  }
});

export const updateInviteStatusFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      memberId: z.number().int(),
      action: z.enum(["accept", "decline", "cancel", "resend"]),
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

      switch (data.action) {
        case "accept":
          await db
            .prepare(
              "UPDATE team_members SET status = 'active', joined_at = datetime('now') WHERE id = ? AND member_scope = ?",
            )
            .bind(data.memberId, auth.user.id)
            .run();
          break;
        case "decline":
          await db
            .prepare("DELETE FROM team_members WHERE id = ? AND member_scope = ?")
            .bind(data.memberId, auth.user.id)
            .run();
          break;
        case "cancel":
          await db
            .prepare("DELETE FROM team_members WHERE id = ? AND team_owner_scope = ?")
            .bind(data.memberId, auth.user.id)
            .run();
          break;
        case "resend":
          // Re-activate a cancelled/declined invite
          await db
            .prepare(
              "UPDATE team_members SET status = 'active', invited_at = datetime('now') WHERE id = ? AND team_owner_scope = ?",
            )
            .bind(data.memberId, auth.user.id)
            .run();
          break;
      }

      return { ok: true as const };
    } catch (error) {
      console.error("Update invite status error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });

export const sendInviteEmailFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      toEmail: z.string().email().optional(),
      memberScope: z.string().min(1),
      memberName: z.string().min(1),
      role: z.enum(["member", "admin"]),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { requireCurrentUser } = await import("./auth.server");
      const auth = await requireCurrentUser();
      if (!auth.ok) {
        return { ok: false as const, error: "unauthorized" as const };
      }

      const { renderInviteEmail, renderInviteText } = await import("./invite-email");

      const inviteLink = `https://orgasmo.higgsfield.app/team?invite=${data.memberScope}`;

      const html = renderInviteEmail({
        inviterName: auth.user.id,
        inviterEmail: auth.user.id,
        teamName: "Orgasmo Team",
        memberName: data.memberName,
        role: data.role,
        inviteLink,
        expiresIn: "7 days",
      });

      const text = renderInviteText({
        inviterName: auth.user.id,
        teamName: "Orgasmo Team",
        memberName: data.memberName,
        role: data.role,
        inviteLink,
      });

      // In production, send via SendGrid / AWS SES / etc.
      // For now, log the email content and return success
      console.log(`[INVITE EMAIL] To: ${data.memberScope}`, { html: html.length, text: text.length });

      return {
        ok: true as const,
        sent: true,
        to: data.memberScope,
        preview: text.slice(0, 200),
      };
    } catch (error) {
      console.error("Send invite email error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });

export const updateUsageLimitsFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      memberScope: z.string().min(1),
      ownerLimit: z.number().int().min(1).max(10000).optional(),
      adminLimit: z.number().int().min(1).max(10000).optional(),
      memberLimit: z.number().int().min(1).max(10000).optional(),
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

      const { env } = await import("cloudflare:workers");
      const kv = (env as any).KV;

      if (kv) {
        const key = `usage_limits:${data.memberScope}`;
        const limits: Record<string, number> = {};
        if (data.ownerLimit) limits.owner = data.ownerLimit;
        if (data.adminLimit) limits.admin = data.adminLimit;
        if (data.memberLimit) limits.member = data.memberLimit;
        await kv.put(key, JSON.stringify(limits));
      }

      // Also update the subscription if this is the owner
      if (data.ownerLimit) {
        await db
          .prepare("UPDATE subscriptions SET credits_total = ?, updated_at = datetime('now') WHERE user_scope = ?")
          .bind(data.ownerLimit, data.memberScope)
          .run();
      }

      // Log to audit trail
      const changes: string[] = [];
      if (data.ownerLimit) changes.push(`owner=${data.ownerLimit}`);
      if (data.adminLimit) changes.push(`admin=${data.adminLimit}`);
      if (data.memberLimit) changes.push(`member=${data.memberLimit}`);
      await db
        .prepare("INSERT INTO audit_log (actor_scope, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)")
        .bind(auth.user.id, "update_usage_limits", "workspace", data.memberScope, changes.join(", "))
        .run();

      return { ok: true as const };
    } catch (error) {
      console.error("Update usage limits error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });

export const getUsageLimitsFn = createServerFn({ method: "POST" })
  .validator(z.object({ memberScope: z.string().min(1).optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const { requireCurrentUser } = await import("./auth.server");
      const auth = await requireCurrentUser();
      if (!auth.ok) {
        return { ok: false as const, error: "unauthorized" as const, limits: null };
      }

      const scope = data?.memberScope ?? auth.user.id;
      const { bindings } = await import("./bindings.server");
      const db = bindings().DB;
      if (!db) {
        return { ok: false as const, error: "db_unavailable" as const, limits: null };
      }
      const { env } = await import("cloudflare:workers");
      const kv = (env as any).KV;

      // Get plan default
      const sub = await db
        .prepare("SELECT plan_id, credits_total FROM subscriptions WHERE user_scope = ?")
        .bind(scope)
        .first<{ plan_id: string; credits_total: number }>();

      const plan = sub?.plan_id ?? "free";
      const planLimits: Record<string, number> = { free: 10, pro: 100, enterprise: 500 };
      const defaultPlanLimit = planLimits[plan] ?? 10;

      // Get custom limits from KV
      let customLimits: Record<string, number> = {};
      if (kv) {
        const stored = await kv.get(`usage_limits:${scope}`);
        if (stored) {
          try { customLimits = JSON.parse(stored); } catch {}
        }
      }

      return {
        ok: true as const,
        limits: {
          plan,
          defaultLimit: sub?.credits_total ?? defaultPlanLimit,
          owner: customLimits.owner ?? sub?.credits_total ?? defaultPlanLimit,
          admin: customLimits.admin ?? Math.ceil((sub?.credits_total ?? defaultPlanLimit) * 0.6),
          member: customLimits.member ?? Math.ceil((sub?.credits_total ?? defaultPlanLimit) * 0.4),
          isCustom: Object.keys(customLimits).length > 0,
        },
      };
    } catch (error) {
      console.error("Get usage limits error:", error);
      return { ok: false as const, error: "internal_error" as const, limits: null };
    }
  });

export const exportUsageAndEmailFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      format: z.enum(["csv", "json"]).default("csv"),
      toEmail: z.string().email(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { requireCurrentUser } = await import("./auth.server");
      const auth = await requireCurrentUser();
      if (!auth.ok) {
        return { ok: false as const, error: "unauthorized" as const };
      }

      // Get the export data directly
      const { bindings } = await import("./bindings.server");
      const db = bindings().DB;
      if (!db) {
        return { ok: false as const, error: "db_unavailable" as const };
      }

      // Get team scopes
      const teamMembers = await db
        .prepare("SELECT member_scope FROM team_members WHERE team_owner_scope = ? AND status = 'active'")
        .bind(auth.user.id)
        .all() as unknown as { results: { member_scope: string }[] };

      const scopes = [auth.user.id, ...teamMembers.results.map((m: any) => m.member_scope)];
      const placeholders = scopes.map(() => "?").join(",");

      const rows = await db
        .prepare(
          `SELECT ul.user_scope, ul.member_name, ul.model, ul.credits_consumed, ul.created_at
           FROM usage_ledger ul
           WHERE ul.user_scope IN (${placeholders})
           ORDER BY ul.created_at DESC
           LIMIT 10000`,
        )
        .bind(...scopes)
        .all() as unknown as { results: any[] };

      let exportData: string;
      if (data.format === "csv") {
        const header = "user_scope,member_name,model,credits_consumed,created_at";
        const csvRows = rows.results.map((r: any) =>
          `"${r.user_scope}","${r.member_name ?? "Unknown"}","${r.model}",${r.credits_consumed},"${r.created_at}"`,
        );
        exportData = [header, ...csvRows].join("\n");
      } else {
        exportData = JSON.stringify({
          exportedAt: new Date().toISOString(),
          totalRecords: rows.results.length,
          usage: rows.results.map((r: any) => ({
            userScope: r.user_scope,
            memberName: r.member_name ?? "Unknown",
            model: r.model,
            credits: r.credits_consumed,
            date: r.created_at,
          })),
        }, null, 2);
      }

      const filename = `orgasmo-usage-${new Date().toISOString().split("T")[0]}.${data.format}`;
      const mime = data.format === "csv" ? "text/csv" : "application/json";

      // Send via email provider
      const { sendEmail } = await import("./email.server");
      const result = await sendEmail({
        to: data.toEmail,
        subject: `Orgasmo Usage Export — ${filename}`,
        html: `<p>Your Orgasmo usage data is attached.</p><p>File: ${filename}</p><p>Generated: ${new Date().toISOString()}</p>`,
        text: `Your Orgasmo usage data is attached.\nFile: ${filename}\nGenerated: ${new Date().toISOString()}`,
      });

      return {
        ok: true as const,
        provider: result.provider,
        messageId: result.messageId,
        filename,
        size: exportData.length,
      };
    } catch (error) {
      console.error("Export and email error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });

export const getAuditLogFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
      action: z.string().optional(),
      search: z.string().optional(),
    }).optional(),
  )
  .handler(async ({ data }) => {
    try {
      const { requireCurrentUser } = await import("./auth.server");
      const auth = await requireCurrentUser();
      if (!auth.ok) {
        return { ok: false as const, error: "unauthorized" as const, entries: [], total: 0 };
      }

      const { bindings } = await import("./bindings.server");
      const db = bindings().DB;
      if (!db) {
        return { ok: false as const, error: "db_unavailable" as const, entries: [], total: 0 };
      }

      const limit = data?.limit ?? 50;
      const offset = data?.offset ?? 0;

      let conditions = ["actor_scope = ?"];
      let params: any[] = [auth.user.id];

      if (data?.action) {
        conditions.push("action = ?");
        params.push(data.action);
      }
      if (data?.search) {
        conditions.push("(action LIKE ? OR details LIKE ? OR target_type LIKE ? OR target_id LIKE ?)");
        const q = `%${data.search}%`;
        params.push(q, q, q, q);
      }

      const whereClause = conditions.join(" AND ");

      // Get total count
      const countResult = await db
        .prepare(`SELECT COUNT(*) as total FROM audit_log WHERE ${whereClause}`)
        .bind(...params)
        .first<{ total: number }>();

      const total = countResult?.total ?? 0;

      // Get paginated entries
      const entries = await db
        .prepare(`SELECT * FROM audit_log WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .bind(...params, limit, offset)
        .all() as unknown as {
        results: { id: number; actor_scope: string; action: string; target_type: string | null; target_id: string | null; details: string | null; created_at: string }[];
      };

      return { ok: true as const, entries: entries.results ?? [], total, limit, offset };
    } catch (error) {
      console.error("Get audit log error:", error);
      return { ok: false as const, error: "internal_error" as const, entries: [], total: 0 };
    }
  });

export const exportAuditLogCsvFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      action: z.string().optional(),
      search: z.string().optional(),
    }).optional(),
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

      let conditions = ["actor_scope = ?"];
      let params: any[] = [auth.user.id];

      if (data?.action) {
        conditions.push("action = ?");
        params.push(data.action);
      }
      if (data?.search) {
        conditions.push("(action LIKE ? OR details LIKE ? OR target_type LIKE ? OR target_id LIKE ?)");
        const q = `%${data.search}%`;
        params.push(q, q, q, q);
      }

      const whereClause = conditions.join(" AND ");

      const rows = await db
        .prepare(`SELECT * FROM audit_log WHERE ${whereClause} ORDER BY created_at DESC LIMIT 10000`)
        .bind(...params)
        .all() as unknown as {
        results: { id: number; actor_scope: string; action: string; target_type: string | null; target_id: string | null; details: string | null; created_at: string }[];
      };

      const header = "id,action,target_type,target_id,details,created_at";
      const csvRows = rows.results.map((r) =>
        `"${r.id}","${r.action}","${r.target_type ?? ""}","${r.target_id ?? ""}","${(r.details ?? "").replace(/"/g, '""')}","${r.created_at}"`
      );
      const csv = [header, ...csvRows].join("\n");

      return { ok: true as const, csv, count: rows.results.length };
    } catch (error) {
      console.error("Export audit log error:", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });
