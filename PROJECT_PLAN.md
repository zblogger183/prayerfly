# PrayerFly — Research & Build Plan
**Brand: PrayerFly · Domain: prayerfly.com**
**For: Claude Code execution**
**Prepared: August 2026**
**Stack decision: Next.js (App Router) · Monetization: Google AdSense (display)**

**Note on the brand/language mix:** the domain and wordmark are Latin-script English ("PrayerFly"), while all site content, URLs, and search targeting are Arabic. This is a normal pattern for Arabic-market products (comparable to Talabat, Sary, etc.) — keep "PrayerFly" as the logo/wordmark in the header and footer, but never translate or Arabize it. Pair it with a short Arabic tagline under the logo on the homepage (e.g. "أدعية موثقة بإسناد صحيح" — "authentic duas with verified sourcing") so first-time visitors immediately get the trust positioning even though the brand name itself is English.

### Environment notes (confirmed during Sprint 0 — carry forward into every later sprint)

Scaffolded on **Next.js 16.3**, which postdates most training data and changes some specifics below. Verified against current Next.js docs (Aug 2026):

- **`export const revalidate = N` (used in Sprint 4 for weekly ISR) still works exactly as planned** — confirmed. This only breaks if the experimental `cacheComponents` flag gets enabled, which switches the model to `use cache` + `cacheLife()`. **Do not enable `cacheComponents` for this project** — the simple time-based revalidate is sufficient for evergreen dua content and avoids an unnecessary migration.
- **`params` (and `searchParams`) are now async** in route handlers, `page.tsx`, and `generateMetadata` — every dynamic-route function in Sprint 4 (`app/دعاء/[pillar]/[slug]/page.tsx`) must `await params` before reading `pillar`/`slug`, e.g. `const { pillar, slug } = await params;`. This is a real breaking change from what most Next.js examples online still show — apply it from the first line of Sprint 4 code, not as a later fix.
- **Turbopack is the default bundler** now (no flag needed) — no action required, just don't be surprised by it in build output.
- **`middleware.ts` is renamed `proxy.ts`** — turned out to be needed sooner than expected; see the next point.
- **Confirmed during Sprint 4, independently reproduced:** Next.js 16.3's static export throws `InvalidCharacterError` for any literal non-ASCII **folder name** under `app/` (e.g. an actual folder named `دعاء`) — this is a build-breaking bug at the filesystem-routing level, not a config issue. Verified in isolation: a bare static Arabic folder with zero dynamic params fails identically; a fully Arabic **value** in a dynamic segment (ASCII folder, e.g. `app/dua/[slug]/` with `generateStaticParams` returning `{ slug: "دعاء-السفر" }`) builds and prerenders with no issue at all. **The bug is specifically about the literal folder name, not about Arabic text appearing anywhere in the URL.**
  - **Standing convention from Sprint 4 onward: every top-level route folder is named in ASCII on disk** (`app/dua/`, `app/azkar/`, `app/tools/`, `app/about/`, `app/privacy/`, `app/contact/`, etc.), and `proxy.ts` rewrites the real public Arabic URLs (`/دعاء/...`, `/اذكار/...`, `/ادوات/...`, `/عن-الموقع`, `/سياسة-الخصوصية`, `/اتصل-بنا`) onto those ASCII paths. Dynamic segment *values* (`[pillar]`, `[slug]`) stay Arabic with no workaround needed — only literal folder names need the ASCII skeleton.
  - **This applies to every static Arabic route in Section 4.1, not just the one Sprint 4 happened to hit.** Sprint 7 (trust pages) and Sprint 9 (tools, adhkar collections) need to follow this same pattern from the start rather than rediscovering the bug — flagged explicitly in both sprints below.
- **`images.domains` is removed in favor of `images.remotePatterns`** — already reflected correctly in Sprint 0's `next.config.js` guidance below.

---

## 0. What this document is

This is a build spec derived from:
1. A full analysis of your 3,231-row keyword cluster export (`google_sa_دعاء_clusters_by_parent_topic`)
2. Live research into ~12 competing Arabic dua/Islamic content sites — their structure, design, and gaps
3. Current (Aug 2026) Google SEO/schema policy — including a May 2026 change that affects the FAQ-schema advice most guides still give

Sections 1–8 are the "why." **Section 9 is the actual execution roadmap** — sprint by sprint, with file paths, commands, and definitions of done, written so Claude Code can work through it directly.

---

## 1. The opportunity, in numbers

From your dataset (3,231 keyword clusters, "دعاء" = "dua/supplication"):

| Metric | Value |
|---|---|
| Total cluster search volume (sum) | ~3.5M/mo |
| Total global cluster volume | ~13.0M/mo |
| Total global traffic potential | ~157.8M |
| Individual keywords represented | 10,704 |
| Clusters with Difficulty = 0 | 2,759 of 3,231 (85%) |
| Clusters with Difficulty ≤ 5 | ~3,109 of 3,231 (96%) |

This is a rare combination: **massive, evergreen, religiously-motivated search demand with almost no real SEO competition.** Difficulty scores this low usually mean either (a) nobody has built real topical authority here, or (b) monetization/intent is unclear to most publishers — which is exactly why a focused, well-built vertical site can outrank generalist content farms and news sites currently occupying page 1.

**SERP feature signal (this drives the whole content strategy):**

| SERP feature | Present on |
|---|---|
| People Also Ask | 3,102 / 3,231 (96%) |
| AI Overview | 2,336 / 3,231 (72%) |
| Image pack | 2,698 / 3,231 |
| Video preview | 2,348 / 3,231 |
| Featured snippet | 58 / 3,231 (1.8%) |

**Reading this correctly:** almost every query already triggers an AI Overview, but almost none trigger a classic featured snippet. That means the win condition isn't "rank #1 and get the blue link" — it's **"be the source the AI Overview and PAA boxes pull from."** That requires unusually clean, extractable, single-answer content blocks — not longer articles, more *structured* ones. This shapes the page template in Section 5.

### Content pillars (auto-clustered from Parent Topic text)

**Metric note (standardized): every volume figure in this document — this table, the Phase 1 list in Sprint 6, and Section 9's Sprint 2 spec — is `Cluster Volume`, not the narrower `Volume` column.** `Cluster Volume` is the total demand across every keyword variant folded into that topic's cluster (including near-duplicate phrasings), which is what a single well-built page can realistically capture — the more meaningful number for prioritization. An earlier draft of the Sprint 6 Phase 1 table displayed `Volume` figures instead by mistake; that table is corrected below to match this standard.

| Pillar | # Topics | Total volume |
|---|---|---|
| Sickness / healing (مريض، شفاء، سحر، حسد) | 539 | 582,210 |
| Travel (سفر) | 48 | 444,790 |
| Hajj & Umrah (عمرة، حج، طواف، سعي) | 143 | 221,970 |
| Istikhara / decisions | 16 | 192,100 |
| Qur'an completion & surahs | 61 | 176,840 |
| General/category duas | 69 | 165,860 |
| Death / deceased (ميت، متوفى) | 77 | 156,190 |
| Provision & ease (رزق، توفيق، فرج) | 122 | 145,800 |
| Ramadan & fasting | 192 | 135,560 |
| Friday (الجمعة) | 93 | 124,960 |
| Sleep / waking | 29 | 74,880 |
| Exams & studying | 72 | 71,630 |
| Grief / distress (كرب، هم، حزن) | 187 | 63,590 |
| Protection (تحصين) | 48 | 59,490 |
| Repentance | 24 | 59,200 |
| Morning/evening | 26 | 54,080 |
| Parents | 30 | 42,660 |
| Rain/nature | 22 | 40,800 |
| Children/family | 46 | 31,830 |
| Marriage | 70 | 27,930 |
| Home/leaving | 12 | 4,920 |
| **Long-tail relationship duas** (e.g. "دعاء لعمتي المريضة", "دعاء لصديقتي") | ~1,300 | ~626,000 |

That last row is its own opportunity: hundreds of near-identical, low-volume, near-zero-difficulty queries built from a `[dua] + [for] + [relationship/person]` pattern. This is a legitimate case for a **templated/programmatic content system** — see Section 4.3 and Sprint 13 — but it has to be built carefully or it becomes exactly the thin, duplicate content Google's helpful-content systems now suppress.

---

## 2. Competitive research: what's actually ranking

I fetched and read full pages (not just snippets) from the sites currently ranking for your highest-volume terms.

### 2.1 `du3a.org` — the strongest dedicated competitor

Ranks for دعاء الاستخارة, دعاء يوم الجمعة, أذكار الصباح, and more. WordPress + WPBakery.

**What it does right:**
- Real topical depth per page (steps, fiqh rulings, conditions, FAQs, "read also" links)
- Numbered table of contents with jump-links
- Footnoted references (numbered, linking to sources like dorar.net, saaid.net)
- FAQ section targeting PAA-style questions
- Active comment section (UGC, freshness signal, social proof)
- "آخر تحديث" (last updated) date shown — a freshness/E-E-A-T signal

**What it gets wrong (your openings):**
- Generic WordPress visual design — nothing distinctly "Islamic" or premium about the typography or layout
- No audio recitation anywhere — a page about a *spoken* dua has no audio
- No authenticity grading system shown consistently (صحيح/حسن/ضعيف) — a serious trust gap for religious content
- Heavy, repetitive keyword stuffing of the exact-match phrase throughout body text — precisely what Google's helpful-content classifiers are tuned to discount now
- No interactive tools (no Istikhara reminder, no per-relationship dua builder, no bookmarking)
- No downloadable/shareable branded image or PDF — despite explicit demand visible in your keyword set ("بالصور", "دعاء ختم القران للسديس مكتوب pdf")
- No structured "when to say it / how many times" block skimmable in under 3 seconds — everything is prose

### 2.2 `mawdoo3.com` — the generalist authority

Huge Arabic content site, ranks on domain authority not depth — pages read like they're templated across thousands of unrelated topics. A specialist site with real depth and structured data can outrank it on any single query without needing mawdoo3's scale.

### 2.3 `azkarna.com` — similar model to du3a.org
Comparable structure (long TOC, FAQ block, share prompts). Same core gaps: no audio, no grading system, no tools, ad-heavy.

### 2.4 News sites ranking for informational queries
(`elbalad.news`, `almasryalyoum.com`, `samanews.ps`) — rank purely on domain authority for evergreen religious queries unrelated to news. Strong signal the query space is *underserved by specialists*.

### 2.5 Trust/authority references (not competitors — sourcing partners)
- **dorar.net** — the standard hadith-grading database; cite this, don't compete with it
- **islamweb.net** — fatwa authority (Qatar-endorsed), plain design, high E-E-A-T
- Linking out to a grading authority *increases* your own trust signal, it doesn't cannibalize your traffic.

### 2.6 Common flaws across nearly every competitor
1. No hadith authenticity grading shown consistently and visually
2. No audio recitation
3. No genuinely interactive tools — everything is static prose
4. No bookmarking / personal collection (zero reason to return)
5. No print/share-image system despite explicit demand in the keyword data
6. Heavy, intrusive ad layouts with layout shift (bad Core Web Vitals)
7. Near-duplicate pages for spelling variants (e.g. القرآن vs القران) instead of one canonical page — visible directly in your own dataset (rows #5 and #18 are the same topic, two spellings, two separate volumes) — **keyword cannibalization**
8. Keyword-stuffed body copy that reads worse the more "SEO-optimized" it tries to look

---

## 3. Differentiation strategy — what we build that they don't

| Feature | Why it wins |
|---|---|
| **Authenticity Grade badge** on every dua (صحيح / حسن / ضعيف + primary source + narrator) | Biggest trust/differentiation lever for religious content; no competitor does this consistently. |
| **Audio recitation** per dua | Zero competitors offer this. High engagement, unique share hook. |
| **"Say it now" quick-answer block** at the very top — dua text + one-line context, before any history/fiqh discussion | Matches how AI Overviews and PAA extract answers: short, self-contained, first. |
| **Tashkeel toggle** + adjustable font size | Directly matches demand visible in your data ("مكتوب بخط كبير") |
| **Downloadable branded share-image + PDF** per dua | Explicit demand in keywords ("بالصور", "pdf") nobody serves well |
| **Bookmarks / "My Duas" collection** (local storage, no login at MVP) | Reason to return; increases session count |
| **Relationship Dua Finder** for the long-tail "دعاء لـ [شخص]" cluster | Captures ~626K/mo long-tail properly instead of thousands of thin near-duplicate pages |
| **Canonical handling of spelling variants** (القرآن/القران, الاستخاره/الاستخارة, etc.) | Fixes the cannibalization every competitor has |
| **Clean, ad-safe layout with reserved ad slots** (no CLS) | UX and Core Web Vitals advantage over competitors' ad-heavy WordPress builds |

---

## 4. Information architecture

### 4.1 URL structure

All on `prayerfly.com`, Arabic **public** paths (matches user search behavior and competitor URLs — Google handles Arabic URLs natively):

```
https://prayerfly.com/                                  → homepage (search + browse by pillar)
https://prayerfly.com/دعاء/[pillar]/                     → pillar hub (e.g. /دعاء/السفر/)
https://prayerfly.com/دعاء/[pillar]/[slug]/              → individual dua page (e.g. /دعاء/السفر/دعاء-السفر/)
https://prayerfly.com/اذكار/[صباح|مساء|نوم]/             → adhkar collections (high-volume adjacent cluster)
https://prayerfly.com/ادوات/الاستخارة/                   → interactive tools hub
https://prayerfly.com/ادوات/دعاء-لشخص/                   → Relationship Dua Finder (see 4.3)
https://prayerfly.com/عن-الموقع  /سياسة-الخصوصية  /اتصل-بنا   → required trust pages (also AdSense requirement)
```

**Implementation note (confirmed during Sprint 4 — see Environment notes above):** these are the public URLs, not the literal `app/` folder structure. Next.js 16.3 cannot build a literal non-ASCII folder name under `app/`, so every one of these top-level segments lives on disk under an ASCII folder (`app/dua/`, `app/azkar/`, `app/tools/`, `app/about/`, `app/privacy/`, `app/contact/`), and `proxy.ts` rewrites the real Arabic public path onto it. This costs nothing in practice — dynamic segment *values* (`[pillar]`, `[slug]`) are unaffected and stay Arabic natively; only the literal, hardcoded folder names needed the workaround.

**Slug policy (resolved during Sprint 2):** slugs are the plain hyphenated canonical topic text, mechanically generated — no modifier suffixes (e.g. not `-مكتوب`, `-كامل`) added by rule. High-frequency modifiers like "مكتوب" belong in `secondary_keywords`, the H1/meta title, and the quick-answer block instead, where they can be phrased naturally and per-topic. This was an ambiguity in an earlier draft of this document (one example slug showed a `-مكتوب` suffix) — that was illustrative only, not a spec; the mechanical rule is plain hyphenation.

Use Arabic slugs (not transliterated) — matches user search behavior and competitor URLs; Google handles Arabic URLs natively.

### 4.2 Canonicalization rule (fixes the #1 competitor flaw)

Before building pages, run a **deduplication pass on the CSV** grouping topics that are spelling/diacritic variants of the same query (e.g. القرآن/القران, الاستخاره/الاستخارة, دعاء لأمي/دعاء لامي). Build **one page per real topic**, targeting the primary spelling as the canonical URL and folding all variant spellings into on-page text, meta keywords, and `<link rel="canonical">`. This is Sprint 3 below — it's the first real engineering task, and it should run before any content is written, because it produces the actual Phase 1/2/3 page list.

### 4.3 The long-tail relationship system (handles the ~626K/mo "other" bucket)

Instead of ~1,300 near-duplicate static pages ("دعاء لعمتي المريضة", "دعاء لخالتي المريضة", "دعاء لصديقتي المريضة"...), build:

1. A **data-driven template** with real structural variance per relationship: unique intro paragraph, a relationship-appropriate hadith/aathar selection, relationship-specific FAQ (3-4 unique questions per type), and a genuinely different "related duas" block.
2. Populate a **relationship taxonomy** (mother, father, sister, brother, aunt, uncle, friend, spouse, child, grandparent × occasion: sickness, travel, exam, grief, general) — a matrix Claude Code can generate content for, but each cell needs at minimum: 1 unique intro sentence, 1 relationship-specific hadith/athar where one genuinely exists, non-recycled FAQs.
3. **Guardrail:** if a matrix cell has no genuinely distinct content to offer, do *not* create a standalone page — build it as a **filterable section within the parent topic page** (e.g. within `/دعاء/المرض/دعاء-للمريض/`, a "اختر لمن تدعو" selector that swaps the name/pronoun client-side). Use `noindex` liberally at MVP for any auto-generated variant that doesn't clear a real editorial bar.

---

## 5. Page template (the core content unit)

Every dua page follows this block order — designed for AI Overview/PAA extraction *and* human skimmability:

1. **H1** — exact primary keyword phrasing
2. **Quick-answer block** (40–60 words, no fluff): what this dua is + one line of context — the block most likely to get lifted into an AI Overview or used as a voice-search answer
3. **The dua itself** — large type, tashkeel toggle, copy button, audio player, share button
4. **Authenticity block** — grade (صحيح/حسن/ضعيف), narrator, primary source (Bukhari/Muslim/Abu Dawud/etc.), link out to dorar.net for full takhrij
5. **When / how many times to say it** — bulleted, scannable, not buried in prose
6. **Context & ruling (حكم)** — is it obligatory, sunnah, mustahabb — 2-3 short paragraphs max
7. **Variants** (if the cluster includes them)
8. **FAQ** (targeting actual PAA phrasing per topic — 4-6 questions, direct 1-2 sentence answers)
9. **Related duas** (internal links within the same pillar — real topical silo linking)
10. **References** (numbered, linking to islamweb.net, dorar.net, or primary hadith collections)

Keep prose genuinely written — do not repeat the exact-match keyword more than 2-3 times naturally in the body.

---

## 6. Answer Engine Optimization (AEO) & schema — corrected for a policy change you should know about

**Time-sensitive correction to standard advice:** most SEO guides still tell you to lean hard on FAQ schema for SERP visibility. **On May 7, 2026, Google deprecated FAQ rich results** — the expandable Q&A dropdown no longer appears in Google Search for any site (following an earlier 2023 restriction to a small set of gov/health sites). Search Console's FAQ report and the Rich Results Test drop support in June 2026; the API drops it in August 2026. `HowTo` rich results were already fully deprecated on desktop back in 2023.

**Practically:**
- `FAQPage`/`HowTo` schema.org markup is **still valid** and Google says it will keep parsing it to understand content — it's just no longer a cosmetic SERP lever.
- Keep FAQ/HowTo JSON-LD on every page anyway — free to implement, and still crawlable by Bingbot, PerplexityBot, and other RAG/AI crawlers, which matters for AI Overview and AI-answer-engine visibility.
- The real lever now is **content structure itself** (Section 5, block 2) — not schema decoration.

**Schema plan (implement all, expect visual SERP payoff only from some):**
- `Article` — every dua/adhkar page, still fully supported
- `BreadcrumbList` — still a live rich result, implement everywhere
- `FAQPage` — implement for AI-crawler/AEO value, not for a Google rich result
- `Organization` + `WebSite` with `SearchAction` — homepage, for sitelinks search box
- Skip investing in `HowTo`-rich-result-specific markup; a plain, well-labeled step list is enough since the rich result won't render on desktop regardless

### Additional AEO tactics
- Answer literal PAA phrasing as an H2/H3 verbatim where natural
- Keep the quick-answer block self-contained with no pronouns depending on earlier context
- Show a real, current "آخر تحديث" date — freshness matters for both ranking and AI Overview source selection

---

## 7. E-E-A-T & editorial standards (also required for AdSense approval)

**Required trust infrastructure (build before applying for AdSense):**
- `/عن-الموقع` (About) — real editorial process description for "موقع PrayerFly"; content reviewed against dorar.net hadith grading and standard fiqh references, not AI-generated wholesale
- `/سياسة-الخصوصية` (Privacy Policy) — GDPR-aware, mentions AdSense/cookies, references PrayerFly as the data controller
- `/اتصل-بنا` (Contact)
- A visible **"أبلغ عن خطأ" (report an error)** mechanism on every dua page
- Minimum **15-20 genuinely complete, well-structured pillar pages** live before applying for AdSense

**Content rule:** every hadith/Qur'anic citation must carry a source (collection + number where available), and where grading is genuinely contested, say so honestly rather than papering over it.

---

## 8. Design system notes

- **RTL-first**, built in `dir="rtl"` from the start, not retrofitted
- **Wordmark**: "PrayerFly" stays Latin-script in the header/footer/logo even inside the RTL layout (common, expected pattern — don't force-Arabize the brand name); pair with the Arabic tagline per the note at the top of this document
- **Typography**: a proper Arabic naskh typeface for the dua text (Amiri, Lateef, or Noto Naskh Arabic — verify tashkeel renders cleanly at small sizes)
- Dark mode (adhkar are frequently read at night)
- Ad slots: reserved fixed dimensions server-side (no layout shift), max 1 above-the-fold unit, never inside the dua text block
- **Frontend design guidance:** this project has no local skills directory equivalent to the one in the chat sandbox (see Sprint 11.5's as-built note) — use real design judgment directly, no `/mnt/skills/...` path to reference.

### Color tokens (set during Sprint 11.5's revision, replacing the original unstyled default)

```css
--color-primary:   #1C4B42;  /* deep green — wordmark, headings, links, primary badges, footer band */
--color-secondary: #B4E717;  /* lime — accent ONLY: small dots, tag chips, underlines, hover highlight rings */
--color-bg:         #FFFFFF; /* dominant background, everywhere */
```

**Usage rules, deliberate not incidental:**
- Background is solid white almost everywhere. Primary green is used as a *solid fill* only in small, deliberate places (footer band, primary buttons, the `sahih` authenticity badge) — not as a large section background.
- **Lime is an accent color, never a fill for large areas or a text color.** It's high-saturation enough that overuse reads as garish rather than premium; used sparingly (a small dot, a tag chip with dark-green text on top of it, an underline accent, a hover ring) against deep green + white, it reads as intentional and modern. If a component's design calls for "highlight this," reach for a lime accent detail, not a lime background fill.
- Authenticity badges: `sahih` → primary green fill, white text. `hasan`/`mixed`/`no_fixed_hadith` should NOT default to brand colors — keep them semantically distinct (a muted teal/gray family) so a citation's actual grade is never visually confused with brand styling. `daif` stays a warm amber/warning tone regardless of brand palette — a "weak" grade should never look like a positive, on-brand result.
- Text stays a dark neutral (not pure black, not tinted green) for body copy — reserve the primary green for headings, links, and brand elements, not paragraph text.
- Dark mode: derive from these same two brand colors rather than inventing a separate dark palette — the deep green already reads well against a dark surface with adjusted lightness.

---


## 9. Claude Code execution roadmap

This is the actual build sequence. Each sprint has a goal, concrete tasks with file paths/commands, and a definition of done. Work through them in order — later sprints depend on earlier ones (especially Sprint 2's canonicalization output, which determines the real page list every later sprint builds against).

**Standing rule, added after a real incident:** everything from Sprint 6 batch 4 through Sprint 12a sat uncommitted on local disk with zero version control for a long stretch of this build, discovered only when finally pushing to GitHub. **Commit after every sprint (or every clearly-scoped chunk of work within a sprint), not in accumulated batches.** `PROJECT_PLAN.md` and the source keyword CSV live in this same repo, not a separate folder — the earlier outer/inner folder split is exactly what caused a near-miss `git init` that almost swallowed real history into a nested embedded repo; one repo, one history, committed frequently.

### Sprint 0 — Repo & environment setup

**Goal:** a running Next.js app with the right primitives installed, deployed to a preview URL.

**Tasks:**
```bash
npx create-next-app@latest prayerfly --typescript --tailwind --app --src-dir=false --import-alias "@/*"
cd prayerfly
npm install gray-matter next-mdx-remote zod lucide-react
npm install -D @tailwindcss/typography
```
- Configure `next.config.js`: enable `images` remote patterns if audio/image assets are hosted externally; set `output` to default (SSG/ISR, not `export`, since ISR is used later); set `metadataBase: new URL("https://prayerfly.com")` in the root layout metadata so all relative OG/canonical URLs resolve correctly
- Set `<html lang="ar" dir="rtl">` in `app/layout.tsx` globally
- Set the root `metadata.title` as a template: `{ default: "PrayerFly", template: "%s | PrayerFly" }` so every page title consistently carries the brand
- Add Arabic font via `next/font/google` (Noto Naskh Arabic or Amiri) and set as the CSS variable used for all dua-text elements specifically (not the whole UI — use a clean sans for UI chrome, the naskh font only for Qur'anic/dua Arabic text, matching what serious Arabic typography does)
- Init git, connect to Vercel project (`vercel link`), attach the `prayerfly.com` domain in Vercel's project settings (DNS can point later — get the project linked now so every subsequent deploy has a stable target), confirm a first deploy renders a blank RTL page correctly

**Definition of done:** preview URL loads, is RTL, Arabic text renders with the chosen font including tashkeel marks correctly (test with a diacritic-heavy string), page title shows "PrayerFly" in the browser tab.

---

### Sprint 1 — Content schema & validation

**Goal:** a typed, validated content model everything else builds on.

**Tasks:**
- Create `lib/schema.ts` with a Zod schema for a dua entry:
```ts
export const DuaSchema = z.object({
  title: z.string(),
  slug: z.string(),
  pillar: z.string(),
  primary_keyword: z.string(),
  secondary_keywords: z.array(z.string()).default([]),
  quick_answer: z.string().max(400),
  arabic_text_tashkeel: z.string(),
  arabic_text_plain: z.string(),
  authenticity_grade: z.enum(["sahih", "hasan", "daif", "mixed", "no_fixed_hadith"]),
  narrator: z.string().optional(),
  primary_source: z.string(),
  source_url: z.string().url().optional(),
  occasion: z.string(),
  repetition_count: z.string().optional(),
  ruling: z.string(), // sunnah/mustahabb/wajib
  context_markdown: z.string(),      // the "حكم" prose block, rendered via MDX
  variants: z.array(z.object({ label: z.string(), text: z.string() })).default([]),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(8),
  related_slugs: z.array(z.string()).default([]),
  audio_url: z.string().optional(),
  last_updated: z.string(), // ISO date
  index: z.boolean().default(true), // false = noindex, for guarded programmatic pages
});
export type Dua = z.infer<typeof DuaSchema>;
```
- Create `lib/pillar-schema.ts` for pillar hub metadata (title, description, intro, list of child slugs)
- Create `content/duas/` and `content/pillars/` directories
- Write a small test script `scripts/validate-content.ts` that walks `content/duas/*.json`, parses each against `DuaSchema`, and fails the build (non-zero exit) on any validation error — wire this into `package.json` as `"validate:content"` and run it in CI/pre-commit

**Definition of done:** running `npm run validate:content` against one hand-written sample dua JSON file passes; against a deliberately broken one, fails with a clear error.

---

### Sprint 2 — Canonicalization script (run against your real CSV)

**Goal:** turn the raw 3,231-row CSV into the real, deduplicated Phase 1/2/3 page list — this is the single most important data-engineering step, since it fixes the #1 flaw every competitor has.

**Tasks:**
- Create `scripts/dedupe-clusters.ts` (Node script, run once, output committed to repo — not a runtime dependency):
  1. Load the CSV (`Parent Topic`, `Cluster Volume`, `Difficulty`, etc.)
  2. Normalize each `Parent Topic` string: strip tashkeel/diacritics, normalize Alef variants (أ/إ/آ → ا), normalize ة/ه and ي/ى, collapse whitespace
  3. Group rows whose normalized string is identical, or whose Levenshtein distance is below a small threshold (e.g. ≤2 for strings >8 chars) AND share ≥80% token overlap — flag close-but-not-identical matches for **manual review** rather than auto-merging (avoid false-merging genuinely distinct topics like دعاء الصباح vs دعاء بعد الصباح)
  4. Within each confirmed group, pick the canonical entry (highest `Cluster Volume`), sum grouped volumes into a `total_volume` field, list the rest as `variant_spellings`
  5. Assign each canonical topic to a pillar using the theme-keyword classifier from Section 1's table (ship the keyword list used for that classification in the script so it's auditable/adjustable)
  6. Sort by `total_volume` descending, output `content-plan.json`:
```json
{
  "pillar": "السفر",
  "canonical_topic": "دعاء السفر",
  "slug": "دعاء-السفر-مكتوب",
  "total_volume": 424560,
  "difficulty": 1,
  "variant_spellings": ["دعاء سفر", "دعاء السفر مكتوب"],
  "phase": 1
}
```
  7. Assign `phase`: top ~30 by volume → `1`, next ~150-200 (volume > 1,000) → `2`, everything else → `3`

**On pillar coverage:** the ~20-pillar keyword list in Section 1 was built for directional sizing in this document, not as an exhaustive classifier — a large "عام" (uncategorized) fallback bucket on the long tail is expected and fine; pillar hubs don't need to cover everything at MVP, and it's a cheap field to recompute later as Phase 2/3 content gets written. The one thing worth doing now: manually verify every `phase: 1` entry (the 30 pillar pages, Sprint 6) has a real, non-"عام" pillar assigned, since those pages are routed and cross-linked immediately — spend the review effort there, not on the long tail.

**Definition of done:** `content-plan.json` exists, committed, with every one of the 3,231 rows accounted for (either as a canonical entry or a `variant_spellings` member of one), and every `phase: 1` entry has a real pillar assignment — spot-check the دعاء ختم القرآن / دعاء ختم القران pair from Section 2.6 to confirm they merged into one canonical entry.

---

### Sprint 3 — Core UI components

**Goal:** the reusable component library the page template is built from.

**Build these as isolated, independently-testable components in `/components`:**

| Component | Responsibility |
|---|---|
| `DuaText` | Renders Arabic dua text in the naskh font; accepts `showTashkeel: boolean`; strips diacritics client-side when toggled off |
| `TashkeelToggle` | Small switch controlling `DuaText`'s prop, persists preference to localStorage |
| `AuthenticityBadge` | Colored badge (e.g. green/amber/red) for sahih/hasan/daif + tooltip with narrator/source |
| `AudioPlayer` | Minimal player bound to `audio_url`; graceful no-render if absent (MVP may not have audio on every page yet) |
| `CopyButton` | Copies plain (non-tashkeel) Arabic text to clipboard, shows a toast |
| `ShareImageButton` | Client-side canvas render of the dua text over a branded background, with a small "PrayerFly · prayerfly.com" watermark in the corner → downloadable PNG (use `html-to-image` or a `<canvas>` draw routine — avoid a server round-trip for this, keep it client-only for speed) |
| `BookmarkButton` | Toggles the slug in a localStorage array; no backend/login |
| `AdSlot` | Fixed-dimension placeholder div now, real AdSense unit wired in later; **must reserve height even when empty** to avoid CLS |
| `Breadcrumbs` | From pillar + slug, also feeds `BreadcrumbList` JSON-LD |
| `TOC` | Auto-generated from the page's H2s |
| `FaqAccordion` | Renders the `faq` array; also feeds `FAQPage` JSON-LD |
| `RelatedDuas` | Renders `related_slugs` as cards within the same pillar |

**Definition of done:** a `/dev/components` route (dev-only, excluded from sitemap) renders every component with sample props so they can be visually checked in isolation before wiring into the real template.

---

### Sprint 4 — The dua page template & routing

**Goal:** `app/دعاء/[pillar]/[slug]/page.tsx` — the single template every content page uses.

**Tasks:**
- `generateStaticParams()` reads every entry from `content-plan.json` (Sprint 2 output) with `phase` 1 or 2 (phase 3 handled separately, Sprint 13) and returns `{ pillar, slug }` params for full SSG
- **Next.js 16 reminder:** `params` is a `Promise` in this version — `page.tsx` and `generateMetadata()` must both `await params` before destructuring `{ pillar, slug }`, or the build will error
- `generateMetadata()` builds `<title>`, meta description (from `quick_answer`, trimmed), canonical URL, OpenGraph tags
- Page body assembles the 10 blocks from Section 5 in order, using the Sprint 3 components, reading from the matching `content/duas/[slug].json` validated against the Sprint 1 Zod schema
- Add `export const revalidate = 604800` (weekly ISR) so editorial corrections propagate without a full redeploy
- Build the pillar hub template `app/دعاء/[pillar]/page.tsx` similarly: intro copy + grid of child dua cards, also SSG

**Definition of done:** navigating to one real Phase-1 slug (once Sprint 5 content exists) renders a complete, correctly-structured page; `next build` completes and lists the expected number of static pages in its output.

---

### Sprint 5 — Schema.org / JSON-LD implementation

**Goal:** structured data on every page, per Section 6.

**Tasks:**
- `lib/schema.ts`: functions `articleSchema(dua)`, `breadcrumbSchema(pillar, dua)`, `faqSchema(dua.faq)`, `websiteSchema()` (homepage only, with `SearchAction`, `name: "PrayerFly"`, `url: "https://prayerfly.com"`), `organizationSchema()` (`name: "PrayerFly"`, logo, `sameAs` social links once they exist)
- Inject via `<script type="application/ld+json">` in the page template (App Router: return from a small server component, not `dangerouslySetInnerHTML` directly in the page body — keep it isolated)
- Validate output against Google's Rich Results Test for `Article` and `BreadcrumbList` specifically (these still produce visible rich results); confirm `FAQPage` validates structurally even though it won't render as a SERP dropdown (Section 6)

**Definition of done:** Rich Results Test passes clean for `Article` + `BreadcrumbList` on a sample page; `FAQPage` JSON-LD is present and schema-valid even without expecting a rich result. **(Deferred until a live URL exists — Sprint 12. Until then, manual verification against Google's published Article/BreadcrumbList/FAQPage requirements is an acceptable substitute; re-run the real tool once deployed and fix anything it flags that manual review missed.)**

**Addendum — found during Sprint 5, not blocking Sprint 6:** `Article` schema wants an `image` property, and there's currently no image asset to point it at. Rather than add an `image` field to `DuaSchema` (which would mean hand-sourcing or fabricating a picture per dua — wrong instinct for religious text content), use Next.js's `opengraph-image.tsx` file convention with `next/og`'s `ImageResponse`: generate the image server-side per route from data already in the schema (title + `quick_answer` + the PrayerFly wordmark, rendered in the naskh font via an ArrayBuffer font load, same branding as `ShareImageButton`'s canvas output from Sprint 3). Next.js auto-wires this into page `<meta>` OG tags via the file convention; separately pass the same resolved URL into `articleSchema()`'s `image` field so the two stay in sync. This is a real gap but not an urgent one — do it whenever convenient before Sprint 12 (deploy) or Sprint 13 (AdSense, where a missing preview image is a worse look), not necessarily right now.

---

### Sprint 6 — Phase 1 content population (the 30 pillar pages)

**Goal:** the 30 highest-volume, lowest-difficulty topics from your data, fully written to the Section 5 template — this is the editorial core of the launch.

**Source of truth:** this table is a human-readable copy of `content-plan.json`'s `phase: 1` entries, generated by Sprint 2 against the full 3,231-row dataset. **If this table and `content-plan.json` ever disagree, `content-plan.json` wins** — it's mechanically generated from the complete dataset with the merge rule (ة/ه, ي/ى normalization) applied consistently; this table is a manual transcription and can drift, as it did twice already before Sprint 2 actually ran against the full file. Below reflects the real Sprint 2 output, verified against Claude Code's Sprint 2 report.

| # | Topic | Cluster Volume | Difficulty |
|---|---|---|---|
| 1 | دعاء السفر | 424,560 | 1 |
| 2 | دعاء الاستخارة | 179,060 | 5 |
| 3 | دعاء ختم القرآن *(merged with دعاء ختم القران)* | 131,940 | 9 |
| 4 | دعاء لشخص مريض تحبه | 126,560 | 2 |
| 5 | دعاء للميت | 114,090 | 2 |
| 6 | ادعيه *(merged with ادعية، أدعية — hub/category page)* | 87,800 | 12 |
| 7 | دعاء الصفا والمروة | 64,260 | 0 |
| 8 | دعاء يوم الجمعه *(merged with دعاء يوم الجمعة)* | 54,540 | 1 |
| 9 | دعاء النوم | 49,910 | 5 |
| 10 | ادعيه العمره *(merged with أدعية العمرة، ادعية العمرة)* | 49,890 | 1 |
| 11 | دعاء التوبة *(merged with دعاء التوبه)* | 46,390 | 3 |
| 12 | دعاء السعي | 42,770 | 0 |
| 13 | دعاء المطر | 42,160 | 0 |
| 14 | دعاء الوتر | 38,410 | 5 |
| 15 | تحصين النفس | 35,490 | 0 |
| 16 | دعاء الاستفتاح | 35,310 | 5 |
| 17 | دعاء الرزق والتوفيق | 31,490 | 3 |
| 18 | خطوات العمرة | 29,720 | 0 |
| 19 | دعاء الكرب | 29,470 | 1 |
| 20 | دعاء للاب المتوفي | 28,520 | 0 |
| 21 | دعاء الخروج من المنزل | 26,480 | 1 |
| 22 | دعاء الصباح | 26,470 | 0 |
| 23 | دعاء الاختبار | 24,860 | 0 |
| 24 | دعاء لشخص تحبه | 23,850 | 0 |
| 25 | دعاء التوفيق | 22,520 | 0 |
| 26 | دعاء قبل المذاكرة *(merged with دعاء قبل المذاكره)* | 21,730 | 0 |
| 27 | دعاء المذاكرة *(merged with دعاء المذاكره)* | 20,110 | 1 |
| 28 | دعاء ليلة القدر *(merged with دعاء ليله القدر)* | 18,490 | 0 |
| 29 | اذكار التحصين | 17,280 | 0 |
| 30 | دعاء قبل الافطار في رمضان | 16,270 | 0 |

*(دعاء الطواف — 15,490 — falls just short of the top 30; it's the first item on the Phase 2 list.)*

New pillars added during Sprint 2 to cover real phase-1 gaps: **الصلاة** (prayer-specific duas — دعاء الوتر, دعاء الاستفتاح) and **المشاعر والعلاقات** (relationship/emotional duas — دعاء لشخص تحبه), plus an exact-match override so the bare "ادعيه" hub query doesn't fall through to a substring rule.

**Per-page workflow (repeat 30x):**
1. Pull the authentic text + grading from a primary source (Sahih Bukhari/Muslim text, or a verified fiqh reference) — do not paraphrase the dua text itself, it must be exact
2. Cross-check the authenticity grade against dorar.net's hadith encyclopedia
3. Write the `quick_answer` (40-60 words) last, after the rest of the page — it should summarize the finished page, not be written in a vacuum
4. Draft 4-6 FAQ entries from real PAA-style phrasing (search the exact topic to see current PAA questions if uncertain)
5. Fill the Sprint 1 JSON schema completely, run `npm run validate:content`
6. Build, visually QA against the Sprint 3 component checklist (tashkeel toggle works, audio absent gracefully, badge color correct for the grade)

**Definition of done:** 30 pages live on the preview deployment, all passing content validation, all with unique (non-templated) prose in the `context_markdown` and `faq` fields — this is the set Google will use to judge the whole site's quality (both for ranking and for AdSense review), so this is not the sprint to rush.

**Two resolutions from batch 1 (both real scoping gaps, correctly deferred rather than forced):**

- **دعاء ختم القرآن has no single fixed prophetic (marfūʿ) hadith wording** — the circulating text is a scholarly-compiled/companion-practice dua (commonly traced to the end-of-Mushaf convention and to Anas ibn Malik's practice of gathering family after a khatm), not a graded hadith. `DuaSchema.authenticity_grade` now has a `"no_fixed_hadith"` value for exactly this case. `AuthenticityBadge` needs a corresponding neutral/gray treatment (not a sahih/hasan/daif color) with text like "دعاء مأثور، وليس حديثًا نبويًا ثابتًا" instead of a grade — small addendum to Sprint 3's component, do it now since Sprint 6 needs it immediately. Write the page honestly framed as scholarly/companion practice; this level of transparency is a real differentiator, not a weakness to soften.
- **ادعيه is a category/hub query, not a single dua** — it doesn't fit `DuaSchema` at all, and shouldn't be forced into it. Re-slot this `content-plan.json` entry to use `PillarSchema` (already built, Sprint 1) and render it through the pillar-hub template (already built, Sprint 4) instead — likely as the site's general "أدعية عامة" index. No new page type needed; this is just routing the content-plan entry to the pipeline that actually matches its shape.
- **On دعاء للميت specifically:** the "أدخله الجنة" wording turned out to reflect genuine multi-route (riwayat) variation within Sahih Muslim, not a simple error in the aggregated version — worth presenting both attested wordings transparently in this page's content rather than picking one as the only correct text.

**Two more content-type gaps found in batch 2 — same root cause as `ادعيه`: `DuaSchema` assumes one fixed dua text, but several Phase-1 topics are genuinely a different shape.** Resolved here rather than deferred again, since this pattern will recur heavily in Phase 2 — Ramadan (192 topics) and Hajj/Umrah (143 topics) almost certainly have more of both.

**New schema — `lib/adhkar-schema.ts` (`AdhkarCollectionSchema`)**, for fixed, ordered, multi-item recitation sets (أذكار الصباح, اذكار التحصين — a genre with a real, recognized shape, not an improvised list):
```ts
const AdhkarItemSchema = z.object({
  order: z.number(),
  arabic_text_tashkeel: z.string(),
  arabic_text_plain: z.string(),
  authenticity_grade: z.enum(["sahih", "hasan", "daif", "mixed", "no_fixed_hadith"]),
  primary_source: z.string(),
  source_url: z.string().url().optional(),
  repetition_count: z.string().optional(),
});
const AdhkarCollectionSchema = z.object({
  title: z.string(), slug: z.string(), occasion: z.string(), // صباح / مساء / تحصين
  quick_answer: z.string().max(400),
  items: z.array(AdhkarItemSchema).min(1),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(8),
  related_slugs: z.array(z.string()).default([]),
  audio_url: z.string().optional(), last_updated: z.string(), index: z.boolean().default(true),
});
```
Routes under `/اذكار/[occasion]/` — already named in Section 4.1 but never actually scheduled: build `app/azkar/[occasion]/page.tsx` now (same ASCII-folder + `proxy.ts` pattern as everything since Sprint 4), reusing `Breadcrumbs`/`TOC`/`FaqAccordion`/`AuthenticityBadge` from Sprint 3 with a repeated-item list in place of the single dua block.

**New schema — `lib/guide-schema.ts` (`GuideSchema`)**, for step-by-step procedures with a dua embedded per step (خطوات العمرة):
```ts
const GuideStepSchema = z.object({
  order: z.number(), step_title: z.string(), step_description: z.string(), // markdown
  associated_dua_slug: z.string().optional(),   // reference into content/duas/
  inline_dua_text: z.string().optional(),       // for a step with no standalone dua page
});
const GuideSchema = z.object({
  title: z.string(), slug: z.string(), pillar: z.string(),
  quick_answer: z.string().max(400),
  steps: z.array(GuideStepSchema).min(2),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(8),
  related_slugs: z.array(z.string()).default([]), last_updated: z.string(), index: z.boolean().default(true),
});
```
JSON-LD: shape this as `HowTo` per Section 6 — still schema-valid and AI-crawler-useful even with no desktop rich result.

**Mapping the 5 flagged topics (default judgment calls — override with real content-shape evidence if you find it while writing):**
- `دعاء الصباح` → `AdhkarCollectionSchema`, `/اذكار/صباح/` (this is really the morning-adhkar set, not one dua)
- `اذكار التحصين` → `AdhkarCollectionSchema`, `/اذكار/تحصين/`
- `تحصين النفس` → judgment call: if it's genuinely one main protective dua/ayah (Ayat al-Kursi) with a few short variants, keep it in `DuaSchema` and use the existing `variants` array rather than building a whole collection for it; only promote to `AdhkarCollectionSchema` if the real search intent wants a fixed ordered set
- `خطوات العمرة` → `GuideSchema`, one page, steps each carrying their stage's dua
- `ادعية العمرة` → stays in `DuaSchema`, using `variants` to list each stage's dua as a flat reference list (distinct search intent from خطوات العمرة — people wanting just the duas vs. people wanting the full walkthrough — don't collapse them into one URL), with a prominent cross-link to the `خطوات العمرة` guide

Build both schemas and the `/اذكار/` route now, then continue batch 3 with whatever remains that cleanly fits `DuaSchema` — don't let this block the pages that don't need it.

---

**Sprint 6 — as-built (all 30 Phase-1 topics + pillar hub complete):** this sprint grew past "write 30 pages" into real infrastructure, worth recording for later sprints/sessions rather than leaving implicit in the file tree:
- Three content types now exist, not one: `content/duas/` (`DuaSchema`), `content/adhkar/` (`AdhkarCollectionSchema`, routed at `/اذكار/[occasion]/`), `content/guides/` (`GuideSchema`, routed at `/خطوات/[slug]/` via `app/guides/[slug]/page.tsx`) — all three ASCII-foldered with `proxy.ts` rewrites, same pattern since Sprint 4. `lib/schema.ts` gained `howToSchema()` for guide pages' JSON-LD.
- `getRelatedDuas()` was generalized to accept anything with a `related_slugs: string[]` field, not just `Dua` — needed once adhkar collections had cross-links with nowhere to render. Sprint 9's tools and any future content type should rely on this generic version, not reimplement per-type.
- `authenticity_grade: "no_fixed_hadith"` is exercised for real now (`دعاء ختم القرآن`, `دعاء يوم الجمعة`) — both explicitly warn users away from the fabricated-looking texts that circulate for these occasions rather than quietly picking one, which is the differentiation this schema value exists for.
- `npm run validate:content` checks all three content directories.

### Sprint 7 — Trust & legal pages

**Goal:** the pages required both for user trust and AdSense eligibility (Section 7).

**Reminder from Sprint 4:** these are ASCII-foldered on disk (`app/about/`, `app/privacy/`, `app/contact/`) with `proxy.ts` rewriting to the Arabic public paths below — don't create literal `app/عن-الموقع/` folders, that's the exact bug Sprint 4 already found and fixed.

**Tasks:**
- `/عن-الموقع` — real, specific description of the editorial/verification process (name the sources: dorar.net grading cross-checks, primary hadith collections) — avoid generic "we are a team of experts" boilerplate, be concrete
- `/سياسة-الخصوصية` — cookie/AdSense disclosure, data handling (note: no accounts/login at MVP, so this should be short and honest about what little data is collected — localStorage bookmarks, standard analytics)
- `/اتصل-بنا` — simple contact form or mailto
- Per-page "أبلغ عن خطأ" — a lightweight `mailto:` link or a simple form component is enough at MVP; don't over-engineer this

**Definition of done:** all three pages live and linked from the footer on every page; error-report affordance present on every dua page template.

---

### Sprint 8 — Sitemap, robots, indexing plumbing

**Tasks:**
- `app/sitemap.ts`: generate from `content-plan.json`, chunked (even though you're under the 50k-URL Google limit at MVP, build the chunking logic now so Phase 3 doesn't require a rewrite)
- `app/robots.ts`: allow all, point to sitemap index
- Ensure every `phase: 3` / `index: false` entry (Section 4.3 guardrail) is excluded from the sitemap and carries a `noindex` meta tag on its page
- Verify canonical tags point correctly on any page reached via a variant-spelling redirect

**Definition of done:** `/sitemap.xml` returns valid XML listing exactly the Phase 1 + Phase 2 URLs; a `noindex` test page confirms the meta tag renders and is excluded from the sitemap.

---

**Sprint 7 — as-built:** `/عن-الموقع`, `/سياسة-الخصوصية`, `/اتصل-بنا` live, ASCII-foldered + `proxy.ts`. `/عن-الموقع` names real specifics from this project's actual Sprint 6 work (direct dorar.net citation extraction, the دعاء النوم Bukhari 6312/6324 resolution, the دعاء الاستفتاح re-sourcing, the `no_fixed_hadith` transparency treatment) rather than generic boilerplate. `/سياسة-الخصوصية` is scoped honestly to current reality — no analytics/ads actually live yet — and will need a real update at Sprint 13 when AdSense goes live, not before. `ErrorReportLink` (mailto) extended to all three content templates (dua/adhkar/guide), beyond the dua-only original spec, for consistency. `Footer` built (didn't exist before Sprint 7) and added to root layout, linking all three trust pages site-wide.

**Sprint 8 — as-built:** `app/robots.ts`, `app/sitemap.ts`, `lib/sitemap.ts` (centralizes URL-gathering across every content type + static pages) live. **Deviation from this document's original chunking instruction, deliberate and documented:** Next.js 16's `generateSitemaps()` outputs `/sitemap/[id].xml`, not a plain `/sitemap.xml` — which would have broken this same sprint's own "`/sitemap.xml` returns valid XML" test at the current ~30-topic scale, nowhere near the 50k-URL limit that made chunking worth building early in the first place. Built the single-file version the DoD actually checks, structured so a future switch is one line around a shared `getSitemapEntries()`, not a rewrite — revisit once URL count actually approaches a scale where it matters (Phase 2/3). `noindex` verified against the real pipeline: a real content file was temporarily flipped to `index: false`, rebuilt, confirmed both the `noindex, follow` meta tag and a sitemap count drop, then reverted and rebuilt clean — not a synthetic test. **Known gap:** variant-spelling canonical-tag behavior has no real content to test against yet (no `phase: 3`/guarded content exists) — revisit once Sprint 13+ produces some.

**Process note:** this document (not any local copy in the repo) is the canonical plan — it's been corrected many times over the course of this build (the volume-metric fix, the Phase 1 table reconciliation, every schema addition, every as-built note) directly in response to real findings from each sprint. If Claude Code has been adding its own as-built notes to a local `PROJECT_PLAN.md`, replace that file with this one after each update here rather than maintaining two copies — the sync direction is this file → the repo, not the reverse, since corrections happen here first.

### Sprint 9 — Interactive tools

**Goal:** the features Section 3 identifies as the real differentiators.

**Reminder from Sprint 4:** `/ادوات/`, `/اذكار/`, and `/محفوظاتي/` are all literal Arabic top-level paths — ASCII folders (`app/tools/`, `app/azkar/`, `app/bookmarks/`) plus a `proxy.ts` rewrite, same as every other route since Sprint 4.

**Tasks:**
- **Homepage search** (client-side, over `content-plan.json`'s titles/keywords — no backend needed at this scale): surfaced as a gap during Sprint 5, since `websiteSchema`'s `SearchAction` was correctly left out for pointing at a search feature that was described in Section 4.1 ("homepage: search + browse by pillar") but never actually scheduled in any sprint until now. Build it here, then add `SearchAction` back into `websiteSchema()`.
- **Relationship Dua Finder** (`/ادوات/دعاء-لشخص/`): client component, a small form (relationship × occasion dropdowns) that renders the appropriate dua from the guarded matrix (Section 4.3) client-side — this is the mechanism that captures the ~626K/mo long-tail without 1,300 thin pages
- **My Duas / Bookmarks** (`/محفوظاتي/`): reads the localStorage bookmark array (Sprint 3's `BookmarkButton`), renders saved duas; handle the empty state clearly
- **Share image generation**: wire `ShareImageButton` to a real branded template (site name/logo watermark, the dua text, clean background) — test on a long dua (Ayat al-Kursi-length) to confirm text doesn't overflow the canvas

**Definition of done:** all four tools functional on the preview deployment with no backend required.

---

**Sprint 9 — as-built:** all four tools live. `lib/search-index.ts` computes one shared search index server-side across all three content types (duas/adhkar/guides); `HomeSearch` filters client-side with Arabic-variant-aware normalization; `websiteSchema()`'s `SearchAction` (left unpointed since Sprint 5) now targets a real endpoint. Relationship Dua Finder has 3 real sourced cells (parents, friend, spouse) plus an honest personalized-wrapper fallback and a genuine empty state — no padded/recycled content for combinations with nothing distinct to say. Bookmarks: `BookmarkButton` (built Sprint 3, never wired until now) is live on the dua template. Share image: dynamic font-sizing fixes overflow on long duas (tested against Ayat al-Kursi, 246 chars) — reasoned through and builds clean, not yet visually eyeballed as a rendered PNG (no browser-automation tool available in that session); low-risk, close it with a manual look next time the dev server's open, not worth separate tooling.

**Flagged content fix, not yet applied:** the spouse-cell hadith in the Relationship Dua Finder is currently cited as Abu Dawud 2130 / Tirmidhi 1091. Independently verified (5 consistent sources): the correct citation is **Abu Dawud 2160** (Abdullah ibn Amr), graded حسن by both al-Albani (Sahih Ibn Majah 1839) and Shuʿayb al-Arnaʾut (Takhrij Sunan Abi Dawud), also in Ibn Majah 2252 and Nasaʾi's Sunan al-Kubra 10069 — no Tirmidhi route found anywhere, drop that attribution unless independently confirmed. The wrong number is the likely reason the original dorar.net search came up empty; retry with 2160.

### Sprint 10 — Performance & Core Web Vitals pass

**Tasks:**
- Run Lighthouse (mobile) against a sample Phase-1 page and the homepage; target LCP < 2.5s, CLS < 0.1, INP < 200ms
- Audit `AdSlot` reserved dimensions specifically — this is the most common CLS failure point on ad-supported sites
- Confirm the Arabic web font uses `font-display: swap` (or is subset/preloaded) so it doesn't block first paint
- Compress/lazy-load any images (share-image previews, pillar hub thumbnails)

**Definition of done:** Lighthouse mobile performance score ≥ 90 on a representative dua page.

---

**Sprint 10 — as-built:** homepage 87→94 (measured, headless Chrome available). Root cause of the deficit: Sprint 9's `?q=` deep link read `searchParams` as a server prop, which opts the whole route out of static rendering in Next's App Router — this silently broke `next/font`'s preload injection, pushing the Arabic font ~3 levels deep into the critical path (~3.3s) instead of loading in parallel. Fixed by moving the read into a client-side `useSearchParams()` hook, restoring static rendering; had to fix a follow-on build error where the `Suspense` fallback itself called the hook, defeating the boundary. Representative dua page: 90 — meets the ≥90 target but with no margin; residual cost is generic React/Next runtime overhead plus Lighthouse's mobile-throttling simulation on localhost, correctly scoped as outside this sprint (AdSlot/fonts/images). AdSlot confirmed CLS-safe by construction and not wired anywhere yet (Sprint 13); fonts were already correct since Sprint 0 (`next/font` defaults); no image assets exist yet, so nothing to compress. **Forward-looking flag for Sprint 13:** the dua-page score has zero margin above target — re-run Lighthouse once real AdSense units are wired in, since third-party ad JS is a common Core Web Vitals regression source and passing at exactly 90 today doesn't guarantee passing after that lands.

### Sprint 11 — Pre-launch QA checklist

Run this against every Phase-1 page before deploying to production:
- [ ] Content validates against Zod schema
- [ ] Dua text matches primary source exactly (character-for-character check against a verified reference)
- [ ] Authenticity grade cross-checked against dorar.net
- [ ] Tashkeel renders correctly, toggle works
- [ ] Audio (if present) plays; absent gracefully if not
- [ ] JSON-LD validates (Article, BreadcrumbList, FAQPage)
- [ ] Canonical tag correct; no duplicate-content overlap with a variant-spelling entry
- [ ] Meta title/description present and under length limits
- [ ] Internal links (related duas) resolve, no 404s
- [ ] Mobile layout checked at 375px width minimum
- [ ] Ad slots reserved, no CLS

---

**Sprint 11 — as-built:** a real re-verification pass, not a rubber stamp — found and fixed a genuine wording error (extra "من" in the Hasan/Husain protection dua, wrong in 4 places across `تحصين.json`/`تحصين-النفس.json`), added two missing `source_url`s (hadeethenc.com for أذكار الصباح #1; khaledalsabt.com for دعاء-الصفا-والمروة/دعاء-السعي, after first resolving a real concern about whether that citation conflated with an unrelated hadith — it didn't), and caught a UI bug the source diversification exposed: the citation link had "dorar.net" hardcoded as its display text regardless of actual source, silently wrong the moment sources diversified — fixed to show the real hostname. 25+ other hadith citations and all 9 Qur'an texts (checked against Alquran Cloud) held up unchanged; zero broken `related_slugs` across all 29 files. **Known limitation:** no browser-automation tool available this session, so 375px mobile layout and tashkeel-toggle click behavior were verified by code/CSS inspection only, not a real rendered viewport — flagged, not silently assumed fine.

### Sprint 11.5 — Homepage & site-wide navigation (gap found during Sprint 12a's audit — never actually scheduled anywhere before this)

**Why this sprint exists:** Section 4.1 said the homepage does "search + browse by pillar" in one line, and no sprint ever turned that into a real task — Sprint 9 built the search half only. There is currently no site-wide header/nav at all (only the Sprint 7 footer), and the homepage has no way to browse pillars, no featured content, and no visual design pass beyond default styling. This isn't a polish gap, it's a missing deliverable.

**Tasks:**
- **`Header` component, site-wide** (every page, not homepage-only): wordmark linking home, a link to browse all pillars, search access (can reuse `HomeSearch` from Sprint 9 in a compact form). Add to `app/layout.tsx` alongside the existing `Footer`.
- **Homepage rebuild**, real sections in order:
  1. Hero: wordmark + Arabic tagline (already exists, keep)
  2. Search (already exists from Sprint 9, keep — but it shouldn't be the only content on the page)
  3. **Pillar browse grid** — the actual "browse by pillar" promise: a card per pillar (name + live dua count from `content-plan.json`), linking to `/دعاء/[pillar]/`. This is the primary navigation mechanism for someone who doesn't have a specific search term in mind yet, and it's currently missing entirely.
  4. **Featured/popular duas** — 6-10 cards from the highest-`Cluster Volume` Phase-1 topics (دعاء السفر, دعاء الاستخارة, etc.), each with a short snippet, so a first-time visitor sees real content immediately instead of an empty search box.
  5. A brief trust/differentiation line tied to Section 3 — authenticity grading, direct sourcing — a sentence, not a marketing block.
- **Read `/mnt/skills/public/frontend-design/SKILL.md` before touching any of this** (referenced back in Section 8 but its actual application should be verified this time, not assumed) — this is a genuine visual design task, not a data-wiring task. Deliberate typography, spacing, and color choices, not framework defaults.
- Spot-check that other page types (dua, pillar hub, adhkar, guide) also render correctly with the new `Header` in place — this touches the root layout, so it touches every page.

**Definition of done:** homepage has all 5 sections above, live pillar counts (not hardcoded), `Header` present site-wide, and the result should not look like a components demo — it should look like a homepage someone would trust with their dua text. Resume the Sprint 12a audit (mobile viewport, tashkeel toggle, share image) after this, against the real rebuilt pages, not before.

**Sprint 11.5 — as-built:** `Header` built and wired site-wide via root layout (wordmark→home, pillar-browse link, compact search via a new `compact` prop on `HomeSearch` rather than a fork). Homepage rebuilt with all 5 sections: hero, search, a live pillar-browse grid (19 pillars, real counts from `getAllPillarHubs()`, not hardcoded), 8 featured duas ranked by real `content-plan.json` volume, one-line trust statement. **Environment correction:** the `/mnt/skills/public/frontend-design/SKILL.md` reference in this document's Section 8 assumes the chat sandbox's skills directory, which does not exist in a local Claude Code session — don't reference `/mnt/skills/...` paths in prompts for local sessions going forward; this was corrected on the fly by proceeding on real design judgment rather than silently skipping the instruction. Two real bugs found and fixed outside the original scope: (1) every dua/pillar-hub breadcrumb has 404'd against a nonexistent `/دعاء` route since Sprint 6 — fixed for those two content types; the same pattern likely exists for `/اذكار` and `/خطوات` breadcrumbs, fix immediately rather than deferring, same pattern already in hand; (2) `no_fixed_hadith` badge wrapping to two lines stretched featured-dua-card grid rows via CSS Grid's default row-stretch — fixed with a `compact` label variant on `AuthenticityBadge`. Verified: build stayed fully static (checked for the same dynamic-rendering regression class as Sprint 10), all 4 page types spot-checked at HTTP 200 with the header present, and Sprint 11's flagged mobile-viewport gap is now closed for real — actual 375px viewport testing via Chrome DevTools Protocol, zero horizontal-overflow elements, not code inspection this time.

**Sprint 11.5 — color system addendum:** applied site-wide (all 7 page types), verified against the usage rules — hero gradient removed as a large-fill violation, `sahih` is the only brand-colored authenticity grade, `hasan`→muted teal, `daif`→amber, dark mode derived from the primary hue rather than a separate palette. Also closed the `/اذكار`, `/خطوات`, `/ادوات` breadcrumb 404s (same bug class as the dua/pillar-hub fix, found proactively per this document's own standing instruction not to defer it).

**Sprint 12a — closed.** Real verification throughout (CDP mouse events, actual file downloads, computed WCAG relative-luminance contrast — not code inspection or eyeballing). Two bugs found and fixed: the share-image canvas gradient was still hardcoded to the pre-brand hex (`#065f46`/`#0f766e`) — raw hex in JS is invisible to a `grep emerald` sweep, a real blind spot in the earlier color-system verification, now fixed to the actual brand hex; footer copyright text failed WCAG AA (4.2:1, needs 4.5:1) at `white/55`, fixed to `white/70` (5.73:1). The share-image render — unverified since Sprint 9 — is now confirmed against both a typical dua and the Ayat al-Kursi stress case. Mobile 375px confirmed zero horizontal overflow via `scrollWidth`, not visual inspection. Full contrast audit: wordmark/headings/`sahih` badge at 9.84:1, `hasan` badge at 6.68:1, both well past AA; the lime focus ring is correctly understood as decorative (1.18:1) since the actual conformant focus indicator is the border-color shift to primary green (9.84:1).

**Open question before Sprint 12b proceeds, found during status reconciliation:** no indexing-block code (robots.ts disallow, global noindex) exists in the current codebase, and it's genuinely unclear whether that's because (a) nothing has ever been deployed to a real public `*.vercel.app` URL — all work so far verified against `next build && next start` on localhost — meaning there was never actual indexing risk to guard against, or (b) something was deployed publicly at some point without the safety net actually landing in code. Resolve this with `vercel ls` / `vercel inspect` or the Vercel dashboard before trusting Sprint 12b to build on whatever's already there — don't assume either direction.

### Sprint 12 — Deploy & Search Console setup

**Split into two phases on request — deliberate choice to audit on Vercel's own URL before attaching the real domain, to avoid premature indexing.**

**Sprint 12a — private preview deploy (now):**
- User runs `vercel login` interactively (still required even without a custom domain) — Claude Code cannot do this step.
- `vercel deploy` to production on Vercel's own `*.vercel.app` URL — no custom domain attached yet.
- **Indexing safety net, because a bare `vercel.app` URL is still publicly crawlable and indexable on its own** — not attaching `prayerfly.com` does not by itself stop Google from indexing the Vercel URL:
  - Set `app/robots.ts` to `Disallow: /` for all user agents during this phase
  - Add a global `noindex, nofollow` meta tag (e.g. via root `metadata` in `app/layout.tsx`, gated by an env var like `NEXT_PUBLIC_ALLOW_INDEXING`) so it's impossible to forget the flag exists later
  - Check whether Vercel's Deployment Protection (password/Vercel Authentication, in project settings) is worth enabling too for a harder guarantee — if enabled, note that any of Claude Code's own automated checks against the live URL will need a protection-bypass token, so factor that in before turning it on
- Audit the live preview URL for real — this is the actual point of this phase: everything that only shows up on a real deployed server (mobile viewport, tashkeel-toggle click behavior, share-image rendering — all three flagged as unverified due to missing browser-automation tooling in earlier sprints) should get checked for real now.

**Sprint 12b — go live (once the audit passes):**
- Register/attach `prayerfly.com` in Vercel, point DNS at the registrar
- **Remove every indexing block added in 12a** — flip `robots.ts` back to allow, remove the global `noindex` (or flip the env var), remove Deployment Protection if it was enabled. Confirm removal by checking rendered HTML, not just by editing the code — a leftover `noindex` on day one of a real domain is a slow, easy-to-miss mistake.
- Verify `prayerfly.com` in Google Search Console + Bing Webmaster Tools
- Submit `sitemap.xml`
- Set up basic analytics (privacy-respecting is fine; the Privacy Policy from Sprint 7 should match whatever's actually running — don't wire analytics silently if the policy still says nothing is live)
- Request indexing manually for the 30 Phase-1 URLs to accelerate initial crawl rather than waiting for organic discovery

**Definition of done:** 12a — preview URL live, confirmed non-indexable (check `robots.txt` output and page source for the `noindex` tag), full manual audit completed against the real deployed server. 12b — site live on the production domain with all indexing blocks confirmed removed, sitemap accepted in Search Console with no errors, at least the homepage and 2-3 pillar pages showing "indexed" status within the first week.

---

### Sprint 13 — AdSense application

**Precondition check (Section 7):** 15-20+ complete pages live, all trust pages live, no thin/stub content anywhere crawlable.

**Tasks:**
- Apply via AdSense
- While awaiting review, do **not** publish anything half-finished — a thin or broken page discovered during manual review is a common rejection cause
- On approval, wire real `AdSlot` units per the placement plan (Section on monetization: after quick-answer block, after authenticity block, near related-duas — never inside the dua text itself)
- **Re-run Lighthouse on a representative dua page immediately after wiring real ad units** — Sprint 10 passed at exactly 90 with no margin, and third-party ad JS is a common regression source. Fix any drop below 90 before this goes live, don't just note it for later.

---

### Sprint 14 — Phase 2 content expansion (~150-200 pages)

**Goal:** move from "authoritative on 30 topics" to "authoritative on the whole dua space."

**Workflow:** same per-page process as Sprint 6, working down the `content-plan.json` `phase: 2` list (volume > 1,000 across all pillars). At this scale, batch by pillar (finish all Travel-pillar pages, then all Hajj/Umrah-pillar pages, etc.) rather than working strictly by volume rank — this lets internal linking (`related_slugs`) between same-pillar pages get built correctly as you go, instead of retrofitted later.

**Definition of done:** all `phase: 2` entries in `content-plan.json` have a corresponding validated, complete `content/duas/*.json` file and are live.

---

### Sprint 15 — Phase 3: programmatic long-tail layer

**Goal:** handle the remaining low-volume long tail without creating thin content.

**Tasks:**
- Expand the Relationship Dua Finder matrix (Section 4.3) with more relationship × occasion combinations as real editorial content becomes available for each cell
- For any `phase: 3` topic that turns out to deserve a real standalone page (i.e., it has genuine unique content, not just a swapped pronoun), promote it manually into Phase 2 rather than force it through the generic matrix
- Everything else stays served only through the interactive tool, `noindex`, out of the sitemap

---

### Ongoing — freshness & maintenance loop

- Re-verify authenticity grades and source links quarterly (dorar.net and islamweb.net occasionally update takhrij)
- Update `last_updated` only when content genuinely changes, not cosmetically (Google and users both discount fake freshness signals)
- Monitor Search Console for new PAA-style queries appearing against live pages and fold them into the FAQ block
- Re-run Sprint 2's canonicalization script periodically if you pull fresh keyword data, to catch new spelling-variant cannibalization before it happens

---

## 10. KPIs

- Organic impressions/clicks by pillar (Search Console) — track Phase 1 pages weekly for first 90 days
- % of tracked keywords appearing in AI Overview citations (manual spot-check monthly — no reliable API for this yet)
- Core Web Vitals (all pages, especially CLS given ad placements)
- Bookmark/return-visit rate (proxy for the trust differentiation actually landing)
- Featured snippet capture count (baseline: 58/3,231 industry-wide; track your share over time)

---

## 11. Open assumptions to confirm before/during build

- Audio: real reciter recordings (licensing/rights work) vs. Arabic TTS at MVP — recommend starting with TTS and upgrading specific high-traffic pages to real recitation later
- Login/accounts: recommend **none at MVP** — bookmarks via localStorage only, to reduce build scope and avoid unnecessary data-handling obligations
- Multi-language: this plan is Arabic-only, matching your keyword set; English/Urdu transliteration pages for diaspora audiences would be a separate silo, not a retrofit

---

## Sources consulted
- du3a.org, mawdoo3.com, azkarna.com, ad3eyah.com, m7et.com, almofud.com, blog.wasalt.sa, jaddah.net, yessmile.ae, sabaharabi.com, islamweb.net (fatwa reference), dorar.net (hadith grading reference)
- Google Search Central FAQ/HowTo structured data deprecation notice (May 7, 2026); Search Engine Journal and Search Engine Land coverage of the same change
- Google AdSense 2026 publisher policy guidance and Islamic-content-specific publisher discussion
