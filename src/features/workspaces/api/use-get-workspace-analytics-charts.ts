import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetWorkspaceAnalyticsChartsProps {
  workspaceId: string;
  projectIds?: string[];
  timelineRange?: { from: string; to: string } | null;
  enabled?: boolean;
}

export const useGetWorkspaceAnalyticsCharts = ({
  workspaceId,
  projectIds = [],
  timelineRange,
  enabled = true,
}: UseGetWorkspaceAnalyticsChartsProps) => {
  const sortedIds = [...projectIds].sort().join(",");

  const timelineSegmentKey = timelineRange
    ? `${timelineRange.from}:${timelineRange.to}`
    : "off";

  return useQuery({
    enabled: Boolean(workspaceId) && enabled,
    placeholderData: (previousData) => previousData,
    queryKey: [
      "workspace-analytics-charts",
      workspaceId,
      sortedIds,
      timelineSegmentKey,
    ],
    queryFn: async () => {
      const query: Record<string, string> = {};
      if (!timelineRange) {
        query.includeTimeline = "false";
      } else {
        query.timelineFrom = timelineRange.from;
        query.timelineTo = timelineRange.to;
      }
      if (projectIds.length > 0) {
        query.projectIds = sortedIds;
      }

      const response = await client.api.workspaces[":workspaceId"]["analytics"]["charts"].$get(
        {
          param: { workspaceId },
          query,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workspace analytics charts");
      }

      return response.json();
    },
  });
};
