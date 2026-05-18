import type { ProjectAnalyticsRespoceType } from "@/features/projects/api/use-get-project-analytics";
import type { WorkspaceAnalyticsRespoceType } from "@/features/workspaces/api/use-get-workspace-analytics";
import {
  Root,
  Scrollbar,
  Thumb,
  Viewport,
} from "@radix-ui/react-scroll-area";

import { AnalyticsCard } from "./analytics-card";
import { cn } from "@/lib/utils";

type AnalyticsStripDataFromResponse<T> = T extends { data: infer D } ? D : never;

export type AnalyticsStripData =
  | AnalyticsStripDataFromResponse<ProjectAnalyticsRespoceType>
  | AnalyticsStripDataFromResponse<WorkspaceAnalyticsRespoceType>;

interface AnalyticsProps {
  data: AnalyticsStripData;
}

export const Analytics = ({ data }: AnalyticsProps) => {
  const items = [
    {
      title: "Всі завдання",
      value: data.taskCount,
      variant: data.taskDifference > 0 ? ("up" as const) : ("down" as const),
      increaseValue: data.taskDifference,
    },
    {
      title: "Призначені завдання",
      value: data.assignedTaskCount,
      variant:
        data.assignedTaskDifference > 0 ? ("up" as const) : ("down" as const),
      increaseValue: data.assignedTaskDifference,
    },
    {
      title: "Виконані завдання",
      value: data.completedTaskCount,
      variant:
        data.completedTaskDifference > 0 ? ("up" as const) : ("down" as const),
      increaseValue: data.completedTaskDifference,
    },
    {
      title: "Протерміновані завдання",
      value: data.overdueTaskCount,
      variant:
        data.overdueTaskDifference > 0 ? ("up" as const) : ("down" as const),
      increaseValue: data.overdueTaskDifference,
    },
    {
      title: "Невиконані завдання",
      value: data.incompleteTaskCount,
      variant:
        data.incompleteTaskDifference > 0 ? ("up" as const) : ("down" as const),
      increaseValue: data.incompleteTaskDifference,
    },
  ];

  return (
    <Root
      className={cn(
        "relative w-full max-w-full shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900"
      )}
    >
      <Viewport className="size-full max-w-full rounded-[inherit] bg-neutral-900 outline-none focus-visible:outline-none focus-visible:ring-0">
        <div className="min-w-full">
          <div className="flex min-h-[112px] w-max min-w-full items-center bg-neutral-900">
            {items.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  "flex min-h-[112px] min-w-0 shrink-0 grow basis-48 items-stretch",
                  index < items.length - 1 &&
                    "border-neutral-700 border-r border-dashed"
                )}
              >
                <AnalyticsCard {...item} />
              </div>
            ))}
          </div>
        </div>
      </Viewport>
      <Scrollbar
        orientation="horizontal"
        className="flex h-2 touch-none bg-neutral-950 transition-colors select-none data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-neutral-900"
      >
        <Thumb className="relative flex-1 rounded-full bg-neutral-600 transition-colors hover:bg-neutral-500" />
      </Scrollbar>
    </Root>
  );
};
