import { NextRequest, NextResponse } from "next/server";

// Replaces the /دعاء/... -> /dua/... mapping that used to live in
// next.config.ts's rewrites(). Confirmed empirically that rewrites()
// doesn't work here: its `source` pattern only matched requests carrying
// literal raw UTF-8 bytes in the request line, but real browsers/crawlers
// always percent-encode non-ASCII URLs before sending (e.g. "/%D8%AF...")
// — so it "worked" for a raw-byte curl test and would have silently 404'd
// for every real visitor. Decoding manually here and rewriting with
// NextResponse.rewrite() sidesteps whatever encoding assumption rewrites()
// makes internally.
export function proxy(request: NextRequest) {
  const decodedPathname = decodeURIComponent(request.nextUrl.pathname);
  const match = decodedPathname.match(/^\/دعاء\/([^/]+)(?:\/([^/]+))?\/?$/);

  if (match) {
    const [, pillar, slug] = match;
    const url = request.nextUrl.clone();
    url.pathname = slug ? `/dua/${pillar}/${slug}` : `/dua/${pillar}`;
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
