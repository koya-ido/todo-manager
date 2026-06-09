import { Badge } from "@/components/Layout/Badge/Badge";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { FC } from "react";

export type TagBadgeProps = {
  name: string;
  className?: string;
  onRemove?: () => void;
  onClick?: () => void;
};

export const TagBadge: FC<TagBadgeProps> = ({ name, className, onRemove, onClick }) => {
  const defaultClasses = cn(
    "bg-slate-100 dark:bg-slate-800/80 text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border border-slate-200/50 dark:border-slate-700/50 shadow-2xs",
    onClick && "cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 hover:border-indigo-200/50 dark:hover:border-indigo-900/50 active:scale-95 duration-100",
    className
  );

  if (onClick) {
    return (
      <Badge asChild className={defaultClasses}>
        <button type="button" onClick={onClick}>
          {name}
        </button>
      </Badge>
    );
  }

  return (
    <Badge className={defaultClasses}>
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-destructive focus:outline-hidden transition-colors cursor-pointer ml-0.5"
          aria-label={`Remove tag ${name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </Badge>
  );
};
