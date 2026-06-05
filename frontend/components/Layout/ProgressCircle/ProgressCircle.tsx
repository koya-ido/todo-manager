"use client";

import { StatusType } from "@/features/todos/hooks/useTodos";
import { cn } from "@/lib/utils";

type ProgressCircleProps = {
  progress: number;
  status: StatusType;
  className?: string;
};

const statusColorMap: Record<StatusType, string> = {
  "not-started": "var(--ring)",
  "in-progress": "var(--chart-1)",
  done: "var(--chart-3)",
  pending: "var(--chart-2)",
};

export const ProgressCircle = ({
  progress,
  status,
  className,
}: ProgressCircleProps) => {
  const normalizedProgress = Number.isFinite(progress)
    ? Math.min(Math.max(progress, 0), 100)
    : 0;
  const progressLabel = `${Math.round(normalizedProgress)}%`;
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedProgress / 100) * circumference;
  const statusColor = statusColorMap[status];

  return (
    <div
      className={cn("relative size-8", className)}
      role="img"
      aria-label={`Progress ${progressLabel}`}
    >
      <svg
        className="size-full -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={statusColor}
          strokeWidth={strokeWidth}
          strokeOpacity={0.2}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={statusColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        <text
          x={size / 2}
          y={size / 2}
          dominantBaseline="central"
          textAnchor="middle"
          fill={statusColor}
          fontSize="32"
          fontWeight="bold"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
        >
          {progressLabel}
        </text>
      </svg>
    </div>
  );
};
