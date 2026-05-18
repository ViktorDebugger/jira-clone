"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PopulatedTask } from "../types";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/components/ui/badge";

import { taskStatusLabelsUk } from "../status-labels";
import { TaskActions } from "./task-actions";
import { TaskTagBadges } from "./task-tag-badges";

export const columns: ColumnDef<PopulatedTask>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Назва завдання
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.name;

      return <p className="line-clamp-1 max-w-64 truncate">{name}</p>;
    },
  },
  {
    accessorKey: "project",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Проєкт
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original.project;

      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <ProjectAvatar
            className="size-6"
            name={project!.name}
            image={project!.imageUrl}
          />
          <p className="line-clamp-1 max-w-64 truncate">{project!.name}</p>
        </div>
      );
    },
  },
  {
    id: "sprint",
    accessorFn: (row) => row.sprint?.name?.toLocaleLowerCase("uk") ?? "",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Спринт
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const sprint = row.original.sprint;
      return (
        <span className="line-clamp-1 max-w-40 text-sm text-neutral-300">
          {sprint?.name ?? "—"}
        </span>
      );
    },
  },
  {
    id: "assignees",
    accessorFn: (row) =>
      (row.assignees ?? [])
        .map((m) => m.name)
        .join(", ")
        .toLocaleLowerCase("uk"),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Виконавці
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const assignees = row.original.assignees ?? [];

      if (assignees.length === 0) {
        return (
          <span className="text-sm text-muted-foreground">—</span>
        );
      }

      const preview = assignees.slice(0, 4);
      const namesJoined = assignees.map((m) => m.name).join(", ");

      return (
        <div
          className="flex shrink-0 items-center gap-1"
          title={namesJoined}
          aria-label={`Виконавці: ${namesJoined}`}
        >
          <div className="flex shrink-0 -space-x-1.5 rtl:space-x-reverse">
            {preview.map((m) => (
              <MemberAvatar
                key={m.$id}
                className="size-6 ring-2 ring-neutral-950"
                fallbackClassName="text-xs"
                name={m.name}
              />
            ))}
          </div>
          {assignees.length > 4 ? (
            <span className="text-xs font-medium tabular-nums text-neutral-400">
              +{assignees.length - 4}
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Термін виконання
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;

      return <TaskDate value={dueDate} />;
    },
  },
  {
    id: "tags",
    accessorKey: "tags",
    header: "Теги",
    cell: ({ row }) => (
      <TaskTagBadges
        tags={row.original.tags}
        maxVisible={1}
        showFullListOnHover
      />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Статус
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;

      return <Badge variant={status}>{taskStatusLabelsUk[status]}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.$id;
      const projectId = row.original.projectId;

      return (
        <TaskActions id={id} projectId={projectId}>
          <Button variant={"ghost"} className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </TaskActions>
      );
    },
  },
];
