/**
 * Email sending service for Orgasmo.
 * Supports SendGrid with Mailgun as fallback.
 * Configure via environment variables (website_secrets).
 */

interface EmailConfig {
  from: string;
  fromName: string;
  replyTo?: string;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

const DEFAULT_CONFIG: EmailConfig = {
  from: "noreply@orgasmo.app",
  fromName: "Orgasmo",
  replyTo: "support@orgasmo.app",
};

/**
 * Send an email via the configured provider.
 * Priority: SendGrid (via API key), then Mailgun, then console log.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ ok: boolean; provider: string; messageId?: string; error?: string }> {
  const { bindings } = await import("./bindings.server");
  const env = bindings();
  const config = { ...DEFAULT_CONFIG };

  const toList = Array.isArray(params.to) ? params.to : [params.to];

  // Try SendGrid first
  const sendgridKey = (env as any).SENDGRID_API_KEY;
  if (sendgridKey) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: toList.map((email) => ({ to: [{ email }] })),
          from: { email: config.from, name: config.fromName },
          reply_to: config.replyTo ? { email: config.replyTo } : undefined,
          subject: params.subject,
          content: [
            { type: "text/plain", value: params.text },
            { type: "text/html", value: params.html },
          ],
        }),
      });

      if (res.ok) {
        const headers = res.headers;
        return {
          ok: true,
          provider: "sendgrid",
          messageId: headers.get("x-message-id") ?? undefined,
        };
      }

      const errorBody = await res.text().catch(() => "Unknown");
      console.error(`[EMAIL] SendGrid error (${res.status}):`, errorBody);

      // If SendGrid fails, fall through to console log
    } catch (err) {
      console.error("[EMAIL] SendGrid exception:", err);
    }
  }

  // Try Mailgun as fallback
  const mailgunKey = (env as any).MAILGUN_API_KEY;
  const mailgunDomain = (env as any).MAILGUN_DOMAIN;
  if (mailgunKey && mailgunDomain) {
    try {
      const formData = new URLSearchParams();
      formData.set("from", `${config.fromName} <${config.from}>`);
      formData.set("subject", params.subject);
      formData.set("text", params.text);
      formData.set("html", params.html);
      for (const to of toList) {
        formData.append("to", to);
      }

      const res = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`api:${mailgunKey}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          ok: true,
          provider: "mailgun",
          messageId: data.id as string,
        };
      }

      const errorBody = await res.text().catch(() => "Unknown");
      console.error(`[EMAIL] Mailgun error (${res.status}):`, errorBody);
    } catch (err) {
      console.error("[EMAIL] Mailgun exception:", err);
    }
  }

  // Fallback: log to console
  console.log("[EMAIL] No email provider configured. Logging email:");
  console.log(`  To: ${toList.join(", ")}`);
  console.log(`  Subject: ${params.subject}`);
  console.log(`  HTML: ${params.html.length} chars`);
  console.log(`  Text: ${params.text.length} chars`);

  return {
    ok: true,
    provider: "console",
    error: "No email provider configured — email logged to console",
  };
}

/**
 * Send a team invite email.
 */
export async function sendInviteEmail(params: {
  toEmail: string;
  inviterName: string;
  teamName: string;
  memberName: string;
  role: string;
  inviteLink: string;
}): Promise<{ ok: boolean; provider: string; messageId?: string }> {
  const { renderInviteEmail, renderInviteText } = await import("./invite-email");

  const html = renderInviteEmail({
    inviterName: params.inviterName,
    inviterEmail: params.toEmail,
    teamName: params.teamName,
    memberName: params.memberName,
    role: params.role,
    inviteLink: params.inviteLink,
    expiresIn: "7 days",
  });

  const text = renderInviteText({
    inviterName: params.inviterName,
    teamName: params.teamName,
    memberName: params.memberName,
    role: params.role,
    inviteLink: params.inviteLink,
  });

  return sendEmail({
    to: params.toEmail,
    subject: `You're invited to join ${params.teamName} on Orgasmo`,
    html,
    text,
  });
}