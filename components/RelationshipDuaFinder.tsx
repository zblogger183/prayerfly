"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { CopyButton } from "@/components/CopyButton";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { FinderResultView, Occasion, Relationship } from "@/lib/relationship-finder-types";
import { matrixKey } from "@/lib/relationship-finder-types";

interface RelationshipDuaFinderProps {
  relationships: Relationship[];
  occasions: Occasion[];
  matrix: Record<string, FinderResultView>;
}

export function RelationshipDuaFinder({
  relationships,
  occasions,
  matrix,
}: RelationshipDuaFinderProps) {
  const [relationshipId, setRelationshipId] = useState("");
  const [occasionId, setOccasionId] = useState("");

  const result =
    relationshipId && occasionId ? matrix[matrixKey(relationshipId, occasionId)] : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground/70">
            تدعو لـ...
          </span>
          <select
            value={relationshipId}
            onChange={(e) => setRelationshipId(e.target.value)}
            dir="rtl"
            className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-secondary/40"
          >
            <option value="">اختر القرابة</option>
            {relationships.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground/70">في حالة...</span>
          <select
            value={occasionId}
            onChange={(e) => setOccasionId(e.target.value)}
            dir="rtl"
            className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-secondary/40"
          >
            <option value="">اختر المناسبة</option>
            {occasions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {result && result.kind !== "none" && (
        <div className="space-y-4 rounded-xl border border-foreground/10 p-6">
          <p className="text-foreground/85">{result.intro}</p>

          <p dir="rtl" className="font-naskh text-2xl leading-loose text-foreground">
            {result.arabic_text_tashkeel}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <AuthenticityBadge
              grade={result.authenticity_grade}
              narrator={"narrator" in result ? result.narrator : undefined}
              source={result.primary_source}
            />
            <CopyButton text={result.arabic_text_plain} />
          </div>

          {result.kind === "fallback" && (
            <Link href={result.href} className="block text-sm text-primary hover:underline">
              الصفحة الكاملة لدعاء «{result.title}» وتفاصيل تخريجه ←
            </Link>
          )}

          {result.kind === "distinct" && result.faq.length > 0 && (
            <div className="pt-2">
              <FaqAccordion items={result.faq} />
            </div>
          )}
        </div>
      )}

      {result && result.kind === "none" && (
        <div className="rounded-xl border border-dashed border-foreground/20 p-6 text-center text-foreground/70">
          <p>لم نضف بعد محتوى موثقًا مخصصًا لهذه الحالة تحديدًا.</p>
          <p className="mt-1 text-sm">
            جرّب مناسبة أخرى، أو تصفح{" "}
            <Link href="/" className="text-primary hover:underline">
              الأدعية العامة من الصفحة الرئيسية
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
