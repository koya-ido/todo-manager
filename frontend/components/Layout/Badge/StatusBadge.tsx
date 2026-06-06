import { Badge } from "@/components/Layout/Badge/Badge";
import { cn } from "@/lib/utils";
import { FC } from "react";

export type StatusBadgeProps = {
  status: string;
  messages: Record<string, string>;
  className?: string;
};

export const statusColors = {
  "not-started": {
    bg: "bg-chart-6",
    badge: "bg-chart-6/20 text-chart-6",
  },
  "in-progress": {
    bg: "bg-chart-1",
    badge: "bg-chart-1/20 text-chart-1",
  },
  done: {
    bg: "bg-chart-3",
    badge: "bg-chart-3/20 text-chart-3",
  },
  pending: {
    bg: "bg-chart-2",
    badge: "bg-chart-2/20 text-chart-2",
  },
} as const;

export const StatusBadge: FC<StatusBadgeProps> = ({ status, messages, className }) => {
  const styles = statusColors[status as keyof typeof statusColors] || statusColors.pending;
  return (
    <Badge className={cn("py-1 font-bold rounded-md border-0 text-xs", styles.badge, className)}>
      {messages[`common.status.${status}`]}
    </Badge>
  );
};
