"use client";

import { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { PencilIcon, TrashIcon } from "lucide-react";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/page-loader";
import { useConfirm } from "@/hooks/use-confirm";
import { useCreateComment } from "../api/use-create-comment";
import { useDeleteComment } from "../api/use-delete-comment";
import { useGetComments } from "../api/use-get-comments";
import { useUpdateComment } from "../api/use-update-comment";
import { RichTextContent } from "@/components/rich-text/rich-text-content";
import { RichTextEditor } from "@/components/rich-text/rich-text-editor";
import {
  isHtmlContentEmpty,
  normalizeRichTextBlob,
} from "@/lib/rich-text-plain";

interface TaskCommentsSectionProps {
  taskId: string;
}

export const TaskCommentsSection = ({ taskId }: TaskCommentsSectionProps) => {
  const { data: list, isLoading } = useGetComments({ taskId });
  const { mutate: createComment, isPending: creating } = useCreateComment();
  const { mutate: updateComment, isPending: updating } = useUpdateComment();
  const { mutate: deleteComment, isPending: deleting } = useDeleteComment();

  const [draftHtml, setDraftHtml] = useState("<p></p>");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("<p></p>");

  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Видалити коментар",
    "Цю дію неможливо скасувати",
    "destructive",
  );

  const onSubmit = () => {
    const body = draftHtml.trim();
    if (!body || isHtmlContentEmpty(normalizeRichTextBlob(body))) return;
    createComment({ json: { taskId, body } }, {
      onSuccess: () => setDraftHtml("<p></p>"),
    });
  };

  const startEdit = (id: string, body: string) => {
    setEditingId(id);
    setEditBody(body.trim() ? body : "<p></p>");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody("<p></p>");
  };

  const saveEdit = () => {
    if (!editingId) return;
    const body = editBody.trim();
    if (!body || isHtmlContentEmpty(normalizeRichTextBlob(body))) return;
    updateComment(
      {
        commentId: editingId,
        body,
        taskId,
      },
      { onSuccess: () => cancelEdit() },
    );
  };

  const onDelete = async (commentId: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteComment({ commentId, taskId });
  };

  const comments = list?.documents ?? [];

  return (
    <section className="flex flex-col" aria-labelledby="task-comments-heading">
      <ConfirmDialog />
      <DottedSeparator className="my-6" />

      <h2
        id="task-comments-heading"
        className="text-lg font-semibold text-neutral-100"
      >
        Коментарі{" "}
        <span className="text-sm font-normal text-neutral-400">
          ({list?.total ?? 0})
        </span>
      </h2>

      <div
        className="mt-4 max-h-[50vh] min-h-0 overflow-y-auto overscroll-y-contain rounded-md pr-1 [-webkit-overflow-scrolling:touch]"
      >
        {isLoading ? (
          <div className="py-6">
            <PageLoader />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Поки що немає коментарів. Напишіть перший.
          </p>
        ) : (
          <ul className="flex flex-col gap-4 pb-2">
            {comments.map((c) => (
              <li
                key={c.$id}
                className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 gap-y-1">
                  <span className="text-sm font-medium text-neutral-200">
                    {c.authorName}
                  </span>
                  <time
                    className="text-xs text-neutral-500"
                    dateTime={c.$createdAt}
                  >
                    {format(c.$createdAt, "dd MMM yyyy, HH:mm", {
                      locale: uk,
                    })}
                  </time>
                </div>

                {editingId === c.$id ? (
                  <div className="mt-3 space-y-2">
                    <RichTextEditor
                      value={editBody}
                      onChange={setEditBody}
                      placeholder="Текст коментаря…"
                      disabled={updating}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        disabled={
                          updating ||
                          isHtmlContentEmpty(normalizeRichTextBlob(editBody))
                        }
                        onClick={() => saveEdit()}
                      >
                        Зберегти
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => cancelEdit()}
                        disabled={updating}
                      >
                        Скасувати
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-2 text-sm">
                      <RichTextContent html={c.body} />
                    </div>
                    {c.isOwner && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          disabled={Boolean(editingId) || deleting || updating}
                          onClick={() => startEdit(c.$id, c.body)}
                          className="h-8 gap-1.5 px-2 text-neutral-400 hover:text-red-500"
                        >
                          <PencilIcon className="size-3.5" />
                          Редагувати
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          disabled={deleting || Boolean(editingId)}
                          onClick={() => onDelete(c.$id)}
                          className="h-8 gap-1.5 px-2 text-red-400 hover:text-red-300"
                        >
                          <TrashIcon className="size-3.5" />
                          Видалити
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 space-y-3" aria-label="Новий коментар">
        <RichTextEditor
          value={draftHtml}
          onChange={setDraftHtml}
          placeholder="Залишити коментар…"
          disabled={creating}
        />
        <Button
          type="button"
          variant="primary"
          disabled={
            creating ||
            isHtmlContentEmpty(normalizeRichTextBlob(draftHtml))
          }
          onClick={() => onSubmit()}
        >
          Надіслати коментар
        </Button>
      </div>
    </section>
  );
};
