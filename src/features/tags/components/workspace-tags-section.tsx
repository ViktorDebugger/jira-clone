"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DottedSeparator } from "@/components/dotted-separator";
import { useConfirm } from "@/hooks/use-confirm";

import { useGetTags } from "../api/use-get-tags";
import { useUpdateTag } from "../api/use-update-tag";
import { useDeleteTag } from "../api/use-delete-tag";
import type { Tag } from "../types";
import { CreateTagForm } from "./create-tag-form";
import { HEX_FALLBACK, TagHexInput } from "./tag-hex-input";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { AdminOnlyAction } from "@/features/workspaces/components/admin-only-action";
import { updateTagSchema } from "../schemas";

export const WorkspaceTagsSection = () => {
  const workspaceId = useWorkspaceId();
  const { data: tagsPayload, isLoading } = useGetTags({ workspaceId });
  const tags = tagsPayload?.documents ?? [];

  const [DeleteTagDialog, confirmDelete] = useConfirm(
    "Видалити тег",
    "Тег буде видалено. У завданнях посилання на нього зникнуть із відображення.",
    "destructive",
  );

  const { mutate: removeTag } = useDeleteTag();
  const { mutate: updateTag, isPending: isUpdating } = useUpdateTag();

  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const editFormSchema = updateTagSchema;
  type EditFormValues = z.infer<typeof editFormSchema>;

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: { name: "", color: HEX_FALLBACK },
  });

  const { reset } = editForm;

  useEffect(() => {
    if (editingTag) {
      reset({
        name: editingTag.name,
        color: editingTag.color,
      });
    }
  }, [editingTag, reset]);

  const handleConfirmDelete = async (tag: Tag) => {
    const ok = await confirmDelete();
    if (!ok) return;
    removeTag({ param: { tagId: tag.$id } });
  };

  const handleSubmitEdit = (values: EditFormValues) => {
    if (!editingTag) return;
    updateTag(
      {
        json: values,
        param: { tagId: editingTag.$id },
      },
      {
        onSuccess: () => {
          setEditingTag(null);
        },
      },
    );
  };

  return (
    <Card className="w-full border border-neutral-800 bg-neutral-950">
      <DeleteTagDialog />
      <CardHeader>
        <CardTitle className="text-xl font-bold text-neutral-100">Теги</CardTitle>
        <p className="text-sm text-neutral-400 font-normal pt-1">
          Керування тегами для завдань у цьому робочому просторі.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-6 pb-8 pt-0">
        <div className="rounded-md border border-neutral-800 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead className="w-12 text-neutral-400">Колір</TableHead>
                <TableHead className="text-neutral-400">Назва</TableHead>
                <TableHead className="hidden sm:table-cell text-neutral-400">
                  HEX
                </TableHead>
                <TableHead className="w-[100px] text-right text-neutral-400">
                  Дії
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-neutral-800">
                  <TableCell colSpan={4} className="text-neutral-400 py-8 text-center">
                    Завантаження…
                  </TableCell>
                </TableRow>
              ) : tags.length === 0 ? (
                <TableRow className="border-neutral-800">
                  <TableCell colSpan={4} className="text-neutral-400 py-8 text-center">
                    Немає тегів. Додайте перший нижче.
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag) => (
                  <TableRow key={tag.$id} className="border-neutral-800">
                    <TableCell>
                      <span
                        className="inline-flex size-6 rounded border border-neutral-700 shadow-inner"
                        style={{ backgroundColor: tag.color }}
                        aria-hidden
                      />
                    </TableCell>
                    <TableCell className="font-medium text-neutral-100">{tag.name}</TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-sm text-neutral-400">
                      {tag.color}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-neutral-400 hover:text-neutral-100"
                          aria-label={`Редагувати тег «${tag.name}»`}
                          onClick={() => setEditingTag(tag)}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <AdminOnlyAction>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-neutral-400 hover:text-red-400"
                            aria-label={`Видалити тег «${tag.name}»`}
                            onClick={() => handleConfirmDelete(tag)}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </AdminOnlyAction>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DottedSeparator />

        <div>
          <h3 className="text-sm font-semibold text-neutral-100 mb-3">Додати тег</h3>
          <CreateTagForm embedded />
        </div>

        <Dialog
          open={editingTag !== null}
          onOpenChange={(open) => !open && setEditingTag(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редагувати тег</DialogTitle>
              <DialogDescription className="sr-only">
                Змініть назву або колір тега та збережіть зміни.
              </DialogDescription>
            </DialogHeader>
            {editingTag ? (
              <Form {...editForm}>
                <form
                  onSubmit={editForm.handleSubmit(handleSubmitEdit)}
                  className="flex flex-col gap-y-4"
                >
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Назва</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            autoComplete="off"
                            disabled={isUpdating}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Колір</FormLabel>
                        <FormControl>
                          <TagHexInput
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isUpdating}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="gap-2 pt-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditingTag(null)}
                      disabled={isUpdating}
                    >
                      Скасувати
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      Зберегти
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : null}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
