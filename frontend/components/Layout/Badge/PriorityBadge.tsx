import { Badge } from "@/components/Layout/Badge/Badge";
import { cn } from "@/lib/utils";
import { FC } from "react";

export type PriorityBadgeProps = {
  priority: string;
  messages: Record<string, string>;
  className?: string;
};

export const PriorityBadge: FC<PriorityBadgeProps> = ({ priority, messages, className }) => {
  return (
    <Badge className={cn("py-1 font-bold rounded-md bg-gray-500 text-white text-xs border-0", className)}>
      {messages["common.priority"]}: {messages[`common.priority.${priority}`]}
    </Badge>
  );
};
