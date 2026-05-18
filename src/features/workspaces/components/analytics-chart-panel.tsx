"use client";

import { type ReactNode, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const CHART_PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
];

export interface AnalyticsChartDatum {
  name: string;
  fullName: string;
  value: number;
}

export type AnalyticsChartTabId =
  | "horizontal-bar"
  | "vertical-bar"
  | "pie"
  | "radar"
  | "radial";

interface AnalyticsChartTypeTabsProps {
  value: AnalyticsChartTabId;
  onValueChange: (value: AnalyticsChartTabId) => void;
  className?: string;
  id?: string;
}

export function AnalyticsChartTypeTabs({
  value,
  onValueChange,
  className,
  id,
}: AnalyticsChartTypeTabsProps) {
  return (
    <Tabs
      id={id}
      value={value}
      onValueChange={(v) => onValueChange(v as AnalyticsChartTabId)}
      className={cn("w-full gap-0", className)}
    >
      <div className="-mx-1 max-w-full overflow-x-auto px-1 pb-px">
        <TabsList className="h-auto min-h-9 w-max max-w-none flex-wrap justify-start gap-1 rounded-lg border border-neutral-800 bg-neutral-950/90 p-1">
          <TabsTrigger
            value="horizontal-bar"
            className="shrink-0 px-2.5 text-xs sm:text-sm"
          >
            Горизонтальні стовпчики
          </TabsTrigger>
          <TabsTrigger
            value="vertical-bar"
            className="shrink-0 px-2.5 text-xs sm:text-sm"
          >
            Вертикальні стовпчики
          </TabsTrigger>
          <TabsTrigger
            value="pie"
            className="shrink-0 px-2.5 text-xs sm:text-sm"
          >
            Кругова
          </TabsTrigger>
          <TabsTrigger
            value="radar"
            className="shrink-0 px-2.5 text-xs sm:text-sm"
          >
            Радар
          </TabsTrigger>
          <TabsTrigger
            value="radial"
            className="shrink-0 px-2.5 text-xs sm:text-sm"
          >
            Радіальна
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}

interface AnalyticsChartPanelProps {
  title: string;
  data: AnalyticsChartDatum[];
  chartType: AnalyticsChartTabId;
  metricLabel?: string;
}

function augmentFill(dataset: AnalyticsChartDatum[]) {
  return dataset.map((d, i) => ({
    ...d,
    fill: CHART_PALETTE[i % CHART_PALETTE.length],
  }));
}

interface AnalyticsChartTooltipPayload {
  payload?: {
    fullName?: string;
    name?: string;
    value?: number;
    fill?: string;
  };
  value?: number;
  name?: string;
}

interface AnalyticsChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: AnalyticsChartTooltipPayload[];
  metricLabel: string;
}

function AnalyticsChartTooltip({
  active,
  label,
  payload,
  metricLabel,
}: AnalyticsChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }
  const datum = payload[0].payload ?? {};
  const titleText = datum.fullName ?? datum.name ?? label ?? "";
  const valueRaw = payload[0].value ?? datum.value ?? 0;
  const valueShown =
    typeof valueRaw === "number" ? valueRaw : Number(valueRaw);

  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-neutral-100">{titleText}</p>
      <p className="text-neutral-400">
        {metricLabel}:{" "}
        <span className="font-semibold tabular-nums text-neutral-100">
          {Number.isFinite(valueShown) ? valueShown : 0}
        </span>
      </p>
    </div>
  );
}

function PieTooltip({
  active,
  payload,
  metricLabel,
}: {
  active?: boolean;
  payload?: { payload?: AnalyticsChartDatum & { fill?: string } }[];
  metricLabel: string;
}) {
  if (!active || !payload?.[0]?.payload) {
    return null;
  }
  const row = payload[0].payload;
  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-neutral-100">
        {row.fullName ?? row.name}
      </p>
      <p className="text-neutral-400">
        {metricLabel}:{" "}
        <span className="font-semibold tabular-nums text-neutral-100">
          {row.value}
        </span>
      </p>
    </div>
  );
}

type PieLegendItem = AnalyticsChartDatum & { fill?: string };

interface PieChartLegendProps {
  items: readonly PieLegendItem[];
}

function PieChartLegend({ items }: PieChartLegendProps) {
  return (
    <ul
      aria-label="Пояснення сегментів діаграми"
      className="chart-legend-scroll flex min-h-0 max-h-[120px] flex-col gap-2 overflow-y-auto overscroll-contain pr-1 text-xs sm:max-h-full sm:flex-[5] sm:border-l sm:border-neutral-800 sm:pl-4"
    >
      {items.map((entry, index) => {
        const label = entry.fullName ?? entry.name;
        const swatch =
          entry.fill ?? CHART_PALETTE[index % CHART_PALETTE.length];
        return (
          <li
            key={`legend-${entry.name}-${index}`}
            className="flex min-w-0 items-start gap-2"
          >
            <span
              className="mt-1 size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: swatch }}
              aria-hidden
            />
            <span
              className="min-w-0 flex-1 leading-snug font-medium text-neutral-200"
              title={label}
            >
              {label}
            </span>
            <span className="shrink-0 tabular-nums text-neutral-500">
              {entry.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyChartPlaceholder() {
  return (
    <div
      className="flex h-[280px] items-center justify-center text-sm text-neutral-500"
      role="status"
    >
      Немає даних для графіка
    </div>
  );
}

const CHART_WRAP_CLASS = "h-[280px] w-full";

export function AnalyticsChartPanel({
  title,
  data,
  chartType,
  metricLabel = "Завдання",
}: AnalyticsChartPanelProps) {
  const filled = useMemo(() => augmentFill(data), [data]);

  const maxRadar = useMemo(
    () => Math.max(...data.map((d) => d.value), 1),
    [data],
  );

  const hasRows = filled.length > 0;

  let chartBody: ReactNode;
  if (!hasRows) {
    chartBody = <EmptyChartPlaceholder />;
  } else {
    switch (chartType) {
      case "horizontal-bar":
        chartBody = (
          <div className={CHART_WRAP_CLASS}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filled}
                layout="vertical"
                margin={{ left: 28, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="4 6"
                  className="stroke-neutral-700/70"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#a3a3a3", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#404040" }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fill: "#a3a3a3", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#404040" }}
                />
                <Tooltip
                  content={<AnalyticsChartTooltip metricLabel={metricLabel} />}
                  cursor={{ fill: "rgba(38,38,38,0.35)" }}
                />
                <Bar
                  dataKey="value"
                  name={metricLabel}
                  radius={[0, 4, 4, 0]}
                >
                  {filled.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        break;
      case "vertical-bar":
        chartBody = (
          <div className={CHART_WRAP_CLASS}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filled} margin={{ bottom: 8, left: -8 }}>
                <CartesianGrid
                  strokeDasharray="4 6"
                  className="stroke-neutral-700/70"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#a3a3a3", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#404040" }}
                />
                <YAxis
                  tick={{ fill: "#a3a3a3", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#404040" }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<AnalyticsChartTooltip metricLabel={metricLabel} />}
                  cursor={{ fill: "rgba(38,38,38,0.35)" }}
                />
                <Bar
                  dataKey="value"
                  name={metricLabel}
                  radius={[4, 4, 0, 0]}
                >
                  {filled.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        break;
      case "pie":
        chartBody = (
          <div className="flex w-full flex-col gap-3 border-t border-neutral-800 pt-3 sm:h-[280px] sm:flex-row sm:gap-4 sm:border-t-0 sm:pt-0">
            <div className="h-[200px] w-full shrink-0 sm:h-full sm:flex-[6] sm:min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filled}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={92}
                    paddingAngle={1}
                  >
                    {filled.map((entry, index) => (
                      <Cell
                        key={`pie-${entry.name}-${index}`}
                        fill={
                          entry.fill ??
                          CHART_PALETTE[index % CHART_PALETTE.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip metricLabel={metricLabel} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <PieChartLegend items={filled} />
          </div>
        );
        break;
      case "radar":
        chartBody = (
          <div className={CHART_WRAP_CLASS}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={filled} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid
                  className="stroke-neutral-700/70"
                  strokeDasharray="4 6"
                />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: "#a3a3a3", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  tick={{ fill: "#a3a3a3", fontSize: 10 }}
                  domain={[0, maxRadar]}
                  allowDecimals={false}
                />
                <Radar
                  name={metricLabel}
                  dataKey="value"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.45}
                />
                <Tooltip
                  content={<AnalyticsChartTooltip metricLabel={metricLabel} />}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );
        break;
      case "radial":
        chartBody = (
          <div className="flex w-full flex-col gap-3 border-t border-neutral-800 pt-3 sm:h-[280px] sm:flex-row sm:gap-4 sm:border-t-0 sm:pt-0">
            <div className="h-[200px] w-full shrink-0 sm:h-full sm:flex-[6] sm:min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="12%"
                  outerRadius="92%"
                  data={filled}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, maxRadar]}
                    tick={false}
                  />
                  <PolarRadiusAxis
                    type="category"
                    dataKey="name"
                    tick={false}
                  />
                  <RadialBar
                    dataKey="value"
                    background={{ fill: "rgba(71,85,105,0.4)" }}
                    cornerRadius={4}
                    isAnimationActive={false}
                    minPointSize={8}
                  >
                    {filled.map((entry, i) => (
                      <Cell
                        key={`radial-${entry.name}-${i}`}
                        fill={
                          entry.fill ??
                          CHART_PALETTE[i % CHART_PALETTE.length]
                        }
                      />
                    ))}
                  </RadialBar>
                  <Tooltip content={<PieTooltip metricLabel={metricLabel} />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <PieChartLegend items={filled} />
          </div>
        );
        break;
    }
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-neutral-800 bg-neutral-900 p-4 shadow-sm",
      )}
    >
      <h2 className="mb-4 text-sm font-semibold text-neutral-200">{title}</h2>
      {chartBody}
    </section>
  );
}
