/**
 * Sprint 2 — canonicalization script (PROJECT_PLAN.md Section 9).
 *
 * Turns the raw keyword-cluster CSV export into content-plan.json: one
 * canonical entry per real topic, with spelling/diacritic variants folded
 * in, near-duplicates that are NOT confidently the same topic flagged for
 * manual review instead of auto-merged, a pillar assignment, and a
 * phase (1/2/3) for the build roadmap.
 *
 * Usage:
 *   node scripts/dedupe-clusters.ts [inputCsv] [outputJson]
 *   node scripts/dedupe-clusters.ts data/keywords.csv content-plan.json
 *
 * Writes <outputJson> and a sibling "<name>.review.json" listing the
 * near-duplicate pairs that were flagged rather than merged.
 */

import { readFileSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// CSV parsing (hand-rolled: several columns contain quoted, comma-bearing
// lists like "Image pack,People also ask,AI Overview", so a naive
// line.split(",") would corrupt rows)
// ---------------------------------------------------------------------------

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (inQuotes) {
      if (c === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // ignore, \n (or end of input) closes the row
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Arabic normalization
// ---------------------------------------------------------------------------

const TASHKEEL_AND_TATWEEL = /[ً-ٰٟۖ-ۭـ]/g;
const ALEF_VARIANTS = /[أإآٱ]/g;

/**
 * Collapses spelling/diacritic variance that does NOT represent a different
 * search intent: harakat, alef forms (أ/إ/آ/ٱ → ا), ة/ه, ي/ى, whitespace.
 * Two Parent Topic strings that normalize to the same value are treated as
 * the same real-world topic and auto-merged.
 */
function normalizeArabic(input: string): string {
  return input
    .replace(TASHKEEL_AND_TATWEEL, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function tokens(normalized: string): string[] {
  return normalized.split(" ").filter(Boolean);
}

/** Jaccard similarity of the two strings' token sets (intersection / union). */
function tokenOverlap(a: string, b: string): number {
  const setA = new Set(tokens(a));
  const setB = new Set(tokens(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection++;
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

// Fuzzy-match thresholds for the "flag, don't merge" path. Deliberately
// strict: a miss here just leaves two topics as separate canonical entries
// (safe), a false hit would silently merge two distinct topics (unsafe).
const FUZZY_MIN_LENGTH = 8; // only consider strings longer than this
const FUZZY_MAX_DISTANCE = 2;
const FUZZY_MIN_TOKEN_OVERLAP = 0.8;

// ---------------------------------------------------------------------------
// Pillar classification — kept as an explicit, ordered, editable keyword
// list per the plan's "ship the keyword list ... so it's auditable/
// adjustable" instruction. Order matters: more specific pillars are checked
// before pillars whose keywords could otherwise false-match first (e.g. a
// deceased father's dua must land in "الموت والمتوفى", not "الوالدين").
// Keywords are matched against the normalized topic string, so either
// spelling (ة/ه, alef forms) works without listing both.
// ---------------------------------------------------------------------------

const PILLAR_RULES: { pillar: string; keywords: string[] }[] = [
  { pillar: "الحج والعمرة", keywords: ["حج", "عمره", "طواف", "سعي", "الصفا", "المروه", "احرام"] },
  { pillar: "الموت والمتوفى", keywords: ["ميت", "متوفي", "جنازه", "قبر"] },
  { pillar: "المرض والشفاء", keywords: ["مريض", "شفاء", "سحر", "حسد", "مرض"] },
  { pillar: "السفر", keywords: ["سفر"] },
  { pillar: "الاستخارة", keywords: ["استخاره"] },
  { pillar: "ختم القرآن والسور", keywords: ["ختم القران", "سوره", "القران الكريم", "تلاوه", "حزب"] },
  { pillar: "رمضان والصيام", keywords: ["رمضان", "صيام", "صائم", "افطار", "سحور", "ليله القدر"] },
  { pillar: "الجمعة", keywords: ["الجمعه"] },
  { pillar: "النوم والاستيقاظ", keywords: ["نوم", "استيقاظ"] },
  { pillar: "الاختبارات والمذاكرة", keywords: ["اختبار", "امتحان", "مذاكره", "دراسه"] },
  { pillar: "الكرب والهم والحزن", keywords: ["كرب", "هم", "هموم", "حزن", "ضيق", "غم"] },
  { pillar: "التحصين", keywords: ["تحصين"] },
  { pillar: "التوبة", keywords: ["توبه"] },
  { pillar: "الصباح والمساء", keywords: ["الصباح", "المساء"] },
  { pillar: "الوالدين", keywords: ["ابي", "امي", "والدي", "والدتي", "الاب", "الام", "الوالدين"] },
  { pillar: "المطر والطبيعة", keywords: ["مطر", "رعد", "برق", "ريح", "غيث"] },
  { pillar: "الابناء والاسرة", keywords: ["ابني", "ابنتي", "اطفال", "ابناء", "طفل"] },
  { pillar: "الزواج", keywords: ["زواج", "زوجي", "زوجتي", "خطوبه"] },
  { pillar: "المنزل والخروج", keywords: ["المنزل", "البيت"] },
  { pillar: "الرزق والتوفيق", keywords: ["رزق", "توفيق", "فرج", "تيسير"] },
  { pillar: "الصلاة", keywords: ["الوتر", "الاستفتاح", "القنوت", "التشهد", "السجود"] },
  { pillar: "المشاعر والعلاقات", keywords: ["لشخص تحبه", "لشخص تحبها"] },
];

/**
 * A handful of topics are, verbatim, the bare "دعاء"/"ادعيه" hub query
 * itself (Phase-1 #6 in the plan — the category/hub page, not a single
 * topic). The generic keyword rules above can't safely catch this: adding
 * "ادعيه" as an ordinary keyword would match its own substring at the start
 * of nearly every OTHER topic too ("ادعيه العمره", etc). So it's handled as
 * an exact, whole-string override instead of a substring rule.
 */
const EXACT_TOPIC_PILLAR_OVERRIDES: Record<string, string> = {
  [normalizeArabic("ادعيه")]: "أدعية عامة",
  [normalizeArabic("دعاء")]: "أدعية عامة",
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Substring match, but the keyword must be followed by a space or the end
 * of the string. Arabic prefixes (ل/و/ف/ب/ال...) are extremely common and
 * meaningful ("لامي" = "for my mother"), so the start of the keyword is left
 * unanchored on purpose. But an unanchored *end* is what caused real
 * false positives during dry-run QA against the real dataset: "توفي"
 * (deceased) matching inside "التوفيق" (ease/success), "حج" matching inside
 * "الحجر" (stone), "ابي" matching inside "الكوابيس" (nightmares). Anchoring
 * the end to a word boundary fixes all of those while still matching
 * "لامي", "المتوفي", etc. This is a heuristic, not real morphology — a
 * handful of coincidental matches (e.g. a surname ending in "ـابي") can
 * still slip through, which is exactly why pillar assignment stays a
 * plain, editable keyword list rather than a black box.
 */
function matchesKeyword(normalizedTopic: string, keyword: string): boolean {
  const re = new RegExp(escapeRegExp(normalizeArabic(keyword)) + "(?=\\s|$)");
  return re.test(normalizedTopic);
}

function classifyPillar(normalizedTopic: string): string {
  const override = EXACT_TOPIC_PILLAR_OVERRIDES[normalizedTopic];
  if (override) return override;

  for (const rule of PILLAR_RULES) {
    for (const kw of rule.keywords) {
      if (matchesKeyword(normalizedTopic, kw)) {
        return rule.pillar;
      }
    }
  }
  return "عام";
}

// ---------------------------------------------------------------------------
// Core pipeline
// ---------------------------------------------------------------------------

interface SourceRow {
  num: number;
  topic: string;
  clusterVolume: number;
  difficulty: number | null;
}

interface Group {
  normalized: string;
  rows: SourceRow[];
}

interface ReviewFlag {
  topic_a: string;
  topic_b: string;
  volume_a: number;
  volume_b: number;
  distance: number;
  token_overlap: number;
}

interface CanonicalEntry {
  pillar: string;
  canonical_topic: string;
  slug: string;
  total_volume: number;
  difficulty: number | null;
  variant_spellings: string[];
  phase: 1 | 2 | 3;
  source_row_numbers: number[];
}

function loadRows(csvPath: string): SourceRow[] {
  const raw = readFileSync(csvPath, "utf-8");
  const table = parseCSV(raw).filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
  const header = table[0];

  const idx = (name: string) => {
    const i = header.indexOf(name);
    if (i === -1) throw new Error(`Column "${name}" not found in CSV header`);
    return i;
  };

  const numIdx = idx("#");
  const topicIdx = idx("Parent Topic");
  const volIdx = idx("Cluster Volume");
  const diffIdx = idx("Difficulty");

  const rows: SourceRow[] = [];
  for (let i = 1; i < table.length; i++) {
    const r = table[i];
    if (!r[topicIdx]) continue;
    const diffRaw = r[diffIdx]?.trim();
    rows.push({
      num: Number(r[numIdx]),
      topic: r[topicIdx].trim(),
      clusterVolume: Number(r[volIdx]) || 0,
      difficulty: diffRaw ? Number(diffRaw) : null,
    });
  }
  return rows;
}

function groupByNormalizedTopic(rows: SourceRow[]): Group[] {
  const map = new Map<string, SourceRow[]>();
  for (const row of rows) {
    const norm = normalizeArabic(row.topic);
    const bucket = map.get(norm);
    if (bucket) bucket.push(row);
    else map.set(norm, [row]);
  }
  return [...map.entries()].map(([normalized, rowsInGroup]) => ({
    normalized,
    rows: rowsInGroup,
  }));
}

/**
 * Finds fuzzy near-duplicate pairs across DIFFERENT normalized groups and
 * flags them for manual review. Uses a token inverted index so we only run
 * Levenshtein on pairs that already share at least one token, instead of
 * comparing every group against every other group.
 */
function findReviewFlags(groups: Group[]): ReviewFlag[] {
  const tokenIndex = new Map<string, number[]>();
  groups.forEach((g, i) => {
    for (const t of tokens(g.normalized)) {
      const list = tokenIndex.get(t);
      if (list) list.push(i);
      else tokenIndex.set(t, [i]);
    }
  });

  const flags: ReviewFlag[] = [];
  const seenPairs = new Set<string>();

  groups.forEach((g, i) => {
    if (g.normalized.length <= FUZZY_MIN_LENGTH) return;

    const candidates = new Set<number>();
    for (const t of tokens(g.normalized)) {
      for (const j of tokenIndex.get(t) ?? []) {
        if (j !== i) candidates.add(j);
      }
    }

    for (const j of candidates) {
      if (j <= i) continue; // dedupe unordered pairs
      const other = groups[j];
      if (other.normalized.length <= FUZZY_MIN_LENGTH) continue;

      const pairKey = `${Math.min(i, j)}-${Math.max(i, j)}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const distance = levenshtein(g.normalized, other.normalized);
      if (distance === 0 || distance > FUZZY_MAX_DISTANCE) continue;

      const overlap = tokenOverlap(g.normalized, other.normalized);
      if (overlap < FUZZY_MIN_TOKEN_OVERLAP) continue;

      const canonicalA = [...g.rows].sort((a, b) => b.clusterVolume - a.clusterVolume)[0];
      const canonicalB = [...other.rows].sort((a, b) => b.clusterVolume - a.clusterVolume)[0];
      flags.push({
        topic_a: canonicalA.topic,
        topic_b: canonicalB.topic,
        volume_a: canonicalA.clusterVolume,
        volume_b: canonicalB.clusterVolume,
        distance,
        token_overlap: Math.round(overlap * 100) / 100,
      });
    }
  });

  return flags;
}

function slugify(topic: string): string {
  return topic.trim().replace(/\s+/g, "-");
}

function buildCanonicalEntries(groups: Group[]): CanonicalEntry[] {
  const entries = groups.map((group) => {
    const sorted = [...group.rows].sort((a, b) => b.clusterVolume - a.clusterVolume);
    const canonical = sorted[0];
    const totalVolume = group.rows.reduce((sum, r) => sum + r.clusterVolume, 0);
    const variantSpellings = sorted
      .slice(1)
      .map((r) => r.topic)
      .filter((t) => t !== canonical.topic);

    return {
      pillar: classifyPillar(normalizeArabic(canonical.topic)),
      canonical_topic: canonical.topic,
      slug: slugify(canonical.topic),
      total_volume: totalVolume,
      difficulty: canonical.difficulty,
      variant_spellings: [...new Set(variantSpellings)],
      source_row_numbers: sorted.map((r) => r.num),
    };
  });

  entries.sort((a, b) => b.total_volume - a.total_volume);

  return entries.map((entry, i) => {
    let phase: 1 | 2 | 3;
    if (i < 30) phase = 1;
    else if (entry.total_volume > 1000) phase = 2;
    else phase = 3;
    return { ...entry, phase };
  });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const inputPath = process.argv[2] ?? "data/keywords.csv";
const outputPath = process.argv[3] ?? "content-plan.json";
const reviewPath = outputPath.replace(/\.json$/, "") + ".review.json";

const rows = loadRows(inputPath);
const groups = groupByNormalizedTopic(rows);
const reviewFlags = findReviewFlags(groups);
const canonicalEntries = buildCanonicalEntries(groups);

writeFileSync(outputPath, JSON.stringify(canonicalEntries, null, 2) + "\n");
writeFileSync(reviewPath, JSON.stringify(reviewFlags, null, 2) + "\n");

const phaseCounts = { 1: 0, 2: 0, 3: 0 };
for (const e of canonicalEntries) phaseCounts[e.phase]++;
const mergedCount = rows.length - canonicalEntries.length;

console.log(`Input rows:        ${rows.length}`);
console.log(`Canonical topics:  ${canonicalEntries.length}`);
console.log(`Rows merged away:  ${mergedCount}`);
console.log(`Flagged for review: ${reviewFlags.length}`);
console.log(`Phase 1: ${phaseCounts[1]}  Phase 2: ${phaseCounts[2]}  Phase 3: ${phaseCounts[3]}`);
console.log(`\nWrote ${outputPath} and ${reviewPath}`);
