"use client";

import type { ReactElement, ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

function tagColorForIndex(index: number): string {
  return TIMELINE_TAG_COLORS[index % TIMELINE_TAG_COLORS.length];
}

interface AnalyticsTimelineChartProps {
  data: readonly Record<string, string | number>[];
  series: readonly { tagId: string; name: string }[];
  enabledTagIds: Record<string, boolean>;
  onToggleTag?: (tagId: string, enabled: boolean) => void;
  variant?: "dashboard" | "report";
}

export function AnalyticsTimelineChart({
  data,
  series,
  enabledTagIds,
  onToggleTag,
  variant = "dashboard",
}: AnalyticsTimelineChartProps): ReactNode {
  const isReport = variant === "report";
  const tickColor = isReport ? "#525252" : "#a3a3a3";
  const axisColor = isReport ? "#737373" : "#404040";
  const gridClass = isReport ? "stroke-neutral-300" : "stroke-neutral-700/70";

  const tagVisible = (tagId: string) => enabledTagIds[tagId] !== false;
  const visibleCount = series.filter((s) => tagVisible(s.tagId)).length;

  return (
    <div className="flex w-full flex-col gap-3">
      <ResponsiveContainer width="100%" height={isReport ? 300 : 340}>
        <AreaChart data={[...data]} margin={{ bottom: 8, left: -8 }}>
          <CartesianGrid strokeDasharray="4 6" className={gridClass} />
          <XAxis
            dataKey="period"
            tick={{ fill: tickColor, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: axisColor }}
            minTickGap={12}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: tickColor, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: axisColor }}
            allowDecimals={false}
          />
          {!isReport ? (
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
          ) : null}
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
                isAnimationActive={false}
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
      {isReport ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-700">
          {series
            .filter((item) => tagVisible(item.tagId))
            .map((item) => {
              const stroke = tagColorForIndex(
                series.findIndex((s) => s.tagId === item.tagId),
              );
              return (
                <li key={item.tagId} className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: stroke }}
                    aria-hidden
                  />
                  {item.name}
                </li>
              );
            })}
        </ul>
      ) : (
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
                      onToggleTag?.(item.tagId, next);
                    }}
                    className="border-red-800/45 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
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
                    {item.name}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function TimelineTagSeriesTooltip({
  active,
  payload,
  tagVisible,
}: {
  active?: boolean;
  payload?: TimelineTagSeriesTooltipPayloadEntry[];
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
        className="mt-2 max-h-52 overflow-y-auto overscroll-contain px-3 pb-2"
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
