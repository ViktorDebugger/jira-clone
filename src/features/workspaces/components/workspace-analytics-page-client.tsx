"use client";

import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { format, startOfDay } from "date-fns";
import { uk } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageError } from "@/components/ui/page-error";
import { PageLoader } from "@/components/page-loader";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Analytics } from "@/components/analytics";
import {
  AnalyticsChartPanel,
  AnalyticsChartTypeTabs,
  type AnalyticsChartTabId,
} from "@/features/workspaces/components/analytics-chart-panel";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useGetWorkspaceAnalyticsCharts } from "@/features/workspaces/api/use-get-workspace-analytics-charts";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { TaskStatus } from "@/features/tasks/types";
import { taskStatusLabelsUk } from "@/features/tasks/status-labels";

const TIMELINE_TAG_COLORS = [
  "#22c55e",
  "#38bdf8",
  "#c084fc",
  "#fb923c",
  "#facc15",
  "#f472b6",
  "#2dd4bf",
  "#818cf8",
  "#a3e635",
  "#f87171",
  "#94a3b8",
];

interface TimelineTagSeriesTooltipPayloadEntry {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
  payload?: Record<string, string | number>;
}

interface TimelineTagSeriesTooltipOwnProps {
  active?: boolean;
  payload?: TimelineTagSeriesTooltipPayloadEntry[];
}

function TimelineTagSeriesTooltip({
  active,
  payload,
  tagVisible,
}: TimelineTagSeriesTooltipOwnProps & {
  tagVisible: (tagId: string) => boolean;
}): ReactElement | null {
  if (!active || !payload?.length) {
    return null;
  }
  const row = payload[0]?.payload;
  const period = row?.period;
  const dateKey = row?.dateKey;
  const sorted = [...payload]
    .filter((entry) => {
      const id = String(entry.dataKey ?? "");
      return id !== "" && id !== "period" && id !== "dateKey" && tagVisible(id);
    })
    .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));

  return (
    <div
      className="pointer-events-auto w-[min(100vw-2rem,18rem)] rounded-md border border-neutral-700 bg-neutral-950 text-sm shadow-lg"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="px-3 pt-2">
        {typeof period === "string" ? (
          <p className="mb-0.5 font-medium text-neutral-100">{period}</p>
        ) : null}
        {typeof dateKey === "string" ? (
          <p className="mb-0 text-xs text-neutral-500 tabular-nums">{dateKey}</p>
        ) : null}
      </div>
      <div
        className="mt-2 max-h-52 overflow-y-auto overscroll-contain px-3 pb-2 [-webkit-overflow-scrolling:touch]"
        onWheel={(e) => e.stopPropagation()}
      >
        <ul className="space-y-1">
          {sorted.map((entry) => (
            <li
              key={String(entry.dataKey ?? entry.name)}
              className="flex justify-between gap-4 text-xs"
            >
              <span
                className="truncate font-medium"
                style={{ color: entry.color }}
              >
                {entry.name}
              </span>
              <span className="shrink-0 tabular-nums text-neutral-300">
                {entry.value ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface TimelineTagSeriesChartProps {
  data: readonly Record<string, string | number>[];
  series: readonly { tagId: string; name: string }[];
  enabledTagIds: Record<string, boolean>;
  onToggleTag: (tagId: string, enabled: boolean) => void;
}

function tagColorForIndex(index: number): string {
  return TIMELINE_TAG_COLORS[index % TIMELINE_TAG_COLORS.length];
}

function TimelineTagSeriesChart({
  data,
  series,
  enabledTagIds,
  onToggleTag,
}: TimelineTagSeriesChartProps): ReactNode {
  const tagVisible = (tagId: string) => enabledTagIds[tagId] !== false;
  const visibleCount = series.filter((s) => tagVisible(s.tagId)).length;

  return (
    <div className="flex w-full flex-col gap-3">
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={[...data]} margin={{ bottom: 8, left: -8 }}>
          <CartesianGrid
            strokeDasharray="4 6"
            className="stroke-neutral-700/70"
          />
          <XAxis
            dataKey="period"
            tick={{ fill: "#a3a3a3", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#404040" }}
            minTickGap={12}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#a3a3a3", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#404040" }}
            allowDecimals={false}
          />
          <Tooltip
            wrapperStyle={{ pointerEvents: "auto", zIndex: 40 }}
            content={(props) => (
              <TimelineTagSeriesTooltip
                active={props.active}
                payload={
                  props.payload as
                    | TimelineTagSeriesTooltipPayloadEntry[]
                    | undefined
                }
                tagVisible={tagVisible}
              />
            )}
          />
          {series.map((item) => {
            if (!tagVisible(item.tagId)) {
              return null;
            }
            const stroke = tagColorForIndex(
              series.findIndex((s) => s.tagId === item.tagId),
            );
            return (
              <Area
                key={item.tagId}
                type="monotone"
                dataKey={item.tagId}
                name={item.name}
                stroke={stroke}
                fill={stroke}
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ fill: stroke, strokeWidth: 0, r: 2 }}
                activeDot={{
                  stroke,
                  strokeWidth: 2,
                  r: 5,
                }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-3">
        <Label className="mb-2 block text-xs font-normal text-neutral-500">
          Теги на графіку
        </Label>
        <ul className="flex max-h-36 flex-wrap gap-x-4 gap-y-2 overflow-y-auto overscroll-contain pr-1">
          {series.map((item, index) => {
            const checked = tagVisible(item.tagId);
            const stroke = tagColorForIndex(index);
            return (
              <li key={item.tagId} className="flex items-center gap-2">
                <Checkbox
                  id={`timeline-tag-${item.tagId}`}
                  checked={checked}
                  onCheckedChange={(value) => {
                    const next = value === true;
                    if (!next && visibleCount <= 1 && checked) {
                      return;
                    }
                    onToggleTag(item.tagId, next);
                  }}
                  className="border-red-800/45 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white dark:border-red-800/45 dark:data-[state=checked]:border-red-600 dark:data-[state=checked]:bg-red-600 dark:data-[state=checked]:text-white"
                />
                <label
                  htmlFor={`timeline-tag-${item.tagId}`}
                  className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-200"
                >
                  <span
                    className="inline-block size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: stroke }}
                    aria-hidden
                  />
                  <span className="truncate">{item.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export const WorkspaceAnalyticsPageClient = () => {
  const workspaceId = useWorkspaceId();
  const {
    data: summaryAnalytics,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: projects, isLoading: projectsLoading } = useGetProjects({
    workspaceId,
  });

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [chartType, setChartType] =
    useState<AnalyticsChartTabId>("horizontal-bar");
  const [timelineRange, setTimelineRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [timelineRangeOpen, setTimelineRangeOpen] = useState(false);
  const [timelineTagEnabled, setTimelineTagEnabled] = useState<
    Record<string, boolean>
  >({});

  const filterProjectIds = useMemo(() => {
    const all = projects?.documents ?? [];
    if (all.length === 0) {
      return [];
    }
    const keys = Object.keys(selectedIds).filter((id) => selectedIds[id]);
    if (keys.length === 0 || keys.length === all.length) {
      return [];
    }
    return keys;
  }, [projects?.documents, selectedIds]);

  const timelineQuery = useMemo(() => {
    if (!timelineRange?.from || !timelineRange?.to) {
      return null;
    }
    return {
      from: format(startOfDay(timelineRange.from), "yyyy-MM-dd"),
      to: format(startOfDay(timelineRange.to), "yyyy-MM-dd"),
    };
  }, [timelineRange]);

  const { data: raw, isLoading: chartsLoading, isError } =
    useGetWorkspaceAnalyticsCharts({
      workspaceId,
      projectIds: filterProjectIds,
      timelineRange: timelineQuery,
    });

  const charts = raw?.data;

  useEffect(() => {
    const tags = charts?.timelineTags;
    if (!tags?.length) {
      return;
    }
    setTimelineTagEnabled((prev) => {
      const next = { ...prev };
      for (const t of tags) {
        if (!(t.tagId in next)) {
          next[t.tagId] = true;
        }
      }
      const allowed = new Set(tags.map((x) => x.tagId));
      for (const key of Object.keys(next)) {
        if (!allowed.has(key)) {
          delete next[key];
        }
      }
      return next;
    });
  }, [charts?.timelineTags]);

  const toggleTimelineTag = useCallback((tagId: string, enabled: boolean) => {
    setTimelineTagEnabled((prev) => ({ ...prev, [tagId]: enabled }));
  }, []);

  const statusChartData = useMemo(() => {
    if (!charts) {
      return [];
    }
    return charts.byStatus.map((item) => ({
      name: taskStatusLabelsUk[item.status as TaskStatus],
      fullName: taskStatusLabelsUk[item.status as TaskStatus],
      value: item.count,
    }));
  }, [charts]);

  const projectChartData = useMemo(() => {
    if (!charts) {
      return [];
    }
    return charts.byProject.slice(0, 12).map((p) => {
      const truncated =
        p.name.length > 18 ? `${p.name.slice(0, 17)}…` : p.name;
      return {
        name: truncated,
        fullName: p.name,
        value: p.count,
      };
    });
  }, [charts]);

  const sprintChartData = useMemo(() => {
    if (!charts) {
      return [];
    }
    return charts.bySprint.map((s) => {
      const truncated =
        s.name.length > 18 ? `${s.name.slice(0, 17)}…` : s.name;
      return {
        name: truncated,
        fullName: s.name,
        value: s.count,
      };
    });
  }, [charts]);

  const tagChartData = useMemo(() => {
    if (!charts) {
      return [];
    }
    return charts.byTag.map((t) => {
      const truncated =
        t.name.length > 18 ? `${t.name.slice(0, 17)}…` : t.name;
      return {
        name: truncated,
        fullName: t.name,
        value: t.count,
      };
    });
  }, [charts]);

  const assigneeChartData = useMemo(() => {
    if (!charts) {
      return [];
    }
    const rows = charts.byAssignee ?? [];
    return rows.map((row) => {
      const truncated =
        row.name.length > 18 ? `${row.name.slice(0, 17)}…` : row.name;
      return {
        name: truncated,
        fullName: row.name,
        value: row.count,
      };
    });
  }, [charts]);

  const commentActivityChartData = useMemo(() => {
    if (!charts) {
      return [];
    }
    const rows = charts.byCommentActivity ?? [];
    return rows.map((row) => {
      const truncated =
        row.name.length > 18 ? `${row.name.slice(0, 17)}…` : row.name;
      return {
        name: truncated,
        fullName: row.name,
        value: row.count,
      };
    });
  }, [charts]);

  const isLoading = projectsLoading || chartsLoading || summaryLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || summaryError || !projects || !charts || !summaryAnalytics) {
    return (
      <PageError message="Не вдалося завантажити аналітику робочого простору" />
    );
  }

  const timelineRangeLabel =
    timelineRange?.from && timelineRange?.to
      ? `${format(timelineRange.from, "d MMM yyyy", { locale: uk })} — ${format(
          timelineRange.to,
          "d MMM yyyy",
          { locale: uk },
        )}`
      : timelineRange?.from
        ? `${format(timelineRange.from, "d MMM yyyy", { locale: uk })} — оберіть кінець`
        : "Оберіть початок і кінець періоду";

  const toggleProject = (id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAllProjects = () => {
    const next: Record<string, boolean> = {};
    for (const p of projects.documents) {
      next[p.$id] = true;
    }
    setSelectedIds(next);
  };

  const clearProjectFilter = () => {
    setSelectedIds({});
  };

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const allCount = projects.documents.length;
  const filterActive =
    selectedCount > 0 && selectedCount < allCount;

  return (
    <div className="flex h-full flex-col gap-6">
      <Analytics data={summaryAnalytics} />

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Label className="text-base text-neutral-200">
              Фільтр за проєктами
            </Label>
            <p className="mt-1 text-xs text-neutral-500">
              Без вибору або з усіма обраними — показує весь простір.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAllProjects}
              disabled={projects.documents.length === 0}
              className="border-neutral-700"
            >
              Усі проєкти
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearProjectFilter}
            >
              Скинути
            </Button>
          </div>
        </div>
        {projects.documents.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">
            Немає проєктів у цьому робочому просторі.
          </p>
        ) : (
          <ul className="mt-4 grid max-h-[200px] grid-cols-1 gap-x-8 gap-y-2 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3">
            {projects.documents.map((project) => {
              const checked = Boolean(selectedIds[project.$id]);
              return (
                <li key={project.$id} className="flex items-center gap-2">
                  <Checkbox
                    id={`project-${project.$id}`}
                    checked={checked}
                    onCheckedChange={() => toggleProject(project.$id)}
                    className="border-red-800/45 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white dark:border-red-800/45 dark:data-[state=checked]:border-red-600 dark:data-[state=checked]:bg-red-600 dark:data-[state=checked]:text-white"
                  />
                  <label
                    htmlFor={`project-${project.$id}`}
                    className="cursor-pointer truncate text-sm font-medium text-neutral-200 peer-disabled:opacity-70"
                  >
                    {project.name}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        {filterActive && (
          <p className="mt-3 text-xs text-neutral-500">
            Активний фільтр: обрано {selectedCount} з {allCount}{" "}
            проєктів.
          </p>
        )}
      </div>

      {charts.truncated && (
        <p className="text-sm text-amber-500/90">
          Показано лише перші {charts.totalTasks} завдань з бази. Для повного
          звіту збільште ліміт у API.
        </p>
      )}

      {charts.commentsTruncated ? (
        <p className="text-sm text-amber-500/90">
          Коментарі для графіка активності обмежені вибіркою з бази — топ учасників
          може не відповідати повній історії.
        </p>
      ) : null}

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <Label
          htmlFor="workspace-analytics-chart-type"
          className="mb-2 block text-sm font-medium text-neutral-200"
        >
          Тип діаграм для блоків нижче
        </Label>
        <AnalyticsChartTypeTabs
          id="workspace-analytics-chart-type"
          value={chartType}
          onValueChange={setChartType}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AnalyticsChartPanel
          title="Завдання за статусом"
          data={statusChartData}
          chartType={chartType}
        />

        <AnalyticsChartPanel
          title="Завдання за проєктом"
          data={projectChartData}
          chartType={chartType}
        />

        <AnalyticsChartPanel
          title="Завдання за спринтами"
          data={sprintChartData}
          chartType={chartType}
        />

        <AnalyticsChartPanel
          title="Завдання за тегами"
          data={tagChartData}
          chartType={chartType}
        />

        <AnalyticsChartPanel
          title="Завдання за призначенням"
          data={assigneeChartData}
          chartType={chartType}
        />

        <AnalyticsChartPanel
          title="Активність за користувачами (коментарі)"
          data={commentActivityChartData}
          chartType={chartType}
          metricLabel="Коментарі"
        />
      </div>

      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-1">
            <h2 className="text-sm font-semibold text-neutral-200">
              Задачі по днях
            </h2>
            <p className="text-xs text-neutral-500">
              Для кожного тега робочого простору будується окрема крива: скільки задач з цим
              тегом перетинають день за інтервалом створення — терміну (due). Задача з
              кількома тегами враховується у відповідних кривих. Спочатку оберіть повний
              діапазон дат нижче — графік оновиться після вибору початку й кінця періоду.
            </p>
          </div>
          <div className="flex w-full flex-col gap-4 lg:w-auto lg:min-w-[320px]">
            <div className="space-y-2">
              <Label className="text-xs text-neutral-500">Період</Label>
              <Popover
                open={timelineRangeOpen}
                onOpenChange={setTimelineRangeOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start border-neutral-700 text-left font-normal text-neutral-100 sm:w-auto"
                    aria-expanded={timelineRangeOpen}
                  >
                    <CalendarIcon className="mr-2 size-4 shrink-0 opacity-80" aria-hidden />
                    {timelineRangeLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex flex-col">
                    <Calendar
                      mode="range"
                      numberOfMonths={2}
                      selected={timelineRange}
                      onSelect={(next) => {
                        setTimelineRange(next ?? undefined);
                      }}
                    />
                    <div className="flex justify-end gap-2 border-t border-neutral-800 px-3 py-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-neutral-700"
                        onClick={() => setTimelineRangeOpen(false)}
                      >
                        Закрити
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!timelineRange?.from || !timelineRange?.to}
                        onClick={() => setTimelineRangeOpen(false)}
                      >
                        Готово
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        {timelineQuery ? (
          <>
            {charts.timelineTags.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed border-neutral-700 bg-neutral-950/40 px-4 py-8 text-center text-sm text-neutral-500">
                У цьому робочому просторі ще немає тегів — додайте теги до задач, щоб на графіку
                відобразились окремі лінії.
              </div>
            ) : (
              <>
                {charts.timelineTruncated && (
                  <p className="mb-4 text-sm text-amber-500/90">
                    Не всі задачі потрапили в підрахунок для графіка через серверний ліміт
                    вибірки. Лінії можуть недооцінювати реальну кількість.
                  </p>
                )}
                <div className="w-full">
                  <TimelineTagSeriesChart
                    data={charts.timeline}
                    series={charts.timelineTags}
                    enabledTagIds={timelineTagEnabled}
                    onToggleTag={toggleTimelineTag}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed border-neutral-700 bg-neutral-950/40 px-4 py-8 text-center text-sm text-neutral-500">
            Відкрийте календар і оберіть дату початку та дату кінця періоду — тоді
            відобразиться графік.
          </div>
        )}
      </section>
    </div>
  );
};
