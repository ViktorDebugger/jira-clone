"use client";

import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Heading } from "@tiptap/extension-heading";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  StrikethroughIcon,
  UnlinkIcon,
} from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorToolbarProps {
  editor: Editor | null;
  disabled: boolean;
}

const RichTextEditorToolbar = ({
  editor,
  disabled,
}: RichTextEditorToolbarProps) => {
  if (!editor || disabled) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Посилання (URL)", previous ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  };

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      aria-label="Форматування тексту"
      className="flex flex-wrap gap-1 border-neutral-800 border-b bg-neutral-950/90 px-1.5 py-1"
    >
      <Button
        type="button"
        variant={editor.isActive("bold") ? "primary" : "ghost"}
        size="xs"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="size-3.5 shrink-0" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("italic") ? "primary" : "ghost"}
        size="xs"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="size-3.5 shrink-0" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("strike") ? "primary" : "ghost"}
        size="xs"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikethroughIcon className="size-3.5 shrink-0" />
      </Button>
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <Button
          key={level}
          type="button"
          variant={
            editor.isActive("heading", { level }) ? "primary" : "ghost"
          }
          size="xs"
          disabled={disabled}
          className="min-w-[1.9rem] px-1 tabular-nums text-[11px]"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level }).run()
          }
        >
          H{level}
        </Button>
      ))}
      <Button
        type="button"
        variant={editor.isActive("bulletList") ? "primary" : "ghost"}
        size="xs"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon className="size-3.5 shrink-0" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("orderedList") ? "primary" : "ghost"}
        size="xs"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon className="size-3.5 shrink-0" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("blockquote") ? "primary" : "ghost"}
        size="xs"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <QuoteIcon className="size-3.5 shrink-0" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        disabled={disabled}
        className={cn(editor.isActive("link") ? "bg-red-950/40 text-red-200" : "")}
        onClick={setLink}
      >
        <Link2Icon className="size-3.5 shrink-0" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        disabled={disabled || !editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <UnlinkIcon className="size-3.5 shrink-0" />
      </Button>
    </div>
  );
};

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  wrapperClassName?: string;
}

const editorMirrorClass =
  "rich-text-prose tiptap ProseMirror min-h-[120px] w-full max-w-none px-3 py-2 text-sm leading-relaxed text-neutral-100 outline-none " +
  "[&_a]:text-red-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-2 [&_a]:decoration-red-400 " +
  "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 " +
  "[&_blockquote]:rounded-r-md [&_blockquote]:border [&_blockquote]:border-neutral-600/70 [&_blockquote]:border-l-4 [&_blockquote]:border-l-red-500/90 [&_blockquote]:bg-red-950/15 [&_blockquote]:py-2 [&_blockquote]:pr-4 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-200 [&_blockquote]:italic " +
  "[&_hr]:border-neutral-700 [&_hr]:my-3 " +
  "[&_li]:marker:text-neutral-500 [&_ol]:list-decimal [&_ol]:pl-6 " +
  "[&_ul]:list-disc [&_ul]:pl-6 " +
  "[&_code]:rounded [&_code]:bg-neutral-800 [&_code]:px-1 " +
  "[&_pre]:rounded-md [&_pre]:border [&_pre]:border-neutral-800 [&_pre]:bg-neutral-950 [&_pre]:p-2 ";

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  disabled,
  wrapperClassName,
}: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: false,
        link: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
          class:
            "text-red-400 underline underline-offset-2 decoration-2 decoration-red-400 hover:text-red-300",
        },
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        spellCheck: "true",
        lang: "uk",
        class: cn(editorMirrorClass, "caret-red-400"),
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const next = value || "<p></p>";
    if (editor.getHTML() === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  return (
    <div
      className={cn(
        "rounded-md border border-neutral-800 bg-neutral-950",
        disabled ? "opacity-70" : "",
        wrapperClassName,
      )}
    >
      <RichTextEditorToolbar editor={editor} disabled={Boolean(disabled)} />
      <EditorContent
        editor={editor}
        className={cn(
          "[&_.ProseMirror]:min-h-[120px] [&_.ProseMirror-focused]:outline-none",
          "[&_.ProseMirror]:whitespace-normal",
        )}
      />
    </div>
  );
};
