/**
 * Server-side auth helper.
 * Re-checks the user's identity before every SDK operation.
 */
export async function requireCurrentUser(): Promise<
  | { ok: true; user: { id: string; workspaceId?: string } }
  | { ok: false; status: number }
> {
  try {
    const response = await fetch("https://fnf.internal/user");
    const body = await response.json().catch(() => null);

    if (response.status === 401) {
      return { ok: false, status: 401 };
    }

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    return {
      ok: true,
      user: {
        id: body.id,
        workspaceId: body.workspaceId,
      },
    };
  } catch {
    return { ok: false, status: 500 };
  }
}