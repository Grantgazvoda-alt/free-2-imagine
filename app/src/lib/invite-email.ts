/**
 * Team invite email template.
 * Renders an HTML email for inviting a user to join an Orgasmo team.
 */

export function renderInviteEmail(params: {
  inviterName: string;
  inviterEmail: string;
  teamName: string;
  memberName: string;
  role: string;
  inviteLink: string;
  expiresIn: string;
}): string {
  const { inviterName, teamName, memberName, role, inviteLink, expiresIn } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>You're invited to join ${teamName} on Orgasmo</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .card { background: #181825; border-radius: 12px; border: 1px solid #2a2a3e; padding: 32px; }
    .logo { font-size: 24px; font-weight: 700; color: #a3e635; margin-bottom: 8px; }
    .tagline { color: #71717a; font-size: 14px; margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 600; color: #fff; margin: 0 0 8px; }
    p { color: #a1a1aa; font-size: 15px; line-height: 1.5; margin: 0 0 16px; }
    .details { background: #12121f; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .details dt { color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .details dd { color: #e4e4e7; font-size: 14px; margin: 0 0 12px; }
    .details dd:last-child { margin-bottom: 0; }
    .btn { display: inline-block; background: #a3e635; color: #0a0a0f; font-weight: 600; font-size: 15px; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin: 8px 0 16px; }
    .btn:hover { background: #84cc16; }
    .footer { color: #52525b; font-size: 12px; margin-top: 24px; text-align: center; }
    .footer a { color: #a3e635; text-decoration: none; }
    .badge { display: inline-block; background: #2a2a3e; color: #a1a1aa; font-size: 12px; padding: 2px 8px; border-radius: 4px; margin-left: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Orgasmo</div>
      <div class="tagline">AI Image Generation</div>

      <h1>You're invited to join ${teamName}</h1>
      <p>
        <strong>${inviterName}</strong> has invited you to join their team on Orgasmo.
        As a team member, you'll be able to generate images using the team's plan.
      </p>

      <div class="details">
        <dl>
          <dt>Team</dt>
          <dd>${teamName}</dd>

          <dt>Invited by</dt>
          <dd>${inviterName}</dd>

          <dt>Your role</dt>
          <dd>${role.charAt(0).toUpperCase() + role.slice(1)} <span class="badge">${role === "admin" ? "60% usage limit" : "40% usage limit"}</span></dd>

          <dt>Expires</dt>
          <dd>${expiresIn}</dd>
        </dl>
      </div>

      <a href="${inviteLink}" class="btn">Accept Invitation</a>

      <p style="font-size: 13px; color: #52525b;">
        This invitation was sent to you because someone invited you to join Orgasmo.
        If you weren't expecting this, you can safely ignore this email.
      </p>
    </div>

    <div class="footer">
      <p>
        Orgasmo — AI Image Generation<br />
        <a href="https://orgasmo.higgsfield.app">orgasmo.higgsfield.app</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Plain-text fallback for the invite email.
 */
export function renderInviteText(params: {
  inviterName: string;
  teamName: string;
  memberName: string;
  role: string;
  inviteLink: string;
}): string {
  const { inviterName, teamName, memberName, role, inviteLink } = params;
  return [
    `You're invited to join ${teamName} on Orgasmo`,
    "",
    `${inviterName} has invited you to join their team on Orgasmo.`,
    `Your role: ${role}`,
    "",
    `Accept the invitation: ${inviteLink}`,
    "",
    "Orgasmo — AI Image Generation",
    "https://orgasmo.higgsfield.app",
  ].join("\n");
}