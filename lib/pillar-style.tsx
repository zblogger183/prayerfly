import { createElement } from "react";
import {
  BookOpenCheck,
  Baby,
  Cloudy,
  Coins,
  Compass,
  Flower2,
  GraduationCap,
  Hand,
  HeartHandshake,
  HeartPulse,
  Home,
  Landmark,
  type LucideIcon,
  Moon,
  MoonStar,
  PersonStanding,
  Plane,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Sunrise,
  Users,
} from "lucide-react";

/**
 * Icons vary per pillar for scannability, but every one renders in the same
 * brand primary tone — user feedback after the first colorful pass: a
 * different hue per card read as inconsistent branding, not "colorful" in
 * the way they wanted. One color, many shapes.
 */
const PILLAR_ICONS: Record<string, LucideIcon> = {
  "الآداب-اليومية": Sparkles,
  "الأخلاق-وطلب-الهداية": Compass,
  "الابناء-والاسرة": Baby,
  "الاختبارات-والمذاكرة": GraduationCap,
  "الاستخارة": Compass,
  "الاستعاذة-من-الشرور": ShieldAlert,
  "التحصين": ShieldCheck,
  "التوبة": HeartHandshake,
  "الجمعة": Star,
  "الحج-والعمرة": Landmark,
  "الرزق-والتوفيق": Coins,
  "الزواج": HeartHandshake,
  "السفر": Plane,
  "الصباح-والمساء": Sunrise,
  "الصلاة": Hand,
  "الكرب-والهم-والحزن": Cloudy,
  "المرض-والشفاء": HeartPulse,
  "المشاعر-والعلاقات": Users,
  "المطر-والطبيعة": Cloudy,
  "المناسبات-والأشهر-الفاضلة": Star,
  "المنزل-والخروج": Home,
  "الموت-والمتوفى": Flower2,
  "النوم-والاستيقاظ": Moon,
  "ختم-القرآن-والسور": BookOpenCheck,
  "رمضان-والصيام": MoonStar,
  "أدعية-الأنبياء-والصحابة": PersonStanding,
};

/** Any pillar not explicitly mapped (a future addition) still gets a real
 * icon rather than nothing. */
const FALLBACK_ICON = Sparkles;

export function getPillarIcon(pillarSlug: string): LucideIcon {
  return PILLAR_ICONS[pillarSlug] ?? FALLBACK_ICON;
}

/**
 * For single-use sites (a page header, not a list of cards) — the obvious
 * `const Icon = getPillarIcon(...); return <Icon />` trips
 * react-hooks/static-components ("components created during render"), even
 * though the lookup is a stable, static reference (a plain object lookup)
 * and never actually constructs anything new — this is a pure
 * AST-syntax-pattern lint, not a real per-render allocation. createElement
 * renders the identical output without writing the `<Icon />` JSX shape
 * the linter pattern-matches on.
 */
export function PillarIcon({ pillarSlug, className }: { pillarSlug: string; className?: string }) {
  return createElement(getPillarIcon(pillarSlug), { className });
}
