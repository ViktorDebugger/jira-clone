/* eslint-disable @typescript-eslint/ban-ts-comment */

"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createTaskSchema } from "../schemas";
import { DatePicker } from "@/components/date-picker";
import { PopulatedTask, Task } from "../types";
import {
  taskStatusLabelsUk,
  taskStatusesOrdered,
} from "../status-labels";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useUpdateTask } from "../api/use-update-task";
import { TaskTagPicker } from "./task-tag-picker";
import { TaskMemberPicker } from "./task-member-picker";
import { TaskSprintSelect } from "@/features/sprints/components/task-sprint-select";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface EditTaskFormProps {
  onCancel?: () => void;
  projectOptions: { id: string; name: string; imageUrl: string }[];
  initialValues: Task & { tags?: PopulatedTask["tags"] };
}

export const EditTaskForm = ({
  onCancel,
  projectOptions,
  initialValues,
}: EditTaskFormProps) => {
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useUpdateTask();

  const formSchema = createTaskSchema.omit({
    workspaceId: true,
    description: true,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-expect-error
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues.name,
      status: initialValues.status,
      projectId: initialValues.projectId,
      assigneeIds: initialValues.assigneeIds ?? [],
      dueDate: initialValues.dueDate
        ? new Date(initialValues.dueDate)
        : undefined,
      tagIds: initialValues.tagIds ?? [],
      sprintId: initialValues.sprintId ?? null,
    },
  });

  const watchedProjectId = form.watch("projectId");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(
      { json: values, param: { taskId: initialValues.$id } },
      {
        onSuccess: () => {
          form.reset();
          onCancel?.();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-4">
        <CardTitle className="text-xl font-bold">Редагувати завдання</CardTitle>
      </CardHeader>
      <div className="px-4">
        <DottedSeparator />
      </div>
      <CardContent className="p-4">
        <Form {...form}>
          {/* @ts-expect-error */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                name="name"
                // @ts-expect-error
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Назва завдання</FormLabel>

                    <FormControl>
                      <Input {...field} placeholder="Введіть назву завдання" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="dueDate"
                // @ts-expect-error
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Термін виконання</FormLabel>
                    <FormControl>
                      <DatePicker {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="assigneeIds"
                // @ts-expect-error
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Виконавці</FormLabel>
                    <TaskMemberPicker
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="status"
                // @ts-expect-error
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Оберіть статус" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {taskStatusesOrdered.map((s) => (
                          <SelectItem key={s} value={s}>
                            {taskStatusLabelsUk[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                name="projectId"
                // @ts-expect-error
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Проєкт</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={(next) => {
                        field.onChange(next);
                        form.setValue("sprintId", null);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Оберіть проєкт" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-x-2">
                              <ProjectAvatar
                                className="size-6"
                                name={project.name}
                                image={project.imageUrl}
                              />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                name="sprintId"
                // @ts-expect-error
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Спринт</FormLabel>
                    <FormControl>
                      <TaskSprintSelect
                        workspaceId={workspaceId}
                        projectId={watchedProjectId}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="tagIds"
                // @ts-expect-error
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Теги</FormLabel>
                    <TaskTagPicker
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DottedSeparator className="py-4" />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size={"lg"}
                variant={"secondary"}
                onClick={onCancel}
                disabled={isPending}
                className={cn(!onCancel && "invisible")}
              >
                Скасувати
              </Button>
              <Button type="submit" size={"lg"} disabled={isPending}>
                Зберегти зміни
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
