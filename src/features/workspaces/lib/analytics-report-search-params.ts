import type { AnalyticsChartTabId } from "@/features/workspaces/components/analytics-chart-panel";

const CHART_TYPES: AnalyticsChartTabId[] = [
  "horizontal-bar",
  "vertical-bar",
  "pie",
  "radar",
  "radial",
];

export interface AnalyticsReportSearchParams {
  projectIds?: string[];
  timelineFrom?: string;
  timelineTo?: string;
  chartType: AnalyticsChartTabId;
  enabledTagIds?: string[];
}

export function buildAnalyticsReportUrl(
  workspaceId: string,
  params: AnalyticsReportSearchParams,
): string {
  const search = new URLSearchParams();

  if (params.projectIds?.length) {
    search.set("projectIds", params.projectIds.join(","));
  }
  if (params.timelineFrom && params.timelineTo) {
    search.set("timelineFrom", params.timelineFrom);
    search.set("timelineTo", params.timelineTo);
  }
  if (params.chartType !== "horizontal-bar") {
    search.set("chartType", params.chartType);
  }
  if (params.enabledTagIds?.length) {
    search.set("tags", params.enabledTagIds.join(","));
  }

  const query = search.toString();
  return `/workspaces/${workspaceId}/analytics/report${query ? `?${query}` : ""}`;
}

export function parseAnalyticsReportSearchParams(
  searchParams: URLSearchParams,
): AnalyticsReportSearchParams {
  const projectIdsRaw = searchParams.get("projectIds");
  const chartTypeRaw = searchParams.get("chartType");
  const tagsRaw = searchParams.get("tags");

  const chartType =
    chartTypeRaw && CHART_TYPES.includes(chartTypeRaw as AnalyticsChartTabId)
      ? (chartTypeRaw as AnalyticsChartTabId)
      : "horizontal-bar";

  return {
    projectIds: projectIdsRaw
      ? projectIdsRaw.split(",").filter((id) => id.trim())
      : undefined,
    timelineFrom: searchParams.get("timelineFrom") ?? undefined,
    timelineTo: searchParams.get("timelineTo") ?? undefined,
    chartType,
    enabledTagIds: tagsRaw
      ? tagsRaw.split(",").filter((id) => id.trim())
      : undefined,
  };
}

export const analyticsChartTypeLabelsUk: Record<AnalyticsChartTabId, string> = {
  "horizontal-bar": "Горизонтальні стовпчики",
  "vertical-bar": "Вертикальні стовпчики",
  pie: "Кругова",
  radar: "Радар",
  radial: "Радіальна",
};
