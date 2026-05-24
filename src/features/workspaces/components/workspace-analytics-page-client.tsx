"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, startOfDay, subDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, FileDownIcon } from "lucide-react";

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
import { AnalyticsTimelineChart } from "@/features/workspaces/components/analytics-timeline-chart";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useGetWorkspaceAnalyticsCharts } from "@/features/workspaces/api/use-get-workspace-analytics-charts";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { buildAnalyticsReportUrl } from "@/features/workspaces/lib/analytics-report-search-params";
import { TaskStatus } from "@/features/tasks/types";
import { taskStatusLabelsUk } from "@/features/tasks/status-labels";

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

  const openPdfReport = () => {
    const defaultTimeline = {
      from: format(startOfDay(subDays(new Date(), 29)), "yyyy-MM-dd"),
      to: format(startOfDay(new Date()), "yyyy-MM-dd"),
    };
    const range = timelineQuery ?? defaultTimeline;

    const enabledTagIds = timelineQuery
      ? Object.entries(timelineTagEnabled)
          .filter(([, enabled]) => enabled)
          .map(([tagId]) => tagId)
      : undefined;

    const url = buildAnalyticsReportUrl(workspaceId, {
      projectIds: filterProjectIds.length ? filterProjectIds : undefined,
      timelineFrom: range.from,
      timelineTo: range.to,
      chartType,
      enabledTagIds,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Аналітика</h1>
          <p className="text-sm text-neutral-500">
            Статистика та діаграми робочого простору.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full shrink-0 sm:w-auto"
          onClick={openPdfReport}
        >
          <FileDownIcon className="mr-2 size-4 shrink-0" aria-hidden />
          PDF-звіт
        </Button>
      </div>

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
                  <AnalyticsTimelineChart
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
