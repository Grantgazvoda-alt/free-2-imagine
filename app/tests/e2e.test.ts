import { describe, it, expect, beforeAll } from "bun:test";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://orgasmo.higgsfield.app";

async function fetchWithUA(url: string) {
  return fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 E2E-Test" },
  });
}

describe("Orgasmo — E2E Tests", () => {
  it("serves the main page (HTTP 200)", async () => {
    const res = await fetchWithUA(BASE_URL);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("serves the main JS bundle (HTTP 200)", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    expect(match).not.toBeNull();
    const jsUrl = `${BASE_URL}${match![1]}`;
    const res = await fetchWithUA(jsUrl);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("javascript");
  });

  it("serves CSS bundles (HTTP 200)", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const cssMatches = html.matchAll(/href="(\/assets\/[^"]+\.css)"/g);
    for (const match of cssMatches) {
      const res = await fetchWithUA(`${BASE_URL}${match[1]}`);
      expect(res.status).toBe(200);
    }
  });

  it("returns 401 on /api/user when not authenticated", async () => {
    const res = await fetchWithUA(`${BASE_URL}/api/user`);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("has the correct HTML structure", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('data-theme="default-dark"');
    expect(html).toContain("color-scheme:dark");
  });

  it("has the TanStack streaming SSR setup", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    expect(html).toContain("$tsr-stream-barrier");
    expect(html).toContain("$_TSR");
  });

  it("has the Higgsfield approval SDK injected", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    expect(html).toContain("window.__hfAuthOrigin");
    expect(html).toContain("requestGeneration");
    expect(html).toContain("single-flight");
    expect(html).toContain("AbortError");
  });

  it("has correct CSP headers", async () => {
    const res = await fetchWithUA(BASE_URL);
    const csp = res.headers.get("content-security-policy");
    expect(csp).not.toBeNull();
    expect(csp).toContain("frame-ancestors");
    expect(csp).toContain("higgsfield.app");
  });

  it("has strict-transport-security header", async () => {
    const res = await fetchWithUA(BASE_URL);
    expect(res.headers.get("strict-transport-security")).toContain("max-age=");
  });

  it("has x-content-type-options header", async () => {
    const res = await fetchWithUA(BASE_URL);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("has a title tag with content", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1].length).toBeGreaterThan(0);
  });

  it("has og:title meta", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    expect(html).toContain('property="og:title"');
    expect(html).toContain("Orgasmo");
  });

  it("compiles key features into the routes bundle", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/\/assets\/routes-[^"']+\.js/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[0]}`)).text();
      expect(js).toContain("gpt_image_2");
      expect(js).toContain("Pick the best");
      expect(js).toContain("batchSize");
      expect(js).toContain("variations");
    }
  });

  it("has the FNF browser pipeline in the fnf bundle", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const match = html.match(/src="(\/assets\/fnf\.browser-[^"]+\.js)"/);
    if (match) {
      const js = await (await fetchWithUA(`${BASE_URL}${match[1]}`)).text();
      expect(js).toContain("createJobsFn");
      expect(js).toContain("listJobsFn");
    }
  });
});

describe("Orgasmo — Asset Availability", () => {
  it("all JS assets return 200", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const jsFiles = html.matchAll(/src="(\/assets\/[^"]+\.js)"/g);
    for (const match of jsFiles) {
      const res = await fetchWithUA(`${BASE_URL}${match[1]}`);
      expect(res.status).toBe(200);
    }
  });

  it("all CSS assets return 200", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const cssFiles = html.matchAll(/href="(\/assets\/[^"]+\.css)"/g);
    for (const match of cssFiles) {
      const res = await fetchWithUA(`${BASE_URL}${match[1]}`);
      expect(res.status).toBe(200);
    }
  });
});

describe("Orgasmo — Generation Flow", () => {
  it("routes bundle has key generation features", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const m = html.match(/\/assets\/routes-[^"']+\.js/);
    if (m) {
      const js = await (await fetchWithUA(`${BASE_URL}${m[0]}`)).text();
      expect(js).toContain("gpt_image_2");
      expect(js).toContain("batchSize");
      expect(js).toContain("StudioPromptBox");
    }
  });

  it("routes bundle has upload logic", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const m = html.match(/\/assets\/routes-[^"']+\.js/);
    if (m) {
      const js = await (await fetchWithUA(`${BASE_URL}${m[0]}`)).text();
      expect(js).toContain("upload");
      expect(js).toContain("AssetLibrary");
    }
  });

  it("routes bundle has cost estimation", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const m = html.match(/\/assets\/routes-[^"']+\.js/);
    if (m) {
      const js = await (await fetchWithUA(`${BASE_URL}${m[0]}`)).text();
      const lower = js.toLowerCase();
      expect(lower).toContain("cost");
    }
  });

  it("routes bundle has sign-in modal", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const m = html.match(/\/assets\/routes-[^"']+\.js/);
    if (m) {
      const js = await (await fetchWithUA(`${BASE_URL}${m[0]}`)).text();
      expect(js).toContain("SignIn");
    }
  });

  it("routes bundle has template features", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const m = html.match(/\/assets\/routes-[^"']+\.js/);
    if (m) {
      const js = await (await fetchWithUA(`${BASE_URL}${m[0]}`)).text();
      expect(js).toContain("ExamplePresets");
    }
  });

  it("routes bundle has pick-best modal strings", async () => {
    const html = await (await fetchWithUA(BASE_URL)).text();
    const m = html.match(/\/assets\/routes-[^"']+\.js/);
    if (m) {
      const js = await (await fetchWithUA(`${BASE_URL}${m[0]}`)).text();
      expect(js).toContain("Pick the best");
      expect(js).toContain("Keep this");
    }
  });
});