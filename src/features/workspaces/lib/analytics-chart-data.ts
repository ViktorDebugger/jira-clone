import type { AnalyticsChartDatum } from "@/features/workspaces/components/analytics-chart-panel";
import { TaskStatus } from "@/features/tasks/types";
import { taskStatusLabelsUk } from "@/features/tasks/status-labels";

interface ChartCountRow {
  name: string;
  count: number;
}

interface StatusRow {
  status: string;
  count: number;
}

export interface WorkspaceChartsPayload {
  byStatus: StatusRow[];
  byProject: ChartCountRow[];
  bySprint: ChartCountRow[];
  byTag: ChartCountRow[];
  byAssignee?: ChartCountRow[];
  byCommentActivity?: ChartCountRow[];
}

function truncateLabel(name: string, max = 18): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

function mapNamedRows(rows: ChartCountRow[]): AnalyticsChartDatum[] {
  return rows.map((row) => ({
    name: truncateLabel(row.name),
    fullName: row.name,
    value: row.count,
  }));
}

export function mapWorkspaceChartsToSections(charts: WorkspaceChartsPayload) {
  return {
    status: charts.byStatus.map((item) => ({
      name: taskStatusLabelsUk[item.status as TaskStatus],
      fullName: taskStatusLabelsUk[item.status as TaskStatus],
      value: item.count,
    })),
    project: mapNamedRows(charts.byProject.slice(0, 12)),
    sprint: mapNamedRows(charts.bySprint),
    tag: mapNamedRows(charts.byTag),
    assignee: mapNamedRows(charts.byAssignee ?? []),
    commentActivity: mapNamedRows(charts.byCommentActivity ?? []),
  };
}
