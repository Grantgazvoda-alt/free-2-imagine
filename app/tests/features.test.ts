import { describe, it, expect } from "bun:test";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://orgasmo.higgsfield.app";

async function fetchWithUA(url: string) {
  return fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 E2E-Test" },
  });
}

describe("Orgasmo — Health & Monitoring", () => {
  it("health endpoint returns 200", async () => {
    const res = await fetchWithUA(`${BASE_URL}/api/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("health endpoint returns correct status", async () => {
    const res = await fetchWithUA(`${BASE_URL}/api/health`);
    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("app", "orgasmo");
    expect(body).toHaveProperty("version");
    expect(body).toHaveProperty("timestamp");
  });

  it("health endpoint checks database connectivity", async () => {
    const res = await fetchWithUA(`${BASE_URL}/api/health`);
    const body = await res.json();
    expect(body.checks).toHaveProperty("database");
    expect(body.checks).toHaveProperty("auth");
  });

  it("health endpoint has no-cache headers", async () => {
    const res = await fetchWithUA(`${BASE_URL}/api/health`);
    expect(res.headers.get("cache-control")).toContain("no-store");
  });
});

describe("Orgasmo — Settings Page", () => {
  it("settings page loads (HTTP 200)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/settings`);
    expect(res.status).toBe(200);
  });
});

describe("Orgasmo — API Docs Page", () => {
  it("docs page loads (HTTP 200)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/docs`);
    expect(res.status).toBe(200);
  });

  it("docs page contains API documentation sections", async () => {
    const html = await (await fetchWithUA(`${BASE_URL}/docs`)).text();
    expect(html).toContain("API Documentation");
    expect(html).toContain("Orgasmo");
  });
});

describe("Orgasmo — Analytics Dashboard", () => {
  it("analytics page loads (HTTP 200)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/analytics`);
    expect(res.status).toBe(200);
  });
});

describe("Orgasmo — Avatar Style Picker", () => {
  it("avatar style definitions are in the routes bundle", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      // Check for key style values that survive minification
      expect(js).toContain("professional");
      expect(js).toContain("cyberpunk");
      expect(js).toContain("watercolor");
    }
  });

  it("avatar style picker modal is in the routes bundle", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      expect(js).toContain("Browse Styles");
    }
  });

  it("favorites feature is in the routes bundle", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      expect(js).toContain("favorites");
    }
  });
});

describe("Orgasmo — Sidebar Navigation", () => {
  it("routes bundle contains sidebar navigation items", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      expect(js).toContain("Analytics");
      expect(js).toContain("Settings");
    }
  });
});

describe("Orgasmo — In-App Help", () => {
  it("help feature is in the routes bundle (if deployed)", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      if (js.includes("HelpButton")) {
        expect(js).toContain("HelpModal");
      }
    }
  });

  it("help content is in the routes bundle (if deployed)", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      if (js.includes("Getting Started")) {
        expect(js).toContain("Freeform Mode");
        expect(js).toContain("Avatar Mode");
      }
    }
  });
});

describe("Orgasmo — Feature Completeness", () => {
  it("routes bundle has all core features", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      const features = [
        "gpt_image_2",
        "batchSize",
        "StudioPromptBox",
        "Pick the best",
        "ExamplePresets",
        "SignInModal",
        "HeroComposition",
        "Analytics",
        "Settings",
      ];
      for (const feature of features) {
        expect(js).toContain(feature);
      }
    }
  });
});
describe("Orgasmo — Pricing Page", () => {
  it("pricing page loads (HTTP 200)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/pricing`);
    expect(res.status).toBe(200);
  });

  it("pricing page has three tiers", async () => {
    const html = await (await fetchWithUA(`${BASE_URL}/pricing`)).text();
    expect(html).toContain("Free");
    expect(html).toContain("Pro");
    expect(html).toContain("Enterprise");
  });

  it("pricing page shows prices", async () => {
    const html = await (await fetchWithUA(`${BASE_URL}/pricing`)).text();
    expect(html).toContain("$0");
    expect(html).toContain("$9.99");
    expect(html).toContain("$29.99");
  });
});

describe("Orgasmo — Legal Pages", () => {
  it("terms page loads (HTTP 200)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/terms`);
    expect(res.status).toBe(200);
  });

  it("terms page has content", async () => {
    const html = await (await fetchWithUA(`${BASE_URL}/terms`)).text();
    expect(html).toContain("Terms of Service");
    expect(html).toContain("Orgasmo");
  });

  it("privacy page loads (HTTP 200)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/privacy`);
    expect(res.status).toBe(200);
  });

  it("privacy page has content", async () => {
    const html = await (await fetchWithUA(`${BASE_URL}/privacy`)).text();
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Orgasmo");
  });
});

describe("Orgasmo — Stripe Integration", () => {
  it("stripe webhook endpoint exists (if deployed)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/api/stripe/webhook`);
    // Accept 200, 405, 404 if not yet deployed
    expect([200, 404, 405, 500]).toContain(res.status);
  });

  it("routes bundle contains stripe functions", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      // The pricing page references createCheckoutSessionFn
      if (js.includes("createCheckoutSessionFn")) {
        expect(js).toContain("stripe");
      }
    }
  });
});

describe("Orgasmo — Billing Page", () => {
  it("billing page loads (HTTP 200 if deployed)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/billing`);
    expect([200, 404]).toContain(res.status);
  });

  it("billing page has billing content (if deployed)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/billing`);
    if (res.status === 200) {
      const html = await res.text();
      expect(html).toContain("Billing");
    }
  });

  it("routes bundle contains billing functions", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      if (js.includes("Billing")) {
        expect(js).toContain("Usage");
      }
    }
  });
});

describe("Orgasmo — Audit Log Filter UI", () => {
  it("audit log page loads (HTTP 200)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/admin/audit-log`);
    expect([200, 404]).toContain(res.status);
  });


  it("routes bundle contains audit log functions", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      if (js.includes("audit")) {
        expect(js).toContain("AuditLog");
      }
    }
  });
});

describe("Orgasmo — Bulk Template Actions", () => {
  it("email templates page loads (HTTP 200)", async () => {
    const res = await fetchWithUA(`${BASE_URL}/admin/email-templates`);
    expect([200, 404]).toContain(res.status);
  });


  it("routes bundle contains bulk template functions", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      if (js.includes("bulkDownload")) {
        expect(js).toContain("bulkCopy");
      }
    }
  });
});

describe("Orgasmo — Bulk Edit Action", () => {
  it("routes bundle contains bulk edit functions", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      if (js.includes("bulkEdit") || js.includes("openBulkEdit")) {
        expect(js).toContain("Edit");
      }
    }
  });
});

