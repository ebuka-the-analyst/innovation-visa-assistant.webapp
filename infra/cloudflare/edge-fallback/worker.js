const FAILURE_STATUSES = new Set([500, 502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 527, 530]);

function reference() {
  return `IFVA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function brandedHtml(ref) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Service temporarily unavailable | Innovator Founder Visa Assistant</title>
  <style>
    :root{color-scheme:light;--navy:#071b3f;--green:#059669;--green2:#047857;--muted:#5f6f86;--line:#dce4ee;--bg:#f7f9fc}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;background:var(--bg);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--navy);display:grid;place-items:center;padding:24px}
    .card{width:min(620px,100%);background:#fff;border:1px solid var(--line);border-radius:22px;box-shadow:0 24px 70px rgba(7,27,63,.10);overflow:hidden}
    .bar{height:6px;background:var(--green)}.inner{padding:42px}.brand{display:flex;align-items:center;gap:12px;margin-bottom:34px}.mark{width:44px;height:44px;border-radius:13px;background:linear-gradient(145deg,var(--navy),#123c77);display:grid;place-items:center;color:#fff;font-weight:800;font-size:18px}.brand b{display:block;font-size:15px}.brand span{font-size:12px;color:var(--muted)}
    .status{width:58px;height:58px;border-radius:18px;background:#ecfdf5;display:grid;place-items:center;margin-bottom:22px}.status svg{width:30px;height:30px;color:var(--green)}
    h1{font-size:32px;line-height:1.12;margin:0 0 14px;letter-spacing:-.025em}.lead{font-size:17px;line-height:1.7;color:var(--muted);margin:0 0 24px}.safe{border:1px solid #bbf7d0;background:#f0fdf4;border-radius:14px;padding:14px 16px;color:#166534;font-size:14px;line-height:1.55}
    .actions{display:grid;gap:10px;margin-top:26px}.btn{appearance:none;border:0;border-radius:11px;padding:13px 18px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;text-align:center}.primary{background:var(--green);color:#fff}.primary:hover{background:var(--green2)}.secondary{background:#fff;color:var(--navy);border:1px solid var(--line)}.ref{border-top:1px solid #eef2f7;margin-top:28px;padding-top:18px;text-align:center;color:#7c899b;font-size:12px}.ref code{color:#445269}
    @media(max-width:520px){.inner{padding:30px 24px}h1{font-size:27px}}
  </style>
</head>
<body>
  <main class="card" role="main">
    <div class="bar"></div>
    <div class="inner">
      <div class="brand"><div class="mark">IF</div><div><b>Innovator Founder Visa Assistant</b><span>Founder planning and endorsement preparation platform</span></div></div>
      <div class="status" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"/></svg></div>
      <h1>We’ll be back shortly</h1>
      <p class="lead">The platform is temporarily unavailable while we restore the service. Please try again in a few moments.</p>
      <div class="safe"><strong>Your account remains protected.</strong><br/>Any work that was already saved will still be available when the service is restored.</div>
      <div class="actions">
        <button class="btn primary" onclick="location.reload()">Try again</button>
        <a class="btn secondary" href="mailto:support@innovatorfoundervisaassistant.co.uk?subject=Platform%20availability%20issue%20${encodeURIComponent(ref)}">Contact support</a>
      </div>
      <div class="ref">Support reference <code>${ref}</code></div>
    </div>
  </main>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    if (!env.ORIGIN_HOST) {
      return new Response("Edge fallback is not configured", { status: 503 });
    }

    const requestUrl = new URL(request.url);
    const originUrl = new URL(request.url);
    originUrl.hostname = env.ORIGIN_HOST.replace(/^https?:\/\//, "").replace(/\/$/, "");
    originUrl.protocol = "https:";

    const upstreamRequest = new Request(originUrl.toString(), request);
    let response;

    try {
      response = await fetch(upstreamRequest, {
        cf: { cacheEverything: false },
      });
    } catch (error) {
      response = null;
    }

    if (response && !FAILURE_STATUSES.has(response.status)) {
      return response;
    }

    const ref = reference();
    const acceptsHtml = (request.headers.get("accept") || "").includes("text/html");
    const isNavigation = request.method === "GET" && acceptsHtml;

    if (isNavigation) {
      return new Response(brandedHtml(ref), {
        status: 503,
        headers: {
          "content-type": "text/html; charset=UTF-8",
          "cache-control": "no-store, no-cache, must-revalidate",
          "retry-after": "30",
          "x-error-reference": ref,
        },
      });
    }

    return Response.json(
      {
        error: "The platform is temporarily unavailable. Please try again shortly.",
        message: "The platform is temporarily unavailable. Please try again shortly.",
        reference: ref,
      },
      {
        status: 503,
        headers: {
          "cache-control": "no-store",
          "retry-after": "30",
          "x-error-reference": ref,
        },
      },
    );
  },
};
