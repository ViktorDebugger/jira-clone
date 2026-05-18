"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { AdminOnlyAction } from "@/features/workspaces/components/admin-only-action";

import { useCreateTag } from "../api/use-create-tag";
import { createTagSchema } from "../schemas";
import { HEX_FALLBACK, TagHexInput } from "./tag-hex-input";

interface CreateTagFormProps {
  onCancel?: () => void;
  embedded?: boolean;
}

export const CreateTagForm = ({
  onCancel,
  embedded = false,
}: CreateTagFormProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateTag();

  const formSchema = createTagSchema.omit({ workspaceId: true });
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: HEX_FALLBACK,
    },
  });

  const handleSubmit = (values: FormValues) => {
    mutate(
      { json: { ...values, workspaceId } },
      {
        onSuccess: () => {
          form.reset({ name: "", color: HEX_FALLBACK });
          if (!embedded) {
            onCancel?.();
          }
        },
      },
    );
  };

  const formInner = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-col gap-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Назва</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    placeholder="Напр. баг або дизайн"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Колір</FormLabel>
                <FormControl>
                  <TagHexInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {!embedded ? (
          <>
            <DottedSeparator className="py-4" />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                disabled={isPending}
                className={cn(!onCancel && "invisible")}
                onClick={onCancel}
              >
                Скасувати
              </Button>
              <AdminOnlyAction>
                <Button type="submit" size="lg" disabled={isPending}>
                  Створити тег
                </Button>
              </AdminOnlyAction>
            </div>
          </>
        ) : (
          <>
            <DottedSeparator className="py-4" />
            <div className="flex justify-end">
              <AdminOnlyAction>
                <Button type="submit" size="lg" disabled={isPending}>
                  Створити тег
                </Button>
              </AdminOnlyAction>
            </div>
          </>
        )}
      </form>
    </Form>
  );

  if (embedded) {
    return formInner;
  }

  return (
    <Card className="w-full h-full border-none shadow-none bg-transparent">
      <CardHeader className="flex p-4">
        <CardTitle className="text-xl font-bold">Новий тег</CardTitle>
      </CardHeader>
      <div className="px-4">
        <DottedSeparator />
      </div>
      <CardContent className="p-4">{formInner}</CardContent>
    </Card>
  );
};
