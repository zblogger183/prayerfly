interface ErrorReportLinkProps {
  pageTitle: string;
  pageUrl: string;
}

/**
 * Plain mailto: link — no form, no client JS, nothing to over-engineer.
 * Pre-fills subject/body with the page identity so a report arrives with
 * enough context to act on without back-and-forth.
 */
export function ErrorReportLink({ pageTitle, pageUrl }: ErrorReportLinkProps) {
  const subject = `تصحيح: ${pageTitle}`;
  const body = `الصفحة: ${pageUrl}\n\nالخطأ:\n`;
  const mailto = `mailto:corrections@prayerfly.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <a href={mailto} className="text-sm text-foreground/50 hover:text-primary hover:underline">
      أبلغ عن خطأ في هذه الصفحة
    </a>
  );
}
