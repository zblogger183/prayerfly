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
 * Tailwind's v4 scanner only picks up class names it can see as literal
 * strings — building `bg-${color}-50` at runtime would silently fail to
 * generate the CSS. Every combination used below is spelled out in full
 * somewhere in this file so the scanner finds it.
 */
interface PillarStyle {
  icon: LucideIcon;
  iconBg: string;
  iconText: string;
  cardHover: string;
}

const PALETTE: PillarStyle[] = [
  { icon: Sparkles, iconBg: "bg-amber-100", iconText: "text-amber-600", cardHover: "hover:border-amber-300" },
  { icon: Sparkles, iconBg: "bg-rose-100", iconText: "text-rose-600", cardHover: "hover:border-rose-300" },
  { icon: Sparkles, iconBg: "bg-sky-100", iconText: "text-sky-600", cardHover: "hover:border-sky-300" },
  { icon: Sparkles, iconBg: "bg-violet-100", iconText: "text-violet-600", cardHover: "hover:border-violet-300" },
  { icon: Sparkles, iconBg: "bg-teal-100", iconText: "text-teal-600", cardHover: "hover:border-teal-300" },
  { icon: Sparkles, iconBg: "bg-orange-100", iconText: "text-orange-600", cardHover: "hover:border-orange-300" },
  { icon: Sparkles, iconBg: "bg-indigo-100", iconText: "text-indigo-600", cardHover: "hover:border-indigo-300" },
  { icon: Sparkles, iconBg: "bg-pink-100", iconText: "text-pink-600", cardHover: "hover:border-pink-300" },
  { icon: Sparkles, iconBg: "bg-emerald-100", iconText: "text-emerald-600", cardHover: "hover:border-emerald-300" },
  { icon: Sparkles, iconBg: "bg-blue-100", iconText: "text-blue-600", cardHover: "hover:border-blue-300" },
];

/** Meaningful icon + color per pillar where the topic suggests one; falls
 * back to cycling through PALETTE by index for anything not listed here
 * (keeps every future pillar visually distinct without needing an edit). */
const PILLAR_OVERRIDES: Record<string, PillarStyle> = {
  "الآداب-اليومية": { icon: Sparkles, iconBg: "bg-amber-100", iconText: "text-amber-600", cardHover: "hover:border-amber-300" },
  "الأخلاق-وطلب-الهداية": { icon: Compass, iconBg: "bg-rose-100", iconText: "text-rose-600", cardHover: "hover:border-rose-300" },
  "الابناء-والاسرة": { icon: Baby, iconBg: "bg-sky-100", iconText: "text-sky-600", cardHover: "hover:border-sky-300" },
  "الاختبارات-والمذاكرة": { icon: GraduationCap, iconBg: "bg-violet-100", iconText: "text-violet-600", cardHover: "hover:border-violet-300" },
  "الاستخارة": { icon: Compass, iconBg: "bg-indigo-100", iconText: "text-indigo-600", cardHover: "hover:border-indigo-300" },
  "الاستعاذة-من-الشرور": { icon: ShieldAlert, iconBg: "bg-red-100", iconText: "text-red-600", cardHover: "hover:border-red-300" },
  "التحصين": { icon: ShieldCheck, iconBg: "bg-emerald-100", iconText: "text-emerald-600", cardHover: "hover:border-emerald-300" },
  "التوبة": { icon: HeartHandshake, iconBg: "bg-teal-100", iconText: "text-teal-600", cardHover: "hover:border-teal-300" },
  "الجمعة": { icon: Star, iconBg: "bg-green-100", iconText: "text-green-600", cardHover: "hover:border-green-300" },
  "الحج-والعمرة": { icon: Landmark, iconBg: "bg-amber-100", iconText: "text-amber-600", cardHover: "hover:border-amber-300" },
  "الرزق-والتوفيق": { icon: Coins, iconBg: "bg-yellow-100", iconText: "text-yellow-700", cardHover: "hover:border-yellow-300" },
  "الزواج": { icon: HeartHandshake, iconBg: "bg-pink-100", iconText: "text-pink-600", cardHover: "hover:border-pink-300" },
  "السفر": { icon: Plane, iconBg: "bg-sky-100", iconText: "text-sky-600", cardHover: "hover:border-sky-300" },
  "الصباح-والمساء": { icon: Sunrise, iconBg: "bg-orange-100", iconText: "text-orange-600", cardHover: "hover:border-orange-300" },
  "الصلاة": { icon: Hand, iconBg: "bg-primary-100", iconText: "text-primary-700", cardHover: "hover:border-primary-300" },
  "الكرب-والهم-والحزن": { icon: Cloudy, iconBg: "bg-slate-100", iconText: "text-slate-600", cardHover: "hover:border-slate-300" },
  "المرض-والشفاء": { icon: HeartPulse, iconBg: "bg-red-100", iconText: "text-red-600", cardHover: "hover:border-red-300" },
  "المشاعر-والعلاقات": { icon: Users, iconBg: "bg-rose-100", iconText: "text-rose-600", cardHover: "hover:border-rose-300" },
  "المطر-والطبيعة": { icon: Cloudy, iconBg: "bg-blue-100", iconText: "text-blue-600", cardHover: "hover:border-blue-300" },
  "المناسبات-والأشهر-الفاضلة": { icon: Star, iconBg: "bg-violet-100", iconText: "text-violet-600", cardHover: "hover:border-violet-300" },
  "المنزل-والخروج": { icon: Home, iconBg: "bg-teal-100", iconText: "text-teal-600", cardHover: "hover:border-teal-300" },
  "الموت-والمتوفى": { icon: Flower2, iconBg: "bg-slate-100", iconText: "text-slate-600", cardHover: "hover:border-slate-300" },
  "النوم-والاستيقاظ": { icon: Moon, iconBg: "bg-indigo-100", iconText: "text-indigo-600", cardHover: "hover:border-indigo-300" },
  "ختم-القرآن-والسور": { icon: BookOpenCheck, iconBg: "bg-emerald-100", iconText: "text-emerald-600", cardHover: "hover:border-emerald-300" },
  "رمضان-والصيام": { icon: MoonStar, iconBg: "bg-amber-100", iconText: "text-amber-600", cardHover: "hover:border-amber-300" },
  "أدعية-الأنبياء-والصحابة": { icon: PersonStanding, iconBg: "bg-violet-100", iconText: "text-violet-600", cardHover: "hover:border-violet-300" },
};

/** Stable per-slug fallback (not array-index-based, so a pillar's color
 * doesn't shift if the homepage's sort order changes) — a simple string
 * hash picking a PALETTE entry. */
function hashStyle(slug: string): PillarStyle {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function getPillarStyle(pillarSlug: string): PillarStyle {
  return PILLAR_OVERRIDES[pillarSlug] ?? hashStyle(pillarSlug);
}
