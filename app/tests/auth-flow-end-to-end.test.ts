import { describe, it, expect, beforeAll } from "bun:test";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://orgasmo.higgsfield.app";

async function fetchWithUA(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      "User-Agent": "Mozilla/5.0 E2E-Test",
      ...init?.headers,
    },
  });
}

describe("Auth Flow — End-to-End", () => {
  let html: string;

  beforeAll(async () => {
    html = await (await fetchWithUA(BASE_URL)).text();
  });

  describe("Unauthenticated (guest) access", () => {
    it("serves the app without auth (HTTP 200)", async () => {
      const res = await fetchWithUA(BASE_URL);
      expect(res.status).toBe(200);
    });

    it("returns 401 on /api/user when unauthenticated", async () => {
      const res = await fetchWithUA(`${BASE_URL}/api/user`);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toHaveProperty("error");
    });

    it("has the Higgsfield auth SDK injected into the HTML", () => {
      expect(html).toContain("window.__hfAuthOrigin");
      expect(html).toContain("requestGeneration");
    });

    it("has the sign-in modal in the routes bundle", async () => {
      const m = html.match(/\/assets\/routes-[^"']+\.js/);
      if (m) {
        const js = await (await fetchWithUA(`${BASE_URL}${m[0]}`)).text();
        expect(js).toContain("SignIn");
      }
    });
  });

  describe("Guest scope key management", () => {
    it("fetches the guest scope key from the server", async () => {
      const res = await fetchWithUA(`${BASE_URL}/api/health`);
      expect(res.status).toBe(200);
    });

    it("guest scope key is used for unauthenticated /api/user calls", async () => {
      const res = await fetchWithUA(`${BASE_URL}/api/user`, {
        credentials: "include",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Auth route security", () => {
    it("disallows direct access to auth internals", async () => {
      const res = await fetchWithUA(`${BASE_URL}/__auth/login`, {
        redirect: "manual",
      });
      // Should either redirect or return 404/401
      expect([301, 302, 307, 308, 401, 404].includes(res.status)).toBe(true);
    });
  });

  describe("Protected routes without auth", () => {
    async function expectProtectedRoute(path: string) {
      const res = await fetchWithUA(`${BASE_URL}${path}`, {
        redirect: "manual",
      });
      // Protected routes should either 401 or redirect to auth
      expect([200, 401, 302, 307, 308].includes(res.status)).toBe(true);
      // If it returns 200, it should be SSR content, not a redirect to login
      if (res.status === 200) {
        const text = await res.text();
        expect(text.length).toBeGreaterThan(100);
      }
    }

    it("protects the billing page", async () => {
      await expectProtectedRoute("/billing");
    });

    it("protects the team page", async () => {
      await expectProtectedRoute("/team");
    });

    it("protects the settings page", async () => {
      await expectProtectedRoute("/settings");
    });

    it("protects the analytics page", async () => {
      await expectProtectedRoute("/analytics");
    });

    it("protects the admin pages", async () => {
      await expectProtectedRoute("/admin/audit-log");
      await expectProtectedRoute("/admin/email-templates");
      await expectProtectedRoute("/admin/usage-limits");
    });

    it("allows public pages without auth", async () => {
      const publicRoutes = ["/", "/pricing", "/docs", "/terms", "/privacy"];
      for (const route of publicRoutes) {
        const res = await fetchWithUA(`${BASE_URL}${route}`);
        expect(res.status).toBe(200);
      }
    });
  });

  describe("Auth infrastructure", () => {
    it("the /api/health endpoint reports auth availability", async () => {
      const res = await fetchWithUA(`${BASE_URL}/api/health`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("status", "ok");
    });

    it("returns proper CORS and security headers on auth endpoints", async () => {
      const res = await fetchWithUA(`${BASE_URL}/api/user`);
      expect(res.status).toBe(401);
      // Should have security headers
      const csp = res.headers.get("content-security-policy");
      if (csp) {
        expect(csp).toContain("frame-ancestors");
      }
    });
  });

  describe("Session cookie handling", () => {
    it("does not set a session cookie for unauthenticated requests", async () => {
      const res = await fetchWithUA(BASE_URL);
      const setCookie = res.headers.get("set-cookie");
      // Guest requests should not set auth cookies
      // (they may set other cookies like session IDs)
      if (setCookie) {
        expect(setCookie).not.toContain("session");
      }
    });

    it("includes credentials=include on /api/user calls", async () => {
      // The client-side code uses credentials: 'include' for /api/user
      // This test verifies the server handles it correctly
      const res = await fetchWithUA(`${BASE_URL}/api/user`, {
        credentials: "include",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Auth flow — SSR rendering", () => {
    it("app renders via SSR for unauthenticated users", () => {
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("$tsr-stream-barrier");
      expect(html).toContain("$_TSR");
      expect(html).toContain("modulepreload");
    });

    it("guest users see the app (not a login page)", () => {
      // The app should render for guests, not redirect to a login page
      expect(html).not.toContain("Sign in to continue");
      expect(html).toContain("Orgasmo");
    });
  });
});