# Cloudflare branded outage fallback

This Worker is the outermost failure layer for Innovator Founder Visa Assistant. It is intentionally hosted outside Railway so customers can still receive a branded response when the Railway origin is unavailable.

## Required architecture

`Visitor -> Cloudflare Worker -> Railway generated origin hostname`

Do **not** set `ORIGIN_HOST` to `innovatorfoundervisaassistant.co.uk`. The Worker is routed on that hostname, so fetching the branded hostname from inside the Worker would recurse back into itself.

Use the Railway-generated public service hostname (for example a `*.up.railway.app` hostname) as `ORIGIN_HOST`.

## Cloudflare setup

1. Add `innovatorfoundervisaassistant.co.uk` to Cloudflare and ensure the relevant DNS record is proxied (orange cloud).
2. Create a Cloudflare Worker using `worker.js` in this directory.
3. Add a Worker environment variable named `ORIGIN_HOST` containing the direct Railway-generated hostname only. Do not include a path.
4. Add a Worker route for `innovatorfoundervisaassistant.co.uk/*`. Add a separate `www` route too if `www` is served rather than redirected.
5. Keep Railway's custom domain configuration in place. The Worker fetches the generated Railway hostname while users continue to see the branded domain.
6. Test a normal page, login/API requests, Stripe callbacks/webhooks, downloads and any WebSocket/streaming routes before considering the edge layer complete.
7. Run a controlled origin-failure test. Browser navigations should receive the branded HTML page with HTTP 503; API requests should receive branded JSON with HTTP 503 and a support reference.

## Failure behaviour

The Worker replaces origin responses with status 500, 502, 503, 504 and Cloudflare 52x/530 origin failures. It also handles origin fetch exceptions.

- Browser document requests receive a self-contained branded service-recovery page.
- API and other non-document requests receive JSON rather than HTML.
- Every fallback response includes `Retry-After: 30` and an `X-Error-Reference` support identifier.
- Responses are `no-store`, so an outage page is not cached after the origin recovers.

## Important operational note

The file in this repository is infrastructure-as-code only. Committing or deploying the Railway application does not activate the Worker. The Cloudflare zone, Worker environment variable and Worker route must be configured in Cloudflare separately.
