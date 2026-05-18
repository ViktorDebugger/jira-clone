"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Loader, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/date-picker";
import {
  Dialog,
  DialogContent,
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
import { useConfirm } from "@/hooks/use-confirm";
import { AdminOnlyAction } from "@/features/workspaces/components/admin-only-action";
import { useWorkspaceAdmin } from "@/features/workspaces/hooks/use-workspace-admin";

import { useCreateSprint } from "../api/use-create-sprint";
import { useDeleteSprint } from "../api/use-delete-sprint";
import { useGetSprints } from "../api/use-get-sprints";
import { useUpdateSprint } from "../api/use-update-sprint";
import { sprintFieldsSchema } from "../schemas";
import type { Sprint } from "../types";

interface ProjectSprintsSectionProps {
  workspaceId: string;
  projectId: string;
}

interface SprintFormValues {
  name: string;
  startDate: Date;
  endDate: Date;
}

const sprintFormResolver = zodResolver(
  sprintFieldsSchema,
) as Resolver<SprintFormValues>;

export const ProjectSprintsSection = ({
  workspaceId,
  projectId,
}: ProjectSprintsSectionProps) => {
  const { isAdmin } = useWorkspaceAdmin();
  const { data: sprintsPayload, isLoading } = useGetSprints({
    workspaceId,
    projectId,
  });
  const sprints = sprintsPayload?.documents ?? [];

  const { mutate: createSprint, isPending: isCreating } = useCreateSprint();
  const { mutate: updateSprint, isPending: isUpdating } = useUpdateSprint();
  const { mutate: deleteSprint } = useDeleteSprint();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  const [DeleteSprintDialog, confirmDeleteSprint] = useConfirm(
    "Видалити спринт",
    "Спринт буде видалено. Завдання з цим спринтом залишаться без спринту.",
    "destructive",
  );

  const createForm = useForm<SprintFormValues>({
    resolver: sprintFormResolver,
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const editForm = useForm<SprintFormValues>({
    resolver: sprintFormResolver,
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const openCreateModal = () => {
    createForm.reset({
      name: "",
      startDate: new Date(),
      endDate: new Date(),
    });
    setCreateOpen(true);
  };

  useEffect(() => {
    if (editingSprint) {
      editForm.reset({
        name: editingSprint.name,
        startDate: new Date(editingSprint.startDate),
        endDate: new Date(editingSprint.endDate),
      });
    }
  }, [editingSprint, editForm]);

  const onCreateSubmit = (values: SprintFormValues) => {
    createSprint(
      {
        json: {
          workspaceId,
          projectId,
          name: values.name,
          startDate: values.startDate,
          endDate: values.endDate,
        },
      },
      {
        onSuccess: () => {
          createForm.reset({
            name: "",
            startDate: new Date(),
            endDate: new Date(),
          });
          setCreateOpen(false);
        },
      },
    );
  };

  const onEditSubmit = (values: SprintFormValues) => {
    if (!editingSprint) return;
    updateSprint(
      {
        json: {
          name: values.name,
          startDate: values.startDate,
          endDate: values.endDate,
        },
        param: { sprintId: editingSprint.$id },
      },
      {
        onSuccess: () => {
          setEditingSprint(null);
        },
      },
    );
  };

  const handleDelete = async (sprint: Sprint) => {
    const ok = await confirmDeleteSprint();
    if (!ok) return;

    deleteSprint({ param: { sprintId: sprint.$id } });
  };

  const handleCreateOpenChange = (openState: boolean) => {
    setCreateOpen(openState);
    if (!openState) {
      createForm.reset({
        name: "",
        startDate: new Date(),
        endDate: new Date(),
      });
    }
  };

  return (
    <Card className="w-full border border-neutral-800 bg-neutral-950">
      <DeleteSprintDialog />
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-neutral-100">
            Спринти
          </CardTitle>
          <p className="text-sm font-normal text-neutral-400">
            {isAdmin
              ? "Ітерації цього проєкту. Задачі можна привʼязувати до спринта під час створення або редагування завдання."
              : "Ітерації цього проєкту. Керувати спринтами може лише адміністратор."}
          </p>
        </div>
        <AdminOnlyAction>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={openCreateModal}
          >
            <PlusIcon className="mr-2 size-4 shrink-0" aria-hidden />
            Створити спринт
          </Button>
        </AdminOnlyAction>
      </CardHeader>
      <CardContent className="pb-8 pt-0">
        {isAdmin ? (
        <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
          <DialogContent className="border-neutral-800 bg-neutral-950 text-neutral-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Новий спринт</DialogTitle>
            </DialogHeader>
            <DottedSeparator className="py-4" />
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(onCreateSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Назва</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Спринт 1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Початок</FormLabel>
                      <FormControl>
                        <DatePicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Кінець</FormLabel>
                      <FormControl>
                        <DatePicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DottedSeparator className="py-4" />
                <DialogFooter className="gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleCreateOpenChange(false)}
                  >
                    Скасувати
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    Створити
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        ) : null}

        {isLoading ? (
          <div className="flex h-36 items-center justify-center rounded-md border border-neutral-800">
            <Loader className="size-5 animate-spin text-neutral-400" />
          </div>
        ) : sprints.length === 0 ? (
          <p className="rounded-md border border-neutral-800 py-12 text-center text-sm text-muted-foreground">
            {isAdmin
              ? "Ще немає спринтів. Натисніть «Створити спринт», щоб додати перший."
              : "Ще немає спринтів."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-neutral-800">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead className="text-neutral-400">Назва</TableHead>
                  <TableHead className="text-neutral-400">Початок</TableHead>
                  <TableHead className="text-neutral-400">Кінець</TableHead>
                  {isAdmin ? (
                    <TableHead className="text-neutral-400 w-24 text-right">
                      Дії
                    </TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sprints.map((sprint: Sprint) => (
                  <TableRow key={sprint.$id} className="border-neutral-800">
                    <TableCell className="font-medium text-neutral-100">
                      {sprint.name}
                    </TableCell>
                    <TableCell className="text-neutral-300">
                      {format(new Date(sprint.startDate), "d MMM yyyy", {
                        locale: uk,
                      })}
                    </TableCell>
                    <TableCell className="text-neutral-300">
                      {format(new Date(sprint.endDate), "d MMM yyyy", {
                        locale: uk,
                      })}
                    </TableCell>
                    {isAdmin ? (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <AdminOnlyAction>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-neutral-300"
                              aria-label={`Редагувати ${sprint.name}`}
                              onClick={() => setEditingSprint(sprint)}
                            >
                              <PencilIcon className="size-4" />
                            </Button>
                          </AdminOnlyAction>
                          <AdminOnlyAction>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-red-400 hover:text-red-300"
                              aria-label={`Видалити ${sprint.name}`}
                              onClick={() => void handleDelete(sprint)}
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          </AdminOnlyAction>
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {isAdmin ? (
        <Dialog
          open={editingSprint !== null}
          onOpenChange={(openState) => {
            if (!openState) setEditingSprint(null);
          }}
        >
          <DialogContent className="border-neutral-800 bg-neutral-950 text-neutral-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Редагувати спринт</DialogTitle>
            </DialogHeader>
            <DottedSeparator className="py-4" />
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Назва</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Початок</FormLabel>
                      <FormControl>
                        <DatePicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Кінець</FormLabel>
                      <FormControl>
                        <DatePicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DottedSeparator className="py-4" />
                <DialogFooter className="gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditingSprint(null)}
                  >
                    Скасувати
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    Зберегти
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        ) : null}
      </CardContent>
    </Card>
  );
};
