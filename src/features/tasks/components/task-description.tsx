"use client";

import { useEffect, useState } from "react";
import { PencilIcon, XIcon } from "lucide-react";

import { RichTextContent } from "@/components/rich-text/rich-text-content";
import { RichTextEditor } from "@/components/rich-text/rich-text-editor";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import {
  isHtmlContentEmpty,
  normalizeRichTextBlob,
} from "@/lib/rich-text-plain";
import { Task } from "../types";
import { useUpdateTask } from "../api/use-update-task";

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description ?? "<p></p>");
  const { mutate, isPending } = useUpdateTask();

  useEffect(() => {
    if (!isEditing) {
      setValue(task.description ?? "<p></p>");
    }
  }, [task.description, task.$id, isEditing]);

  const handleSave = () => {
    mutate(
      {
        json: { description: value },
        param: { taskId: task.$id },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleToggleEdit = () => {
    setValue(task.description ?? "<p></p>");
    setIsEditing((prev) => !prev);
  };

  const stored = task.description ?? "";
  const isEmptyStored =
    !stored.trim() || isHtmlContentEmpty(normalizeRichTextBlob(stored));

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-neutral-100">Опис</p>
        <Button
          onClick={handleToggleEdit}
          size={"sm"}
          variant={"secondary"}
          type="button"
        >
          {isEditing ? (
            <XIcon className="size-4 mr-2" />
          ) : (
            <PencilIcon className="size-4 mr-2" />
          )}
          {isEditing ? "Скасувати" : "Редагувати"}
        </Button>
      </div>
      <DottedSeparator className="my-4" />
      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <RichTextEditor
            value={value}
            onChange={setValue}
            placeholder="Додати опис…"
            disabled={isPending}
          />
          <Button
            size={"sm"}
            className="ml-auto w-fit"
            type="button"
            onClick={handleSave}
            disabled={isPending || isHtmlContentEmpty(normalizeRichTextBlob(value))}
          >
            {isPending ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </div>
      ) : (
        <div className="text-sm">
          {isEmptyStored ? (
            <span className="text-neutral-500">Опис не встановлено</span>
          ) : (
            <RichTextContent html={stored} />
          )}
        </div>
      )}
    </div>
  );
};
