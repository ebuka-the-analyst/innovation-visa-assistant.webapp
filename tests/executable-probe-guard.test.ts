import assert from "node:assert/strict";
import test from "node:test";
import { isExecutableProbe, rejectExecutableProbes } from "../server/security/executableProbeGuard";

test("rejects common PHP web shell and WordPress scanning URLs", () => {
  for (const pathname of [
    "/wp-content/plugins/hellopress/wp_filemanager.php",
    "/wordfence-waf.php",
    "/alfa.php", "/reop3.php", "//aa.php",
    "/wp-includes/blocks/freeform/", "/wp-admin/",
    "/upload/test.phtml", "/cgi-bin/exploit.cgi",
  ]) assert.equal(isExecutableProbe(pathname), true, pathname);
});

test("does not disrupt normal client, SEO, API and static routes", () => {
  for (const pathname of [
    "/", "/dashboard", "/questionnaire", "/checkout",
    "/blog/sample-article", "/api/auth/user", "/api/activity/page-view",
    "/assets/index-123.js", "/robots.txt", "/sitemap.xml",
  ]) assert.equal(isExecutableProbe(pathname), false, pathname);
});

test("probe middleware returns 404 with no-store and does not call next", () => {
  const req = { path: "/alfa.php", ip: "203.0.113.7", method: "GET" } as any;
  const out: any = { headers: {}, statusCode: 0, body: "" };
  const res: any = {
    setHeader: (k: string, v: string) => { out.headers[k] = v; },
    status: (code: number) => { out.statusCode = code; return res; },
    type: () => res,
    send: (body: string) => { out.body = body; return res; },
  };
  const previousWarn = console.warn;
  console.warn = () => {};
  let nextCalled = false;
  try { rejectExecutableProbes(req, res, () => { nextCalled = true; }); }
  finally { console.warn = previousWarn; }
  assert.equal(out.statusCode, 404);
  assert.equal(out.headers["Cache-Control"], "no-store");
  assert.equal(out.body, "Not Found");
  assert.equal(nextCalled, false);
});

test("probe middleware passes normal routes through", () => {
  let nextCalled = false;
  rejectExecutableProbes({ path: "/dashboard" } as any, {} as any, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});
