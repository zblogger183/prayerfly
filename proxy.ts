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
  { arabic: "خطوات", ascii: "guides" },
  { arabic: "عن-الموقع", ascii: "about" },
  { arabic: "سياسة-الخصوصية", ascii: "privacy" },
  { arabic: "اتصل-بنا", ascii: "contact" },
  { arabic: "ادوات", ascii: "tools" },
  { arabic: "محفوظاتي", ascii: "bookmarks" },
];

export function proxy(request: NextRequest) {
  // decodeURIComponent throws URIError on malformed percent-encoding (a
  // stray "%", an incomplete escape) — previously unguarded, so a crafted
  // request could throw an uncaught error out of the proxy instead of
  // falling through to Next's normal 404 handling. Not exploitable beyond
  // that (no state, nothing else reads this value), but worth closing.
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(request.nextUrl.pathname);
  } catch {
    return;
  }

  for (const { arabic, ascii } of ROUTE_PREFIXES) {
    // Was capped at two segments (enough for /دعاء/[pillar]/[slug]) until
    // opengraph-image.tsx added a third, metadata-route segment
    // (/دعاء/[pillar]/[slug]/opengraph-image) that silently 404'd through
    // this proxy — capturing the whole remainder instead of two fixed
    // groups generalizes to any depth, present or future.
    const match = decodedPathname.match(new RegExp(`^/${arabic}(/.*)?$`));
    if (match) {
      const rest = match[1] ?? "";
      const url = request.nextUrl.clone();
      url.pathname = `/${ascii}${rest}`;
      return NextResponse.rewrite(url);
    }
  }
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
