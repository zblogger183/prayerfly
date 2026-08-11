/**
 * The one place dangerouslySetInnerHTML is used for structured data. Escapes
 * "<" to its unicode form per Next's own documented JSON-LD guidance —
 * JSON.stringify alone doesn't sanitize for XSS (a string value containing
 * "</script>" would otherwise break out of the tag).
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
