const TAG_REGEX = /<[^>]+>/g;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeRichTextBlob(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (looksLikeHtml) return raw;
  return `<p>${escapeHtml(raw).replace(/\r\n|\r|\n/g, "<br />")}</p>`;
}

export function stripHtmlToPlain(html: string): string {
  return html
    .replace(TAG_REGEX, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function plainTextLengthFromHtml(html: string): number {
  return stripHtmlToPlain(html).length;
}

export function isHtmlContentEmpty(html: string): boolean {
  return plainTextLengthFromHtml(html) === 0;
}
