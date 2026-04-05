import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

type LabelWithIconProps = {
  icon: ReactNode;
  label: string;
  className?: string;
};

export const LabelWithIcon: FC<LabelWithIconProps> = ({
  icon,
  label,
  className,
}) => {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span className={cn("text-xs", className)}>{label}</span>
    </div>
  );
};
