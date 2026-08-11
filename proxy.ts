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
// One entry per top-level Arabic route from Section 4.1. Add to this list
// rather than writing a new regex per route — Sprint 7/9 add more
// (/ادوات/, /عن-الموقع, /سياسة-الخصوصية, /اتصل-بنا, /محفوظاتي).
const ROUTE_PREFIXES: { arabic: string; ascii: string }[] = [
  { arabic: "دعاء", ascii: "dua" },
  { arabic: "اذكار", ascii: "azkar" },
];

export function proxy(request: NextRequest) {
  const decodedPathname = decodeURIComponent(request.nextUrl.pathname);

  for (const { arabic, ascii } of ROUTE_PREFIXES) {
    const match = decodedPathname.match(
      new RegExp(`^/${arabic}(?:/([^/]+))?(?:/([^/]+))?/?$`)
    );
    if (match) {
      const [, first, second] = match;
      const url = request.nextUrl.clone();
      url.pathname = first ? `/${ascii}/${first}${second ? `/${second}` : ""}` : `/${ascii}`;
      return NextResponse.rewrite(url);
    }
  }
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
