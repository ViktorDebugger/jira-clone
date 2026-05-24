"use client";

import { useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { FileDownIcon, PrinterIcon } from "lucide-react";

import { PageError } from "@/components/ui/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useGetWorkspaceAnalyticsCharts } from "@/features/workspaces/api/use-get-workspace-analytics-charts";
import { AnalyticsChartPanel } from "@/features/workspaces/components/analytics-chart-panel";
import { AnalyticsTimelineChart } from "@/features/workspaces/components/analytics-timeline-chart";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { mapWorkspaceChartsToSections } from "@/features/workspaces/lib/analytics-chart-data";
import {
  analyticsChartTypeLabelsUk,
  parseAnalyticsReportSearchParams,
} from "@/features/workspaces/lib/analytics-report-search-params";

interface ReportTableSectionProps {
  title: string;
  rows: { label: string; value: number }[];
  metricLabel?: string;
}

function ReportTableSection({
  title,
  rows,
  metricLabel = "Кількість",
}: ReportTableSectionProps) {
  if (rows.length === 0) {
    return (
      <section className="report-section">
        <h2 className="report-section-title">{title}</h2>
        <p className="report-empty">Немає даних для відображення.</p>
      </section>
    );
  }

  return (
    <section className="report-section">
      <h2 className="report-section-title">{title}</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th scope="col">Назва</th>
            <th scope="col" className="report-table-num">
              {metricLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="report-table-num">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function WorkspaceAnalyticsReportClient() {
  const workspaceId = useWorkspaceId();
  const searchParams = useSearchParams();
  const hasPrintedRef = useRef(false);

  const reportParams = useMemo(
    () => parseAnalyticsReportSearchParams(searchParams),
    [searchParams],
  );

  const timelineRange =
    reportParams.timelineFrom && reportParams.timelineTo
      ? { from: reportParams.timelineFrom, to: reportParams.timelineTo }
      : null;

  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    workspaceId,
  });
  const { data: projects, isLoading: projectsLoading } = useGetProjects({
    workspaceId,
  });
  const { data: summary, isLoading: summaryLoading } = useGetWorkspaceAnalytics({
    workspaceId,
  });
  const {
    data: chartsResponse,
    isLoading: chartsLoading,
    isError,
  } = useGetWorkspaceAnalyticsCharts({
    workspaceId,
    projectIds: reportParams.projectIds ?? [],
    timelineRange,
  });

  const charts = chartsResponse?.data;
  const sections = charts ? mapWorkspaceChartsToSections(charts) : null;

  const enabledTagSet = reportParams.enabledTagIds
    ? new Set(reportParams.enabledTagIds)
    : null;

  const timelineTagEnabled = useMemo(() => {
    if (!charts?.timelineTags.length) {
      return {};
    }
    const record: Record<string, boolean> = {};
    for (const tag of charts.timelineTags) {
      record[tag.tagId] = enabledTagSet ? enabledTagSet.has(tag.tagId) : true;
    }
    return record;
  }, [charts?.timelineTags, enabledTagSet]);

  const isLoading =
    workspaceLoading || projectsLoading || summaryLoading || chartsLoading;

  useEffect(() => {
    if (isLoading || isError || !charts || !summary || hasPrintedRef.current) {
      return;
    }
    hasPrintedRef.current = true;
    let rafId = 0;
    let timerId = 0;
    rafId = window.requestAnimationFrame(() => {
      rafId = window.requestAnimationFrame(() => {
        timerId = window.setTimeout(() => {
          window.print();
        }, 1200);
      });
    });
    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
    };
  }, [isLoading, isError, charts, summary]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !charts || !summary || !projects || !sections) {
    return <PageError message="Не вдалося сформувати PDF-звіт" />;
  }

  const generatedAt = format(new Date(), "d MMMM yyyy, HH:mm", { locale: uk });

  const projectFilterLabel = (() => {
    const ids = reportParams.projectIds;
    if (!ids?.length) {
      return "Усі проєкти робочого простору";
    }
    const names = ids
      .map((id) => projects.documents.find((p) => p.$id === id)?.name)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(", ") : `${ids.length} обраних проєктів`;
  })();

  const parseReportDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const timelineLabel =
    reportParams.timelineFrom && reportParams.timelineTo
      ? `${format(parseReportDate(reportParams.timelineFrom), "d MMM yyyy", { locale: uk })} — ${format(parseReportDate(reportParams.timelineTo), "d MMM yyyy", { locale: uk })}`
      : "Не обрано";

  const summaryRows = [
    { label: "Усі завдання", value: summary.taskCount },
    { label: "Призначені завдання", value: summary.assignedTaskCount },
    { label: "Виконані завдання", value: summary.completedTaskCount },
    { label: "Протерміновані завдання", value: summary.overdueTaskCount },
    { label: "Невиконані завдання", value: summary.incompleteTaskCount },
  ];

  const chartType = reportParams.chartType;

  return (
    <article className="analytics-report mx-auto w-full max-w-5xl bg-white text-neutral-900 print:max-w-none">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm text-neutral-600">
          Відкрийте діалог друку браузера та оберіть «Зберегти як PDF».
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.close()}
          >
            Закрити
          </Button>
          <Button type="button" size="sm" onClick={() => window.print()}>
            <PrinterIcon className="mr-2 size-4" aria-hidden />
            Друк / PDF
          </Button>
        </div>
      </div>

      <header className="report-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              FlowForge
            </p>
            <h1 className="mt-1 text-2xl font-bold">Звіт з аналітики</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {workspace?.name ?? "Робочий простір"}
            </p>
          </div>
          <FileDownIcon
            className="no-print size-8 shrink-0 text-red-600"
            aria-hidden
          />
        </div>
        <p className="mt-4 text-xs text-neutral-500">Сформовано: {generatedAt}</p>
      </header>

      <section className="report-section">
        <h2 className="report-section-title">Параметри звіту</h2>
        <dl className="report-meta">
          <div>
            <dt>Проєкти</dt>
            <dd>{projectFilterLabel}</dd>
          </div>
          <div>
            <dt>Тип діаграм</dt>
            <dd>{analyticsChartTypeLabelsUk[chartType]}</dd>
          </div>
          <div>
            <dt>Період таймлайну</dt>
            <dd>{timelineLabel}</dd>
          </div>
          {charts.truncated ? (
            <div>
              <dt>Примітка</dt>
              <dd>
                Дані обмежені вибіркою ({charts.totalTasks} завдань з бази).
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <ReportTableSection title="Зведення" rows={summaryRows} metricLabel="Значення" />

      {timelineRange ? (
        <section className="report-section report-chart-panel">
          <h2 className="report-section-title">Задачі по днях (за тегами)</h2>
          {charts.timelineTags.length === 0 ? (
            <p className="report-empty">Немає тегів для відображення таймлайну.</p>
          ) : (
            <AnalyticsTimelineChart
              data={charts.timeline}
              series={charts.timelineTags}
              enabledTagIds={timelineTagEnabled}
              variant="report"
            />
          )}
        </section>
      ) : null}

      <div className="report-chart-grid">
        <AnalyticsChartPanel
          title="Завдання за статусом"
          data={sections.status}
          chartType={chartType}
          variant="report"
        />
        <AnalyticsChartPanel
          title="Завдання за проєктом"
          data={sections.project}
          chartType={chartType}
          variant="report"
        />
        <AnalyticsChartPanel
          title="Завдання за спринтами"
          data={sections.sprint}
          chartType={chartType}
          variant="report"
        />
        <AnalyticsChartPanel
          title="Завдання за тегами"
          data={sections.tag}
          chartType={chartType}
          variant="report"
        />
        <AnalyticsChartPanel
          title="Завдання за призначенням"
          data={sections.assignee}
          chartType={chartType}
          variant="report"
        />
        <AnalyticsChartPanel
          title="Активність за користувачами (коментарі)"
          data={sections.commentActivity}
          chartType={chartType}
          metricLabel="Коментарі"
          variant="report"
        />
      </div>

      <footer className="report-footer">
        <p>FlowForge — звіт згенеровано автоматично з поточних фільтрів аналітики.</p>
      </footer>
    </article>
  );
}
