"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useGetSprints } from "../api/use-get-sprints";
import type { Sprint } from "../types";

interface TaskSprintSelectProps {
  workspaceId: string;
  projectId: string | undefined;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

const SPRINT_SELECT_NONE = "__sprint_none__";

export const TaskSprintSelect = ({
  workspaceId,
  projectId,
  value,
  onChange,
  disabled,
}: TaskSprintSelectProps) => {
  const pid = projectId?.trim() ?? "";
  const { data: sprintsPayload, isLoading } = useGetSprints({
    workspaceId,
    projectId: pid,
  });

  const sprints = sprintsPayload?.documents ?? [];
  const safeValue =
    value?.trim() &&
    sprints.some((sprint: Sprint) => sprint.$id === value.trim())
      ? value.trim()
      : SPRINT_SELECT_NONE;

  return (
    <Select
      value={safeValue}
      onValueChange={(next) => {
        if (next === SPRINT_SELECT_NONE) {
          onChange(null);
          return;
        }
        onChange(next);
      }}
      disabled={
        disabled || !pid || isLoading
      }
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            !pid
              ? "Спочатку оберіть проєкт"
              : isLoading
                ? "Завантаження…"
                : "Спринт"
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={SPRINT_SELECT_NONE}>Без спринту</SelectItem>
        {sprints.map((sprint: Sprint) => (
          <SelectItem key={sprint.$id} value={sprint.$id}>
            {sprint.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
