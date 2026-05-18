"use client";

import DOMPurify from "isomorphic-dompurify";

import {
  isHtmlContentEmpty,
  normalizeRichTextBlob,
} from "@/lib/rich-text-plain";
import { cn } from "@/lib/utils";

interface RichTextContentProps {
  html: string;
  className?: string;
}

export const RichTextContent = ({ html, className }: RichTextContentProps) => {
  if (!html?.trim() || isHtmlContentEmpty(normalizeRichTextBlob(html)))
    return null;

  const clean = DOMPurify.sanitize(normalizeRichTextBlob(html), {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "s",
      "strike",
      "blockquote",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "hr",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <div
      className={cn(
        "rich-text-prose",
        "[&_p]:mb-2 [&_p:last-child]:mb-0",
        "[&_a]:break-all [&_a]:text-red-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-2 [&_a]:decoration-red-400 hover:[&_a]:text-red-300",
        "[&_blockquote]:rounded-r-md [&_blockquote]:border [&_blockquote]:border-neutral-600/70 [&_blockquote]:border-l-4 [&_blockquote]:border-l-red-500/90 [&_blockquote]:bg-red-950/15 [&_blockquote]:py-2 [&_blockquote]:pr-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-200",
        "[&_code]:rounded [&_code]:bg-neutral-800 [&_code]:px-1 [&_code]:py-px",
        "[&_hr]:border-neutral-700 [&_hr]:my-3",
        "[&_ol]:list-decimal [&_ol]:pl-6",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-neutral-800 [&_pre]:bg-neutral-950 [&_pre]:p-3",
        "[&_ul]:list-disc [&_ul]:pl-6",
        "[&_li]:marker:text-neutral-500",
        "text-sm text-neutral-300",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};
