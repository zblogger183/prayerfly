// Attached only to www.prayerfly.com (cloudflare/wrangler.www.jsonc). The
// apex is the single canonical host, so every www request — any path, any
// query — gets a permanent redirect to the same URL on prayerfly.com.
// Kept as its own tiny Worker so the main Worker never has to run for
// static assets just to inspect the hostname.

const worker = {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    url.protocol = "https:";
    url.hostname = "prayerfly.com";
    url.port = "";
    return new Response(null, { status: 308, headers: { Location: url.toString() } });
  },
};

export default worker;
